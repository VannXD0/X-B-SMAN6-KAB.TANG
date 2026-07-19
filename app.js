/* ============================================================
   X-B CLASS PORTFOLIO — app.js
   Handles: tab routing, data loading, rendering, search, modal
   Data source: siswa/{n}/1.txt | siswi/{n}/1.txt | walas/1.txt
============================================================ */

'use strict';

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════
const MAX_STUDENTS = 30;
const MAX_IMAGES   = 10;

// Color palettes per tab — cycles through on render
const PALETTE_SISWA = ['#00C2FF', '#B4FF39', '#FF6B2B', '#FFE135', '#A855F7'];
const PALETTE_SISWI = ['#FF3B5C', '#A855F7', '#FFE135', '#00C2FF', '#FF6B2B'];

// Global registry: avoids putting JSON into onclick attributes
// Key format: "siswa-3", "siswi-7"
const registry = {};

// ═══════════════════════════════════════════════════════════
// TAB ROUTER
// ═══════════════════════════════════════════════════════════
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const active = btn.dataset.tab === tabId;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });

  document.querySelectorAll('.section').forEach(sec => {
    sec.classList.toggle('active', sec.id === tabId);
  });
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// ═══════════════════════════════════════════════════════════
// TXT PARSER
// Handles "Cita-cita: xxx", "Nama: xxx" etc.
// ═══════════════════════════════════════════════════════════
function parseTxt(raw) {
  const out = {};
  // Normalize Windows line endings
  raw.replace(/\r/g, '').split('\n').forEach(line => {
    const colonAt = line.indexOf(':');
    if (colonAt < 1) return;
    const key = line
      .slice(0, colonAt)
      .trim()
      .toLowerCase()
      .replace(/[\s\-]+/g, '_');   // "cita-cita" → "cita_cita"
    const val = line.slice(colonAt + 1).trim();
    if (key && val) out[key] = val;
  });
  return out;
}

// ═══════════════════════════════════════════════════════════
// LOAD STUDENTS
// Fires all fetches in parallel. Slots that 404/fail → null.
// ═══════════════════════════════════════════════════════════
async function loadStudents(type) {
  const slots = Array.from({ length: MAX_STUDENTS }, (_, i) => i + 1);
  const results = await Promise.all(
    slots.map(n =>
      fetch(`${type}/${n}/1.txt`)
        .then(r => r.ok ? r.text().then(t => ({ n, data: parseTxt(t) })) : null)
        .catch(() => null)
    )
  );
  return results.filter(Boolean).sort((a, b) => a.n - b.n);
}

