const API = 'http://localhost:3000';

// Cargar lista de equipos
async function loadTeams() {
  const res = await fetch(`${API}/teams`);
  const teams = await res.json();
  const list = document.getElementById('teams-list');
  list.innerHTML = teams.map(t =>
    `<li><strong>${t.name}</strong> (Pos: ${t.position}) — Pilotos: ${t.pilots.join(', ')}</li>`
  ).join('');
}

// Manejar formulario de creación
document.getElementById('team-form').addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('team-name').value;
  const pilots = document.getElementById('team-pilots').value.split(',').map(s => s.trim());
  const position = parseInt(document.getElementById('team-position').value, 10);

  await fetch(`${API}/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, pilots, position })
  });

  // Limpiar y recargar
  e.target.reset();
  loadTeams();
});

// Al cargar la página
window.addEventListener('DOMContentLoaded', loadTeams);