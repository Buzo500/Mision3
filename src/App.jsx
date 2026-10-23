import Cabecera from "./components/Cabecera.jsx";
import Portada from "./components/Portada.jsx";
import ExploradorRecetas from "./components/ExploradorRecetas.jsx";
import Filosofia from "./components/Filosofia.jsx";
import Pie from "./components/Pie.jsx";

export default function App() {
  return (
    <>
      <a className="saltar-contenido" href="#contenido">Saltar al contenido</a>
      <Cabecera />
      <main id="contenido">
        <Portada />
        <ExploradorRecetas />
        <Filosofia />
      </main>
      <Pie />
    </>
  );
}
