import assert from "node:assert/strict";
import { after, afterEach, beforeEach, mock, test } from "node:test";
import { act, createElement, StrictMode } from "react";
import { JSDOM } from "jsdom";
import { createServer } from "vite";
import useBuscarRecetas from "../src/hooks/useBuscarRecetas.js";
import useLocalStorage from "../src/hooks/useLocalStorage.js";
import { prepararRecetas } from "../src/logica.js";

// DOM aislado: estas pruebas no usan Internet ni el almacenamiento del navegador real.
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });
const originales = new Map();
for (const nombre of ["window", "document", "navigator", "HTMLElement", "Event", "localStorage"]) {
  originales.set(nombre, Object.getOwnPropertyDescriptor(globalThis, nombre));
  Object.defineProperty(globalThis, nombre, { configurable: true, value: dom.window[nombre] });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = await import("react-dom/client");
// Vite transforma los JSX de la aplicación; las pruebas siguen usando node:test.
const vite = await createServer({
  configFile: false,
  oxc: { jsx: { runtime: "automatic" } },
  cacheDir: "node_modules/.vite-tests",
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, hmr: false, watch: null },
});
const { default: Recetario } = await vite.ssrLoadModule("/src/components/Recetario.jsx");
let raiz;
let contenedor;
let busquedaActual;
let almacenamientoActual;

const pasta = { idMeal: "1", strMeal: "Pasta de prueba", strCategory: "Pasta", strInstructions: "Cocer y servir.", strIngredient1: "Tomato", strMeasure1: "2" };
const tarta = { idMeal: "2", strMeal: "Tarta de prueba", strCategory: "Dessert", strInstructions: "Hornear." };
const respuesta = (meals) => ({ ok: true, json: async () => ({ meals }) });

function SondaBusqueda() {
  busquedaActual = useBuscarRecetas();
  return createElement("p", null, busquedaActual.estado);
}

function SondaAlmacenamiento({ clave, inicial, preparar }) {
  almacenamientoActual = useLocalStorage(clave, inicial, preparar);
  return null;
}

async function montar(componente, props = {}) {
  await act(async () => raiz.render(createElement(StrictMode, null, createElement(componente, props))));
}

function boton(nombre) {
  const encontrado = [...contenedor.querySelectorAll("button")].find((elemento) =>
    (elemento.getAttribute("aria-label") || elemento.textContent).trim().replace(/\s+/g, " ") === nombre);
  assert.ok(encontrado, `Debe existir el botón: ${nombre}`);
  return encontrado;
}

async function pulsar(nombre) {
  await act(async () => boton(nombre).click());
}

