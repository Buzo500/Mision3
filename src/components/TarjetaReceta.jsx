import { useState } from "react";

export default function TarjetaReceta({ receta, favorita, onFavorita, onVer }) {
  const [falloImagen, setFalloImagen] = useState(false);

  return (
    <article className="tarjeta-receta">
      <div className="foto-receta">
        {receta.imagen && !falloImagen ? (
          <img src={receta.imagen} alt={receta.nombre} loading="lazy" onError={() => setFalloImagen(true)} />
        ) : <p className="sin-imagen">Imagen no disponible</p>}
      </div>
      <p className="categoria-receta">{receta.categoria}</p>
      <h4>{receta.nombre}</h4>
      <p className="origen-receta">{receta.origen}</p>
      <div className="acciones-receta">
        <button className="boton-texto ver-receta" type="button"
          aria-label={`Ver receta: ${receta.nombre}`} onClick={() => onVer(receta.id)}>
          Ver receta <span aria-hidden="true">↗</span>
        </button>
        <button className="boton-favorita" type="button" aria-pressed={favorita}
          aria-label={`Favorita: ${receta.nombre}`} onClick={() => onFavorita(receta.id)}>
          <span aria-hidden="true">{favorita ? "♥" : "♡"}</span> {favorita ? "Guardada" : "Guardar"}
        </button>
      </div>
    </article>
  );
}
