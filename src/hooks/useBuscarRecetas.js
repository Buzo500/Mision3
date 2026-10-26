import { useEffect, useRef, useState } from "react";
import { buscarRecetas } from "../api.js";
import { prepararRecetas } from "../logica.js";

export default function useBuscarRecetas() {
  const [resultado, setResultado] = useState({ recetas: [], busqueda: "", estado: "inicial" });
  const ultimaPeticion = useRef(0);

  useEffect(() => {
    // Al desmontar, ninguna petición pendiente puede actualizar el resultado.
    return () => { ultimaPeticion.current += 1; };
  }, []);

  async function buscar(nombre) {
    const peticion = ++ultimaPeticion.current;
    setResultado({ recetas: [], busqueda: nombre, estado: "cargando" });
    try {
      const datos = await buscarRecetas(nombre);
      if (peticion !== ultimaPeticion.current) return;
      const recetas = prepararRecetas(datos);
      setResultado({ recetas, busqueda: nombre, estado: "exito" });
      return recetas;
    } catch {
      if (peticion !== ultimaPeticion.current) return;
      setResultado({ recetas: [], busqueda: nombre, estado: "error" });
    }
  }

  return { ...resultado, buscar };
}
