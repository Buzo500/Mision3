function textoConDefecto(valor, porDefecto) {
  return typeof valor === "string" && valor.trim() ? valor.trim() : porDefecto;
}

function prepararIngredientes(receta) {
  // Cada posición corresponde a un campo fijo de TheMealDB.
  return Array.from({ length: 20 })
    .map((valor, indice) => ({
      id: `strIngredient${indice + 1}`,
      nombre: textoConDefecto(receta[`strIngredient${indice + 1}`], ""),
      cantidad: textoConDefecto(receta[`strMeasure${indice + 1}`], ""),
    }))
    .filter((ingrediente) => ingrediente.nombre !== "");
}

export function prepararRecetas(datos) {
  if (!Array.isArray(datos)) return [];

  // Descartamos entradas sin identidad para que cada tarjeta tenga una key estable.
  return datos
    .filter((receta) => receta !== null && typeof receta === "object")
    .map((receta) => ({
      id: textoConDefecto(receta.idMeal, ""),
      nombre: textoConDefecto(receta.strMeal, "Receta sin nombre"),
      categoria: textoConDefecto(receta.strCategory, "Sin categoría"),
      origen: textoConDefecto(receta.strArea, "Origen no disponible"),
      imagen: textoConDefecto(receta.strMealThumb, ""),
      instrucciones: textoConDefecto(receta.strInstructions, "Preparación no disponible."),
      ingredientes: prepararIngredientes(receta),
    }))
    .filter((receta) => receta.id !== "");
}

export function filtrarPorCategoria(recetas, categoria) {
  return recetas.filter((receta) => categoria === "" || receta.categoria === categoria);
}

export function resumirCategorias(recetas) {
  return recetas.reduce((resumen, receta) => {
    const grupo = resumen.find((elemento) => elemento.categoria === receta.categoria);

    if (grupo) {
      grupo.cantidad += 1;
    } else {
      resumen.push({ categoria: receta.categoria, cantidad: 1 });
    }

    return resumen;
  }, []);
}
