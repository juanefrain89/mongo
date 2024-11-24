const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient } = require("mongodb");

// Configuración de conexión a MongoDB
const mongoUrl = "mongodb+srv://universidad:123456*-.@cluster0.52oxy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // URL de conexión
const dbName = "nueva"; // Nombre de tu base de datos
let db; // Variable para almacenar la conexión a la base de datos

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: "*" // Permite solicitudes desde cualquier origen
}));

console.log("Servidor iniciado.");

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

// Ruta de login
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

// Ruta para obtener consumos
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

// Ruta para obtener usuarios
app.get("/usuarios", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Base de datos no conectada" });
    }

    const usuarios = await db.collection("usuarios").find({}).toArray();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    res.status(500).json({ message: "Error al obtener los usuarios", error });
  }
});

// Ruta para eliminar usuario
app.post('/eliminar', async (req, res) => {
  const { id } = req.body;  // Recibir id desde el cuerpo de la solicitud
  console.log("ID recibido:", id);

  // Verificar si el ID es válido (debe ser un número entre 1 y 1000)
  if (isNaN(id) || id < 1 || id > 1000) {
    return res.status(400).json({ error: "ID no válido. Debe ser un número entre 1 y 1000" });
  }

  try {
    // Verificar si la base de datos está conectada
    if (!db) {
      return res.status(500).json({ error: "Base de datos no conectada" });
    }

    // Eliminar el usuario de la colección "usuarios"
    const result = await db.collection("usuarios").deleteOne({ id: parseInt(id, 10) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    console.log("Usuario eliminado exitosamente");
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
