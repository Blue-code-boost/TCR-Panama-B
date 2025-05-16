// admin.js

// ===================
// Configuración base
// ===================
const API = 'http://localhost:3000';

/**
 * Envoltorio para fetch que envía cookies y redirige al login si devuelve 401
 */
async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    ...opts
  });
  if (res.status === 401) {
    window.location.href = '/login.html';
    throw new Error('No autenticado');
  }
  return res;
}

// ===================
// Autenticación
// ===================

// Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const u = loginForm.username.value;
    const p = loginForm.password.value;
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p }),
      credentials: 'include'
    });
    if (res.ok) window.location = 'admin.html';
    else alert('Credenciales inválidas');
  });
}

// Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await fetch(`${API}/logout`, { method: 'POST', credentials: 'include' });
    window.location = 'login.html';
  });
}

// Proteger rutas siguientes
if (!loginForm) {
  document.addEventListener('DOMContentLoaded', async () => {
    // Prueba simple a ruta protegida
    await apiFetch('/hero').catch(() => { });
  });
}
// ===================
// CRUD: Equipos
// ===================
let editTeamId = null;
const teamForm = document.getElementById('team-form');
const teamList = document.getElementById('teams-list');
const teamNameInput = document.getElementById('team-name');
const teamPilotsInput = document.getElementById('team-pilots');
const teamPositionInput = document.getElementById('team-position');
const teamImageInput = document.getElementById('team-image');
const teamStatus = document.getElementById('bulk-status');
const teamSubmitBtn = document.getElementById('team-submit-btn');

async function loadTeams() {
  try {
    const res = await apiFetch('/teams');
    const teams = await res.json();
    teamList.innerHTML = teams.map(t => `
      <li data-id="${t._id}">
        ${t.imageUrl ? `<img src="${t.imageUrl}" class="thumb">` : ''}
        <span><strong>${t.name}</strong> (Pos ${t.position}) — ${t.pilots.join(', ')}</span>
        <span class="actions">
          <button class="edit-btn">Editar</button>
          <button class="delete-btn">Eliminar</button>
        </span>
      </li>
    `).join('');
  } catch (err) {
    teamList.innerHTML = `<li style="color:red">Error al cargar equipos: ${err.message}</li>`;
  }
}

async function handleTeamFormSubmit(e) {
  e.preventDefault();
  const fd = new FormData();
  fd.append('name', teamNameInput.value.trim());
  fd.append('pilots', teamPilotsInput.value.trim());
  fd.append('position', teamPositionInput.value);
  if (teamImageInput.files[0]) fd.append('image', teamImageInput.files[0]);
  const method = editTeamId ? 'PUT' : 'POST';
  const path = editTeamId ? `/teams/${editTeamId}` : '/teams';
  try {
    const res = await apiFetch(path, { method, body: fd });
    if (!res.ok) throw new Error(await res.text());
    editTeamId = null;
    teamForm.reset();
    teamSubmitBtn.innerText = 'Crear Equipo';
    teamStatus.textContent = '';
    await loadTeams();
  } catch (err) {
    teamStatus.textContent = 'Error: ' + err.message;
  }
}

teamForm?.addEventListener('submit', handleTeamFormSubmit);
teamList?.addEventListener('click', async e => {
  const btn = e.target, li = btn.closest('li');
  if (!li) return;
  const id = li.dataset.id;
  if (btn.matches('.delete-btn')) {
    if (!confirm('¿Eliminar este equipo?')) return;
    await apiFetch(`/teams/${id}`, { method: 'DELETE' });
    return loadTeams();
  }
  if (btn.matches('.edit-btn')) {
    const res = await apiFetch(`/teams/${id}`);
    const t = await res.json();
    editTeamId = t._id;
    teamNameInput.value = t.name;
    teamPilotsInput.value = t.pilots.join(', ');
    teamPositionInput.value = t.position;
    teamSubmitBtn.innerText = 'Actualizar Equipo';
  }
});

