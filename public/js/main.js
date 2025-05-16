const API = 'http://localhost:3000';
let countdownTarget;

// carga dinámica
async function initCountdown() {
  try {
    const res = await fetch('/countdown');
    const { target } = await res.json();
    countdownTarget = new Date(target).getTime();
  } catch {
    countdownTarget = new Date("2025-06-15T12:00:00").getTime();
  }
}

function updateCountdown() {
  if (!countdownTarget) return;
  const now = Date.now();
  const diff = countdownTarget - now;
  if (diff < 0) return;
  document.getElementById("days").innerText =
    String(Math.floor(diff / 86400000)).padStart(2, '0');
  document.getElementById("hours").innerText =
    String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
  document.getElementById("minutes").innerText =
    String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
  document.getElementById("seconds").innerText =
    String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById("days")) {
    initCountdown().then(() => {
      updateCountdown();
      setInterval(updateCountdown, 1000);
    });
  }
  // … resto de tu init …
});


// ——— Hero público ———
async function loadPublicHero() {
  try {
    const res = await fetch('/hero');
    if (!res.ok) throw 0;
    const hero = await res.json();
    const sec = document.getElementById('hero');
    if (!sec) return;

    if (hero.imageUrl) {
      sec.style.backgroundImage =
        `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url('${hero.imageUrl}')`;
    }
    document.getElementById('hero-title').textContent = hero.title;
    document.getElementById('hero-subtitle').textContent = hero.subtitle;
    document.getElementById('hero-description').textContent = hero.description;

    ['btn1', 'btn2'].forEach(key => {
      const btn = document.getElementById(`hero-${key}`);
      if (hero[key]?.text && hero[key]?.url) {
        btn.textContent = hero[key].text;
        btn.onclick = () => window.location = hero[key].url;
        btn.style.display = 'inline-block';
      }
    });
  } catch {
    const sec = document.getElementById('hero');
    if (sec) sec.style.display = 'none';
  }
}

