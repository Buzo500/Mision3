import { useRef, useState } from "react";
import EstadoResultados from "./EstadoResultados.jsx";
import TarjetaReceta from "./TarjetaReceta.jsx";
import DetalleReceta from "./DetalleReceta.jsx";

export default function BibliotecaFavoritas({ recetas, pendientes, onFavorita }) {
  const [idSeleccionada, setIdSeleccionada] = useState(null);
  const seleccionada = recetas.find((receta) => receta.id === idSeleccionada);
  const bibliotecaRef = useRef(null);

  function cerrarDetalle() {
    setIdSeleccionada(null);
    bibliotecaRef.current.focus();
  }

  function quitarFavorita(receta) {
    onFavorita(receta);
    if (receta.id === idSeleccionada) setIdSeleccionada(null);
    // La tarjeta desaparece: devolvemos el foco a un elemento que permanece visible.
    bibliotecaRef.current.focus();
  }

  return (
    <div className="zona-resultados" ref={bibliotecaRef} tabIndex={-1} aria-label="Biblioteca de favoritas">
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
      {seleccionada && <DetalleReceta receta={seleccionada} onCerrar={cerrarDetalle} />}
      <div className="recetas">
        {recetas.map((receta) => (
          <TarjetaReceta key={receta.id} receta={receta} favorita={true}
            onFavorita={() => quitarFavorita(receta)} onVer={setIdSeleccionada} />
        ))}
      </div>
    </div>
  );
}
