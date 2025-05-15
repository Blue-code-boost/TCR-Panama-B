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
    const listEl = document.getElementById('teams-list');
    listEl.innerHTML = teams.map(t =>
      `<li data-id="${t._id}">
     ${t.imageUrl
        ? `<img src="${t.imageUrl}" alt="${t.name}" class="team-thumb">`
        : ''}
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

  const id = document.getElementById('team-id').value;
  const url = id ? `${API}/teams/${id}` : `${API}/teams`;
  const method = id ? 'PUT' : 'POST';
  const formData = new FormData();

  formData.append('name', document.getElementById('team-name').value.trim());
  formData.append('pilots', document.getElementById('team-pilots').value);
  formData.append('position', document.getElementById('team-position').value);

  const fileInput = document.getElementById('team-image');
  if (fileInput.files.length > 0) {
    formData.append('image', fileInput.files[0]);
  }

  try {
    const res = await fetch(`${API.replace(/\/$/, '')}${url}`, {
      method,
      body: formData
    });
    if (!res.ok) throw new Error(await res.text());
  } catch (err) {
    alert('Error guardando equipo: ' + err.message);
    console.error(err);
  }

  // Reset
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
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
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

// ==== Noticias ====
async function loadNews() {
  try {
    const res = await fetch(`${API}/news`);
    const data = await res.json();
    const list = document.getElementById('news-list');
    list.innerHTML = data.map(n => `
      <li data-id="${n._id}">
        <strong>${n.title}</strong>
        <small>${new Date(n.date).toLocaleDateString()}</small>
        <p>${n.description}</p>
        <button class="edit-news-btn">Editar</button>
        <button class="delete-news-btn">Eliminar</button>
      </li>
    `).join('');

    // Editar
    document.querySelectorAll('.edit-news-btn').forEach(btn => {
      btn.onclick = () => {
        const li = btn.closest('li');
        const id = li.dataset.id;
        const n = data.find(x => x._id === id);
        document.getElementById('news-id').value = id;
        document.getElementById('news-title').value = n.title;
        document.getElementById('news-date').value = n.date.slice(0, 10);
        document.getElementById('news-description').value = n.description;
        document.getElementById('news-submit-btn').innerText = 'Actualizar';
      };
    });

    // Borrar
    document.querySelectorAll('.delete-news-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.closest('li').dataset.id;
        if (!confirm('¿Eliminar esta noticia?')) return;
        await fetch(`${API}/news/${id}`, { method: 'DELETE' });
        loadNews();
      };
    });
  } catch (err) {
    console.error('Error loadNews()', err);
  }
}

async function handleNewsFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('news-id').value;
  const payload = {
    title: document.getElementById('news-title').value.trim(),
    date: document.getElementById('news-date').value,
    description: document.getElementById('news-description').value.trim()
  };
  const opts = {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  };
  const url = `${API}/news${id ? '/' + id : ''}`;
  const res = await fetch(url, opts);
  if (res.status === 201 || res.ok) {
    document.getElementById('news-form').reset();
    document.getElementById('news-submit-btn').innerText = 'Crear / Actualizar';
    loadNews();
  } else {
    alert(`Error guardando Noticia (${res.status})`);
  }
}

// Registrar listeners
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('news-form')
    .addEventListener('submit', handleNewsFormSubmit);
  loadNews();
});


async function handleBulkNews() {
  console.log('🔥 handleBulkNews disparado', document.getElementById('news-excel').files);
  const fileInput = document.getElementById('news-excel');
  if (!fileInput.files.length) return alert('Selecciona un archivo');
  const data = await fileInput.files[0].arrayBuffer();
  const wb = XLSX.read(data);
  const ws = wb.Sheets[wb.SheetNames[0]];
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
    const res = await fetch(`${API}/gallery`);
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
  const fileInput = document.getElementById('gallery-image');
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

// === Info ===
async function loadInfo() {
  try {
    const res = await fetch(`${API}/info`);
    const data = await res.json();
    const list = document.getElementById('info-list');
    list.innerHTML = data.map(i =>
      `<li data-id="${i._id}">
         <strong>${i.title}</strong>
         <p>${i.content}</p>
         <button class="edit-info-btn">Editar</button>
         <button class="delete-info-btn">Eliminar</button>
       </li>`
    ).join('');

    // Bind Edit
    document.querySelectorAll('.edit-info-btn').forEach(btn => {
      btn.onclick = async e => {
        const li = e.target.closest('li');
        const id = li.dataset.id;
        const item = data.find(x => x._id === id);
        document.getElementById('info-id').value = id;
        document.getElementById('info-title').value = item.title;
        document.getElementById('info-content').value = item.content;
        document.getElementById('info-submit-btn').innerText = 'Actualizar';
      };
    });

    // Bind Delete
    document.querySelectorAll('.delete-info-btn').forEach(btn => {
      btn.onclick = async e => {
        const id = e.target.closest('li').dataset.id;
        if (!confirm('¿Eliminar este bloque de info?')) return;
        await fetch(`${API}/info/${id}`, { method: 'DELETE' });
        loadInfo();
      };
    });

  } catch (err) {
    console.error('Error loadInfo()', err);
  }
}

async function handleInfoFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('info-id').value;
  const title = document.getElementById('info-title').value.trim();
  const content = document.getElementById('info-content').value.trim();
  const res = await fetch(`${API}/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, title, content })
  });
  if (!res.ok) return alert('Error guardando Info');
  document.getElementById('info-form').reset();
  document.getElementById('info-submit-btn').innerText = 'Crear / Actualizar';
  loadInfo();
}

