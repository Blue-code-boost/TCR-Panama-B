const mongoose = require('mongoose');
const cors    = require('cors');       
const path    = require('path');
const express = require('express');
const team   = require('./models/team')
const Event = require('./models/Event');
const News = require('./models/News');
const fs      = require('fs');
const multer  = require('multer');
const Gallery = require('./models/Gallery');
const Info = require('./models/Info');
const Blog  = require('./models/Blog');
const uploadsDir = path.join(__dirname, 'uploads', 'gallery');
fs.mkdirSync(uploadsDir, { recursive: true });
const blogUploadDir = path.join(__dirname, 'uploads', 'blog');
fs.mkdirSync(blogUploadDir, { recursive: true });
const app = express();
const port = 3000;  

// storage Multer
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename:    (_, file, cb) => {
    // usar timestamp + extensión original
    const name = Date.now() + path.extname(file.originalname);
    cb(null, name);
  }
});
const upload = multer({ storage });

// servir carpeta /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// CRUD Noticias
app.get('/news', async (req, res) => {
  const list = await News.find().sort({ date: -1 });
  res.json(list);
});
app.get('/news/:id', async (req, res) => {
  const item = await News.findById(req.params.id);
  res.json(item);
});
app.post('/news', async (req, res) => {
  const created = await News.create(req.body);
  res.status(201).json(created);
});
app.put('/news/:id', async (req, res) => {
  const updated = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});
app.delete('/news/:id', async (req, res) => {
  await News.findByIdAndDelete(req.params.id);
  res.status(204).send();
});
// Bulk upload Noticias
app.post('/news/bulk', async (req, res) => {
  const docs = req.body.map(n => ({
    title:   n.title,
    date:    new Date(n.date),
    content: n.content
  }));
  await News.insertMany(docs);
  res.status(201).send('Bulk news imported');
});

// Listar imágenes
app.get('/gallery', async (req, res) => {
  const items = await Gallery.find().sort({ date: -1 });
  res.json(items);
});

// Subir imagen individual
app.post('/gallery', upload.single('image'), async (req, res) => {
  const caption = req.body.caption || '';
  const filename = req.file.filename;
  const url = `/uploads/gallery/${filename}`;
  const item = await Gallery.create({ filename, url, caption });
  res.status(201).json(item);
});

// DELETE /gallery/:id
app.delete('/gallery/:id', async (req, res) => {
  try {
    // 1. Busca y elimina el documento de MongoDB
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).send('Item not found');
    }

    // 2. Borra el fichero físico (ajusta uploadsDir si tu carpeta está fuera de js/)
    // Si tu uploads están dentro de js/uploads/gallery, usa:
    const filePath = path.join(__dirname, 'uploads', 'gallery', item.filename);
    // Si en cambio los tienes en root/uploads/gallery, usa:
    // const filePath = path.join(__dirname, '..', 'uploads', 'gallery', item.filename);

    fs.unlink(filePath, err => {
      if (err) {
        // Si no existe el fichero, solo lo logueamos pero no devolvemos error
        console.warn('⚠️ No se pudo borrar el fichero:', filePath, err.message);
      } else {
        console.log('🗑️ Fichero borrado:', filePath);
      }
    });

    // 3. Responde con 204 No Content
    res.status(204).send();
  } catch (err) {
    console.error('Error en DELETE /gallery/:id', err);
    res.status(500).send('Server error');
  }
});

// Listar bloques de info
app.get('/info', async (req, res) => {
  const items = await Info.find().sort({ createdAt: 1 });
  res.json(items);
});

// Crear/Actualizar bloque
app.post('/info', async (req, res) => {
  const { id, title, content } = req.body;
  if (id) {
    const updated = await Info.findByIdAndUpdate(id, { title, content }, { new: true });
    return res.json(updated);
  }
  const created = await Info.create({ title, content });
  res.status(201).json(created);
});

// Eliminar bloque
app.delete('/info/:id', async (req, res) => {
  await Info.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

const Position = require('./models/Position');

// Listar posiciones
app.get('/positions', async (req, res) => {
  const list = await Position.find().sort({ position: 1 });
  res.json(list);
});

// Crear posición
app.post('/positions', async (req, res) => {
  const created = await Position.create(req.body);
  res.status(201).json(created);
});

// Actualizar posición
app.put('/positions/:id', async (req, res) => {
  const updated = await Position.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Borrar posición
app.delete('/positions/:id', async (req, res) => {
  await Position.findByIdAndDelete(req.params.id);
  res.status(204).send();
});
const Result = require('./models/Result');

// Listar resultados
app.get('/results', async (req, res) => {
  const list = await Result.find().sort({ date: -1 });
  res.json(list);
});

// Crear resultado
app.post('/results', async (req, res) => {
  const created = await Result.create(req.body);
  res.status(201).json(created);
});

// Actualizar resultado
app.put('/results/:id', async (req, res) => {
  const updated = await Result.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Borrar resultado
app.delete('/results/:id', async (req, res) => {
  await Result.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// Bulk upload de posiciones desde Excel (CSV/TSV convertido)
const xlsx = require('xlsx');

// POST /positions/bulk
app.post('/positions/bulk', async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('Archivo no proporcionado');
    }
    // Leer el workbook y la primera hoja
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Validar y mapear filas
    const toInsert = rows.map(r => ({
      position: r.position,
      pilot:    r.pilot,
      team:     r.team,
      points:   r.points
    }));

    // Insertar en Mongo
    const result = await Position.insertMany(toInsert);
    res.status(201).json({ inserted: result.length });
  } catch (err) {
    console.error('Error en POST /positions/bulk', err);
    res.status(500).send('Error al procesar la importación');
  }
});

// Configuración Multer para carpeta uploads/blog
const blogStorage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, 'uploads', 'blog')),
  filename: (req, file, cb) => {
    const name = Date.now() + '-' + Math.round(Math.random()*1e9)
               + path.extname(file.originalname);
    cb(null, name);
  }
});
const blogUpload = multer({ storage: blogStorage });

// GET /blog
app.get('/blog', async (req, res) => {
  const list = await Blog.find().sort({ date: -1 });
  // Devuelve URLs completas
  res.json(list.map(b => ({
    _id:     b._id,
    title:   b.title,
    date:    b.date,
    content: b.content,
    images:  b.images.map(f => `/uploads/blog/${f}`)
  })));
});

// POST /blog  (varias imágenes: campo name="images")
app.post('/blog', blogUpload.array('images', 5), async (req, res) => {
  const { title, date, content } = req.body;
  const images = (req.files || []).map(f => f.filename);
  const created = await Blog.create({ title, date, content, images });
  res.status(201).json(created);
});

// PUT /blog/:id
app.put('/blog/:id', blogUpload.array('images', 5), async (req, res) => {
  const { title, date, content } = req.body;
  const update = { title, date, content };
  if (req.files && req.files.length) {
    // Opcionalmente borrar las anteriores:
    const old = await Blog.findById(req.params.id);
    if (old?.images) {
      old.images.forEach(f => {
        const fp = path.join(__dirname, 'uploads', 'blog', f);
        fs.unlink(fp, ()=>{});
      });
    }
    update.images = req.files.map(f => f.filename);
  }
  const updated = await Blog.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json(updated);
});

// DELETE /blog/:id
app.delete('/blog/:id', async (req, res) => {
  const item = await Blog.findByIdAndDelete(req.params.id);
  if (item?.images) {
    item.images.forEach(f => {
      const fp = path.join(__dirname, 'uploads', 'blog', f);
      fs.unlink(fp, ()=>{});
    });
  }
  res.status(204).send();
});