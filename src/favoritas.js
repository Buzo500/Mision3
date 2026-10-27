export const BIBLIOTECA_INICIAL = { recetas: [], pendientes: [] };

function esRecetaCompleta(receta) {
  return receta && ["id", "nombre", "categoria", "origen", "imagen", "instrucciones"]
    .every((campo) => typeof receta[campo] === "string")
    && receta.id.trim() !== ""
    && Array.isArray(receta.ingredientes)
    && receta.ingredientes.every((ingrediente) => ingrediente
      && ["id", "nombre", "cantidad"].every((campo) => typeof ingrediente[campo] === "string"));
}

export function prepararBiblioteca(guardado) {
  // Se admiten la biblioteca actual y la lista antigua de favoritas.
  const registros = Array.isArray(guardado) ? guardado : [
    ...(Array.isArray(guardado?.recetas) ? guardado.recetas : []),
    ...(Array.isArray(guardado?.pendientes) ? guardado.pendientes : []),
  ];
  const recetas = [];
  const pendientes = [];

  for (const registro of registros) {
    if (typeof registro === "string") {
      const id = registro.trim();
      if (id && !pendientes.includes(id)) pendientes.push(id);
    } else if (esRecetaCompleta(registro) && !recetas.some((receta) => receta.id === registro.id)) {
      recetas.push(registro);
    }
  }

  return {
    recetas,
    pendientes: pendientes.filter((id) => !recetas.some((receta) => receta.id === id)),
  };
}

export function completarBiblioteca(biblioteca, encontradas) {
  const recetas = [...biblioteca.recetas];
  const pendientes = [];

  // Cada ID pendiente se recupera con la búsqueda o se conserva para otra.
  for (const id of biblioteca.pendientes) {
    const receta = encontradas.find((encontrada) => encontrada.id === id);
    if (receta) recetas.push(receta);
    else pendientes.push(id);
  }

  if (recetas.length === biblioteca.recetas.length) return biblioteca;
  return { recetas, pendientes };
}
