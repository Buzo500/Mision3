import { leerCache, PREFIJO_CACHE } from "./cache.js";
import { prepararRecetas } from "./logica.js";

export const BIBLIOTECA_INICIAL = { recetas: [], pendientes: [] };

function esRecetaCompleta(receta) {
  return ["id", "nombre", "categoria", "origen", "imagen", "instrucciones"]
    .every((campo) => typeof receta[campo] === "string")
    && Array.isArray(receta.ingredientes)
    && receta.ingredientes.every((ingrediente) => ingrediente
      && ["id", "nombre", "cantidad"].every((campo) => typeof ingrediente[campo] === "string"));
}

export function completarBiblioteca(biblioteca, encontradas) {
  const recuperadas = biblioteca.pendientes
    .map((id) => encontradas.find((receta) => receta.id === id))
    .filter(Boolean);
  if (recuperadas.length === 0) return biblioteca;

  return {
    recetas: [...biblioteca.recetas, ...recuperadas],
    pendientes: biblioteca.pendientes.filter((id) => !recuperadas.some((receta) => receta.id === id)),
  };
}

export function prepararBiblioteca(guardado) {
  // Solo la lectura admite el formato antiguo. Las vistas reciben recetas completas.
  const registros = Array.isArray(guardado) ? guardado : [
    ...(Array.isArray(guardado?.recetas) ? guardado.recetas : []),
    ...(Array.isArray(guardado?.pendientes) ? guardado.pendientes : []),
  ];
  const recetas = [];
  const idsAntiguos = [];
  for (const registro of registros) {
    const valorId = typeof registro === "string" ? registro : registro?.id;
    if (typeof valorId !== "string" || !valorId.trim()) continue;
    const id = valorId.trim();
    if (typeof registro === "object" && esRecetaCompleta(registro)) {
      if (!recetas.some((receta) => receta.id === id)) recetas.push({ ...registro, id });
    } else if (!idsAntiguos.includes(id)) {
      idsAntiguos.push(id);
    }
  }
  const biblioteca = {
    recetas,
    pendientes: idsAntiguos.filter((id) => !recetas.some((receta) => receta.id === id)),
  };
  if (biblioteca.pendientes.length === 0) return biblioteca;

  const recetasAnteriores = [];
  try {
    for (let indice = 0; indice < localStorage.length; indice += 1) {
      const clave = localStorage.key(indice);
      if (clave?.startsWith(PREFIJO_CACHE)) {
        recetasAnteriores.push(...prepararRecetas(leerCache(clave.slice(PREFIJO_CACHE.length))));
      }
    }
  } catch {
    // Los IDs que no se recuperen quedan aparte y sobreviven a las recargas.
  }
  return completarBiblioteca(biblioteca, recetasAnteriores);
}
