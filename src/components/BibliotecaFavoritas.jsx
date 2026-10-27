import { useState } from "react";
import { obtenerMensajeFavoritas } from "../mensajes.js";
import EstadoResultados from "./EstadoResultados.jsx";
import ResultadosRecetas from "./ResultadosRecetas.jsx";

export default function BibliotecaFavoritas({ recetas, pendientes, onFavorita }) {
  const [idSeleccionada, setIdSeleccionada] = useState(null);
  const idsFavoritas = recetas.map((receta) => receta.id);
  const { titulo, mensaje, avisoPendientes } = obtenerMensajeFavoritas({ cantidad: recetas.length, pendientes });

  return (
    <ResultadosRecetas recetas={recetas} favoritas={idsFavoritas} idSeleccionada={idSeleccionada}
      onSeleccionar={setIdSeleccionada} onFavorita={onFavorita} soloFavoritas={true} etiqueta="Biblioteca de favoritas">
      <div role="status" aria-live="polite">
        <EstadoResultados titulo={titulo} conResultados={recetas.length > 0}>
          {mensaje}
        </EstadoResultados>
        {avisoPendientes && <p className="aviso-favoritas">{avisoPendientes}</p>}
      </div>
    </ResultadosRecetas>
  );
}
