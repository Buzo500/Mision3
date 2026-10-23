import { useRef, useState } from "react";
import { buscarRecetas } from "../api.js";
import { filtrarPorCategoria, prepararRecetas, resumirCategorias } from "../logica.js";
import useLocalStorage from "../hooks/useLocalStorage.js";
import FormularioBusqueda from "./FormularioBusqueda.jsx";
import FiltroCategoria from "./FiltroCategoria.jsx";
import EstadoResultados from "./EstadoResultados.jsx";
import TarjetaReceta from "./TarjetaReceta.jsx";
import DetalleReceta from "./DetalleReceta.jsx";

export default function ExploradorRecetas() {
  const [recetas, setRecetas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("inicial");
  const [categoria, setCategoria] = useState("");
  const [soloFavoritas, setSoloFavoritas] = useState(false);
  const [idSeleccionada, setIdSeleccionada] = useState(null);
  const [favoritas, setFavoritas] = useLocalStorage("pasaporte:favoritas:v1");
  const resultadosRef = useRef(null);

  // Son valores derivados, no otros estados que haya que mantener sincronizados.
  const cargando = estado === "cargando";
  const categorias = resumirCategorias(recetas);
  const visibles = filtrarPorCategoria(recetas, categoria)
    .filter((receta) => !soloFavoritas || favoritas.includes(receta.id));
  const seleccionada = visibles.find((receta) => receta.id === idSeleccionada);
  const favoritasEnBusqueda = recetas.filter((receta) => favoritas.includes(receta.id)).length;

  async function realizarBusqueda(nombre) {
    if (cargando) return;
    setBusqueda(nombre);
    setEstado("cargando");
    setRecetas([]);
    setCategoria("");
    setSoloFavoritas(false);
    setIdSeleccionada(null);
    try {
      const datos = await buscarRecetas(nombre);
      setRecetas(prepararRecetas(datos));
      setEstado("exito");
    } catch {
      setEstado("error");
    }
  }

  function alternarFavorita(id) {
    // Se crea un array nuevo y se parte del estado anterior.
    setFavoritas((anteriores) => anteriores.includes(id)
      ? anteriores.filter((guardada) => guardada !== id)
      : [...anteriores, id]);
  }

  function cerrarDetalle() {
    setIdSeleccionada(null);
    resultadosRef.current.focus();
  }

  let titulo = "La mesa está puesta.";
  let mensaje = "Busca un plato y encuentra inspiración para tu próxima comida.";
  if (cargando) {
    titulo = "Un momento, estamos en la cocina.";
    mensaje = `Buscando recetas para «${busqueda}»…`;
  } else if (estado === "error") {
    titulo = "Esta vez no hemos llegado a la mesa.";
    mensaje = "No se han podido cargar las recetas. Comprueba tu conexión o vuelve a intentarlo.";
  } else if (estado === "exito") {
    titulo = visibles.length === 0 ? "Un destino por descubrir." : `${visibles.length} ${visibles.length === 1 ? "receta" : "recetas"} para descubrir`;
    if (visibles.length > 0) {
      mensaje = `Resultados para «${busqueda}».${categoria ? ` Categoría: ${categoria}.` : ""}`;
    } else if (soloFavoritas) {
      mensaje = "No tienes favoritas con estos filtros. Desmarca «Solo favoritas de esta búsqueda» para ver más recetas.";
    } else {
      mensaje = `No hay recetas para «${busqueda}». Prueba otro nombre en inglés, como chicken o cake.`;
    }
  }

  return (
    <section id="explorador" className="explorador contenedor" aria-labelledby="titulo-explorador">
      <div className="titulo-seccion">
        <div><p className="antetitulo">01 / El recetario</p><h2 id="titulo-explorador">¿Dónde te lleva el <em>hambre?</em></h2></div>
        <p>Encuentra tu próximo plato.<br />Guarda tus favoritos para volver a ellos.</p>
      </div>
      <FormularioBusqueda cargando={cargando} onBuscar={realizarBusqueda}>
        <FiltroCategoria categorias={categorias} categoria={categoria} cargando={cargando}
          onCambiar={(valor) => { setCategoria(valor); setIdSeleccionada(null); }} />
      </FormularioBusqueda>
      <div className="notas-busqueda">
        <p id="ayuda-busqueda">Un apunte: busca en inglés, el idioma de las recetas de TheMealDB.</p>
        <p id="estado-recetario"><span className="punto-estado" aria-hidden="true"></span> Recetas de TheMealDB</p>
      </div>
      <div className="zona-resultados" ref={resultadosRef} tabIndex={-1} aria-label="Resultados de recetas" aria-busy={cargando}>
        {recetas.length > 0 && (
          <div className="barra-resultados">
            <div className="resumen">
              <p>En esta búsqueda</p>
              <ul aria-label="Recetas por categoría">
                {categorias.map((grupo) => <li key={grupo.categoria}><span>{grupo.categoria}</span><strong>{grupo.cantidad}</strong></li>)}
              </ul>
            </div>
            <label className="filtro-favoritas">
              <input type="checkbox" checked={soloFavoritas}
                onChange={(evento) => { setSoloFavoritas(evento.target.checked); setIdSeleccionada(null); }} />
              Solo favoritas de esta búsqueda ({favoritasEnBusqueda})
            </label>
          </div>
        )}
        <div role="status" aria-live="polite">
          <EstadoResultados titulo={titulo} esError={estado === "error"} conResultados={visibles.length > 0}
            onReintentar={estado === "error" ? () => realizarBusqueda(busqueda) : undefined}>
            {mensaje}
          </EstadoResultados>
        </div>
        {seleccionada && <DetalleReceta receta={seleccionada} onCerrar={cerrarDetalle} />}
        <div className="recetas">
          {visibles.map((receta) => (
            <TarjetaReceta key={receta.id} receta={receta} favorita={favoritas.includes(receta.id)}
              onFavorita={alternarFavorita} onVer={setIdSeleccionada} />
          ))}
        </div>
      </div>
    </section>
  );
}
