import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import { buscarRecetas } from "../src/api.js";
import { guardarCache, leerCache } from "../src/cache.js";
import { BIBLIOTECA_INICIAL, completarBiblioteca, prepararBiblioteca } from "../src/favoritas.js";
import { filtrarPorCategoria, prepararRecetas, resumirCategorias } from "../src/logica.js";

const almacenamientoOriginal = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
let almacenamiento;

beforeEach(() => {
  almacenamiento = new Map();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (clave) => almacenamiento.get(clave) ?? null,
      setItem: (clave, valor) => almacenamiento.set(clave, valor),
    },
  });
  mock.method(console, "warn", () => {});
});

afterEach(() => {
  mock.restoreAll();
  if (almacenamientoOriginal) {
    Object.defineProperty(globalThis, "localStorage", almacenamientoOriginal);
  } else {
    delete globalThis.localStorage;
  }
});

test("descarta entradas nulas o sin ID y completa los campos ausentes", () => {
  const recetas = prepararRecetas([null, undefined, "texto", {}, { idMeal: "  " }, { idMeal: " 42 " }]);

  assert.deepEqual(recetas, [{
    id: "42",
    nombre: "Receta sin nombre",
    categoria: "Sin categoría",
    origen: "Origen no disponible",
    imagen: "",
    instrucciones: "Preparación no disponible.",
    ingredientes: [],
  }]);
  assert.deepEqual(prepararRecetas(null), []);
});

test("los ingredientes conservan la identidad de su campo aunque haya huecos", () => {
  const [receta] = prepararRecetas([{
    idMeal: "42",
    strMeal: " Pasta ",
    strIngredient1: " Tomato ",
    strMeasure1: " 2 ",
    strIngredient2: " ",
    strIngredient3: "Basil",
    strMeasure3: null,
  }]);

  assert.equal(receta.nombre, "Pasta");
  assert.deepEqual(receta.ingredientes, [
    { id: "strIngredient1", nombre: "Tomato", cantidad: "2" },
    { id: "strIngredient3", nombre: "Basil", cantidad: "" },
  ]);
});

test("el filtro y el resumen derivan los resultados sin cambiar las recetas", () => {
  const recetas = Object.freeze([
    Object.freeze({ id: "1", categoria: "Pasta" }),
    Object.freeze({ id: "2", categoria: "Dessert" }),
    Object.freeze({ id: "3", categoria: "Pasta" }),
  ]);

  assert.deepEqual(filtrarPorCategoria(recetas, "Pasta"), [recetas[0], recetas[2]]);
  assert.deepEqual(filtrarPorCategoria(recetas, ""), recetas);
  assert.deepEqual(filtrarPorCategoria(recetas, "Seafood"), []);
  const esperado = [{ categoria: "Pasta", cantidad: 2 }, { categoria: "Dessert", cantidad: 1 }];
  assert.deepEqual(resumirCategorias(recetas), esperado);
  assert.deepEqual(resumirCategorias(recetas), esperado);
  assert.deepEqual(resumirCategorias([]), []);
});

test("preparar la biblioteca conserva recetas válidas, elimina duplicados y descarta datos dañados", () => {
  const [receta] = prepararRecetas([{ idMeal: "1" }]);
  const guardado = {
    recetas: [receta, receta, { id: "3" }, { ...receta, id: "4", ingredientes: [null] }, null],
    pendientes: ["1", "2", " 2 ", "", null, 5],
  };
  mock.method(localStorage, "getItem", () => { throw new Error("No debe consultar el almacenamiento"); });

  assert.deepEqual(prepararBiblioteca(guardado), { recetas: [receta], pendientes: ["2"] });
  for (const valor of [null, {}, "texto", { recetas: {}, pendientes: 1 }]) {
    assert.deepEqual(prepararBiblioteca(valor), BIBLIOTECA_INICIAL);
  }
});

