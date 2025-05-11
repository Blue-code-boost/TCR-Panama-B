const mongoose = require('mongoose');
const cors    = require('cors');       
const path    = require('path');
const express = require('express');
const team   = require('./models/team')
const Event = require('./models/Event');
const app = express();
const port = 3000;  

app.use(cors());                        // <-- habilitar CORS
app.use(express.json());
// sirve todo lo que esté en la raíz (admin.html, css/, js/, etc)
app.use(express.static(path.join(__dirname)));

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

// GET /teams/:id → devuelve un solo equipo
app.get('/teams/:id', async (req, res) => {
    try {
      const team = await Team.findById(req.params.id);
      if (!team) return res.status(404).send('Equipo no encontrado');
      res.json(team);
    } catch (err) {
      res.status(400).send('ID inválido');
    }
  });
  
// PUT /teams/:id → actualiza un equipo
app.put('/teams/:id', async (req, res) => {
    try {
      const updated = await Team.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updated) return res.status(404).send('Equipo no encontrado');
      res.json(updated);
    } catch (err) {
      res.status(400).send('Error al actualizar: ' + err.message);
    }
  });

// DELETE /teams/:id → elimina un equipo
app.delete('/teams/:id', async (req, res) => {
    try {
      const deleted = await Team.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).send('Equipo no encontrado');
      res.send('Equipo eliminado');
    } catch (err) {
      res.status(400).send('ID inválido');
    }
  });
  
  // Rutas Eventos
app.get('/events', async (req, res) => {
  const evs = await Event.find();
  res.json(evs);
});
app.get('/events/:id', async (req, res) => {
  const ev = await Event.findById(req.params.id);
  res.json(ev);
});
app.post('/events', async (req, res) => {
  const created = await Event.create(req.body);
  res.status(201).json(created);
});
app.put('/events/:id', async (req, res) => {
  const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});
app.delete('/events/:id', async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// Bulk
app.post('/events/bulk', async (req, res) => {
  const docs = req.body.map(e => ({
    name: e.name,
    date: new Date(e.date),
    location: e.location
  }));
  await Event.insertMany(docs);
  res.status(201).send('Bulk events imported');
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

// Ruta para obtener todos los equipos
app.get('/teams', async (req, res) => {
    try {
      const teams = await Team.find();      // Trae todos los documentos
      res.status(200).json(teams);          // Devuélvelos en formato JSON
    } catch (err) {
      res.status(500).send('Error al obtener equipos: ' + err.message);
    }
  });

app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});

// Bulk insert
app.post('/teams/bulk', async (req, res) => {
  try {
    const docs = req.body.map(item => ({
      name: item.name,
      pilots: (item.pilots || '').split(',').map(s => s.trim()),
      position: Number(item.position)
    }));
    await Team.insertMany(docs);
    res.status(201).send('Bulk import completed');
  } catch (err) {
    res.status(400).send(err.message);
  }
});  


