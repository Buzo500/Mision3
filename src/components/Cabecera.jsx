export default function Cabecera() {
  return (
    <header className="cabecera contenedor">
      <a className="marca" href="#inicio" aria-label="Pasaporte gastronómico, inicio">
        <span className="marca-nombre">pasaporte<span className="marca-punto">.</span></span>
        <span className="marca-subtitulo">Gastronómico</span>
      </a>
      <nav className="navegacion" aria-label="Navegación principal">
        <a className="enlace-activo" href="#explorador">El recetario</a>
        <a href="#filosofia">Nuestra filosofía</a>
      </nav>
      <span className="nota-cabecera">Para viajar con el paladar <span aria-hidden="true">↗</span></span>
    </header>
  );
}
