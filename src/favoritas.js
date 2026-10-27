import { leerCache, PREFIJO_CACHE } from "./cache.js";
import { prepararRecetas } from "./logica.js";

export function idDeFavorita(favorita) {
  return typeof favorita === "string" ? favorita : favorita.id;
}

function esRecetaCompleta(receta) {
  return ["id", "nombre", "categoria", "origen", "imagen", "instrucciones"]
    .every((campo) => typeof receta[campo] === "string")
    && Array.isArray(receta.ingredientes)
    && receta.ingredientes.every((ingrediente) => ingrediente
      && ["id", "nombre", "cantidad"].every((campo) => typeof ingrediente[campo] === "string"));
}

export function completarFavoritas(favoritas, recetas) {
  // Los IDs antiguos se conservan hasta encontrar los datos de su receta.
  return favoritas.map((favorita) => typeof favorita === "string"
    ? recetas.find((receta) => receta.id === favorita) ?? favorita
    : favorita);
}

export function prepararFavoritas(guardadas) {
  if (!Array.isArray(guardadas)) return [];
  const favoritas = [];
  for (const guardada of guardadas) {
    const id = typeof guardada === "string" ? guardada : guardada?.id;
    if (typeof id !== "string" || !id.trim() || favoritas.some((receta) => idDeFavorita(receta) === id)) continue;
    favoritas.push(typeof guardada === "object" && esRecetaCompleta(guardada) ? guardada : id);
  }

  if (favoritas.every((receta) => typeof receta !== "string")) return favoritas;
  const recetasAnteriores = [];
  try {
    // La versión anterior guardaba solo IDs: recuperamos sus datos de la caché disponible.
    for (let indice = 0; indice < localStorage.length; indice += 1) {
      const clave = localStorage.key(indice);
      if (clave?.startsWith(PREFIJO_CACHE)) {
        recetasAnteriores.push(...prepararRecetas(leerCache(clave.slice(PREFIJO_CACHE.length))));
      }
    }
  } catch {
    // Si no se puede leer la caché, los IDs siguen guardados para otra búsqueda.
  }
  return completarFavoritas(favoritas, recetasAnteriores);
}