async function buscarEnFormulario(nombre) {
  const campo = contenedor.querySelector("input[type=search]");
  await act(async () => {
    Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, "value").set.call(campo, nombre);
    campo.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => contenedor.querySelector("form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
}

beforeEach(() => {
  localStorage.clear();
  contenedor = document.createElement("div");
  document.body.append(contenedor);
  raiz = createRoot(contenedor);
  mock.method(globalThis, "fetch", async () => { throw new Error("Petición no prevista en la prueba"); });
});

afterEach(async () => {
  if (raiz) await act(async () => raiz.unmount());
  contenedor.remove();
  mock.restoreAll();
});

after(async () => {
  await vite.close();
  dom.window.close();
  for (const [nombre, descriptor] of originales) {
    if (descriptor) Object.defineProperty(globalThis, nombre, descriptor);
    else delete globalThis[nombre];
  }
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});

test("el almacenamiento admite objetos, listas, texto, cero, false y null sin reescribir al montar", async () => {
  const valores = [{ tema: "claro" }, ["1"], "texto", 0, false, null];
  valores.forEach((valor, indice) => localStorage.setItem(`prueba:${indice}`, JSON.stringify(valor)));
  const escritura = mock.method(dom.window.Storage.prototype, "setItem");
  for (const [indice, valor] of valores.entries()) {
    await montar(SondaAlmacenamiento, { key: indice, clave: `prueba:${indice}`, inicial: "por defecto" });
    assert.deepEqual(almacenamientoActual[0], valor);
  }
  assert.equal(escritura.mock.callCount(), 0);
});

test("el valor inicial y las actualizaciones funcionales se guardan una vez en StrictMode", async () => {
  const escritura = mock.method(dom.window.Storage.prototype, "setItem");
  await montar(SondaAlmacenamiento, { clave: "contador", inicial: 0 });
  assert.equal(escritura.mock.callCount(), 1);
  await act(async () => {
    almacenamientoActual[1]((anterior) => anterior + 1);
    almacenamientoActual[1]((anterior) => anterior + 1);
  });
  assert.equal(almacenamientoActual[0], 2);
  assert.equal(localStorage.getItem("contador"), "2");
  assert.equal(escritura.mock.callCount(), 2);
});

test("una migración sí se persiste aunque ocurra en el primer montaje", async () => {
  localStorage.setItem("preferencias", JSON.stringify("claro"));
  const escritura = mock.method(dom.window.Storage.prototype, "setItem");
  await montar(SondaAlmacenamiento, { clave: "preferencias", inicial: {}, preparar: (tema) => ({ tema }) });
  assert.deepEqual(almacenamientoActual[0], { tema: "claro" });
  assert.deepEqual(JSON.parse(localStorage.getItem("preferencias")), { tema: "claro" });
  assert.equal(escritura.mock.callCount(), 1);
});

test("el almacenamiento ilegible permite usar y actualizar el valor inicial en memoria", async () => {
  mock.method(dom.window.Storage.prototype, "getItem", () => { throw new Error("Acceso bloqueado"); });
  mock.method(console, "warn", () => {});
  await montar(SondaAlmacenamiento, { clave: "preferencias", inicial: { tema: "claro" } });
  await act(async () => almacenamientoActual[1]({ tema: "oscuro" }));
  assert.deepEqual(almacenamientoActual[0], { tema: "oscuro" });
});

test("una respuesta antigua no sustituye al resultado de la última búsqueda", async () => {
  const antigua = Promise.withResolvers();
  const reciente = Promise.withResolvers();
  globalThis.fetch.mock.mockImplementation((url) => new URL(url).searchParams.get("s") === "pasta" ? antigua.promise : reciente.promise);
  await montar(SondaBusqueda);
  let primera;
  let segunda;
  await act(async () => { primera = busquedaActual.buscar("pasta"); segunda = busquedaActual.buscar("cake"); });
  await act(async () => { reciente.resolve(respuesta([tarta])); await segunda; });
  await act(async () => { antigua.resolve(respuesta([pasta])); assert.equal(await primera, undefined); });
  assert.equal(busquedaActual.busqueda, "cake");
  assert.equal(busquedaActual.recetas[0].nombre, "Tarta de prueba");
  assert.equal(busquedaActual.estado, "exito");
});

test("un error antiguo tampoco pisa una búsqueda más reciente", async () => {
  const antigua = Promise.withResolvers();
  globalThis.fetch.mock.mockImplementation((url) => new URL(url).searchParams.get("s") === "pasta" ? antigua.promise : Promise.resolve(respuesta([tarta])));
  await montar(SondaBusqueda);
  let primera;
  await act(async () => { primera = busquedaActual.buscar("pasta"); });
  await act(async () => { await busquedaActual.buscar("cake"); });
  await act(async () => { antigua.reject(new Error("Sin conexión")); await primera; });
  assert.equal(busquedaActual.estado, "exito");
  assert.equal(busquedaActual.recetas[0].id, "2");
});

test("el fallo de la última búsqueda se mantiene aunque llegue un éxito antiguo", async () => {
  const antigua = Promise.withResolvers();
  globalThis.fetch.mock.mockImplementation((url) => new URL(url).searchParams.get("s") === "pasta" ? antigua.promise : Promise.reject(new Error("Sin conexión")));
  await montar(SondaBusqueda);
  let primera;
  await act(async () => { primera = busquedaActual.buscar("pasta"); });
  await act(async () => { await busquedaActual.buscar("cake"); });
  await act(async () => { antigua.resolve(respuesta([pasta])); await primera; });
  assert.equal(busquedaActual.estado, "error");
  assert.equal(busquedaActual.busqueda, "cake");
  assert.deepEqual(busquedaActual.recetas, []);
});

test("desmontar invalida la petición y no entrega resultados al componente padre", async () => {
  const pendiente = Promise.withResolvers();
  globalThis.fetch.mock.mockImplementation(() => pendiente.promise);
  await montar(SondaBusqueda);
  let solicitud;
  await act(async () => { solicitud = busquedaActual.buscar("pasta"); });
  await act(async () => raiz.unmount());
  raiz = null;
  pendiente.resolve(respuesta([pasta]));
  assert.equal(await solicitud, undefined);
  assert.equal(contenedor.textContent, "");
});

test("una nueva búsqueda reinicia categoría, filtro de favoritas y detalle", async () => {
  globalThis.fetch.mock.mockImplementation(async () => respuesta([pasta, tarta]));
  await montar(Recetario);
  await buscarEnFormulario("pasta");
  await pulsar("Favorita: Pasta de prueba");
  await act(async () => {
    const select = contenedor.querySelector("select");
    select.value = "Pasta";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await act(async () => contenedor.querySelector("input[type=checkbox]").click());
  await pulsar("Ver receta: Pasta de prueba");
  assert.equal(contenedor.querySelectorAll(".tarjeta-receta").length, 1);
  assert.ok(contenedor.querySelector(".detalle"));
  await buscarEnFormulario("cake");
  assert.equal(contenedor.querySelector("select").value, "");
  assert.equal(contenedor.querySelector("input[type=checkbox]").checked, false);
  assert.equal(contenedor.querySelector(".detalle"), null);
  assert.equal(contenedor.querySelectorAll(".tarjeta-receta").length, 2);
});

test("las favoritas conservan ingredientes y detalle tras recargar, sin búsquedas nuevas", async () => {
  globalThis.fetch.mock.mockImplementation(async () => respuesta([pasta, tarta]));
  await montar(Recetario);
  await buscarEnFormulario("pasta");
  await pulsar("Favorita: Pasta de prueba");
  await pulsar("Favorita: Tarta de prueba");
  assert.equal(JSON.parse(localStorage.getItem("pasaporte:favoritas:v1")).recetas[0].ingredientes[0].nombre, "Tomato");
  await act(async () => raiz.unmount());
  raiz = createRoot(contenedor);
  await montar(Recetario);
  await pulsar("Mis favoritas (2)");
  assert.equal(contenedor.querySelectorAll(".tarjeta-receta").length, 2);
  await pulsar("Ver receta: Pasta de prueba");
  assert.equal(document.activeElement.id, "detalle-nombre");
  assert.match(contenedor.querySelector(".detalle").textContent, /Tomato/);
  assert.match(contenedor.querySelector(".detalle").textContent, /Cocer y servir/);
  await pulsar("Favorita: Pasta de prueba");
  assert.equal(contenedor.querySelector(".detalle"), null);
  assert.equal(document.activeElement.getAttribute("aria-label"), "Biblioteca de favoritas");
  assert.equal(contenedor.querySelectorAll(".tarjeta-receta").length, 1);
  assert.equal(globalThis.fetch.mock.callCount(), 1);
  assert.equal(JSON.parse(localStorage.getItem("pasaporte:favoritas:v1")).recetas[0].id, "2");
});

test("conserva los IDs antiguos tras recargar y los completa al buscar", async () => {
  localStorage.setItem("pasaporte:favoritas:v1", JSON.stringify(["1", "2", "1", null, {}]));
  localStorage.setItem("pasaporte:recetas:v1:pasta", JSON.stringify([pasta]));
  await montar(Recetario);
  await pulsar("Mis favoritas (2)");
  assert.equal(contenedor.querySelectorAll(".tarjeta-receta").length, 0);
  assert.match(contenedor.querySelector(".aviso-favoritas").textContent, /Quedan 2 favoritas/);
  const guardado = JSON.parse(localStorage.getItem("pasaporte:favoritas:v1"));
  assert.deepEqual(guardado.pendientes, ["1", "2"]);
  assert.deepEqual(guardado.recetas, []);
  await act(async () => raiz.unmount());
  raiz = createRoot(contenedor);
  await montar(Recetario);
  await pulsar("Mis favoritas (2)");
  assert.match(contenedor.querySelector(".aviso-favoritas").textContent, /Quedan 2 favoritas/);
  globalThis.fetch.mock.mockImplementation(async () => respuesta([tarta]));
  await pulsar("Buscar recetas");
  await buscarEnFormulario("pasta");
  assert.equal(globalThis.fetch.mock.callCount(), 0);
  await pulsar("Mis favoritas (2)");
  assert.equal(contenedor.querySelectorAll(".tarjeta-receta").length, 1);
  assert.match(contenedor.querySelector(".aviso-favoritas").textContent, /Queda 1 favorita/);
  await pulsar("Buscar recetas");
  await buscarEnFormulario("cake");
  await pulsar("Mis favoritas (2)");
  assert.equal(contenedor.querySelectorAll(".tarjeta-receta").length, 2);
  assert.equal(contenedor.querySelector(".aviso-favoritas"), null);
  assert.deepEqual(JSON.parse(localStorage.getItem("pasaporte:favoritas:v1")).pendientes, []);
});

test("normaliza favoritas antiguas duplicadas y prioriza sus recetas completas", async () => {
  const [receta] = prepararRecetas([pasta]);
  localStorage.setItem("pasaporte:favoritas:v1", JSON.stringify(["1", receta, receta, "2", { id: "3" }, null]));
  await montar(Recetario);
  await pulsar("Mis favoritas (2)");
  const guardado = JSON.parse(localStorage.getItem("pasaporte:favoritas:v1"));
  assert.deepEqual(guardado.recetas, [receta]);
  assert.deepEqual(guardado.pendientes, ["2"]);
  assert.equal(contenedor.querySelectorAll(".tarjeta-receta").length, 1);
  assert.equal(globalThis.fetch.mock.callCount(), 0);
});

test("cerrar el detalle devuelve el foco a los resultados en las dos vistas", async () => {
  globalThis.fetch.mock.mockImplementation(async () => respuesta([pasta]));
  await montar(Recetario);
  await buscarEnFormulario("pasta");
  await pulsar("Ver receta: Pasta de prueba");
  await pulsar("Cerrar receta ↑");
  assert.equal(contenedor.querySelector(".detalle"), null);
  assert.equal(document.activeElement.getAttribute("aria-label"), "Resultados de recetas");
  await pulsar("Favorita: Pasta de prueba");
  await pulsar("Mis favoritas (1)");
  await pulsar("Ver receta: Pasta de prueba");
  await pulsar("Cerrar receta ↑");
  assert.equal(contenedor.querySelector(".detalle"), null);
  assert.equal(document.activeElement.getAttribute("aria-label"), "Biblioteca de favoritas");
});

test("quitar una favorita filtrada cierra su detalle y mantiene el foco visible", async () => {
  globalThis.fetch.mock.mockImplementation(async () => respuesta([pasta]));
  await montar(Recetario);
  await buscarEnFormulario("pasta");
  await pulsar("Favorita: Pasta de prueba");
  await act(async () => contenedor.querySelector("input[type=checkbox]").click());
  await pulsar("Ver receta: Pasta de prueba");
  await pulsar("Favorita: Pasta de prueba");
  assert.equal(contenedor.querySelector(".detalle"), null);
  assert.equal(contenedor.querySelectorAll(".tarjeta-receta").length, 0);
  assert.equal(document.activeElement.getAttribute("aria-label"), "Resultados de recetas");
  await act(async () => contenedor.querySelector("input[type=checkbox]").click());
  assert.equal(contenedor.querySelector(".detalle"), null);
  assert.equal(contenedor.querySelectorAll(".tarjeta-receta").length, 1);
});

test("cambiar de sección durante la carga ignora la respuesta pendiente", async () => {
  const pendiente = Promise.withResolvers();
  globalThis.fetch.mock.mockImplementation(() => pendiente.promise);
  await montar(Recetario);
  await buscarEnFormulario("pasta");
  assert.equal(contenedor.querySelector("input[type=search]").disabled, true);
  await pulsar("Mis favoritas (0)");
  await act(async () => { pendiente.resolve(respuesta([pasta])); });
  assert.equal(contenedor.querySelectorAll(".tarjeta-receta").length, 0);
  await pulsar("Buscar recetas");
  assert.match(contenedor.textContent, /La mesa está puesta/);
});

test("una lista dañada no rompe la biblioteca y el almacenamiento bloqueado permite guardar en memoria", async () => {
  localStorage.setItem("pasaporte:favoritas:v1", "JSON dañado");
  mock.method(dom.window.Storage.prototype, "setItem", () => { throw new Error("Sin espacio"); });
  mock.method(console, "warn", () => {});
  globalThis.fetch.mock.mockImplementation(async () => respuesta([pasta]));
  await montar(Recetario);
  await buscarEnFormulario("pasta");
  await pulsar("Favorita: Pasta de prueba");
  await pulsar("Mis favoritas (1)");
  assert.equal(contenedor.querySelectorAll(".tarjeta-receta").length, 1);
});
