// views/module.js — Halaman Detail Modul (PG-03)
function renderStudyTool(mod){
  const tool = MODULE_STUDY_TOOLS[mod.id];
  if (!tool) return '';

  let controls = '';
  if (tool.type === 'simulation') {
    controls = `<button class="btn btn-primary" data-act="open-sim" data-type="${tool.simulation}">${escapeHtml(tool.buttonLabel)}</button>`;
  } else {
    const fields = tool.fields.map(field => {
      const inputType = tool.type === 'resnet' ? 'number' : 'text';
      const value = field.value ? `value="${escapeHtml(field.value)}"` : '';
      const placeholder = field.placeholder ? `placeholder="${escapeHtml(field.placeholder)}"` : '';
      return `
        <div class="field">
          <label for="${tool.type}-${field.name}-${mod.id}">${escapeHtml(field.label)}</label>
          <input id="${tool.type}-${field.name}-${mod.id}" name="${field.name}" type="${inputType}" ${value} ${placeholder} ${tool.type === 'resnet' ? 'min="1" max="4096" step="1"' : ''}>
        </div>`;
    }).join('');
    const action = tool.type === 'peas' ? 'check-peas' : tool.type === 'prolog' ? 'build-prolog' : 'check-resnet';
    const buttonLabel = tool.type === 'peas' ? 'Periksa rancangan PEAS' : tool.type === 'prolog' ? 'Buat contoh program' : 'Periksa dimensi';
    controls = `
      <div class="study-tool-fields ${tool.type === 'resnet' ? 'resnet-fields' : ''}">${fields}</div>
      <button class="btn btn-primary" data-act="${action}" data-mid="${mod.id}">${buttonLabel}</button>
      <div class="study-tool-result" id="study-tool-result-${mod.id}" aria-live="polite"></div>`;
  }

  return `
    <section class="card study-tool-card" id="study-tool-${mod.id}">
      <div class="section-eyebrow">ALAT BANTU BELAJAR</div>
      <h2>${escapeHtml(tool.title)}</h2>
      <p>${escapeHtml(tool.description)}</p>
      ${controls}
    </section>`;
}

function renderModuleQuiz(mod){
  const questions = MODULE_QUIZZES[mod.id] || [];
  const choiceCount = questions.filter(question => question.type === 'choice').length;
  const essayCount = questions.length - choiceCount;
  const questionMarkup = questions.map((question, index) => {
    const answerMarkup = question.type === 'choice'
      ? `<div class="quiz-options">${question.options.map((option, optionIndex) => `
          <label class="quiz-option" for="${question.id}-option-${optionIndex}">
            <input id="${question.id}-option-${optionIndex}" type="radio" name="${question.id}" value="${optionIndex}">
            <span>${escapeHtml(option)}</span>
          </label>`).join('')}</div>`
      : `<label class="quiz-essay-label" for="${question.id}">Tulis jawabanmu</label>
         <textarea id="${question.id}" name="${question.id}" rows="5" maxlength="2000" placeholder="Jelaskan dengan kata-katamu sendiri..."></textarea>`;
    return `
      <fieldset class="quiz-question">
        <legend><span>Soal ${index + 1} · ${question.type === 'choice' ? 'Pilihan ganda' : 'Essay'}</span>${escapeHtml(question.prompt)}</legend>
        ${answerMarkup}
      </fieldset>`;
  }).join('');

  return `
    <section class="card module-quiz" id="module-quiz-${mod.id}">
      <div class="section-eyebrow">LATIHAN SOAL MODUL ${mod.num}</div>
      <h2>Uji pemahamanmu</h2>
      <p class="quiz-intro">${questions.length} soal: ${choiceCount} pilihan ganda dan ${essayCount} essay. Setelah dikirim, jawaban benar dan pembahasan akan ditampilkan. Skor essay memakai kecocokan kata kunci rubrik sederhana, bukan penilaian makna otomatis.</p>
      <form id="quiz-form-${mod.id}" novalidate>
        ${questionMarkup}
        <div class="quiz-error" id="quiz-error-${mod.id}" role="alert"></div>
        <button class="btn btn-primary" type="button" data-act="submit-quiz" data-mid="${mod.id}">Kirim jawaban</button>
      </form>
      <div id="quiz-result-${mod.id}" aria-live="polite"></div>
    </section>`;
}

