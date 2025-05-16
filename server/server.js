// server/server.js

// ── 1. CABECERA Y CONFIGURACIONES GLOBALES ───────────────────────
require('dotenv').config();
const path     = require('path');
const fs       = require('fs');
const express  = require('express');
const session  = require('express-session');
const bcrypt   = require('bcrypt');
const cors     = require('cors');
const mongoose = require('mongoose');
const multer   = require('multer');

// Modelos
const Team      = require('./models/team');
const Event     = require('./models/event');
const News      = require('./models/news');
const Gallery   = require('./models/gallery');
const Info      = require('./models/info');
const Blog      = require('./models/blog');
const Position  = require('./models/position');
const Result    = require('./models/result');
const Countdown = require('./models/countdown');
const Hero      = require('./models/hero');

const app  = express();
const port = process.env.PORT || 3000;

// ── SESIONES, CORS Y BODY PARSE ─────────────────────────────────
app.use(cors({
  origin: 'http://localhost:3000',  // ajusta al origen de tu frontend
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'cámbialo_por_un_secreto_largo',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 3600000 }
}));

// ── CONEXIÓN A MONGODB ─────────────────────────────────────────
if (!process.env.MONGO_URI) {
  console.error('❌ Falta la variable MONGO_URI en .env');
  process.exit(1);
}
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// ── 2. AUTENTICACIÓN (LOGIN / LOGOUT) ───────────────────────────

// Usuarios hard-coded (puedes mover hashes a .env si quieres)
const users = [
  { username: 'admin1', hash: '$2b$10$qVd5qSlyjm3cgsbS/0XjaOD3vRVkXq2t1bSdiCtf6NmX6gBfQZljW' },
  { username: 'admin2', hash: '$2b$10$XmRiXszoaH7tFtj2k9pFqe6pQMBSIVldZP.6s0Yv4ka2j.2gvrx9G' }
];

// Ruta de login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.hash))) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  req.session.user = { username };
  res.json({ success: true });
});

// Ruta de logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error(err);
    res.json({ success: true });
  });
});

// Middleware para proteger rutas
function requireLogin(req, res, next) {
  if (req.session.user) return next();
  res.status(401).json({ error: 'No autenticado' });
}

// ── 3. UPLOADS Y ARCHIVOS ESTÁTICOS ─────────────────────────────

// Directorio base para todos los uploads
const UPLOAD_ROOT = path.join(__dirname, 'uploads');
// Subcarpetas que usaremos
['hero', 'gallery', 'teams', 'blog/banner', 'blog/images'].forEach(sub =>
  fs.mkdirSync(path.join(UPLOAD_ROOT, sub), { recursive: true })
);

// Configuración genérica de Multer para un subdir dado
const storageFor = subdir => multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(UPLOAD_ROOT, subdir)),
  filename:    (_, file, cb) => {
    const unique = Date.now() + '-' + Math.random().toString().slice(2);
    cb(null, unique + path.extname(file.originalname));
  }
});

// Differentes instancias para cada uso
const uploadHero    = multer({ storage: storageFor('hero') });
const uploadGallery = multer({ storage: storageFor('gallery') });
const uploadTeams   = multer({ storage: storageFor('teams') });
const uploadBlog    = multer({ storage: storageFor('blog/banner') });

// Servir carpeta de uploads bajo /uploads
app.use('/uploads', express.static(UPLOAD_ROOT));
// Servir frontend público
app.use(express.static(path.join(__dirname, '../public')));
// Servir plantillas sueltas (si las usas)
app.use('/templates', express.static(path.join(__dirname, '../public/templates')));
// ── 4. CONEXIÓN A MONGODB ───────────────────────────────────────

if (!process.env.MONGO_URI) {
  console.error('❌ Falta la variable MONGO_URI en .env');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser:    true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => {
  console.error('❌ Error conectando a MongoDB:', err);
  process.exit(1);
});

