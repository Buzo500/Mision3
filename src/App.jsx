import Cabecera from "./components/Cabecera.jsx";
import Portada from "./components/Portada.jsx";
import Recetario from "./components/Recetario.jsx";
import Filosofia from "./components/Filosofia.jsx";
import Pie from "./components/Pie.jsx";

export default function App() {
  return (
    <>
      <a className="saltar-contenido" href="#contenido">Saltar al contenido</a>
      <Cabecera />
      <main id="contenido">
        <Portada />
        <Recetario />
        <Filosofia />
      </main>
      <Pie />
    </>
  );
}
