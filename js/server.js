const mongoose = require('mongoose');
const express = require('express');
const app = express();
const port = 3000;  

// Middleware para procesar solicitudes JSON
app.use(express.json());
const Team = require('./models/team');// Importar el modelo Team

// Ruta para agregar un nuevo equipo
app.post('/teams', async (req, res) => {
  console.log('🏷️  POST /teams recibido:', req.body);
  const { name, pilots, position } = req.body;

  try {
    const newTeam = new Team({ name, pilots, position });
    await newTeam.save();
    return res.status(201).send('Equipo creado con éxito');
  } catch (err) {
    return res.status(400).send('Error al crear equipo: ' + err.message);
  }
});

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/tcr_panama_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Conexión exitosa a MongoDB');
})
.catch((err) => {
  console.log('Error al conectar a MongoDB:', err);
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Hola, mundo! Conectado a MongoDB.');
});

app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});

  