// ── 5. RUTAS PROTEGIDAS (CRUD) ─────────────────────────────────

// — Hero CRUD —
app.get('/hero',            async (req, res) => res.json(await Hero.findOne()));
app.post('/hero', uploadHero.single('image'),
  async (req, res) => {
    const data = req.body;
    if (req.file) data.imageUrl = `/uploads/hero/${req.file.filename}`;
    res.status(201).json(await Hero.create(data));
});
app.put('/hero/:id', uploadHero.single('image'),
  async (req, res) => {
    const data = req.body;
    if (req.file) data.imageUrl = `/uploads/hero/${req.file.filename}`;
    const h = await Hero.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!h) return res.status(404).end();
    res.json(h);
});

// — Countdown CRUD —
app.get('/countdown', async (req, res) => {
  let c = await Countdown.findOne();
  if (!c) c = await Countdown.create({ target: new Date() });
  res.json({ target: c.target });
});
app.put('/countdown', async (req, res) => {
  const { target } = req.body;
  if (!target) return res.status(400).json({ error: 'Falta target' });
  let c = await Countdown.findOne();
  if (!c) c = await Countdown.create({ target });
  else { c.target = target; await c.save(); }
  res.json({ target: c.target });
});

// — Teams CRUD —
app.get('/teams',     async (req, res) => res.json(await Team.find()));
app.get('/teams/:id', async (req, res) => res.json(await Team.findById(req.params.id)));
app.post('/teams', uploadTeams.single('image'),
  async (req, res) => {
    const { name, pilots, position } = req.body;
    const imageUrl = req.file ? `/uploads/teams/${req.file.filename}` : '';
    res.status(201).json(await Team.create({ name, pilots, position, imageUrl }));
});
app.put('/teams/:id', uploadTeams.single('image'),
  async (req, res) => {
    const u = { ...req.body };
    if (req.file) u.imageUrl = `/uploads/teams/${req.file.filename}`;
    res.json(await Team.findByIdAndUpdate(req.params.id, u, { new: true, runValidators: true }));
});
app.delete('/teams/:id', async (req, res) => {
  await Team.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// — Events CRUD —
app.get('/events',     async (req, res) => res.json(await Event.find()));
app.get('/events/:id', async (req, res) => res.json(await Event.findById(req.params.id)));
app.post('/events',    async (req, res) => res.status(201).json(await Event.create(req.body)));
app.put('/events/:id', async (req, res) => res.json(await Event.findByIdAndUpdate(req.params.id, req.body, { new: true })));
app.delete('/events/:id', async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.status(204).end();
});
app.post('/events/bulk', async (req, res) => {
  const docs = req.body.map(e => ({ name: e.name, date: new Date(e.date), location: e.location }));
  await Event.insertMany(docs);
  res.status(201).end();
});

// — News CRUD —
app.get('/news',            async (req, res) => res.json(await News.find().sort({ date: -1 })));
app.post('/news',           async (req, res) => res.status(201).json(await News.create(req.body)));
app.put('/news/:id',        async (req, res) => res.json(await News.findByIdAndUpdate(req.params.id, req.body, { new: true })));
app.delete('/news/:id',     async (req, res) => { await News.findByIdAndDelete(req.params.id); res.status(204).end(); });
app.post('/news/bulk',      async (req, res) => {
  const docs = req.body.map(n => ({ title: n.title, date: new Date(n.date), description: n.content }));
  const r = await News.insertMany(docs);
  res.status(201).json({ inserted: r.length });
});

// — Gallery CRUD —
app.get('/gallery',         async (req, res) => res.json(await Gallery.find()));
app.post('/gallery', uploadGallery.single('image'),
  async (req, res) => {
    const item = await Gallery.create({
      filename: req.file.filename,
      url:      `/uploads/gallery/${req.file.filename}`,
      caption:  req.body.caption || ''
    });
    res.status(201).json(item);
});
app.delete('/gallery/:id',  async (req, res) => { await Gallery.findByIdAndDelete(req.params.id); res.status(204).end(); });

// — Info CRUD —
app.get('/info',            async (req, res) => res.json(await Info.find().sort({ createdAt: 1 })));
app.post('/info',           async (req, res) => {
  const { id, title, content } = req.body;
  if (id) return res.json(await Info.findByIdAndUpdate(id, { title, content }, { new: true }));
  res.status(201).json(await Info.create({ title, content }));
});
app.delete('/info/:id',     async (req, res) => { await Info.findByIdAndDelete(req.params.id); res.status(204).end(); });

// — Positions CRUD —
app.get('/positions',       async (req, res) => res.json(await Position.find().sort({ position: 1 })));
app.post('/positions',      async (req, res) => res.status(201).json(await Position.create(req.body)));
app.put('/positions/:id',   async (req, res) => res.json(await Position.findByIdAndUpdate(req.params.id, req.body, { new: true })));
app.delete('/positions/:id',async (req, res) => { await Position.findByIdAndDelete(req.params.id); res.status(204).end(); });
app.post('/positions/bulk', async (req, res) => {
  const docs = req.body.map(r=>({position:Number(r.position),pilot:String(r.pilot).trim(),team:String(r.team).trim(),points:Number(r.points)}));
  await Position.insertMany(docs);
  res.status(201).end();
});


// — Results CRUD —
app.get('/results',         async (req, res) => res.json(await Result.find().sort({ date: -1 })));
app.post('/results',        async (req, res) => res.status(201).json(await Result.create(req.body)));
app.put('/results/:id',     async (req, res) => res.json(await Result.findByIdAndUpdate(req.params.id, req.body, { new: true })));
app.delete('/results/:id',  async (req, res) => { await Result.findByIdAndDelete(req.params.id); res.status(204).end(); });

// — Blog CRUD —
app.get('/blog',            async (req, res) => {
  const list = await Blog.find().sort({ date: -1 });
  res.json(list.map(b => ({
    _id: b._id,
    title: b.title,
    date: b.date,
    content: b.content,
    banner: b.banner ? `/uploads/blog/banner/${b.banner}` : null,
    images: (b.images||[]).map(f => `/uploads/blog/images/${f}`)
  })));
});
app.get('/blog/:id',        async (req, res) => {
  const b = await Blog.findById(req.params.id);
  res.json({
    _id: b._id,
    title: b.title,
    date: b.date,
    content: b.content,
    banner: b.banner ? `/uploads/blog/banner/${b.banner}` : null,
    images: (b.images||[]).map(f => `/uploads/blog/images/${f}`)
  });
});
app.post('/blog', uploadBlog.fields([{ name: 'banner', maxCount: 1 }, { name: 'images', maxCount: 20 }]),
  async (req, res) => {
    const { title, date, content } = req.body;
    const banner = req.files.banner?.[0].filename || null;
    const images = (req.files.images||[]).map(f => f.filename);
    res.status(201).json(await Blog.create({ title, date, content, banner, images }));
});
app.put('/blog/:id', uploadBlog.fields([{ name: 'banner', maxCount: 1 }, { name: 'images', maxCount: 20 }]),
  async (req, res) => {
    const { title, date, content } = req.body;
    const u = { title, date, content };
    if (req.files.banner) u.banner = req.files.banner[0].filename;
    if (req.files.images) u.images = req.files.images.map(f => f.filename);
    res.json(await Blog.findByIdAndUpdate(req.params.id, u, { new: true }));
});
app.delete('/blog/:id',     async (req, res) => { await Blog.findByIdAndDelete(req.params.id); res.status(204).end(); });


app.get('/', (req, res) => res.send('¡Hola mundo!'));

app.listen(port, () => console.log(`🚀 Servidor en http://localhost:${port}`));
