const express = require('express');
const app = express();
const port = 3000;

let ledState = "off"; // Estado inicial del LED

// Ruta para encender el LED
app.get('/prender', (req, res) => {
  ledState = "on";
  console.log("LED encendido");
  res.send('LED encendido');
});

// Ruta para apagar el LED
app.get('/apagar', (req, res) => {
  ledState = "off";
  console.log("LED apagado");
  res.send('LED apagado');
});

// Ruta para consultar el estado del LED
app.get('/estado', (req, res) => {
  res.json({ estado: ledState });
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
