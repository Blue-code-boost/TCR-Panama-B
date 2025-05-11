// admin.js
// ===================
// Variables y Configuración
// ===================
const API = 'http://localhost:3000';
let editId = null;

// ===================
// Funciones de Equipos
// ===================
/**
 * Carga y muestra la lista de equipos
 */
async function loadTeams() {
  try {
    const res = await fetch(`${API}/teams`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const teams = await res.json();
    const listEl = document.getElementById('teams-list');
    listEl.innerHTML = teams.map(t =>
      `<li data-id="${t._id}">
         <span><strong>${t.name}</strong> (Pos: ${t.position}) — ${t.pilots.join(', ')}</span>
         <span>
           <button class="edit-btn">Editar</button>
           <button class="delete-btn">Eliminar</button>
         </span>
       </li>`
    ).join('');

    // Asociar botones de borrar
    listEl.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        const id = e.target.closest('li').dataset.id;
        if (confirm('¿Eliminar este equipo?')) {
          await fetch(`${API}/teams/${id}`, { method: 'DELETE' });
          loadTeams();
        }
      });
    });

    // Asociar botones de editar
    listEl.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        const id = e.target.closest('li').dataset.id;
        const res2 = await fetch(`${API}/teams/${id}`);
        if (!res2.ok) return alert('No se pudo cargar el equipo');
        const team = await res2.json();
        document.getElementById('team-id').value = id;
        document.getElementById('team-name').value = team.name;
        document.getElementById('team-pilots').value = team.pilots.join(', ');
        document.getElementById('team-position').value = team.position;
        document.getElementById('team-submit-btn').innerText = 'Actualizar Equipo';
        editId = id;
      });
    });
  } catch (err) {
    console.error('Error en loadTeams():', err);
    document.getElementById('teams-list').innerHTML = '<li style="color:red">Error cargando equipos</li>';
  }
}

/**
 * Crea o actualiza un equipo según editId
 */
async function handleFormSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('team-name').value.trim();
  const pilots = document.getElementById('team-pilots').value.split(',').map(s => s.trim());
  const position = Number(document.getElementById('team-position').value);
  const payload = { name, pilots, position };
  const url = editId ? `${API}/teams/${editId}` : `${API}/teams`;
  const method = editId ? 'PUT' : 'POST';
  try {
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(await res.text());
  } catch (err) {
    alert('Error guardando equipo: ' + err.message);
    console.error(err);
  }
  // Reset form
  editId = null;
  document.getElementById('team-form').reset();
  document.getElementById('team-submit-btn').innerText = 'Crear Equipo';
  loadTeams();
}

/**
 * Procesa archivo Excel y envía bulk import
 */
