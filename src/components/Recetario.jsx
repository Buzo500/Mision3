import { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage.js";
import { completarFavoritas, idDeFavorita, prepararFavoritas } from "../favoritas.js";
import ExploradorRecetas from "./ExploradorRecetas.jsx";
import BibliotecaFavoritas from "./BibliotecaFavoritas.jsx";

export default function Recetario() {
  const [vista, setVista] = useState("buscar");
  const [favoritas, setFavoritas] = useLocalStorage("pasaporte:favoritas:v1", prepararFavoritas);
  const idsFavoritas = favoritas.map(idDeFavorita);
  const recetasGuardadas = favoritas.filter((receta) => typeof receta !== "string");

  function alternarFavorita(receta) {
    setFavoritas((anteriores) => anteriores.some((guardada) => idDeFavorita(guardada) === receta.id)
      ? anteriores.filter((guardada) => idDeFavorita(guardada) !== receta.id)
      : [...anteriores, receta]);
  }

  function recuperarFavoritas(recetas) {
    setFavoritas((anteriores) => completarFavoritas(anteriores, recetas));
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
          Mis favoritas ({favoritas.length})
        </button>
      </div>
      {vista === "buscar" ? (
        <ExploradorRecetas favoritas={idsFavoritas} onFavorita={alternarFavorita} onRecetasEncontradas={recuperarFavoritas} />
      ) : (
        <BibliotecaFavoritas recetas={recetasGuardadas} pendientes={favoritas.length - recetasGuardadas.length}
          onFavorita={alternarFavorita} />
      )}
    </section>
  );
}
