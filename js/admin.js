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

// Cuando el DOM esté listo, registra listeners
window.addEventListener('DOMContentLoaded', () => {
  console.log('✅ admin.js cargado');
  document.getElementById('team-form').addEventListener('submit', handleFormSubmit);
  document.getElementById('bulk-upload-btn').addEventListener('click', handleBulkUpload);
  document.getElementById('event-form').addEventListener('submit', handleEventFormSubmit);
  document.getElementById('bulk-events-btn').addEventListener('click',   handleBulkEvents);
  loadTeams();
  loadEvents(); 
});
