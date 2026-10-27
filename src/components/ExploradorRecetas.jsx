import { useState } from "react";
import { filtrarPorCategoria, resumirCategorias } from "../logica.js";
import { obtenerMensajeResultados } from "../mensajes.js";
import useBuscarRecetas from "../hooks/useBuscarRecetas.js";
import FormularioBusqueda from "./FormularioBusqueda.jsx";
import FiltroCategoria from "./FiltroCategoria.jsx";
import EstadoResultados from "./EstadoResultados.jsx";
import ResultadosRecetas from "./ResultadosRecetas.jsx";
import BarraResultados from "./BarraResultados.jsx";

const FILTROS_INICIALES = { categoria: "", soloFavoritas: false, idSeleccionada: null };

export default function ExploradorRecetas({ favoritas, onFavorita, onRecetasEncontradas }) {
  const { recetas, busqueda, estado, buscar } = useBuscarRecetas();
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const { categoria, soloFavoritas, idSeleccionada } = filtros;

  // Son valores derivados, no otros estados que haya que mantener sincronizados.
  const cargando = estado === "cargando";
  const categorias = resumirCategorias(recetas);
  const visibles = filtrarPorCategoria(recetas, categoria)
    .filter((receta) => !soloFavoritas || favoritas.includes(receta.id));
  const favoritasEnBusqueda = recetas.filter((receta) => favoritas.includes(receta.id)).length;

  async function realizarBusqueda(nombre) {
    if (cargando) return;
    setFiltros(FILTROS_INICIALES);
    const encontradas = await buscar(nombre);
    if (encontradas) onRecetasEncontradas(encontradas);
  }

  function cambiarFiltros(cambios) {
    setFiltros((anteriores) => ({ ...anteriores, idSeleccionada: null, ...cambios }));
  }

  const { titulo, mensaje } = obtenerMensajeResultados({
    estado, busqueda, categoria, soloFavoritas, cantidad: visibles.length,
  });

  return (
    <>
      <FormularioBusqueda cargando={cargando} onBuscar={realizarBusqueda}>
        <FiltroCategoria categorias={categorias} categoria={categoria} cargando={cargando}
          onCambiar={(valor) => cambiarFiltros({ categoria: valor })} />
      </FormularioBusqueda>
      <div className="notas-busqueda">
        <p id="ayuda-busqueda">Un apunte: busca en inglés, el idioma de las recetas de TheMealDB.</p>
        <p id="estado-recetario"><span className="punto-estado" aria-hidden="true"></span> Recetas de TheMealDB</p>
      </div>
      <ResultadosRecetas recetas={visibles} favoritas={favoritas} idSeleccionada={idSeleccionada}
        onSeleccionar={(id) => cambiarFiltros({ idSeleccionada: id })} onFavorita={onFavorita}
        soloFavoritas={soloFavoritas} cargando={cargando}>
        {recetas.length > 0 && (
          <BarraResultados categorias={categorias} soloFavoritas={soloFavoritas} favoritasEnBusqueda={favoritasEnBusqueda}
            onCambiarFavoritas={(valor) => cambiarFiltros({ soloFavoritas: valor })} />
        )}
        <div role="status" aria-live="polite">
          <EstadoResultados titulo={titulo} esError={estado === "error"} conResultados={visibles.length > 0}
            onReintentar={estado === "error" ? () => realizarBusqueda(busqueda) : undefined}>
            {mensaje}
          </EstadoResultados>
        </div>
      </ResultadosRecetas>
    </>
  );
}
