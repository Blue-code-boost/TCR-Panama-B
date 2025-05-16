// js/login.js
const admins = {
  // usuario: contraseña
  'admin1': 'password1',
  'admin2': 'password2'
};

document.getElementById('login-form').addEventListener('submit', e => {
  e.preventDefault();
  const user = document.getElementById('user').value.trim();
  const pass = document.getElementById('pass').value;

  const errorEl = document.getElementById('login-error');

  if (admins[user] && admins[user] === pass) {
    // credenciales correctas: redirige al admin principal
    window.location.href = 'admin.html';
  } else {
    errorEl.textContent = 'Usuario o contraseña incorrectos';
  }
});