async function handleBulkUpload() {
  console.log('🔥 Bulk upload button clicked');
  const fileInput = document.getElementById('excel-file');
  const status = document.getElementById('bulk-status');
  if (!fileInput.files.length) return alert('Selecciona un archivo Excel.');
  const data = await fileInput.files[0].arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet);
  status.textContent = 'Importando...';
  try {
    const res = await fetch(`${API}/teams/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(json)
    });
    if (!res.ok) throw new Error(await res.text());
    status.textContent = 'Importación exitosa 🎉';
    loadTeams();
  } catch (err) {
    status.textContent = 'Error: ' + err.message;
    console.error(err);
  }
}

// ===================
// Funciones de Eventos
// ===================
async function loadEvents() {
  try {
    const res = await fetch(`${API}/events`);
    const events = await res.json();
    const list = document.getElementById('events-list');
    list.innerHTML = events.map(ev =>
      `<li data-id="${ev._id}">
         <span>${ev.name} — ${new Date(ev.date).toLocaleDateString()} — ${ev.location}</span>
         <span>
           <button class="edit-btn">Editar</button>
           <button class="delete-btn">Eliminar</button>
         </span>
       </li>`
    ).join('');
    // Borrar eventos
    list.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        const id = e.target.closest('li').dataset.id;
        await fetch(`${API}/events/${id}`, { method: 'DELETE' });
        loadEvents();
      });
    });
    // Editar eventos
    list.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        const id = e.target.closest('li').dataset.id;
        const res2 = await fetch(`${API}/events/${id}`);
        const ev = await res2.json();
        document.getElementById('event-id').value = id;
        document.getElementById('event-name').value = ev.name;
        document.getElementById('event-date').value = ev.date.split('T')[0];
        document.getElementById('event-location').value = ev.location;
        document.getElementById('event-submit-btn').innerText = 'Actualizar Evento';
      });
    });
  } catch (err) {
    console.error('Error en loadEvents():', err);
    document.getElementById('events-list').innerHTML = '<li style="color:red">Error cargando eventos</li>';
  }
}

// handleEventFormSubmit actualizado
async function handleEventFormSubmit(e) {
  e.preventDefault();
  // Log para revisar datos
  const eventId = document.getElementById('event-id').value;
  const payload = { name: document.getElementById('event-name').value, date: document.getElementById('event-date').value, location: document.getElementById('event-location').value };
  const url = eventId ? `${API}/events/${eventId}` : `${API}/events`;
  const method = eventId ? 'PUT' : 'POST';
  try {
    const res = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(await res.text());
  } catch (err) {
    console.error('Error guardando evento:', err);
    alert('Error guardando evento: ' + err.message);
  }
  document.getElementById('event-form').reset();
  loadEvents();
}

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
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(json)
    });
    if (!res.ok) throw new Error(await res.text());
    status.textContent = 'Eventos importados 🎉';
    loadEvents();
  } catch (err) {
    status.textContent = 'Error: '+err.message;
    console.error(err);
  }
}

// === Noticias ===
async function loadNews() {
  try {
    const res = await fetch(`${API}/news`);
    if (!res.ok) throw new Error(res.status);
    const items = await res.json();
    const list = document.getElementById('news-list');
list.innerHTML = items.map(n =>
  `<li data-id="${n._id}">
     <div class="news-admin-item">
       <h4>${n.title}</h4>
       <div class="news-admin-date">${new Date(n.date).toLocaleDateString()}</div>
       <p class="news-admin-content">${n.content}</p>
     </div>
     <div class="news-admin-actions">
       <button class="edit-news-btn">Editar</button>
       <button class="delete-news-btn">Eliminar</button>
     </div>
   </li>`
).join('');


    // Eliminar
    document.querySelectorAll('.delete-news-btn').forEach(btn => {
      btn.onclick = async e => {
        const id = e.target.closest('li').dataset.id;
        if (confirm('¿Eliminar esta noticia?')) {
          await fetch(`${API}/news/${id}`, { method: 'DELETE' });
          loadNews();
        }
      };
    });

    // Editar
    document.querySelectorAll('.edit-news-btn').forEach(btn => {
      btn.onclick = async e => {
        const id = e.target.closest('li').dataset.id;
        const res2 = await fetch(`${API}/news/${id}`);
        if (!res2.ok) return alert('No se pudo cargar la noticia');
        const news = await res2.json();
        document.getElementById('news-id').value      = id;
        document.getElementById('news-title').value   = news.title;
        document.getElementById('news-date').value    = news.date.slice(0,10);
        document.getElementById('news-content').value = news.content;
        document.getElementById('news-submit-btn').innerText = 'Actualizar Noticia';
      };
    });
  } catch (err) {
    console.error('Error loadNews()', err);
  }
}

async function handleNewsFormSubmit(e) {
  e.preventDefault();
  console.log('🔥 handleNewsFormSubmit disparado');
  const id      = document.getElementById('news-id').value;
  const title   = document.getElementById('news-title').value.trim();
  const date    = document.getElementById('news-date').value;
  const content = document.getElementById('news-content').value.trim();
  const payload = { title, date, content };

  const opts = {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  };
  const res = await fetch(`${API}/news${id?'/'+id:''}`, opts);
  if (!res.ok) alert('Error guardando noticia');
  document.getElementById('news-form').reset();
  document.getElementById('news-submit-btn').innerText = 'Crear Noticia';
  loadNews();
}

async function handleBulkNews() {
  console.log('🔥 handleBulkNews disparado', document.getElementById('news-excel').files);
  const fileInput = document.getElementById('news-excel');
  if (!fileInput.files.length) return alert('Selecciona un archivo');
  const data = await fileInput.files[0].arrayBuffer();
  const wb   = XLSX.read(data);
  const ws   = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws);
  document.getElementById('bulk-news-status').innerText = 'Importando...';
  const res = await fetch(`${API}/news/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rows)
  });
  if (res.ok) {
    document.getElementById('bulk-news-status').innerText = 'Importación exitosa 🎉';
    loadNews();
  } else {
    document.getElementById('bulk-news-status').innerText = 'Error en importación';
  }
}

// === Galería ===
async function loadGallery() {
  try {
    const res  = await fetch(`${API}/gallery`);
    const data = await res.json();
    const list = document.getElementById('gallery-list');
    list.innerHTML = data.map(i => `
      <li data-id="${i._id}">
        <img src="${i.url}" alt="${i.caption}" width="100">
        <p>${i.caption}</p>
        <button class="delete-gallery-btn">Eliminar</button>
      </li>
    `).join('');

    // Borrar cada imagen
    document.querySelectorAll('.delete-gallery-btn').forEach(btn => {
      btn.onclick = async e => {
        const id = e.target.closest('li').dataset.id;
        if (!confirm('¿Eliminar esta imagen?')) return;
        await fetch(`${API}/gallery/${id}`, { method: 'DELETE' });
        loadGallery();
      };
    });
  } catch (err) {
    console.error('Error loadGallery()', err);
  }
}

async function handleGalleryFormSubmit(e) {
  e.preventDefault();
  const fileInput    = document.getElementById('gallery-image');
  const captionInput = document.getElementById('gallery-caption');
  const file = fileInput.files[0];
  if (!file) return alert('Selecciona una imagen');
  const formData = new FormData();
  formData.append('image', file);
  formData.append('caption', captionInput.value.trim());

  const res = await fetch(`${API}/gallery`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) return alert('Error subiendo imagen');
  fileInput.value = '';
  captionInput.value = '';
  loadGallery();
}



// Cuando el DOM esté listo, registra listeners
window.addEventListener('DOMContentLoaded', () => {
  console.log('✅ admin.js cargado');
  document.getElementById('team-form').addEventListener('submit', handleFormSubmit);
  document.getElementById('bulk-upload-btn').addEventListener('click', handleBulkUpload);
  document.getElementById('event-form').addEventListener('submit', handleEventFormSubmit);
  document.getElementById('bulk-events-btn').addEventListener('click',   handleBulkEvents);
  document.getElementById('news-form').addEventListener('submit', handleNewsFormSubmit);
document.getElementById('bulk-news-btn').addEventListener('click', handleBulkNews);
  document.getElementById('gallery-form').addEventListener('submit', handleGalleryFormSubmit);
  loadTeams();
  loadEvents();
  loadNews(); 
  loadGallery();
});
