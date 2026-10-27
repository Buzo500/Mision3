import { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage.js";
import { BIBLIOTECA_INICIAL, completarBiblioteca, prepararBiblioteca } from "../favoritas.js";
import ExploradorRecetas from "./ExploradorRecetas.jsx";
import BibliotecaFavoritas from "./BibliotecaFavoritas.jsx";

export default function Recetario() {
  const [vista, setVista] = useState("buscar");
  const [biblioteca, setBiblioteca] = useLocalStorage("pasaporte:favoritas:v1", BIBLIOTECA_INICIAL, prepararBiblioteca);
  const { recetas: favoritas, pendientes } = biblioteca;
  const idsFavoritas = favoritas.map((receta) => receta.id);
  const totalFavoritas = favoritas.length + pendientes.length;

  function alternarFavorita(receta) {
    setBiblioteca((anterior) => ({
      recetas: anterior.recetas.some((guardada) => guardada.id === receta.id)
        ? anterior.recetas.filter((guardada) => guardada.id !== receta.id)
        : [...anterior.recetas, receta],
      pendientes: anterior.pendientes.filter((id) => id !== receta.id),
    }));
  }

  function recuperarFavoritas(recetas) {
    setBiblioteca((anterior) => completarBiblioteca(anterior, recetas));
  }

  return (
    <section id="explorador" className="explorador contenedor" aria-labelledby="titulo-explorador">
      <div className="titulo-seccion">
        <div><p className="antetitulo">01 / El recetario</p><h2 id="titulo-explorador">¿Dónde te lleva el <em>hambre?</em></h2></div>
        <p>Encuentra tu próximo plato.<br />Guarda tus favoritos para volver a ellos.</p>
      </div>
      <div className="vistas-recetario" role="group" aria-label="Secciones del recetario">
        <button type="button" aria-pressed={vista === "buscar"} onClick={() => setVista("buscar")}>Buscar recetas</button>
        <button type="button" aria-pressed={vista === "favoritas"} onClick={() => setVista("favoritas")}>
          Mis favoritas ({totalFavoritas})
        </button>
      </div>
      {vista === "buscar" ? (
        <ExploradorRecetas favoritas={idsFavoritas} onFavorita={alternarFavorita} onRecetasEncontradas={recuperarFavoritas} />
      ) : (
        <BibliotecaFavoritas recetas={favoritas} pendientes={pendientes.length}
          onFavorita={alternarFavorita} />
      )}
    </section>
  );
}