test("completar recupera solo IDs pendientes, sin duplicar recetas ni modificar la biblioteca original", () => {
  const [primera, segunda, tercera] = prepararRecetas([{ idMeal: "1" }, { idMeal: "2" }, { idMeal: "3" }]);
  const biblioteca = Object.freeze({
    recetas: Object.freeze([primera]),
    pendientes: Object.freeze(["2", "4"]),
  });

  assert.equal(completarBiblioteca(biblioteca, [tercera]), biblioteca);
  const completada = completarBiblioteca(biblioteca, [primera, segunda, segunda, tercera]);
  assert.deepEqual(completada, { recetas: [primera, segunda], pendientes: ["4"] });
  assert.equal(completarBiblioteca(completada, [segunda]), completada);
});

test("la caché distingue una búsqueda vacía de una búsqueda no guardada", () => {
  assert.equal(leerCache("cake"), null);
  guardarCache("cake", []);
  assert.deepEqual(leerCache("cake"), []);
});

test("una caché con JSON dañado o con otro tipo se ignora", () => {
  almacenamiento.set("pasaporte:recetas:v1:cake", "{roto");
  assert.equal(leerCache("cake"), null);
  almacenamiento.set("pasaporte:recetas:v1:cake", JSON.stringify({ meals: [] }));
  assert.equal(leerCache("cake"), null);
});

test("los errores de acceso o espacio de la caché no se propagan", () => {
  mock.method(localStorage, "getItem", () => { throw new Error("Acceso bloqueado"); });
  mock.method(localStorage, "setItem", () => { throw new Error("Sin espacio"); });
  assert.equal(leerCache("cake"), null);
  assert.doesNotThrow(() => guardarCache("cake", []));
});

test("la API normaliza la consulta y reutiliza la respuesta guardada", async () => {
  const recetas = [{ idMeal: "42", strMeal: "Chicken" }];
  const peticion = mock.method(globalThis, "fetch", async (direccion) => {
    assert.equal(new URL(direccion).searchParams.get("s"), "chicken & rice");
    return { ok: true, json: async () => ({ meals: recetas }) };
  });

  assert.deepEqual(await buscarRecetas(" Chicken & Rice "), recetas);
  assert.deepEqual(await buscarRecetas("chicken & rice"), recetas);
  assert.equal(peticion.mock.callCount(), 1);
});

test("una respuesta sin resultados se guarda y tampoco repite la petición", async () => {
  const peticion = mock.method(globalThis, "fetch", async () => ({
    ok: true,
    json: async () => ({ meals: null }),
  }));
  assert.deepEqual(await buscarRecetas("inexistente"), []);
  assert.deepEqual(await buscarRecetas("inexistente"), []);
  assert.equal(peticion.mock.callCount(), 1);
});

test("un error HTTP se comunica y no se guarda como resultado vacío", async () => {
  mock.method(globalThis, "fetch", async () => ({ ok: false, status: 503 }));
  await assert.rejects(buscarRecetas("cake"), /HTTP 503/);
  assert.equal(leerCache("cake"), null);
});

test("un rechazo de red se propaga para que la interfaz permita reintentar", async () => {
  mock.method(globalThis, "fetch", async () => { throw new Error("Sin conexión"); });
  await assert.rejects(buscarRecetas("cake"), /Sin conexión/);
  assert.equal(leerCache("cake"), null);
});

test("una respuesta inesperada no se guarda", async () => {
  mock.method(globalThis, "fetch", async () => ({
    ok: true,
    json: async () => ({ meals: {} }),
  }));
  await assert.rejects(buscarRecetas("cake"), /respuesta inesperada/);
  assert.equal(leerCache("cake"), null);
});

test("la búsqueda funciona aunque localStorage esté bloqueado", async () => {
  mock.method(localStorage, "getItem", () => { throw new Error("Bloqueado"); });
  mock.method(localStorage, "setItem", () => { throw new Error("Bloqueado"); });
  const recetas = [{ idMeal: "42" }];
  mock.method(globalThis, "fetch", async () => ({ ok: true, json: async () => ({ meals: recetas }) }));

  assert.deepEqual(await buscarRecetas("cake"), recetas);
});