// === Posiciones ===
async function loadPositions() {
  try {
    const res = await fetch(`${API}/positions`);
    const data = await res.json();
    const list = document.getElementById('positions-list');
    list.innerHTML = data.map(p => `
      <li data-id="${p._id}">
        <span>#${p.position} — ${p.pilot} (${p.team}) · ${p.points} pts</span>
        <span>
          <button class="edit-pos-btn">Editar</button>
          <button class="delete-pos-btn">Eliminar</button>
        </span>
      </li>
    `).join('');

    // Editar
    document.querySelectorAll('.edit-pos-btn').forEach(btn => {
      btn.onclick = e => {
        const li = e.target.closest('li');
        const id = li.dataset.id;
        const p = data.find(x => x._id === id);
        document.getElementById('pos-id').value = id;
        document.getElementById('pos-number').value = p.position;
        document.getElementById('pos-pilot').value = p.pilot;
        document.getElementById('pos-team').value = p.team;
        document.getElementById('pos-points').value = p.points;
        document.getElementById('pos-submit-btn').innerText = 'Actualizar';
      };
    });

    // Borrar
    document.querySelectorAll('.delete-pos-btn').forEach(btn => {
      btn.onclick = async e => {
        const id = e.target.closest('li').dataset.id;
        if (!confirm('¿Eliminar esta posición?')) return;
        await fetch(`${API}/positions/${id}`, { method: 'DELETE' });
        loadPositions();
      };
    });
  } catch (err) {
    console.error('Error loadPositions()', err);
  }
}

async function handlePositionsFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('pos-id').value;
  const body = {
    position: +document.getElementById('pos-number').value,
    pilot: document.getElementById('pos-pilot').value.trim(),
    team: document.getElementById('pos-team').value.trim(),
    points: +document.getElementById('pos-points').value
  };
  const opts = {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
  const url = `${API}/positions${id ? '/' + id : ''}`;
  const res = await fetch(url, opts);
  if (!res.ok) return alert('Error guardando posición');
  document.getElementById('positions-form').reset();
  document.getElementById('pos-submit-btn').innerText = 'Crear / Actualizar';
  loadPositions();
}

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

