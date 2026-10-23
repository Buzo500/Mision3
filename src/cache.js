const PREFIJO_CACHE = "pasaporte:recetas:v1:";

export function leerCache(busqueda) {
  try {
    const guardado = localStorage.getItem(`${PREFIJO_CACHE}${busqueda}`);
    if (guardado === null) return null;

    const recetas = JSON.parse(guardado);
    return Array.isArray(recetas) ? recetas : null;
  } catch (error) {
    // Una caché dañada o bloqueada no debe impedir consultar la API.
    console.warn("No se ha podido leer la caché de recetas:", error);
    return null;
  }
}

export function guardarCache(busqueda, recetas) {
  try {
    localStorage.setItem(`${PREFIJO_CACHE}${busqueda}`, JSON.stringify(recetas));
  } catch (error) {
    // Si no hay espacio o permiso, las recetas se muestran igualmente.
    console.warn("No se ha podido guardar la caché de recetas:", error);
  }
}
