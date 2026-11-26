// views/dashboard.js — Main Dashboard (PG-02)
async function renderDashboard(){
  const ov = overallProgress();
  const nextModule = MODULES.find(m => moduleProgress(m).done < moduleProgress(m).total) || MODULES[0];
  const cards = MODULES.map(m => {
    const p = moduleProgress(m);
    const simBadge = m.hasSimulation ? `<span class="badge badge-warning">Simulasi interaktif</span>` : '';
    return `
      <div class="card module-card" data-go="module:${m.id}" style="--mod-color:${m.color}">
        <div class="head">
          <div class="num">${m.num}</div>
          <div>
            <b>${m.title}</b>
            <small>${m.lessons.length} submateri · ${m.dur}</small>
          </div>
        </div>
        <ul>${m.lessons.slice(0, 2).map(l => `<li>${escapeHtml(l.title)}</li>`).join('')}</ul>
        <div class="module-card-badges">${simBadge}</div>
        <div class="foot">
          <div class="prog-mini">${p.done}/${p.total} · ${p.pct}%</div>
          <span class="module-open">Buka modul →</span>
        </div>
      </div>`;
  }).join('');

  const main = `
    <div class="crumb">Dashboard</div>
    <h1 class="title">Ringkasan pembelajaran AI</h1>
    <div class="subtitle">Selamat datang, ${escapeHtml(State.user?.username || State.user?.email || 'Mahasiswa')} · ${COURSE.name} · Semester ${COURSE.semester}</div>

    <div class="hero-banner">
      <div class="k">TUJUAN PEMBELAJARAN</div>
      <h2>Mempelajari Kecerdasan Buatan secara terstruktur, interaktif, dan mandiri.</h2>
      <p>Ikuti enam modul, pelajari submateri, dan pantau progress belajarmu.</p>
      <a class="btn" data-go="module:${nextModule.id}">${ov.done === ov.total ? 'Ulangi pembelajaran' : 'Mulai / lanjutkan belajar'} →</a>
    </div>

    <div class="dashboard-summary">
      <div class="card"><small>Modul pembelajaran</small><b>${MODULES.length} Modul</b></div>
      <div class="card"><small>Total submateri</small><b>${ov.total} Langkah</b></div>
      <div class="card"><small>Progress saat ini</small><b>${ov.pct}%</b></div>
    </div>

    <h3 class="section-title">Lanjutkan pembelajaran</h3>
    <div class="grid-modules">${cards}</div>`;

  $('#app').innerHTML = shell('dashboard', main);
}