// === Resultados ===
async function loadResults() {
  try {
    const res = await fetch(`${API}/results`);
    const data = await res.json();
    const list = document.getElementById('results-list');
    list.innerHTML = data.map(r => `
      <li data-id="${r._id}">
        <span>${new Date(r.date).toLocaleDateString()} —
              ${r.event}: 🥇${r.first} 🥈${r.second} 🥉${r.third}
        </span>
        <span>
          <button class="edit-res-btn">Editar</button>
          <button class="delete-res-btn">Eliminar</button>
        </span>
      </li>
    `).join('');

    // Editar
    document.querySelectorAll('.edit-res-btn').forEach(btn => {
      btn.onclick = () => {
        const li = btn.closest('li');
        const id = li.dataset.id;
        const r = data.find(x => x._id === id);
        document.getElementById('res-id').value = id;
        document.getElementById('res-event').value = r.event;
        document.getElementById('res-date').value = r.date.slice(0, 10);
        document.getElementById('res-first').value = r.first;
        document.getElementById('res-second').value = r.second;
        document.getElementById('res-third').value = r.third;
        document.getElementById('res-submit-btn').innerText = 'Actualizar';
      };
    });

    // Borrar
    document.querySelectorAll('.delete-res-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.closest('li').dataset.id;
        if (!confirm('¿Eliminar este resultado?')) return;
        await fetch(`${API}/results/${id}`, { method: 'DELETE' });
        loadResults();
      };
    });
  } catch (err) {
    console.error('Error loadResults()', err);
  }
}

async function handleResultsFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('res-id').value;
  const body = {
    event: document.getElementById('res-event').value.trim(),
    date: document.getElementById('res-date').value,
    first: document.getElementById('res-first').value.trim(),
    second: document.getElementById('res-second').value.trim(),
    third: document.getElementById('res-third').value.trim()
  };
  const opts = {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
  const url = `${API}/results${id ? '/' + id : ''}`;
  const res = await fetch(url, opts);
  if (!res.ok) return alert('Error guardando resultado');
  document.getElementById('results-form').reset();
  document.getElementById('res-submit-btn').innerText = 'Crear / Actualizar';
  loadResults();
}

// ==== Inicialización de toolbar y listeners de Blog ====
window.addEventListener('DOMContentLoaded', () => {
  // 1) Formatea el contenido en el editor
  document.querySelectorAll('#blog-toolbar button').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.dataset.cmd;
      document.execCommand(cmd, false, null);
      document.getElementById('blog-content-editor').focus();
    });
  });

  // 2) Listener para el formulario de Blog
  document.getElementById('blog-form')
    .addEventListener('submit', handleBlogFormSubmit);

  // 3) Carga inicial de entradas
  loadBlog();
});

// ——— Blog CRUD ——— //

// Carga y renderizado de las entradas de Blog
async function loadBlog() {
  try {
    const res = await fetch(`${API}/blog`);
    const data = await res.json();
    const list = document.getElementById('blog-list');

    list.innerHTML = data.map(b => `
      <li data-id="${b._id}">
        <div class="blog-preview-images">
          ${b.banner
        ? `<img src="${b.banner}" alt="Banner" width="150">`
        : ''
      }
          ${b.images.map(url =>
        `<img src="${url}" alt="" width="80">`
      ).join('')}
        </div>
        <div class="blog-info">
          <strong>${b.title}</strong><br>
          <small>${new Date(b.date).toLocaleDateString()}</small>
          <div class="blog-excerpt">
            ${b.content.substring(0, 100)}...
          </div>
        </div>
        <div class="blog-actions">
          <button class="edit-blog-btn">Editar</button>
          <button class="delete-blog-btn">Eliminar</button>
        </div>
      </li>
    `).join('');

    // Editar: vuelca datos al formulario y al editor
    document.querySelectorAll('.edit-blog-btn').forEach(btn => {
      btn.onclick = () => {
        const li = btn.closest('li');
        const id = li.dataset.id;
        const b = data.find(x => x._id === id);

        document.getElementById('blog-id').value = id;
        document.getElementById('blog-title').value = b.title;
        document.getElementById('blog-date').value = b.date.slice(0, 10);
        document.getElementById('blog-content-editor').innerHTML = b.content;
        // Nota: no podemos prellenar input type="file", pero podrías mostrar un preview:
        const prev = document.getElementById('blog-banner-preview');
        if (prev) prev.src = b.banner || '';
        document.getElementById('blog-submit-btn').innerText = 'Actualizar';
      };
    });

    // Borrar
    document.querySelectorAll('.delete-blog-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.closest('li').dataset.id;
        if (!confirm('¿Eliminar esta entrada?')) return;
        await fetch(`${API}/blog/${id}`, { method: 'DELETE' });
        loadBlog();
      };
    });

  } catch (err) {
    console.error('Error loadBlog()', err);
  }
}

