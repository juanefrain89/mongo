const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const dbName = "nueva"; // Nombre de la base de datos
const mongoUrl = "mongodb+srv://universidad:123456*-.@cluster0.52oxy.mongodb.net/?retryWrites=true&w=majority";

// Variable global para la conexión a la base de datos
let db;

// Middleware
app.use(bodyParser.json());
app.use(cors({ origin: "*" }));

console.log("Iniciando servidor...");



app.get('/', (req, res) => {
  console.log("¡Hola Mundo desde Node.js!");
  res.send('Petición recibida');
});



// Conexión a MongoDB
MongoClient.connect(mongoUrl, { useUnifiedTopology: true })
  .then((client) => {
    db = client.db(dbName);
    console.log(`Conectado a la base de datos: ${dbName}`);
  })
  .catch((err) => {
    console.error("Error al conectar a la base de datos:", err);
  });

// Rutas
app.post("/login", async (req, res) => {
  const { correo, contrasena } = req.body;
  try {
    const usuario = await db.collection("usuarios").findOne({ correo });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (usuario.contrasena === contrasena) {
      return res.status(200).json({ id: usuario.id });
    } else {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }
  } catch (err) {
    console.error("Error al iniciar sesión:", err);
    return res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

app.post("/consumos", async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "El id es requerido" });
  }

  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    return res.status(400).json({ error: "El id debe ser un número válido" });
  }

  try {
    const consumo = await db.collection("consumo").findOne({ usuario_id: numericId });

    if (consumo) {
      return res.status(200).json(consumo);
    } else {
      return res.status(404).json({ error: "Consumo no encontrado" });
    }
  } catch (err) {
    console.error("Error al obtener el consumo:", err);
    return res.status(500).json({ error: "Error al obtener el consumo" });
  }
});

app.get("/usuarios", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Conexión a la base de datos no inicializada" });
    }

    const usuarios = await db.collection("usuarios").find({}).toArray();
    return res.status(200).json(usuarios);
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    return res.status(500).json({ message: "Error al obtener los usuarios", error });
  }
});

app.post("/eliminar", async (req, res) => {
  const { id } = req.body;

  if (!id || isNaN(id) || id < 1 || id > 1000) {
    return res.status(400).json({ error: "ID no válido. Debe ser un número entre 1 y 1000" });
  }

  try {
    const result = await db.collection("usuarios").deleteOne({ id: parseInt(id, 10) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.status(200).json({ message: "Usuario eliminado exitosamente" });
  } catch (err) {
    console.error("Error al eliminar el usuario:", err);
    return res.status(500).json({ error: "Error al eliminar el usuario" });
  }
});

// Iniciar el servidor
app.listen(4200, () => {
  console.log("Servidor escuchando en http://localhost:4200");
});
