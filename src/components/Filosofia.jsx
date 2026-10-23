export default function Filosofia() {
  return (
    <section id="filosofia" className="filosofia" aria-labelledby="titulo-filosofia">
      <div className="contenedor filosofia-interior">
        <div>
          <p className="antetitulo">02 / Nuestra filosofía</p>
          <h2 id="titulo-filosofia">Otras cocinas.<br />La misma <em>mesa.</em></h2>
        </div>
        <div className="filosofia-texto">
          <p>No hace falta un billete de avión para salir de lo de siempre. A veces basta con un ingrediente distinto, una receta que no conocías y las ganas de probar.</p>
          <p>Pasaporte gastronómico nace de esa idea: acercar otras cocinas a la tuya. Sin complicaciones. A tu ritmo. Y siempre con hambre de descubrir.</p>
          <a className="enlace-texto" href="#explorador">Tu próximo viaje empieza aquí <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>
  );
}
