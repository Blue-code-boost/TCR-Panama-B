// server/server.js
const path     = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const fs       = require('fs');
const multer   = require('multer');

// Modelos
const Team     = require('./models/team');
const Event    = require('./models/event');     // ¡ojo: event.js, no Event.js !
const News     = require('./models/news');
const Gallery  = require('./models/gallery');
const Info     = require('./models/info');
const Blog     = require('./models/blog');
const Position = require('./models/position');
const Result   = require('./models/result');
// Modelo Hero
const Hero = require('./models/hero');

// Carpeta de uploads para Hero
const heroDir = path.join(__dirname, 'uploads', 'hero');
fs.mkdirSync(heroDir, { recursive: true });

// Configuración Multer para Hero
const heroStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, heroDir),
  filename:    (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const heroUpload = multer({ storage: heroStorage });


const app  = express();
const port = process.env.PORT || 3000;

// Crear carpetas de uploads
const galleryDir = path.join(__dirname, 'uploads', 'gallery');
const blogDir    = path.join(__dirname, 'uploads', 'blog');
fs.mkdirSync(galleryDir, { recursive: true });
fs.mkdirSync(blogDir,    { recursive: true });

// Middlewares generales (una sola vez)
app.use(cors());
app.use(express.json());

// Carpeta de uploads para Multer
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Sirve todo el frontend estático (HTML, JS, CSS, img, templates...)
app.use(express.static(path.join(__dirname, '../public')));

// Exponer public/templates en /templates (opcional, porque ya cae bajo public/)
app.use(
  '/templates',
  express.static(path.join(__dirname, '../public/templates'))
);

// Valida que la variable de entorno exista
if (!process.env.MONGO_URI) {
  console.error('❌ Falta la variable MONGO_URI en .env');
  process.exit(1);
}

// ——— Hero CRUD ——— //

// GET /hero → obtiene el único Hero
app.get('/hero', async (req, res) => {
  const hero = await Hero.findOne();
  res.json(hero);
});

// GET /hero/:id → obtiene Hero por ID
app.get('/hero/:id', async (req, res) => {
  try {
    const hero = await Hero.findById(req.params.id);
    if (!hero) return res.status(404).end();
    res.json(hero);
  } catch {
    res.status(400).end();
  }
});

// POST /hero → crea Hero (sólo uno)
app.post('/hero', heroUpload.single('image'), async (req, res) => {
  try {
    const data = req.body;
    if (req.file) data.imageUrl = `/uploads/hero/${req.file.filename}`;
    const created = await Hero.create(data);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /hero/:id → actualiza Hero existente
app.put('/hero/:id', heroUpload.single('image'), async (req, res) => {
  try {
    const data = req.body;
    if (req.file) data.imageUrl = `/uploads/hero/${req.file.filename}`;
    const updated = await Hero.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!updated) return res.status(404).end();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Conexión a MongoDB y arranque del servidor
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(port, () => console.log(`🚀 Servidor corriendo en http://localhost:${port}`));
  })
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// storage Multer para galería (usa galleryDir definido arriba)
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, galleryDir),
  filename:    (_, file, cb) => {
    // Timestamp + extensión original
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

// GET /news — todas las noticias ordenadas por fecha desc
app.get('/news', async (req, res) => {
  const list = await News.find().sort({ date: -1 });
  res.json(list);
});

// POST /news — crear noticia (manejo de errores y validación)
app.post('/news', express.json(), async (req, res) => {
  try {
    const { title, date, description } = req.body;
    const created = await News.create({ title, date, description });
    return res.status(201).json(created);
  } catch (err) {
    console.error('❌ Error creando noticia:', err);
    // Devuelve un 400 con el mensaje de validación
    return res.status(400).json({ error: err.message });
  }
});


// PUT /news/:id — actualizar
app.put('/news/:id', express.json(), async (req, res) => {
  const { title, date, description } = req.body;
  const updated = await News.findByIdAndUpdate(
    req.params.id,
    { title, date, description },
    { new: true }
  );
  res.json(updated);
});

// DELETE /news/:id — borrar
app.delete('/news/:id', async (req, res) => {
  await News.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// Bulk upload Noticias (ajustado para usar `description`)
app.post('/news/bulk', express.json(), async (req, res) => {
  try {
    // Mapear cada fila al campo `description` que exige tu esquema
    const docs = req.body.map(n => ({
      title:       n.title,
      date:        new Date(n.date),
      description: n.content   // ← ahora va aquí
    }));

    // Inserción masiva con validación
    const result = await News.insertMany(docs, { ordered: false });
    res.status(201).json({ insertedCount: result.length });
  } catch (err) {
    console.error('❌ Error en bulk /news:', err);
    // Si falla validación, devuelves 400 con detalles
    res.status(400).json({ error: err.message });
  }
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