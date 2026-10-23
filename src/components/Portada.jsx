export default function Portada() {
  return (
    <section id="inicio" className="portada contenedor" aria-labelledby="titulo-principal">
      <div className="portada-texto">
        <p className="antetitulo"><span className="raya" aria-hidden="true"></span> Un recetario sin fronteras</p>
        <h1 id="titulo-principal">El mundo,<br />a la <em>mesa.</em></h1>
        <p className="introduccion">Hay muchas formas de viajar.<br />La nuestra empieza en la cocina.</p>
        <p className="descripcion">Descubre sabores de otros lugares, encuentra tu próxima receta y hazle sitio a algo nuevo.</p>
        <a className="boton enlace-explorar" href="#explorador">Explorar el recetario <span aria-hidden="true">↗</span></a>
        <div className="nota-portada">
          <span className="estrella" aria-hidden="true">✳</span>
          <p>Un poco de curiosidad.<br />Una buena receta. Nada más.</p>
        </div>
      </div>
      <figure className="portada-foto">
        <img src="/images/pasta-verde.jpg" alt="Un plato de pasta con setas, hojas verdes y queso sobre una mesa de madera." width="1400" height="1023" />
        <div className="sello-foto" aria-hidden="true">
          <span>Sin fronteras</span>
          <span className="sello-centro">Buen<br /><em>provecho.</em></span>
          <span>Con mucho gusto</span>
        </div>
        <figcaption><span>El placer de descubrir, el gusto de cocinar.</span><span aria-hidden="true">01 /</span></figcaption>
      </figure>
    </section>
  );
}
