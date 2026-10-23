export default function EstadoResultados({ titulo, children, esError = false, conResultados = false, onReintentar }) {
  return (
    <div className={`estado-resultados ${esError ? "estado-error" : ""} ${conResultados ? "con-resultados" : ""}`}>
      {!conResultados && <span className="ilustracion-plato" aria-hidden="true"><span></span></span>}
      <h3 id="titulo-resultados">{titulo}</h3>
      <p className="mensaje">{children}</p>
      {onReintentar && (
        <button id="boton-reintentar" className="boton" type="button" onClick={onReintentar}>
          Volver a intentar <span aria-hidden="true">↗</span>
        </button>
      )}
    </div>
  );
}
