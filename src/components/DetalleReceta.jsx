import { useEffect, useRef } from "react";

export default function DetalleReceta({ receta, onCerrar }) {
  const tituloRef = useRef(null);

  useEffect(() => {
    // El foco es un sistema del navegador: al cambiar la selección, vamos al título.
    tituloRef.current.focus();
  }, [receta.id]);

  return (
    <section className="detalle" aria-labelledby="detalle-nombre">
      <div className="detalle-cabecera">
        <p className="antetitulo">Del recetario a tu cocina</p>
        <button className="boton-texto" type="button" onClick={onCerrar}>Cerrar receta <span aria-hidden="true">↑</span></button>
      </div>
      <p className="categoria-receta">{receta.categoria} · {receta.origen}</p>
      <h3 id="detalle-nombre" ref={tituloRef} tabIndex={-1}>{receta.nombre}</h3>
      <p className="detalle-nota">Ingredientes y preparación en el idioma original de TheMealDB.</p>
      <div className="detalle-contenido">
        <div className="detalle-ingredientes">
          <h4>Ingredientes</h4>
          {receta.ingredientes.length === 0 ? <p>No hay ingredientes disponibles para esta receta.</p> : (
            <ul>
              {receta.ingredientes.map((ingrediente) => (
                <li key={ingrediente.id}><span>{ingrediente.nombre}</span><span>{ingrediente.cantidad}</span></li>
              ))}
            </ul>
          )}
        </div>
        <div className="detalle-preparacion">
          <h4>Preparación</h4>
          <p id="detalle-instrucciones">{receta.instrucciones}</p>
        </div>
      </div>
    </section>
  );
}