// ═══════════════════════════════════════════════════════════
// RENDER STUDENT CARDS
// ═══════════════════════════════════════════════════════════
function renderCards(students, gridId, type) {
  const grid    = document.getElementById(gridId);
  const palette = type === 'siswa' ? PALETTE_SISWA : PALETTE_SISWI;
  const label   = type === 'siswa' ? 'SISWA' : 'SISWI';

  if (!students.length) {
    grid.innerHTML = `
      <div class="empty-msg" role="status">
        <iconify-icon icon="solar:users-group-rounded-linear" aria-hidden="true"></iconify-icon>
        <p>Belum ada data ${type}</p>
      </div>`;
    return;
  }

  grid.innerHTML = students.map(({ n, data }, i) => {
    const color = palette[i % palette.length];
    const key   = `${type}-${n}`;
    registry[key] = data;                    // store in registry

    return `
      <article
        class="s-card"
        role="listitem"
        style="animation-delay:${(i % 14) * 50}ms"
        onclick="openModal('${key}', ${n}, '${type}')"
        aria-label="Profil ${data.nama || 'Siswa'}"
        tabindex="0"
      >
        <div class="card-photo" style="background:${color}28">
          <img
            data-src="${type}/${n}/1.png"
            alt="Foto ${data.nama || 'siswa'}"
            class="lazy-img"
          >
          <div class="card-photo-fallback" aria-hidden="true">
            <iconify-icon icon="solar:user-circle-bold"></iconify-icon>
          </div>
          <span class="card-tag" style="background:${color}">${label}</span>
        </div>
        <div class="card-info">
          <div class="card-idx">#${String(n).padStart(2, '0')}</div>
          <div class="card-name">${escHtml(data.nama || '—')}</div>
          <div class="card-school">
            <iconify-icon icon="solar:buildings-2-linear" aria-hidden="true"></iconify-icon>
            ${escHtml(data.asal || '—')}
          </div>
        </div>
      </article>`;
  }).join('');

  // Lazy load images + handle missing ones
  grid.querySelectorAll('img.lazy-img').forEach(img => {
    img.src = img.dataset.src;
    img.addEventListener('error', function () {
      this.style.display = 'none';
      const fallback = this.nextElementSibling;
      if (fallback) fallback.style.display = 'flex';
    });
  });

  // Allow keyboard activation
  grid.querySelectorAll('.s-card').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════
// SEARCH / FILTER
// ═══════════════════════════════════════════════════════════
function setupSearch(inputId, allStudents, gridId, type, countId) {
  const input   = document.getElementById(inputId);
  const countEl = document.getElementById(countId);

  const setCount = n =>
    countEl && (countEl.textContent = `${n} orang ditemukan`);

  setCount(allStudents.length);

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    const filtered = q
      ? allStudents.filter(s => (s.data.nama || '').toLowerCase().includes(q))
      : allStudents;
    renderCards(filtered, gridId, type);
    setCount(filtered.length);
  });
}

// ═══════════════════════════════════════════════════════════
// MODAL — DETAIL SISWA
// ═══════════════════════════════════════════════════════════
function openModal(key, n, type) {
  const data    = registry[key] || {};
  const modal   = document.getElementById('modal');
  const photo   = document.getElementById('m-photo');
  const fallback = document.getElementById('m-fallback');
  const label   = type === 'siswa' ? 'Siswa Putra' : 'Siswa Putri';

  // Fill data
  document.getElementById('m-badge').textContent = label;
  document.getElementById('m-name').textContent  = data.nama     || '—';
  document.getElementById('m-asal').textContent  = data.asal     || '—';
  document.getElementById('m-hobi').textContent  = data.hobi     || '—';
  document.getElementById('m-cita').textContent  = data.cita_cita || data.cita || '—';

  // Load photo
  photo.src         = `${type}/${n}/1.png`;
  photo.style.display   = 'block';
  fallback.style.display = 'none';

  photo.onload  = () => {};
  photo.onerror = () => {
    photo.style.display    = 'none';
    fallback.style.display = 'flex';
  };

  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').setAttribute('hidden', '');
  document.body.style.overflow = '';
}

// ═══════════════════════════════════════════════════════════
// WALI KELAS
// Loads walas/1.txt. Falls back to hardcoded name if absent.
// ═══════════════════════════════════════════════════════════
async function loadWalas() {
  const wrap = document.getElementById('walas-wrap');

  let data = {
    nama:    'Yudha Agustian, S.Pd',
    jabatan: 'Wali Kelas X-B',
    mapel:   '',
    pesan:   '',
  };

  try {
    const r = await fetch('walas/1.txt');
    if (r.ok) data = { ...data, ...parseTxt(await r.text()) };
  } catch (_) {}

  wrap.innerHTML = `
    <div class="walas-card">
      <div class="walas-photo">
        <img id="wl-photo" src="walas/1.png" alt="${escHtml(data.nama)}">
        <div class="walas-photo-fallback" id="wl-fallback" aria-hidden="true">
          <iconify-icon icon="solar:user-circle-bold"></iconify-icon>
        </div>
      </div>
      <div class="walas-info">
        <span class="walas-role">Wali Kelas X-B</span>
        <h3 class="walas-name">${escHtml(data.nama)}</h3>
        <p class="walas-mapel">${escHtml(data.mapel || 'Guru Kelas')}</p>
        ${data.pesan
          ? `<p class="walas-pesan">"${escHtml(data.pesan)}"</p>`
          : ''}
      </div>
    </div>`;

  const wPhoto   = document.getElementById('wl-photo');
  const wFallback = document.getElementById('wl-fallback');
  wPhoto.addEventListener('error', () => {
    wPhoto.style.display    = 'none';
    wFallback.style.display = 'flex';
  });
}

