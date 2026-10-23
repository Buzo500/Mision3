import { leerCache, guardarCache } from "./cache.js";

const URL_API = "https://www.themealdb.com/api/json/v1/1/search.php";

export async function buscarRecetas(nombre) {
  const busqueda = nombre.trim().toLowerCase();
  const guardadas = leerCache(busqueda);

  // null significa que no hay caché; [] es una búsqueda sin resultados.
  if (guardadas !== null) return guardadas;

  const parametros = new URLSearchParams({ s: busqueda });
  const respuesta = await fetch(`${URL_API}?${parametros}`);

  if (!respuesta.ok) {
    throw new Error(`No se pudieron cargar las recetas (error HTTP ${respuesta.status}).`);
  }

  const datos = await respuesta.json();
  if (datos?.meals !== null && !Array.isArray(datos?.meals)) {
    throw new Error("La API ha devuelto una respuesta inesperada.");
  }

  // TheMealDB devuelve null cuando la búsqueda no encuentra recetas.
  const recetas = datos.meals ?? [];
  guardarCache(busqueda, recetas);
  return recetas;
}