// ===================
// CRUD: Eventos
// ===================
let editEventId = null;
const eventForm = document.getElementById('event-form');
const eventList = document.getElementById('events-list');
const eventNameInput = document.getElementById('event-name');
const eventDateInput = document.getElementById('event-date');
const eventLocInput = document.getElementById('event-location');
const eventSubmitBtn = document.getElementById('event-submit-btn');

async function loadEvents() {
  try {
    const res = await apiFetch('/events');
    const evs = await res.json();
    eventList.innerHTML = evs.map(ev => `
      <li data-id="${ev._id}">
        <span>${ev.name} — ${new Date(ev.date).toLocaleDateString()} — ${ev.location}</span>
        <span class="actions">
          <button class="edit-btn">Editar</button>
          <button class="delete-btn">Eliminar</button>
        </span>
      </li>
    `).join('');
  } catch {
    eventList.innerHTML = `<li style="color:red">Error al cargar eventos</li>`;
  }
}

async function handleEventFormSubmit(e) {
  e.preventDefault();
  const payload = {
    name: eventNameInput.value.trim(),
    date: eventDateInput.value,
    location: eventLocInput.value.trim()
  };
  const method = editEventId ? 'PUT' : 'POST';
  const path = editEventId ? `/events/${editEventId}` : '/events';
  try {
    const res = await apiFetch(path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await res.text());
    editEventId = null;
    eventForm.reset();
    eventSubmitBtn.innerText = 'Crear Evento';
    await loadEvents();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

eventForm?.addEventListener('submit', handleEventFormSubmit);
eventList?.addEventListener('click', async e => {
  const btn = e.target, li = btn.closest('li');
  if (!li) return;
  const id = li.dataset.id;
  if (btn.matches('.delete-btn')) {
    await apiFetch(`/events/${id}`, { method: 'DELETE' });
    return loadEvents();
  }
  if (btn.matches('.edit-btn')) {
    const res = await apiFetch(`/events/${id}`);
    const ev = await res.json();
    editEventId = ev._id;
    eventNameInput.value = ev.name;
    eventDateInput.value = ev.date.split('T')[0];
    eventLocInput.value = ev.location;
    eventSubmitBtn.innerText = 'Actualizar Evento';
  }
});

// Bulk events
document.getElementById('bulk-events-btn')?.addEventListener('click', async () => {
  const file = document.getElementById('events-excel').files[0];
  if (!file) return alert('Selecciona un archivo');
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  try {
    await apiFetch('/events/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows)
    });
    await loadEvents();
  } catch (err) {
    alert('Error bulk events: ' + err.message);
  }
});

// ===================
// CRUD: Galería
// ===================
const galleryForm = document.getElementById('gallery-form');
const galleryList = document.getElementById('gallery-list');
const galleryImgInput = document.getElementById('gallery-image');
const galleryCapInput = document.getElementById('gallery-caption');

async function loadGallery() {
  try {
    const res = await apiFetch('/gallery');
    const items = await res.json();
    galleryList.innerHTML = items.map(i => `
      <li data-id="${i._id}">
        <img src="${i.url}" width="100">
        <p>${i.caption}</p>
        <button class="delete-btn">Eliminar</button>
      </li>
    `).join('');
  } catch {
    galleryList.innerHTML = `<li style="color:red">Error galería</li>`;
  }
}

galleryForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const file = galleryImgInput.files[0];
  if (!file) return alert('Selecciona una imagen');
  const fd = new FormData();
  fd.append('image', file);
  fd.append('caption', galleryCapInput.value.trim());
  try {
    await apiFetch('/gallery', { method: 'POST', body: fd });
    galleryForm.reset();
    await loadGallery();
  } catch (err) {
    alert('Error: ' + err.message);
  }
});

galleryList?.addEventListener('click', async e => {
  if (!e.target.matches('.delete-btn')) return;
  const id = e.target.closest('li').dataset.id;
  await apiFetch(`/gallery/${id}`, { method: 'DELETE' });
  loadGallery();
});

