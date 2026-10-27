import { useEffect, useState } from "react";

// Admite valores JSON. La clave permanece fija mientras el componente está montado.
export default function useLocalStorage(clave, valorInicial, preparar = (valor) => valor) {
  const [valor, setValor] = useState(() => {
    try {
      const guardado = localStorage.getItem(clave);
      return guardado === null ? valorInicial : preparar(JSON.parse(guardado));
    } catch {
      return valorInicial;
    }
  });

  useEffect(() => {
    try {
      const texto = JSON.stringify(valor);
      if (localStorage.getItem(clave) !== texto) localStorage.setItem(clave, texto);
    } catch {
      // Si el navegador bloquea el almacenamiento, el estado funciona en memoria.
      console.warn("No se ha podido guardar el estado en este navegador.");
    }
  }, [clave, valor]);
  // No hay cleanup: guardar texto no deja listeners ni temporizadores activos.

  return [valor, setValor];
}