// ═══════════════════════════════════════════════════════════
// GALLERY — MEMORI KELAS
// Tries image/1.png through image/{MAX_IMAGES}.png
// ═══════════════════════════════════════════════════════════
function loadGallery() {
  const gallery = document.getElementById('gallery');

  gallery.innerHTML = Array.from({ length: MAX_IMAGES }, (_, i) => {
    const src = `image/${i + 1}.png`;
    return `
      <div class="g-item" role="listitem" onclick="openLightbox('${src}')" aria-label="Foto memori ${i + 1}">
        <img data-src="${src}" alt="Memori kelas ${i + 1}" class="lazy-img">
        <div class="g-overlay" aria-hidden="true">
          <iconify-icon icon="solar:eye-bold"></iconify-icon>
        </div>
      </div>`;
  }).join('');

  gallery.querySelectorAll('img.lazy-img').forEach(img => {
    img.src = img.dataset.src;
    img.addEventListener('error', function () {
      const item = this.closest('.g-item');
      if (item) item.innerHTML = `
        <div class="g-placeholder">
          <iconify-icon icon="solar:gallery-linear" aria-hidden="true"></iconify-icon>
          <span>Foto ${this.alt}</span>
        </div>`;
    });
  });
}

// ═══════════════════════════════════════════════════════════
// LIGHTBOX
// ═══════════════════════════════════════════════════════════
function openLightbox(src) {
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lb-img');

  img.src = src;
  img.onerror = () => closeLightbox();

  lb.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.add('hidden');
  document.body.style.overflow = '';
}

// ═══════════════════════════════════════════════════════════
// STATS COUNTER (animated number roll)
// ═══════════════════════════════════════════════════════════
function animCount(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  let cur = 0;
  const fps = () => {
    cur = Math.min(cur + 1, target);
    el.textContent = cur;
    if (cur < target) requestAnimationFrame(fps);
  };
  requestAnimationFrame(fps);
}

// ═══════════════════════════════════════════════════════════
// HTML ESCAPE — prevents XSS from txt content
// ═══════════════════════════════════════════════════════════
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ═══════════════════════════════════════════════════════════
// KEYBOARD HANDLERS
// ═══════════════════════════════════════════════════════════
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeLightbox();
  }
});

// Close lightbox backdrop click
document.getElementById('lightbox')
  .querySelector('.lb-backdrop')
  ?.addEventListener('click', closeLightbox);

// ═══════════════════════════════════════════════════════════
// INIT — Bootstrap everything
// ═══════════════════════════════════════════════════════════
async function init() {
  // Load siswa + siswi in parallel
  const [siswaList, siswiList] = await Promise.all([
    loadStudents('siswa'),
    loadStudents('siswi'),
  ]);

  // Render grids
  renderCards(siswaList, 'grid-siswa', 'siswa');
  renderCards(siswiList, 'grid-siswi', 'siswi');

  // Setup search
  setupSearch('q-siswa', siswaList, 'grid-siswa', 'siswa', 'siswa-count');
  setupSearch('q-siswi', siswiList, 'grid-siswi', 'siswi', 'siswi-count');

  // Animate hero counters
  animCount('st-siswa',  siswaList.length);
  animCount('st-siswi',  siswiList.length);
  animCount('st-total',  siswaList.length + siswiList.length);

  // Load wali kelas + gallery (non-blocking)
  loadWalas();
  loadGallery();
}

init();