function renderModule(modId){
  const mod = findModule(modId);
  if (!mod) { go('dashboard'); return; }
  State.currentModule = mod;
  const p = moduleProgress(mod);

  const subnav = mod.lessons.map((l, i) => `
    <a data-act="jump" data-id="${l.id}" class="${i===0?'active':''} ${isDone(mod.id,l.id)?'done':''}">${i+1}. ${escapeHtml(l.title.split(':')[0])}</a>
  `).join('');

  const lessons = mod.lessons.map((l, i) => {
    const done = isDone(mod.id, l.id);
    const simBtn = l.hasSim
      ? `<button class="btn btn-sim" data-act="open-sim" data-type="${l.hasSim}">🔢 Buka Simulasi ${l.hasSim==='knn'?'KNN':l.hasSim==='nb'?'Naive Bayes':'Backpropagation'}</button>`
      : '';
    const swishBtn = mod.swish && i === 1
      ? `<a class="btn btn-secondary" href="${mod.swish}" target="_blank" rel="noopener">🌐 Buka SWISH Prolog</a>` : '';
    return `
      <div class="lesson ${i===0?'open':''}" id="lesson-${l.id}">
        <div class="lesson-head" data-act="toggle-lesson" data-id="${l.id}">
          <div class="lnum">${i+1}</div>
          <div class="ltxt">
            <b>${escapeHtml(l.title)}</b>
            <small>${escapeHtml(l.objective)}</small>
          </div>
          <div class="status ${done?'done':''}">${done?'✓ Selesai':'Belum'}</div>
        </div>
        <div class="lesson-body">
          <div class="objective"><b>TUJUAN PEMBELAJARAN</b>${escapeHtml(l.objective)}</div>
          <div class="reading-label">Materi Pembelajaran</div>
          ${l.body}
          <div class="lesson-actions">
            <button class="btn btn-done" data-act="toggle-done" data-mid="${mod.id}" data-id="${l.id}" ${done?'disabled':''}>
              ${done?'✓ Sudah Selesai':'Tandai Selesai'}
            </button>
            ${simBtn}
            ${swishBtn}
          </div>
        </div>
      </div>`;
  }).join('');

  const main = `
    <div class="crumb"><a data-go="dashboard">Beranda</a> / <a data-go="modules">Modul</a> / ${mod.num}</div>
    <div class="module-header" style="--mod-color:${mod.color}">
      <div class="k">MODUL ${mod.num} · ${mod.dur.toUpperCase()}</div>
      <h2>${mod.title}</h2>
      <p>${mod.desc}</p>
      <div class="bar-wrap">
        <div class="progress"><i style="width:${p.pct}%"></i></div>
        <div style="font-size:11px;color:rgba(255,255,255,.85);margin-top:6px">${p.done}/${p.total} sub-materi · ${p.pct}%</div>
      </div>
    </div>
    <div class="module-layout">
      <aside class="card subnav">
        <div class="label">SUB-BAB</div>
        ${subnav}
        <div class="label subnav-extra-label">FITUR BELAJAR</div>
        <a data-act="jump-section" data-target="study-tool-${mod.id}">Alat bantu belajar</a>
        <a data-act="jump-section" data-target="module-quiz-${mod.id}">Latihan soal</a>
      </aside>
      <div class="lesson-list">${lessons}</div>
    </div>`;
  const mainWithLearningTools = `${main}
    ${renderStudyTool(mod)}
    ${renderModuleQuiz(mod)}`;

  $('#app').innerHTML = shell('modules', mainWithLearningTools);
}