// ===================
// CRUD: Info
// ===================
let editInfoId = null;
const infoForm = document.getElementById('info-form');
const infoList = document.getElementById('info-list');
const infoTitleInput = document.getElementById('info-title');
const infoContentInput = document.getElementById('info-content');

async function loadInfo() {
  try {
    const res = await apiFetch('/info');
    const data = await res.json();
    infoList.innerHTML = data.map(i => `
      <li data-id="${i._id}">
        <strong>${i.title}</strong>
        <p>${i.content}</p>
        <button class="edit-btn">Editar</button>
        <button class="delete-btn">Eliminar</button>
      </li>
    `).join('');
  } catch {
    infoList.innerHTML = `<li style="color:red">Error info</li>`;
  }
}

infoForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const payload = {
    id: editInfoId,
    title: infoTitleInput.value.trim(),
    content: infoContentInput.value.trim()
  };
  try {
    await apiFetch('/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    editInfoId = null;
    infoForm.reset();
    infoSubmitBtn.innerText = 'Crear / Actualizar';
    loadInfo();
  } catch (err) {
    alert('Error: ' + err.message);
  }
});

infoList?.addEventListener('click', async e => {
  const btn = e.target, li = btn.closest('li');
  if (!li) return;
  const id = li.dataset.id;
  if (btn.matches('.delete-btn')) {
    await apiFetch(`/info/${id}`, { method: 'DELETE' });
    return loadInfo();
  }
  if (btn.matches('.edit-btn')) {
    const data = await (await apiFetch('/info')).json();
    const item = data.find(x => x._id === id);
    editInfoId = id;
    infoTitleInput.value = item.title;
    infoContentInput.value = item.content;
    infoSubmitBtn.innerText = 'Actualizar';
  }
});

// ===================
// CRUD: Posiciones
// ===================
let editPosId = null;
const positionsForm = document.getElementById('positions-form');
const positionsList = document.getElementById('positions-list');
const posNumberInput = document.getElementById('pos-number');
const posPilotInput = document.getElementById('pos-pilot');
const posTeamInput = document.getElementById('pos-team');
const posPointsInput = document.getElementById('pos-points');

async function loadPositions() {
  try {
    const res = await apiFetch('/positions');
    const data = await res.json();
    positionsList.innerHTML = data.map(p => `
      <li data-id="${p._id}">
        #${p.position} — ${p.pilot} (${p.team}) · ${p.points} pts
        <button class="edit-btn">Editar</button>
        <button class="delete-btn">Eliminar</button>
      </li>
    `).join('');
  } catch {
    positionsList.innerHTML = `<li style="color:red">Error posiciones</li>`;
  }
}

positionsForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const body = {
    position: +posNumberInput.value,
    pilot: posPilotInput.value.trim(),
    team: posTeamInput.value.trim(),
    points: +posPointsInput.value
  };
  const method = editPosId ? 'PUT' : 'POST';
  const path = editPosId ? `/positions/${editPosId}` : '/positions';
  await apiFetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  editPosId = null;
  positionsForm.reset();
  posSubmitBtn.innerText = 'Crear / Actualizar';
  loadPositions();
});

positionsList?.addEventListener('click', async e => {
  const btn = e.target, li = btn.closest('li');
  if (!li) return;
  const id = li.dataset.id;
  if (btn.matches('.delete-btn')) {
    await apiFetch(`/positions/${id}`, { method: 'DELETE' });
    return loadPositions();
  }
  if (btn.matches('.edit-btn')) {
    const data = await (await apiFetch('/positions')).json();
    const p = data.find(x => x._id === id);
    editPosId = id;
    posNumberInput.value = p.position;
    posPilotInput.value = p.pilot;
    posTeamInput.value = p.team;
    posPointsInput.value = p.points;
    posSubmitBtn.innerText = 'Actualizar';
  }
});

