import { useState } from "react";

export default function FormularioBusqueda({ cargando, onBuscar, children }) {
  const [texto, setTexto] = useState("");
  const [aviso, setAviso] = useState("");

  function enviar(evento) {
    evento.preventDefault();
    const nombre = texto.trim();
    setTexto(nombre);
    if (!nombre) {
      setAviso("Escribe el nombre de un plato para buscar recetas.");
      return;
    }
    setAviso("");
    onBuscar(nombre);
  }

  return (
    <form className="formulario-busqueda" onSubmit={enviar}>
      <div className="campo-busqueda">
        <label htmlFor="busqueda">¿Qué te apetece cocinar?</label>
        <div className="fila-busqueda">
          <span className="icono-busqueda" aria-hidden="true"></span>
          <input id="busqueda" type="search" value={texto}
            onChange={(evento) => { setTexto(evento.target.value); setAviso(""); }}
            placeholder="Prueba con chicken, pasta, cake…" disabled={cargando}
            aria-describedby={aviso ? "ayuda-busqueda aviso-busqueda" : "ayuda-busqueda"}
            aria-invalid={aviso !== ""} required />
          <button className="boton" type="submit" disabled={cargando}>
            {cargando ? "Buscando…" : "Buscar"} <span aria-hidden="true">↗</span>
          </button>
        </div>
        {aviso && <p id="aviso-busqueda" className="estado-error" role="alert">{aviso}</p>}
      </div>
      {children}
    </form>
  );
}
