import { useState } from "react";
import EstadoResultados from "./EstadoResultados.jsx";
import ResultadosRecetas from "./ResultadosRecetas.jsx";

export default function BibliotecaFavoritas({ recetas, pendientes, onFavorita }) {
  const [idSeleccionada, setIdSeleccionada] = useState(null);
  const idsFavoritas = recetas.map((receta) => receta.id);

  return (
    <ResultadosRecetas recetas={recetas} favoritas={idsFavoritas} idSeleccionada={idSeleccionada}
      onSeleccionar={setIdSeleccionada} onFavorita={onFavorita} soloFavoritas={true} etiqueta="Biblioteca de favoritas">
      <div role="status" aria-live="polite">
        <EstadoResultados titulo={recetas.length ? "Tu recetario personal" : "Tu recetario está por empezar"}
          conResultados={recetas.length > 0}>
          {recetas.length
            ? `${recetas.length} ${recetas.length === 1 ? "receta guardada" : "recetas guardadas"} para volver a cocinar. Puedes consultarlas sin repetir la búsqueda.`
            : "Pulsa «Guardar» en una receta para tenerla siempre aquí, también después de recargar la página."}
        </EstadoResultados>
        {pendientes > 0 && <p className="aviso-favoritas">
          {pendientes === 1 ? "Queda 1 favorita" : `Quedan ${pendientes} favoritas`} de la versión anterior sin sus datos.
          {" "}La próxima búsqueda permitirá recuperar las recetas que coincidan.
        </p>}
      </div>
    </ResultadosRecetas>
  );
}