// Bulk posiciones
document.getElementById('bulk-positions-btn')?.addEventListener('click', async () => {
  // 1) Obtenemos el archivo desde el input correcto
  const fileInput = document.getElementById('bulk-positions-file');
  const file = fileInput?.files[0];
  if (!file) return alert('Selecciona un archivo Excel para posiciones');

  try {
    // 2) Lo leemos como ArrayBuffer y convertimos a JSON
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data, { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

    // 3) Hacemos POST al endpoint correspondiente
    await apiFetch('/positions/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows)
    });

    // 4) Recargamos la lista
    await loadPositions();
    alert(`✅ Importadas ${rows.length} posiciones`);
  } catch (err) {
    console.error('Error bulk positions:', err);
    alert('Error importando posiciones: ' + err.message);
  }
});

// ===================
// CRUD: Resultados
// ===================
let editResId = null;
const resultsForm = document.getElementById('results-form');
const resultsList = document.getElementById('results-list');

async function loadResults() {
  try {
    const res = await apiFetch('/results');
    const data = await res.json();
    resultsList.innerHTML = data.map(r => `
      <li data-id="${r._id}">
        ${new Date(r.date).toLocaleDateString()} — ${r.event}: 🥇${r.first} 🥈${r.second} 🥉${r.third}
        <button class="edit-btn">Editar</button>
        <button class="delete-btn">Eliminar</button>
      </li>
    `).join('');
  } catch {
    resultsList.innerHTML = `<li style="color:red">Error resultados</li>`;
  }
}

resultsForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const body = {
    event: document.getElementById('res-event').value.trim(),
    date: document.getElementById('res-date').value,
    first: document.getElementById('res-first').value.trim(),
    second: document.getElementById('res-second').value.trim(),
    third: document.getElementById('res-third').value.trim()
  };
  const method = editResId ? 'PUT' : 'POST';
  const path = editResId ? `/results/${editResId}` : '/results';
  await apiFetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  editResId = null;
  resultsForm.reset();
  loadResults();
});

resultsList?.addEventListener('click', async e => {
  const btn = e.target, li = btn.closest('li');
  if (!li) return;
  const id = li.dataset.id;
  if (btn.matches('.delete-btn')) {
    await apiFetch(`/results/${id}`, { method: 'DELETE' });
    return loadResults();
  }
  if (btn.matches('.edit-btn')) {
    const data = await (await apiFetch('/results')).json();
    const r = data.find(x => x._id === id);
    editResId = id;
    document.getElementById('res-event').value = r.event;
    document.getElementById('res-date').value = r.date.slice(0, 10);
    document.getElementById('res-first').value = r.first;
    document.getElementById('res-second').value = r.second;
    document.getElementById('res-third').value = r.third;
  }
});

// ===================
// CRUD: Noticias
// ===================
let editNewsId = null;
const newsForm = document.getElementById('news-form');
const newsListElm = document.getElementById('news-list');

async function loadNews() {
  const res = await apiFetch('/news');
  const data = await res.json();
  newsListElm.innerHTML = data.map(n => `
    <li data-id="${n._id}">
      <strong>${n.title}</strong>
      <small>${new Date(n.date).toLocaleDateString()}</small>
      <p>${n.description}</p>
      <button class="edit-btn">Editar</button>
      <button class="delete-btn">Eliminar</button>
    </li>
  `).join('');
}

newsForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const payload = {
    title: newsForm.title.value.trim(),
    date: newsForm.date.value,
    description: newsForm.description.value.trim()
  };
  const method = editNewsId ? 'PUT' : 'POST';
  const path = editNewsId ? `/news/${editNewsId}` : '/news';
  await apiFetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  editNewsId = null;
  newsForm.reset();
  loadNews();
});

