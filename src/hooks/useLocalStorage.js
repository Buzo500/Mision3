import { useEffect, useState } from "react";

// Reutilizable para listas. La clave permanece fija mientras el componente está montado.
export default function useLocalStorage(clave, preparar = (lista) => lista) {
  const [valor, setValor] = useState(() => {
    try {
      const guardado = JSON.parse(localStorage.getItem(clave));
      return Array.isArray(guardado) ? preparar(guardado) : [];
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
