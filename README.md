# Pasaporte Gastronómico

Misión M3 · React Core

Aplicación de recetas adaptada a React a partir de la plantilla de la misión 2. Permite buscar platos en TheMealDB, filtrarlos por categoría, consultar los ingredientes y guardar favoritos.

## Cómo probarlo

Con Node.js 22.12 o posterior, ejecutar desde la carpeta del proyecto:

```sh
npm ci
npm run dev
```

Abrir la dirección que indique Vite y buscar un nombre en inglés, como `cake` o `chicken`. Para comprobar las favoritas, guardar una receta, recargar y repetir la búsqueda. `npm run check` ejecuta la revisión de código, las pruebas y la compilación.

## Uso de IA

Utilicé ChatGPT para pedirle como poder pasar todos los módulos de JS que tenía del M2  React ya que eran unos cuantos y me dijo como estructurarlo

Prompt: "Aqui tienes los modulos en JS voy a querer pasarlos a React, sin escribirme código, dime cual crees que es la mejor manera"

Tambien lo usé para preguntarle si era viable pasarlo a React o si tenía que cambiar de temática de aplicacion y rediseñarla dedse 0

Prompt: "Crees que es viable pasar esta app a React o debería cambiar el programa de JS antes?"

## Autopsia

1. **Buscar solo al enviar el formulario.** La consulta se hace desde `onSubmit` y los controles se deshabilitan mientras carga. La alternativa era buscar en cada pulsación, pero habría requerido controlar más peticiones y respuestas que pueden llegar fuera de orden. Se eligió el envío explícito por su sencillez; como contrapartida, no hay resultados mientras se escribe. El filtrado por categoría se calcula con los datos recibidos y no necesita otra petición ni un efecto.

2. **Guardar solo los identificadores de las favoritas.** El hook `useLocalStorage` conserva una lista de IDs y las tarjetas comprueban si su receta pertenece a ella. Se descartó guardar las recetas completas para evitar duplicar sus datos y mantener pequeño el estado. La limitación es que las favoritas se muestran dentro de la búsqueda actual: después de recargar hay que volver a buscar, porque no existe una biblioteca independiente de recetas guardadas.
