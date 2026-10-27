# Pasaporte Gastronómico

Misión M3 · React Core

Aplicación de recetas adaptada a React a partir de la plantilla de la misión 2. Permite buscar platos en TheMealDB, filtrarlos por categoría, consultar los ingredientes y guardar favoritos.

## Cómo probarlo

Con Node.js 22.12 o posterior, ejecutar desde la carpeta del proyecto:

```sh
npm ci
npm run dev
```

Abrir la dirección que indique Vite y buscar un plato en inglés, como chicken, cake o Arrabiata.

Para comprobar las funciones principales:

1. Buscar una receta y abrir su detalle.

2. Filtrar los resultados por categoría.

3. Guardar una receta y activar «Solo favoritas de esta búsqueda».

4. Recargar la página y entrar en «Mis favoritas»: la receta debe seguir disponible sin repetir la búsqueda.

5. Abrir su detalle y quitarla de favoritas.

Para ejecutar las comprobaciones automáticas:


```sh
npm run check
```

Este comando ejecuta ESLint, las 28 pruebas y la compilación de producción. Las pruebas cubren la preparación de datos, la caché, los errores de búsqueda, las respuestas fuera de orden, la persistencia, la recuperación de favoritas antiguas y la gestión del foco.

## Uso de IA

Utilicé ChatGPT para pedirle como poder pasar todos los módulos de JS que tenía del M2  React ya que eran unos cuantos y me dijo como estructurarlo

Prompt: "Aqui tienes los modulos en JS voy a querer pasarlos a React, sin escribirme código, dime cual crees que es la mejor manera"

Tambien lo usé para preguntarle si era viable pasarlo a React o si tenía que cambiar de temática de aplicacion y rediseñarla dedse 0

Prompt: "Crees que es viable pasar esta app a React o debería cambiar el programa de JS antes?"

## Autopsia

1. Buscar al enviar el formulario. La consulta se inicia desde onSubmit; los filtros se calculan sobre los resultados recibidos. Se descartó buscar con cada pulsación para mantener una interacción sencilla y evitar peticiones innecesarias. Como contrapartida, no hay resultados mientras se escribe. El hook useBuscarRecetas utiliza un contador para ignorar respuestas antiguas e invalidar las pendientes cuando el componente se desmonta.

2. Guardar las recetas completas como favoritas. Esto permite abrir sus ingredientes y preparación desde una biblioteca independiente después de recargar. Se descartó conservar únicamente los IDs porque haría depender el detalle de otra consulta o de la caché. La contrapartida es ocupar más espacio en localStorage. Las recetas completas mantienen un formato uniforme; los IDs antiguos que aún no se han podido recuperar se conservan por separado.