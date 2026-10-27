import { useRef } from "react";
import TarjetaReceta from "./TarjetaReceta.jsx";
import DetalleReceta from "./DetalleReceta.jsx";

export default function ResultadosRecetas({
  recetas, favoritas, idSeleccionada, onSeleccionar, onFavorita, children,
  soloFavoritas = false, cargando = false, etiqueta = "Resultados de recetas",
}) {
  const resultadosRef = useRef(null);
  const seleccionada = recetas.find((receta) => receta.id === idSeleccionada);

  function cerrarDetalle() {
    onSeleccionar(null);
    resultadosRef.current.focus();
  }

  function alternarFavorita(receta) {
    onFavorita(receta);
    if (soloFavoritas && favoritas.includes(receta.id)) {
      if (receta.id === idSeleccionada) onSeleccionar(null);
      // Si la tarjeta desaparece, el foco vuelve a una zona que permanece visible.
      resultadosRef.current.focus();
    }
  }

  return (
    <div className="zona-resultados" ref={resultadosRef} tabIndex={-1} aria-label={etiqueta} aria-busy={cargando}>
      {children}
      {seleccionada && <DetalleReceta receta={seleccionada} onCerrar={cerrarDetalle} />}
      <div className="recetas">
        {recetas.map((receta) => (
          <TarjetaReceta key={receta.id} receta={receta} favorita={favoritas.includes(receta.id)}
            onFavorita={alternarFavorita} onVer={onSeleccionar} />
        ))}
      </div>
    </div>
  );
}