// Halaman daftar semua modul
function renderModulesList(){
  const cards = MODULES.map(m => {
    const p = moduleProgress(m);
    return `
      <div class="card module-card" data-go="module:${m.id}" style="--mod-color:${m.color}">
        <div class="head">
          <div class="num">${m.num}</div>
          <div><b>${escapeHtml(m.title)}</b><small>${m.lessons.length} submateri · ${escapeHtml(m.dur)}</small></div>
        </div>
        <p class="module-description">${escapeHtml(m.desc)}</p>
        <ul>${m.lessons.map((l, i) => `<li>${i + 1}. ${escapeHtml(l.title)}</li>`).join('')}</ul>
        <div class="foot">
          <div class="prog-mini">${p.done}/${p.total} selesai · ${p.pct}%</div>
          <span class="module-open">Lihat detail →</span>
        </div>
      </div>`;
  }).join('');

  $('#app').innerHTML = shell('modules', `
    <div class="crumb"><a data-go="dashboard">Dashboard</a> › Daftar Materi</div>
    <h1 class="title">Daftar Materi</h1>
    <div class="subtitle">Pilih modul untuk membaca submateri dan aktivitas pembelajaran.</div>
    <div class="grid-modules grid-two">${cards}</div>
  `);
}

function renderProgress(){
  const ov = overallProgress();
  const nextModule = MODULES.find(m => moduleProgress(m).done < moduleProgress(m).total);
  const rows = MODULES.map(m => {
    const p = moduleProgress(m);
    return `
      <div class="card progress-row" data-go="module:${m.id}" style="--mod-color:${m.color}">
        <b>${m.num}</b>
        <span>${escapeHtml(m.title)}</span>
        <div class="progress"><i style="width:${p.pct}%;background:var(--mod-color)"></i></div>
        <em>${p.done}/${p.total} selesai</em>
      </div>`;
  }).join('');

  $('#app').innerHTML = shell('progress', `
    <div class="crumb"><a data-go="dashboard">Dashboard</a> › Progress Saya</div>
    <h1 class="title">Progress Saya</h1>
    <div class="subtitle">Pantau kemajuan belajar dan lanjutkan dari modul yang belum selesai.</div>
    <div class="hero-banner progress-hero">
      <div class="k">PROGRESS PEMBELAJARAN MANDIRI</div>
      <h2>${ov.pct}% selesai</h2>
      <p>${ov.done} dari ${ov.total} submateri telah ditandai selesai.</p>
      ${nextModule ? `<a class="btn" data-go="module:${nextModule.id}">Lanjutkan belajar →</a>` : '<p class="all-complete">Semua submateri selesai. Kerja bagus!</p>'}
    </div>
    <h3 class="section-title">Kemajuan per modul</h3>
    <div class="progress-list">${rows}</div>
  `);
}

function renderSequence(){
  const nodes = MODULES.map(m => {
    const p = moduleProgress(m);
    const lessons = m.lessons.map((lesson, i) => `
      <li>
        <span class="sequence-dot ${isDone(m.id, lesson.id) ? 'is-done' : ''}"></span>
        <span>${i + 1}. ${escapeHtml(lesson.title)}</span>
      </li>`).join('');
    return `
      <div class="sequence-node" style="--mod-color:${m.color}">
        <div class="sequence-number">${m.num}</div>
        <div class="card sequence-card" data-go="module:${m.id}">
          <div class="sequence-card-heading">
            <div><b>${escapeHtml(m.title)}</b><small>${p.done}/${p.total} submateri selesai</small></div>
            <span class="module-open">Buka modul →</span>
          </div>
          <ul>${lessons}</ul>
        </div>
      </div>`;
  }).join('');

  $('#app').innerHTML = shell('sequence', `
    <div class="crumb"><a data-go="dashboard">Dashboard</a> › Urutan Pembelajaran</div>
    <h1 class="title">Urutan Pembelajaran</h1>
    <div class="subtitle">Ikuti alur enam modul berikut atau buka modul untuk belajar langsung.</div>
    <div class="sequence-flow">${nodes}</div>
  `);
}