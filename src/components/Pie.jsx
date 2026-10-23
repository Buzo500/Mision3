export default function Pie() {
  return (
    <footer className="pie contenedor">
      <a className="marca marca-pie" href="#inicio" aria-label="Pasaporte gastronómico, volver al inicio">
        <span className="marca-nombre">pasaporte<span className="marca-punto">.</span></span>
        <span className="marca-subtitulo">Gastronómico</span>
      </a>
      <p>Hecho para los que siempre quieren probar algo más.</p>
      <div className="creditos">
        <span>Recetario con <a href="https://www.themealdb.com/">TheMealDB</a></span>
        <span>Fotografía de <a href="https://unsplash.com/">Unsplash</a></span>
      </div>
    </footer>
  );
}
