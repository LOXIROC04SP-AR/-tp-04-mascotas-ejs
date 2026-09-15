const fs = require("fs");
const path = require("path");

const RUTA_MASCOTAS = path.join(__dirname, "..", "datos", "mascotas.json");

function leerMascotas() {
  return new Promise((resolve, reject) => {
    fs.readFile(RUTA_MASCOTAS, "utf-8", (error, contenido) => {
      if (error) {
        reject(error);
        return;
      }

      try {
        const datos = JSON.parse(contenido);
        resolve(datos);
      } catch (errorFormato) {
        reject(errorFormato);
      }
    });
  });
}

module.exports = { leerMascotas };