// Envío del formulario de Blog (banner + imágenes + editor)
async function handleBlogFormSubmit(e) {
  e.preventDefault();

  // 1) Recoge el HTML del editor
  const htmlContent = document
    .getElementById('blog-content-editor')
    .innerHTML
    .trim();

  // 2) Prepara FormData
  const id = document.getElementById('blog-id').value;
  const form = new FormData();
  form.append('title', document.getElementById('blog-title').value.trim());
  form.append('date', document.getElementById('blog-date').value);
  form.append('content', htmlContent);

  // 3) Banner (solo uno)
  const bannerInput = document.getElementById('blog-banner');
  if (bannerInput.files.length > 0) {
    form.append('banner', bannerInput.files[0]);
  }

  // 4) Imágenes del artículo (varias)
  const files = document.getElementById('blog-images').files;
  for (const file of files) {
    form.append('images', file);
  }

  
  // 5) POST o PUT
  const url = `${API}/blog${id ? '/' + id : ''}`;
  const opts = { method: id ? 'PUT' : 'POST', body: form };
  const res = await fetch(url, opts);

  // 6) Reset y recarga
  if (res.status === 201 || res.ok) {
    document.getElementById('blog-form').reset();
    document.getElementById('blog-content-editor').innerHTML = '';
    document.getElementById('blog-submit-btn').innerText = 'Crear / Actualizar';
    loadBlog();
  } else {
    console.error('Error guardando Blog:', res.status, res.statusText);
    alert(`Error guardando Blog (${res.status})`);
  }
}

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




// Cuando el DOM esté listo, registra listeners
window.addEventListener('DOMContentLoaded', () => {
  console.log('✅ admin.js cargado');
  document.getElementById('team-form').addEventListener('submit', handleFormSubmit);
  document.getElementById('bulk-upload-btn').addEventListener('click', handleBulkUpload);
  document.getElementById('event-form').addEventListener('submit', handleEventFormSubmit);
  document.getElementById('bulk-events-btn').addEventListener('click', handleBulkEvents);
  document.getElementById('news-form').addEventListener('submit', handleNewsFormSubmit);
  document.getElementById('bulk-news-btn').addEventListener('click', handleBulkNews);
  document.getElementById('gallery-form').addEventListener('submit', handleGalleryFormSubmit);
  document.getElementById('info-form').addEventListener('submit', handleInfoFormSubmit);
  document.getElementById('positions-form').addEventListener('submit', handlePositionsFormSubmit);
  document.getElementById('results-form').addEventListener('submit', handleResultsFormSubmit);
  document.getElementById('bulk-positions-btn').addEventListener('click', handleBulkPositionsUpload);
  document.getElementById('blog-form').addEventListener('submit', handleBlogFormSubmit);
  loadTeams();
  loadEvents();
  loadNews();
  loadGallery();
  loadInfo();
  loadPositions();
  loadPositions();
  loadResults();
  loadBlog();
  loadHero();
});
