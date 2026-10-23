import Cabecera from "./components/Cabecera.jsx";
import Portada from "./components/Portada.jsx";
import Filosofia from "./components/Filosofia.jsx";
import Pie from "./components/Pie.jsx";

export default function App() {
  return (
    <>
      <a className="saltar-contenido" href="#contenido">Saltar al contenido</a>
      <Cabecera />
      <main id="contenido">
        <Portada />
        <section id="explorador" className="explorador contenedor" aria-labelledby="titulo-explorador">
          <p className="antetitulo">01 / El recetario</p>
          <h2 id="titulo-explorador">¿Dónde te lleva el <em>hambre?</em></h2>
          <p>Encuentra inspiración para tu próxima comida.</p>
        </section>
        <Filosofia />
      </main>
      <Pie />
    </>
  );
}
