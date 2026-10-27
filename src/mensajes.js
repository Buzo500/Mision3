export function obtenerMensajeFavoritas({ cantidad, pendientes }) {
  const unidad = cantidad === 1 ? "receta guardada" : "recetas guardadas";
  const titulo = cantidad > 0 ? "Tu recetario personal" : "Tu recetario está por empezar";
  const mensaje = cantidad > 0
    ? `${cantidad} ${unidad} para volver a cocinar. Puedes consultarlas sin repetir la búsqueda.`
    : "Pulsa «Guardar» en una receta para tenerla siempre aquí, también después de recargar la página.";
  let avisoPendientes = "";
  if (pendientes > 0) {
    const inicio = pendientes === 1 ? "Queda 1 favorita" : `Quedan ${pendientes} favoritas`;
    avisoPendientes = `${inicio} de la versión anterior sin sus datos. La próxima búsqueda permitirá recuperar las recetas que coincidan.`;
  }
  return { titulo, mensaje, avisoPendientes };
}

export function obtenerMensajeResultados({ estado, busqueda, categoria, soloFavoritas, cantidad }) {
  if (estado === "cargando") {
    return {
      titulo: "Un momento, estamos en la cocina.",
      mensaje: `Buscando recetas para «${busqueda}»…`,
    };
  }
  if (estado === "error") {
    return {
      titulo: "Esta vez no hemos llegado a la mesa.",
      mensaje: "No se han podido cargar las recetas. Comprueba tu conexión o vuelve a intentarlo.",
    };
  }
  if (estado === "inicial") {
    return {
      titulo: "La mesa está puesta.",
      mensaje: "Busca un plato y encuentra inspiración para tu próxima comida.",
    };
  }
  if (cantidad > 0) {
    return {
      titulo: `${cantidad} ${cantidad === 1 ? "receta" : "recetas"} para descubrir`,
      mensaje: `Resultados para «${busqueda}».${categoria ? ` Categoría: ${categoria}.` : ""}`,
    };
  }
  return {
    titulo: "Un destino por descubrir.",
    mensaje: soloFavoritas
      ? "No tienes favoritas con estos filtros. Desmarca «Solo favoritas de esta búsqueda» para ver más recetas."
      : `No hay recetas para «${busqueda}». Prueba otro nombre en inglés, como chicken o cake.`,
  };
}