// ——— Próximos Eventos ———
async function loadEvents() {
  try {
    const res = await fetch('/events');
    if (!res.ok) throw 0;
    const evs = await res.json();
    const c = document.getElementById('events-list');
    if (!c) return;
    c.innerHTML = evs.map(e => `
      <div class="event-item">
        <h4>${e.name}</h4>
        <p class="event-date">${new Date(e.date).toLocaleDateString()}</p>
        <p>${e.location}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('loadEvents:', err);
  }
}

// ——— Noticias ———
async function loadNews() {
  try {
    const res = await fetch('/news');
    if (!res.ok) throw 0;
    const ns = await res.json();
    const c = document.getElementById('news-list');
    if (!c) return;
    c.innerHTML = ns.map(n => `
      <div class="news-item">
        <h4>${n.title}</h4>
        <span class="date">${new Date(n.date).toLocaleDateString()}</span>
        <p>${n.description}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('loadNews:', err);
  }
}

// ——— Galería público ———
async function loadGallery() {
  try {
    const res = await fetch('/gallery');
    if (!res.ok) throw 0;
    const imgs = await res.json();
    const grid = document.getElementById('gallery-list');
    if (!grid) return;
    grid.innerHTML = imgs.map(i => `
      <div class="gallery-item">
        <img src="${i.url}" alt="${i.caption}">
        <p>${i.caption}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('loadGallery:', err);
  }
}

// ——— Info público ———
async function loadInfo() {
  try {
    const res = await fetch('/info');
    if (!res.ok) throw 0;
    const dat = await res.json();
    const c = document.getElementById('info-list');
    if (!c) return;
    c.innerHTML = dat.map(i => `
      <div class="info-block">
        <h3>${i.title}</h3>
        <p>${i.content}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('loadInfo:', err);
  }
}

// ——— Posiciones público ———
async function loadPositions() {
  try {
    const res = await fetch('/positions');
    if (!res.ok) throw 0;
    const ps = await res.json();
    const tb = document.querySelector('#positions-table tbody');
    if (!tb) return;
    tb.innerHTML = ps.map(p => `
      <tr>
        <td>${p.position}</td>
        <td>${p.pilot}</td>
        <td>${p.team}</td>
        <td>${p.points}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('loadPositions:', err);
  }
}

// ——— Resultados público ———
async function loadResults() {
  try {
    const res = await fetch('/results');
    if (!res.ok) throw 0;
    const rs = await res.json();
    const c = document.getElementById('results-list');
    if (!c) return;
    c.innerHTML = rs.map(r => `
      <article class="result-date">
        <h4>${new Date(r.date).toLocaleDateString()}</h4>
        <ul class="podium">
          <li><span class="medal gold">🥇</span> ${r.first}</li>
          <li><span class="medal silver">🥈</span> ${r.second}</li>
          <li><span class="medal bronze">🥉</span> ${r.third}</li>
        </ul>
      </article>
    `).join('');
  } catch (err) {
    console.error('loadResults:', err);
  }
}

// ——— Blog público con “Leer más” ———
async function loadBlog() {
  try {
    const res = await fetch('/blog');
    if (!res.ok) throw 0;
    const posts = await res.json();
    const c = document.getElementById('blog-list');
    if (!c) return;
    c.innerHTML = posts.map(b => {
      const excerpt = b.content.length > 150
        ? b.content.slice(0, 150) + '…'
        : b.content;
      return `
        <article class="blog-post">
          <h3>${b.title}</h3>
          <span class="date">${new Date(b.date).toLocaleDateString()}</span>
          <div class="excerpt">${excerpt}</div>
          <p><a class="read-more" href="blogPost.html?id=${b._id}">Leer más →</a></p>
        </article>
      `;
    }).join('');
  } catch (err) {
    console.error('loadBlog:', err);
  }
}

// ——— Lightbox setup ———
function setupLightbox() {
  const overlay = document.getElementById('image-modal-overlay');
  if (!overlay) return;
  const overlayImg = overlay.querySelector('img');

  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target === overlayImg) {
      overlay.style.display = 'none';
      overlayImg.src = '';
    }
  });

  document.querySelectorAll('.post-images img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      overlayImg.src = img.src;
      overlay.style.display = 'flex';
    });
  });
}

// ——— Detalle de Blog público ———
async function loadBlogPost() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) return;

  try {
    const res = await fetch(`/blog/${id}`);
    if (!res.ok) throw 0;
    const p = await res.json();
    const a = document.getElementById('blog-post');
    if (!a) return;

    let html = '';
    if (p.banner) html += `<img src="${p.banner}" class="blog-banner" alt="${p.title}">`;

    html += `
      <h1>${p.title}</h1>
      <p class="date">Publicado el ${new Date(p.date).toLocaleDateString()}</p>
      <div class="content">${p.content}</div>
    `;

    if (p.images?.length) {
      html += '<div class="post-images">';
      p.images.forEach(src => {
        html += `<img src="${src}" alt="Imagen artículo">`;
      });
      html += '</div>';
    }

    html += `<p><a href="blog.html" class="btn-back">← Volver al blog</a></p>`;

    a.innerHTML = html;

    // ¡muy importante!: bind de lightbox tras inyectar miniaturas
    setupLightbox();

  } catch (err) {
    console.error('loadBlogPost:', err);
    const a = document.getElementById('blog-post');
    if (a) a.innerText = 'No pudimos cargar el artículo.';
  }
}

// ——— Lightbox setup for blog ———
function setupLightbox() {
  const overlay = document.getElementById('image-modal-overlay');
  if (!overlay) return;
  const overlayImg = overlay.querySelector('img');

  // cerrar al clickar fuera o sobre la imagen
  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target === overlayImg) {
      overlay.style.display = 'none';
      overlayImg.src = '';
    }
  });

  // bind a miniaturas de blog
  document.querySelectorAll('.post-images img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      overlayImg.src = img.src;
      overlay.style.display = 'flex';
    });
  });
}

// ——— Lightbox setup para galería ———
function setupGalleryLightbox() {
  const overlay = document.getElementById('image-modal-overlay');
  if (!overlay) return;
  const overlayImg = overlay.querySelector('img');

  // cerrar al clickar fuera o sobre la imagen
  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target === overlayImg) {
      overlay.style.display = 'none';
      overlayImg.src = '';
    }
  });

  // bind a miniaturas de galería
  document.querySelectorAll('.gallery-item img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      overlayImg.src = img.src;
      overlay.style.display = 'flex';
    });
  });
}

// ——— Galería público ———
async function loadGallery() {
  try {
    const res = await fetch('/gallery');
    if (!res.ok) throw 0;
    const imgs = await res.json();
    const grid = document.getElementById('gallery-list');
    if (!grid) return;

    grid.innerHTML = imgs.map(i => `
      <div class="gallery-item">
        <img src="${i.url}" alt="${i.caption}">
        <p>${i.caption}</p>
      </div>
    `).join('');

    // ¡importante! engancha el lightbox
    setupGalleryLightbox();

  } catch (err) {
    console.error('loadGallery:', err);
  }
}

// ——— Carga pública de Teams ———
async function loadTeamsPublic() {
  try {
    const res = await fetch(`${API}/teams`);
    if (!res.ok) throw new Error(res.statusText);
    const teams = await res.json();
    const container = document.getElementById('teams-container');
    if (!container) return;

    container.innerHTML = teams.map(t => `
      <div class="team-card">
        <img src="${t.imageUrl || 'img/placeholder.png'}" alt="${t.name}">
        <div class="team-info">
          <h3>${t.name}</h3>
          <p><strong>Pilotos:</strong> ${t.pilots.join(', ')}</p>
          <p><strong>Posición:</strong> ${t.position}º</p>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error cargando equipos:', err);
  }
}




// ——— Punto de entrada único ———
document.addEventListener('DOMContentLoaded', () => {
  loadPublicHero();

  if (document.getElementById("days")) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }
  if (document.getElementById('events-list')) loadEvents();
  if (document.getElementById('news-list')) loadNews();
  if (document.getElementById('gallery-list')) loadGallery();
  if (document.getElementById('info-list')) loadInfo();
  if (document.querySelector('#positions-table')) loadPositions();
  if (document.getElementById('results-list')) loadResults();
  if (document.getElementById('blog-list')) loadBlog();
  if (document.getElementById('blog-post')) loadBlogPost();
  if (document.getElementById('teams-container')) loadTeamsPublic();
  if (document.getElementById("days")) {
    // en lugar del hard-code:
    fetch('/countdown')
      .then(r => r.json())
      .then(cfg => {
        publicCountdownTarget = new Date(cfg.target).getTime();
        updateCountdown();
        setInterval(updateCountdown, 1000);
      })
      .catch(err => console.error('countdown fetch:', err));
  }

  const btnEn = document.getElementById('to-en');
  const btnEs = document.getElementById('to-es');
  if (btnEn) {
    btnEn.addEventListener('click', () => {
      const url = encodeURIComponent(window.location.href);
      window.location.href = `https://translate.google.com/translate?sl=auto&tl=en&u=${url}`;
    });
  }
  if (btnEs) {
    btnEs.addEventListener('click', () => {
      const url = encodeURIComponent(window.location.href);
      window.location.href = `https://translate.google.com/translate?sl=auto&tl=es&u=${url}`;
    });
  }
});
