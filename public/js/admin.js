// admin.js
// ===================
// Variables y referencias al DOM
// ===================

const API = 'http://localhost:3000';

// --- Equipos ---
let editTeamId = null;
const teamForm        = document.getElementById('team-form');
const teamList        = document.getElementById('teams-list');
const teamNameInput   = document.getElementById('team-name');
const teamPilotsInput = document.getElementById('team-pilots');
const teamPositionInput = document.getElementById('team-position');
const teamImageInput  = document.getElementById('team-image');
const teamStatus      = document.getElementById('bulk-status');
const teamSubmitBtn   = document.getElementById('team-submit-btn');

async function loadTeams() {
  try {
    const res = await fetch(`${API}/teams`);
    if (!res.ok) throw new Error(res.statusText);
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
  const url = editTeamId ? `${API}/teams/${editTeamId}` : `${API}/teams`;
  const method = editTeamId ? 'PUT' : 'POST';
  const fd = new FormData();
  fd.append('name', teamNameInput.value.trim());
  fd.append('pilots', teamPilotsInput.value.trim());
  fd.append('position', teamPositionInput.value);
  if (teamImageInput.files[0]) fd.append('image', teamImageInput.files[0]);

  try {
    const res = await fetch(url, { method, body: fd });
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

teamList.addEventListener('click', async e => {
  const btn = e.target;
  const li = btn.closest('li');
  if (!li) return;
  const id = li.dataset.id;

  if (btn.matches('.delete-btn')) {
    if (!confirm('¿Eliminar este equipo?')) return;
    await fetch(`${API}/teams/${id}`, { method: 'DELETE' });
    return loadTeams();
  }

  if (btn.matches('.edit-btn')) {
    const res = await fetch(`${API}/teams/${id}`);
    if (!res.ok) return alert('No se encontró ese equipo');
    const t = await res.json();
    editTeamId = t._id;
    teamNameInput.value = t.name;
    teamPilotsInput.value = t.pilots.join(', ');
    teamPositionInput.value = t.position;
    teamSubmitBtn.innerText = 'Actualizar Equipo';
  }
});

// --- Eventos ---
let editEventId = null;
const eventForm       = document.getElementById('event-form');
const eventList       = document.getElementById('events-list');
const eventNameInput  = document.getElementById('event-name');
const eventDateInput  = document.getElementById('event-date');
const eventLocInput   = document.getElementById('event-location');
const eventSubmitBtn  = document.getElementById('event-submit-btn');

async function loadEvents() {
  try {
    const res = await fetch(`${API}/events`);
    const events = await res.json();
    eventList.innerHTML = events.map(ev => `
      <li data-id="${ev._id}">
        <span>${ev.name} — ${new Date(ev.date).toLocaleDateString()} — ${ev.location}</span>
        <span>
          <button class="edit-btn">Editar</button>
          <button class="delete-btn">Eliminar</button>
        </span>
      </li>
    `).join('');
  } catch (err) {
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
  const url = editEventId ? `${API}/events/${editEventId}` : `${API}/events`;
  const method = editEventId ? 'PUT' : 'POST';
  try {
    const res = await fetch(url, {
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

eventList.addEventListener('click', async e => {
  const btn = e.target;
  const li = btn.closest('li');
  if (!li) return;
  const id = li.dataset.id;

  if (btn.matches('.delete-btn')) {
    await fetch(`${API}/events/${id}`, { method: 'DELETE' });
    return loadEvents();
  }

  if (btn.matches('.edit-btn')) {
    const res = await fetch(`${API}/events/${id}`);
    const ev = await res.json();
    editEventId = ev._id;
    eventNameInput.value = ev.name;
    eventDateInput.value = ev.date.split('T')[0];
    eventLocInput.value = ev.location;
    eventSubmitBtn.innerText = 'Actualizar Evento';
  }
});

// --- bulk event ---
async function handleBulkEvents() {
  console.log('🔥 Bulk events upload');
  const file = document.getElementById('events-excel').files[0];
  if (!file) return alert('Selecciona un archivo');
  const status = document.getElementById('bulk-events-status');
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data);
  const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  status.textContent = 'Importando eventos...';
  try {
    const res = await fetch(`${API}/events/bulk`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(json)
    });
    if (!res.ok) throw new Error(await res.text());
    status.textContent = 'Eventos importados 🎉';
    loadEvents();
  } catch (err) {
    status.textContent = 'Error: ' + err.message;
    console.error(err);
  }
}

// --- Galería ---
const galleryForm     = document.getElementById('gallery-form');
const galleryList     = document.getElementById('gallery-list');
const galleryImgInput = document.getElementById('gallery-image');
const galleryCapInput = document.getElementById('gallery-caption');

async function loadGallery() {
  try {
    const res = await fetch(`${API}/gallery`);
    const data = await res.json();
    galleryList.innerHTML = data.map(i => `
      <li data-id="${i._id}">
        <img src="${i.url}" width="100">
        <p>${i.caption}</p>
        <button class="delete-btn">Eliminar</button>
      </li>
    `).join('');
  } catch (err) {
    galleryList.innerHTML = `<li style="color:red">Error galería</li>`;
  }
}

async function handleGalleryFormSubmit(e) {
  e.preventDefault();
  const file = galleryImgInput.files[0];
  if (!file) return alert('Selecciona una imagen');
  const fd = new FormData();
  fd.append('image', file);
  fd.append('caption', galleryCapInput.value.trim());
  try {
    const res = await fetch(`${API}/gallery`, { method: 'POST', body: fd });
    if (!res.ok) throw new Error(await res.text());
    galleryForm.reset();
    await loadGallery();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

galleryList.addEventListener('click', async e => {
  if (!e.target.matches('.delete-btn')) return;
  const id = e.target.closest('li').dataset.id;
  if (!confirm('¿Eliminar imagen?')) return;
  await fetch(`${API}/gallery/${id}`, { method: 'DELETE' });
  loadGallery();
});

// --- Info ---
let editInfoId = null;
const infoForm       = document.getElementById('info-form');
const infoList       = document.getElementById('info-list');
const infoTitleInput = document.getElementById('info-title');
const infoContentInput = document.getElementById('info-content');
const infoSubmitBtn  = document.getElementById('info-submit-btn');

async function loadInfo() {
  try {
    const res = await fetch(`${API}/info`);
    const data = await res.json();
    infoList.innerHTML = data.map(i => `
      <li data-id="${i._id}">
        <strong>${i.title}</strong>
        <p>${i.content}</p>
        <button class="edit-btn">Editar</button>
        <button class="delete-btn">Eliminar</button>
      </li>
    `).join('');
  } catch (err) {
    infoList.innerHTML = `<li style="color:red">Error info</li>`;
  }
}

async function handleInfoFormSubmit(e) {
  e.preventDefault();
  const payload = { id: editInfoId, title: infoTitleInput.value.trim(), content: infoContentInput.value.trim() };
  try {
    const res = await fetch(`${API}/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await res.text());
    editInfoId = null;
    infoForm.reset();
    infoSubmitBtn.innerText = 'Crear / Actualizar';
    loadInfo();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

infoList.addEventListener('click', async e => {
  const btn = e.target;
  const li = btn.closest('li'); if (!li) return;
  const id = li.dataset.id;
  if (btn.matches('.delete-btn')) {
    if (!confirm('¿Eliminar bloque?')) return;
    await fetch(`${API}/info/${id}`, { method: 'DELETE' });
    return loadInfo();
  }
  if (btn.matches('.edit-btn')) {
    const data = await (await fetch(`${API}/info`)).json();
    const item = data.find(x => x._id === id);
    editInfoId = id;
    infoTitleInput.value = item.title;
    infoContentInput.value = item.content;
    infoSubmitBtn.innerText = 'Actualizar';
  }
});

// --- Posiciones ---
let editPosId = null;
const positionsForm     = document.getElementById('positions-form');
const positionsList     = document.getElementById('positions-list');
const posNumberInput    = document.getElementById('pos-number');
const posPilotInput     = document.getElementById('pos-pilot');
const posTeamInput      = document.getElementById('pos-team');
const posPointsInput    = document.getElementById('pos-points');
const posSubmitBtn      = document.getElementById('pos-submit-btn');

async function loadPositions() {
  try {
    const res = await fetch(`${API}/positions`);
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

async function handlePositionsFormSubmit(e) {
  e.preventDefault();
  const body = {
    position: +posNumberInput.value,
    pilot: posPilotInput.value.trim(),
    team: posTeamInput.value.trim(),
    points: +posPointsInput.value
  };
  const url    = editPosId ? `${API}/positions/${editPosId}` : `${API}/positions`;
  const method = editPosId ? 'PUT' : 'POST';
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(await res.text());
    editPosId = null;
    positionsForm.reset();
    posSubmitBtn.innerText = 'Crear / Actualizar';
    loadPositions();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

positionsList.addEventListener('click', async e => {
  const btn = e.target; const li = btn.closest('li'); if (!li) return;
  const id = li.dataset.id;
  if (btn.matches('.delete-btn')) {
    if (!confirm('¿Eliminar posición?')) return;
    await fetch(`${API}/positions/${id}`, { method: 'DELETE' });
    return loadPositions();
  }
  if (btn.matches('.edit-btn')) {
    const data = await (await fetch(`${API}/positions`)).json();
    const p = data.find(x => x._id === id);
    editPosId = id;
    posNumberInput.value = p.position;
    posPilotInput.value  = p.pilot;
    posTeamInput.value   = p.team;
    posPointsInput.value = p.points;
    posSubmitBtn.innerText = 'Actualizar';
  }
});

// === Bulk upload de Posiciones ===
async function handleBulkPositionsUpload() {
  const fileInput = document.getElementById('bulk-positions-file');
  const status = document.getElementById('bulk-positions-status');
  if (!fileInput.files.length) return alert('Selecciona un archivo Excel');

  status.innerText = '📥 Leyendo archivo…';
  // Leer workbook
  const dataBuf = await fileInput.files[0].arrayBuffer();
  const wb = XLSX.read(dataBuf, { type: 'array' });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

  status.innerText = `⏳ Importando ${rows.length} filas…`;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    // Asegúrate que las columnas de tu plantilla se llaman: position, pilot, team, points
    await fetch(`${API}/positions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        position: +r.position,
        pilot: r.pilot,
        team: r.team,
        points: +r.points
      })
    });
  }

  status.innerText = `✅ Importadas ${rows.length} posiciones.`;
  loadPositions();
}

// --- Resultados ---
let editResId = null;
const resultsForm     = document.getElementById('results-form');
const resultsList     = document.getElementById('results-list');
const resEventInput   = document.getElementById('res-event');
const resDateInput    = document.getElementById('res-date');
const resFirstInput   = document.getElementById('res-first');
const resSecondInput  = document.getElementById('res-second');
const resThirdInput   = document.getElementById('res-third');
const resSubmitBtn    = document.getElementById('res-submit-btn');

async function loadResults() {
  try {
    const res = await fetch(`${API}/results`);
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

async function handleResultsFormSubmit(e) {
  e.preventDefault();
  const body = {
    event: resEventInput.value.trim(),
    date: resDateInput.value,
    first: resFirstInput.value.trim(),
    second: resSecondInput.value.trim(),
    third: resThirdInput.value.trim()
  };
  const url    = editResId ? `${API}/results/${editResId}` : `${API}/results`;
  const method = editResId ? 'PUT' : 'POST';
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(await res.text());
    editResId = null;
    resultsForm.reset();
    resSubmitBtn.innerText = 'Crear / Actualizar';
    loadResults();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

resultsList.addEventListener('click', async e => {
  const btn = e.target; const li = btn.closest('li'); if (!li) return;
  const id = li.dataset.id;
  if (btn.matches('.delete-btn')) {
    if (!confirm('¿Eliminar resultado?')) return;
    await fetch(`${API}/results/${id}`, { method: 'DELETE' });
    return loadResults();
  }
  if (btn.matches('.edit-btn')) {
    const data = await (await fetch(`${API}/results`)).json();
    const r = data.find(x => x._id === id);
    editResId = id;
    resEventInput.value  = r.event;
    resDateInput.value   = r.date.slice(0,10);
    resFirstInput.value  = r.first;
    resSecondInput.value = r.second;
    resThirdInput.value  = r.third;
    resSubmitBtn.innerText = 'Actualizar';
  }
});

// --- Noticias ---
let editNewsId = null;
const newsForm        = document.getElementById('news-form');
const newsList        = document.getElementById('news-list');
const newsTitleInput  = document.getElementById('news-title');
const newsDateInput   = document.getElementById('news-date');
const newsDescInput   = document.getElementById('news-description');
const newsSubmitBtn   = document.getElementById('news-submit-btn');
const bulkNewsBtn     = document.getElementById('bulk-news-btn');
const bulkNewsStatus  = document.getElementById('bulk-news-status');

async function loadNews() {
  try {
    const res = await fetch(`${API}/news`);
    const data = await res.json();
    newsList.innerHTML = data.map(n => `
      <li data-id="${n._id}">
        <strong>${n.title}</strong>
        <small>${new Date(n.date).toLocaleDateString()}</small>
        <p>${n.description}</p>
        <button class="edit-btn">Editar</button>
        <button class="delete-btn">Eliminar</button>
      </li>
    `).join('');
  } catch {
    newsList.innerHTML = `<li style="color:red">Error noticias</li>`;
  }
}

async function handleNewsFormSubmit(e) {
  e.preventDefault();
  const payload = {
    title: newsTitleInput.value.trim(),
    date: newsDateInput.value,
    description: newsDescInput.value.trim()
  };
  const url = editNewsId ? `${API}/news/${editNewsId}` : `${API}/news`;
  const method = editNewsId ? 'PUT' : 'POST';
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await res.text());
    editNewsId = null;
    newsForm.reset();
    newsSubmitBtn.innerText = 'Crear / Actualizar';
    await loadNews();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

newsList.addEventListener('click', async e => {
  const btn = e.target;
  const li = btn.closest('li');
  if (!li) return;
  const id = li.dataset.id;
  
  if (btn.matches('.delete-btn')) {
    if (!confirm('¿Eliminar esta noticia?')) return;
    await fetch(`${API}/news/${id}`, { method: 'DELETE' });
    return loadNews();
  }
  
  if (btn.matches('.edit-btn')) {
    const n = (await fetch(`${API}/news`)).json().then(arr => arr.find(x=>x._id===id));
    editNewsId = id;
    newsTitleInput.value = (await n).title;
    newsDateInput.value = (await n).date.slice(0,10);
    newsDescInput.value = (await n).description;
    newsSubmitBtn.innerText = 'Actualizar';
  }
});

bulkNewsBtn.addEventListener('click', async ()=>{
  const inp = document.getElementById('news-excel'); if(!inp.files.length)return;
  const buf = await inp.files[0].arrayBuffer();
  const wb = XLSX.read(buf,{type:'array'});
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  bulkNewsStatus.textContent='Importando...';
  try {
    const res = await fetch(`${API}/news/bulk`,{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(rows)
    });
    if(!res.ok) throw new Error(await res.text());
    bulkNewsStatus.textContent='Importación exitosa 🎉';
    loadNews();
  } catch(e){ bulkNewsStatus.textContent='Error: '+e.message; }
});

// --- Blog ---
let editBlogId = null;
const blogForm           = document.getElementById('blog-form');
const blogList           = document.getElementById('blog-list');
const blogTitleInput     = document.getElementById('blog-title');
const blogDateInput      = document.getElementById('blog-date');
const blogBannerInput    = document.getElementById('blog-banner');
const blogContentEditor  = document.getElementById('blog-content-editor');
const blogSubmitBtn      = document.getElementById('blog-submit-btn');
const blogImagesInput    = document.getElementById('blog-images');

// toolbar for blog
document.querySelectorAll('#blog-toolbar button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.execCommand(btn.dataset.cmd,false,null);
    blogContentEditor.focus();
  });
});

async function loadBlog() {
  try {
    const res = await fetch(`${API}/blog`);
    const data = await res.json();
    blogList.innerHTML = data.map(b=>`
      <li data-id="${b._id}">
        <div class="blog-preview-images">
          ${b.banner?`<img src="${b.banner}" width="150">`:''}
          ${b.images.map(u=>`<img src="${u}" width="80">`).join('')}
        </div>
        <div class="blog-info">
          <strong>${b.title}</strong><br>
          <small>${new Date(b.date).toLocaleDateString()}</small>
          <div class="blog-excerpt">${b.content.substring(0,100)}...</div>
        </div>
        <div class="blog-actions">
          <button class="edit-btn">Editar</button>
          <button class="delete-btn">Eliminar</button>
        </div>
      </li>
    `).join('');
  } catch {
    blogList.innerHTML = `<li style="color:red">Error blog</li>`;
  }
}

async function handleBlogFormSubmit(e) {
  e.preventDefault();
  const fd = new FormData();
  fd.append('title', blogTitleInput.value.trim());
  fd.append('date', blogDateInput.value);
  fd.append('content', blogContentEditor.innerHTML.trim());
  if (blogBannerInput.files[0]) fd.append('banner', blogBannerInput.files[0]);
  Array.from(blogImagesInput.files).forEach(f=>fd.append('images',f));

  const url = editBlogId ? `${API}/blog/${editBlogId}` : `${API}/blog`;
  const method = editBlogId ? 'PUT' : 'POST';
  try {
    const res = await fetch(url,{method,body:fd});
    if(!res.ok) throw new Error(await res.text());
    editBlogId = null;
    blogForm.reset();
    blogSubmitBtn.innerText='Crear / Actualizar';
    blogContentEditor.innerHTML='';
    loadBlog();
  } catch(err){ alert('Error blog: '+err.message); }
}

blogList.addEventListener('click', async e=>{
  const btn = e.target; const li = btn.closest('li'); if(!li) return;
  const id = li.dataset.id;
  if(btn.matches('.delete-btn')){
    if(!confirm('¿Eliminar entrada?')) return;
    await fetch(`${API}/blog/${id}`,{method:'DELETE'});
    return loadBlog();
  }
  if(btn.matches('.edit-btn')){
    const b = await (await fetch(`${API}/blog/${id}`)).json();
    editBlogId = id;
    blogTitleInput.value=b.title;
    blogDateInput.value=b.date.slice(0,10);
    blogContentEditor.innerHTML=b.content;
    blogSubmitBtn.innerText='Actualizar';
  }
});

// ——— Hero CRUD ——— //

async function loadHero() {
  try {
    const res = await fetch('/hero');
    const hero = await res.json();
    const preview = document.getElementById('hero-preview');
    if (!hero) {
      preview.innerHTML = '<p>No hay Hero configurado</p>';
      return;
    }
    preview.innerHTML = `
      ${hero.imageUrl ? `<img src="${hero.imageUrl}" alt="Hero Image">` : ''}
      <h3>${hero.title}</h3>
      <h4>${hero.subtitle}</h4>
      <p>${hero.description}</p>
      <a href="${hero.btn1.url}" target="_blank">${hero.btn1.text}</a>
      <a href="${hero.btn2.url}" target="_blank">${hero.btn2.text}</a>
      <button onclick="editHero('${hero._id}')">Editar</button>
    `;
  } catch (err) {
    console.error('Error cargando Hero:', err);
  }
}

function editHero(id) {
  fetch(`/hero/${id}`)
    .then(res => res.json())
    .then(h => {
      document.getElementById('hero-id').value = h._id;
      document.getElementById('hero-title').value = h.title;
      document.getElementById('hero-subtitle').value = h.subtitle;
      document.getElementById('hero-description').value = h.description;
      document.getElementById('hero-btn1-text').value = h.btn1.text;
      document.getElementById('hero-btn1-url').value = h.btn1.url;
      document.getElementById('hero-btn2-text').value = h.btn2.text;
      document.getElementById('hero-btn2-url').value = h.btn2.url;
    })
    .catch(console.error);
}

document.getElementById('hero-form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('hero-id').value;
  const fd = new FormData();
  fd.append('title', document.getElementById('hero-title').value);
  fd.append('subtitle', document.getElementById('hero-subtitle').value);
  fd.append('description', document.getElementById('hero-description').value);
  fd.append('btn1[text]', document.getElementById('hero-btn1-text').value);
  fd.append('btn1[url]', document.getElementById('hero-btn1-url').value);
  fd.append('btn2[text]', document.getElementById('hero-btn2-text').value);
  fd.append('btn2[url]', document.getElementById('hero-btn2-url').value);
  const fileInput = document.getElementById('hero-image');
  if (fileInput.files.length) {
    fd.append('image', fileInput.files[0]);
  }

  const opts = { method: id ? 'PUT' : 'POST', body: fd };
  const url = id ? `/hero/${id}` : '/hero';
  try {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error('Error guardando Hero');
    document.getElementById('hero-form').reset();
    loadHero();
  } catch (err) {
    console.error(err);
    alert('Error guardando Hero');
  }
});

// ===================
// Inicialización global
// ===================
window.addEventListener('DOMContentLoaded', () => {
  // Equipos
  teamForm.addEventListener('submit', handleTeamFormSubmit);
  loadTeams();

  // Eventos
  eventForm.addEventListener('submit', handleEventFormSubmit);
  loadEvents();
  // Eventos bulk
  document.getElementById('bulk-events-btn').addEventListener('click', handleBulkEvents);

  // Galería
  galleryForm.addEventListener('submit', handleGalleryFormSubmit);
  loadGallery();

  // Info
  infoForm.addEventListener('submit', handleInfoFormSubmit);
  loadInfo();

  // Posiciones
  positionsForm.addEventListener('submit', handlePositionsFormSubmit);
  loadPositions();
  // Posiciones bulk
  document.getElementById('bulk-positions-btn').addEventListener('click', handleBulkPositionsUpload);

  // Resultados
  resultsForm.addEventListener('submit', handleResultsFormSubmit);
  loadResults();

  // Blog
  blogForm .addEventListener('submit', handleBlogFormSubmit);
  loadBlog();

   // Noticias
  newsForm .addEventListener('submit', handleNewsFormSubmit);
  loadNews();

   loadHero();
});
