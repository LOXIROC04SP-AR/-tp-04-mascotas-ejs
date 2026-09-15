const path = require("path");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const { leerMascotas } = require("./archivos");

const app = express();
const PUERTO = process.env.PORT || 3000;
const ESTADOS_VALIDOS = ["En adopción", "Reservada", "Adoptada"];
const IMAGEN_MASCOTA_NUEVA = "/img/mascota-nueva.jpg";

let mascotas = [];

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("inicio", { titulo: "Inicio" });
});

app.get("/mascotas", (req, res) => {
  res.render("mascotas/lista", { titulo: "Catálogo", mascotas });
});

app.get("/mascotas/nueva", (req, res) => {
  res.render("mascotas/nueva", {
    titulo: "Agregar mascota",
    error: null,
    valores: {
      nombre: "",
      especie: "",
      edad: "",
      estado: "En adopción",
      descripcion: "",
    },
  });
});

app.get("/mascotas/:id", (req, res) => {
  const id = Number(req.params.id);
  const mascota = mascotas.find((m) => m.id === id);

  if (!mascota) {
    res.status(404).render("no-encontrado", { titulo: "No encontrado" });
    return;
  }

  res.render("mascotas/detalle", { titulo: mascota.nombre, mascota });
});

app.post("/mascotas", (req, res) => {
  const nombre = typeof req.body.nombre === "string" ? req.body.nombre.trim() : "";
  const especie = typeof req.body.especie === "string" ? req.body.especie.trim() : "";
  const edad = typeof req.body.edad === "string" ? req.body.edad.trim() : "";
  const estado = typeof req.body.estado === "string" ? req.body.estado.trim() : "";
  const descripcion = typeof req.body.descripcion === "string" ? req.body.descripcion.trim() : "";
  const edadNumero = Number(edad);

  const valores = { nombre, especie, edad, estado, descripcion };

  const camposCompletos = Boolean(nombre && especie && edad && estado && descripcion);
  const edadValida = Number.isFinite(edadNumero) && edadNumero >= 0;
  const estadoValido = ESTADOS_VALIDOS.includes(estado);

  if (!camposCompletos || !edadValida || !estadoValido) {
    res.status(400).render("mascotas/nueva", {
      titulo: "Agregar mascota",
      error: "Completá todos los campos. La edad debe ser un número mayor o igual a cero.",
      valores,
    });
    return;
  }

  const nuevoId = mascotas.length > 0 ? Math.max(...mascotas.map((m) => m.id)) + 1 : 1;

  const nuevaMascota = {
    id: nuevoId,
    nombre,
    especie,
    edad: edadNumero,
    descripcion,
    estado,
    imagen: IMAGEN_MASCOTA_NUEVA,
  };

  mascotas.push(nuevaMascota);

  res.redirect("/mascotas");
});

app.use((req, res) => {
  res.status(404).render("no-encontrado", { titulo: "No encontrado" });
});

leerMascotas()
  .then((datos) => {
    mascotas = datos;
    app.listen(PUERTO, () => {
      console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
    });
  })
  .catch((error) => {
    console.error("No se pudieron leer los datos iniciales:", error);
  });
