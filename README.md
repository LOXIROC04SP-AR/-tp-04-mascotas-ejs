# Trabajo práctico 04

## Descripción

Aplicación web hecha con Express y EJS para consultar mascotas en adopción. Se puede ver un
listado de mascotas, entrar al detalle de cada una y agregar una nueva mascota de forma
temporal (solo en memoria, mientras el servidor está prendido) mediante un formulario.

## Instalación

```bash
npm install
```

Esto descarga las tres dependencias que usa el proyecto: `express`, `ejs` y
`express-ejs-layouts`.

## Ejecución

```bash
npm start
```

El servidor arranca en `http://localhost:3000`. En una plataforma de hosting
que asigne el puerto mediante la variable `PORT`, la aplicación usa ese puerto
automáticamente. También se puede correr `npm run check` para verificar que no
haya errores de sintaxis en los archivos `src/index.js` y `src/archivos.js`.

## Publicación

Subir el proyecto a un repositorio de GitHub sin incluir `node_modules/`.
La plataforma debe ejecutar `npm install` y luego `npm start`. El proyecto no
usa base de datos ni archivos externos: los registros nuevos se guardan solo
en memoria y se pierden al reiniciar el servidor.

## Páginas y rutas

| Método | Ruta              | Qué hace                                              |
| ------ | ----------------- | ------------------------------------------------------ |
| GET    | `/`                | Página de inicio, con un enlace al catálogo            |
| GET    | `/mascotas`        | Lista todas las mascotas cargadas                       |
| GET    | `/mascotas/nueva`  | Muestra el formulario para agregar una mascota          |
| GET    | `/mascotas/:id`    | Muestra el detalle de una mascota (o un 404 si no existe) |
| POST   | `/mascotas`        | Procesa el formulario y crea una mascota nueva          |

La ruta `/mascotas/nueva` está declarada antes que `/mascotas/:id` a propósito.
Si estuviera al revés, Express interpretaría la palabra "nueva" como si fuera
un `id`, y nunca llegaríamos al formulario.

## Estructura de vistas

- **Layout** (`views/layouts/main.ejs`): es el "molde" de toda la página. Tiene el
  `<html>`, el `<head>`, el enlace al CSS y el lugar donde se inserta el contenido
  de cada vista (`<%- body %>`). Todas las páginas comparten este mismo molde.
- **Vista**: es el contenido específico de cada página (por ejemplo `inicio.ejs`
  o `mascotas/lista.ejs`). Solo tiene el contenido de esa pantalla en particular,
  no repite el `<html>` ni el `<head>`.
- **Parcial**: son pedacitos de HTML reutilizables que se insertan dentro de una
  vista o del layout, como el encabezado (`partials/encabezado.ejs`) y el pie
  (`partials/pie.ejs`). Se usan con `include()` para no repetir código.

## Datos enviados a una vista mediante `res.render`

`res.render` recibe el nombre de la vista y un objeto con los datos que esa
vista va a necesitar. Por ejemplo, en la ruta del listado:

```js
res.render("mascotas/lista", { titulo: "Catálogo", mascotas });
```

Ese objeto (`{ titulo, mascotas }`) queda disponible dentro del archivo
`lista.ejs` como si fueran variables normales, y se pueden usar directamente
con `<%= mascotas %>` o recorriendo el arreglo con `forEach`.

## Recursos estáticos

`express.static` le dice a Express que sirva directamente los archivos que
están dentro de la carpeta `public` (CSS, imágenes, JavaScript del cliente)
sin necesidad de crear una ruta para cada uno. Por eso en el HTML se escribe
`/css/estilos.css` y no `/public/css/estilos.css`: la carpeta `public` no se
menciona en la URL, Express ya sabe que ahí están esos archivos.

Las mascotas iniciales usan la ilustración `/img/mascota.svg`. Las mascotas
creadas mediante el formulario usan `/img/mascota-perro.jpg` si la especie es
perro, o `/img/mascota-gato.jpg` si la especie es gato. La comparación no
distingue mayúsculas de minúsculas.

## Formulario

`express.urlencoded({ extended: false })` es el middleware que le permite a
Express leer los datos que llegan desde un formulario HTML enviado por
`POST` (los que se mandan con `method="post"`). Sin este middleware,
`req.body` estaría vacío y no podríamos leer lo que escribió el usuario.

### Recorrido POST → redirección → GET

1. El usuario completa el formulario en `/mascotas/nueva` y hace clic en
   "Guardar mascota". El navegador manda un `POST` a `/mascotas`.
2. El servidor valida los datos. Si está todo bien, arma la nueva mascota,
   la agrega al arreglo en memoria y responde con `res.redirect("/mascotas")`.
3. Ese `redirect` le dice al navegador "andá a buscar `/mascotas`", así que el
   navegador hace automáticamente un nuevo pedido, esta vez por `GET`.
4. El servidor responde ese `GET /mascotas` con el listado actualizado, donde
   ya aparece la mascota recién agregada.

Este patrón (POST → redirect → GET) evita que, si el usuario recarga la
página después de enviar el formulario, el navegador vuelva a mandar el
mismo `POST` por error.

## Persistencia de los datos

La nueva mascota se guarda solamente en la variable `mascotas` que vive en la
memoria del programa (un arreglo de JavaScript), no se escribe en el archivo
`datos/mascotas.json`. Por eso, cuando se reinicia el servidor con
`npm start`, el archivo `archivos.js` vuelve a leer el JSON original desde el
disco y la aplicación arranca de nuevo con las cinco mascotas iniciales: la
mascota que se había agregado "a mano" en memoria desaparece porque nunca
llegó a guardarse en ningún archivo.