newsListElm?.addEventListener('click', async e => {
  const btn = e.target, li = btn.closest('li');
  if (!li) return;
  const id = li.dataset.id;
  if (btn.matches('.delete-btn')) {
    await apiFetch(`/news/${id}`, { method: 'DELETE' });
    return loadNews();
  }
  if (btn.matches('.edit-btn')) {
    const arr = await (await apiFetch('/news')).json();
    const n = arr.find(x => x._id === id);
    editNewsId = id;
    newsForm.title.value = n.title;
    newsForm.date.value = n.date.slice(0, 10);
    newsForm.description.value = n.description;
  }
});

// Bulk noticias
document.getElementById('bulk-news-btn')?.addEventListener('click', async () => {
  const fileInput = document.getElementById('news-excel');
  const file = fileInput?.files[0];
  if (!file) return alert('Selecciona un archivo Excel para noticias');

  try {
    // Leer el archivo y pasarlo a JSON
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data, { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

    // POST al endpoint de bulk news
    const res = await apiFetch('/news/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows)
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    // Recarga la lista y notifica
    await loadNews();
    alert(`✅ Importadas ${rows.length} noticias`);
  } catch (err) {
    console.error('Error bulk news:', err);
    alert('Error importando noticias: ' + err.message);
  }
});

// ===================
// ——— Blog CRUD ———
let editBlogId = null;
const blogForm = document.getElementById('blog-form');
const blogListElm = document.getElementById('blog-list');
const blogTitleInput = document.getElementById('blog-title');
const blogDateInput = document.getElementById('blog-date');
const blogContentEditor = document.getElementById('blog-content-editor');
const blogBannerInput = document.getElementById('blog-banner');
const blogImagesInput = document.getElementById('blog-images');

async function loadBlog() {
  try {
    const res = await apiFetch('/blog');
    const data = await res.json();
    blogListElm.innerHTML = data.map(b => `
      <li data-id="${b._id}">
        <div class="blog-preview-images">
          ${b.banner ? `<img src="${b.banner}" width="150">` : ''}
          ${b.images.map(u => `<img src="${u}" width="80">`).join('')}
        </div>
        <div class="blog-info">
          <strong>${b.title}</strong><br>
          <small>${new Date(b.date).toLocaleDateString()}</small>
          <p>${b.content.substring(0, 100)}...</p>
        </div>
        <div class="blog-actions">
          <button class="edit-btn">Editar</button>
          <button class="delete-btn">Eliminar</button>
        </div>
      </li>
    `).join('');
  } catch (err) {
    blogListElm.innerHTML = `<li style="color:red">Error blog: ${err.message}</li>`;
  }
}

blogForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData();
  fd.append('title', blogTitleInput.value.trim());
  fd.append('date', blogDateInput.value);
  fd.append('content', blogContentEditor.innerHTML.trim());
  if (blogBannerInput.files[0]) fd.append('banner', blogBannerInput.files[0]);
  Array.from(blogImagesInput.files).forEach(f => fd.append('images', f));

  const method = editBlogId ? 'PUT' : 'POST';
  const path = editBlogId ? `/blog/${editBlogId}` : '/blog';

  try {
    const res = await apiFetch(path, { method, body: fd });
    if (!res.ok) throw new Error(await res.text());
    blogForm.reset();
    blogContentEditor.innerHTML = '';
    editBlogId = null;
    await loadBlog();
  } catch (err) {
    alert('Error blog: ' + err.message);
  }
});

blogListElm?.addEventListener('click', async e => {
  const btn = e.target, li = btn.closest('li');
  if (!li) return;
  const id = li.dataset.id;

  if (btn.matches('.delete-btn')) {
    if (!confirm('¿Eliminar entrada?')) return;
    await apiFetch(`/blog/${id}`, { method: 'DELETE' });
    return loadBlog();
  }
  if (btn.matches('.edit-btn')) {
    const b = await (await apiFetch(`/blog/${id}`)).json();
    editBlogId = id;
    blogTitleInput.value = b.title;
    blogDateInput.value = b.date.slice(0, 10);
    blogContentEditor.innerHTML = b.content;
  }
});

