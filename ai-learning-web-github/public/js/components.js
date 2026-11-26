// components.js — Komponen UI reusable

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

let _toastTimer;
function toast(msg, ms = 2200){
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function brandRow(extraClass = ''){
  return `
    <div class="brandrow ${extraClass}">
      <img class="lg-uni" src="${appAsset('assets/Institut%20Teknologi%20Indonesia.png')}" alt="Logo Institut Teknologi Indonesia">
      <img class="lg-afz" src="${appAsset('assets/logo%20afarziya.jpeg')}" alt="Logo tim AFARZIYA">
      <div class="brandtxt"><b>AFARZIYA</b><small>PEMBELAJARAN INTERAKTIF</small></div>
    </div>`;
}

// Komponen shell (sidebar + topbar)
function shell(active, mainHTML){
  const ov = overallProgress();
  return `
    <div class="shell">
      <aside class="sidebar">
        ${brandRow()}
        <div class="menu-label">MENU UTAMA</div>
        <nav class="nav">
          <a data-go="dashboard" class="${active==='dashboard'?'active':''}">Dashboard</a>
          <a data-go="modules" class="${active==='modules'?'active':''}">Daftar Materi</a>
          <a data-go="progress" class="${active==='progress'?'active':''}">Progress Saya</a>
          <a data-go="sequence" class="${active==='sequence'?'active':''}">Urutan Pembelajaran</a>
          <a data-go="profile" class="${active==='profile'?'active':''}">Profil Saya</a>
        </nav>
        <div class="side-foot">
          <div class="side-note">
            <b>Belajar bertahap</b>
            <span>${ov.done} dari ${ov.total} submateri selesai. Lanjutkan sesuai urutan belajar.</span>
            <div class="progress"><i style="width:${ov.pct}%"></i></div>
          </div>
          <a class="logout" data-act="logout">← Keluar</a>
        </div>
      </aside>
      <div class="scrim" data-go="close-menu"></div>
      <main class="main">
        <div class="topbar">
          <button data-go="open-menu">☰</button>
          ${brandRow('brandrow-compact')}
          <b>AI Learning</b>
        </div>
        ${mainHTML}
        <div class="page-foot">AI Learning · Tim AFARZIYA · Institut Teknologi Indonesia</div>
      </main>
      ${guideWidget()}
    </div>`;
}