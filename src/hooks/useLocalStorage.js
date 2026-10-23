import { useEffect, useState } from "react";

// Reutilizable para listas de identificadores. La clave permanece fija al usarlo.
export default function useLocalStorage(clave) {
  const [valor, setValor] = useState(() => {
    try {
      const guardado = JSON.parse(localStorage.getItem(clave));
      return Array.isArray(guardado) && guardado.every((id) => typeof id === "string")
        ? guardado
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
    } catch {
      // Si el navegador bloquea el almacenamiento, la lista funciona en memoria.
      console.warn("No se ha podido guardar la lista en este navegador.");
    }
  }, [clave, valor]);
  // No hay cleanup: guardar texto no deja listeners ni temporizadores activos.

  return [valor, setValor];
}