// ——— Hero CRUD ———
const heroPreview = document.getElementById('hero-preview');
const heroForm = document.getElementById('hero-form');

async function loadHero() {
  try {
    const res = await apiFetch('/hero');
    const h = await res.json();
    if (!h) {
      heroPreview.innerHTML = '<p>No hay Hero configurado</p>';
      return;
    }
    heroPreview.innerHTML = `
      ${h.imageUrl ? `<img src="${h.imageUrl}" alt="Hero Image">` : ''}
      <h3>${h.title}</h3>
      <h4>${h.subtitle}</h4>
      <p>${h.description}</p>
      <button id="edit-hero-btn">Editar</button>
    `;
    document.getElementById('edit-hero-btn').onclick = () => {
      document.getElementById('hero-id').value = h._id;
      document.getElementById('hero-title').value = h.title;
      document.getElementById('hero-subtitle').value = h.subtitle;
      document.getElementById('hero-description').value = h.description;
    };
  } catch (err) {
    console.error('Error cargando Hero:', err);
  }
}

heroForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('hero-id').value;
  const fd = new FormData(heroForm);
  const method = id ? 'PUT' : 'POST';
  const path = id ? `/hero/${id}` : '/hero';
  try {
    await apiFetch(path, { method, body: fd });
    heroForm.reset();
    await loadHero();
  } catch (err) {
    alert('Error Hero: ' + err.message);
  }
});

// ——— Countdown ADMIN ———
let countdownTarget = null;
const countdownInput = document.getElementById('countdown-target');
const countdownStatus = document.getElementById('countdown-status');

async function saveCountdown() {
  if (!countdownInput.value) return alert('Selecciona fecha y hora');
  const iso = new Date(countdownInput.value).toISOString();
  try {
    const res = await apiFetch('/countdown', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: iso })
    });
    const { target } = await res.json();
    countdownTarget = new Date(target).getTime();
    countdownStatus.textContent = '✅ Guardado';
  } catch (err) {
    countdownStatus.textContent = '❌ ' + err.message;
  }
}

function updateAdminCountdown() {
  if (!countdownTarget) return;
  const diff = countdownTarget - Date.now();
  if (diff < 0) return;
  const days = String(Math.floor(diff / 86400000)).padStart(2, '0');
  const hours = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
  const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
  const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
  document.getElementById('preview-days').textContent = days;
  document.getElementById('preview-hours').textContent = hours;
  document.getElementById('preview-minutes').textContent = minutes;
  document.getElementById('preview-seconds').textContent = seconds;
}



// ── Inicialización global ─────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Si estoy en login.html => salir
  if (loginForm) return;

  // Bind de CRUD
  loadTeams();
  loadEvents();
  loadGallery();
  loadInfo();
  loadPositions();
  loadResults();
  loadNews();
  loadBlog();
  loadHero();
  // countdown inicial
  apiFetch('/countdown')
    .then(r => r.json())
    .then(cfg => {
      countdownTarget = new Date(cfg.target).getTime();
      countdownInput.value = new Date(cfg.target).toISOString().slice(0, 16);
    })
    .finally(() => {
      updateAdminCountdown();
      setInterval(updateAdminCountdown, 1000);
    });
  document.getElementById('countdown-save-btn')
    .addEventListener('click', saveCountdown);
  // Botón de bulk / countdown
  document.getElementById('bulk-events-btn')?.addEventListener('click', handleBulkEvents);
  document.getElementById('bulk-positions-btn')?.addEventListener('click', handleBulkPositionsUpload);
  document.getElementById('countdown-save-btn')?.addEventListener('click', saveCountdown);
 document.getElementById('bulk-positions-btn').addEventListener('click', handleBulkPositionsUpload);
  document.getElementById('bulk-news-btn')
    ?.addEventListener('click', handleBulkNewsUpload);
});

