// app.js — Inisialisasi app & event delegation global

function normalizeRubricText(value){
  return String(value).normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function rubricContains(answer, keyword){
  const normalizedAnswer = ` ${normalizeRubricText(answer)} `;
  const normalizedKeyword = normalizeRubricText(keyword);
  return normalizedKeyword && normalizedAnswer.includes(` ${normalizedKeyword} `);
}

function readStudyToolField(mid, name){
  return $(`#study-tool-${mid} [name="${name}"]`).value.trim();
}

function showStudyToolError(mid, message){
  const result = $(`#study-tool-result-${mid}`);
  if (result) result.innerHTML = `<p class="tool-error">${escapeHtml(message)}</p>`;
}

function checkPeasTool(mid){
  const tool = MODULE_STUDY_TOOLS[mid];
  if (!tool || tool.type !== 'peas') return;
  const values = tool.fields.map(field => ({
    label: field.label,
    value: readStudyToolField(mid, field.name),
  }));
  const task = values[0].value;
  const missing = values.filter(field => !field.value);
  const result = $(`#study-tool-result-${mid}`);
  result.innerHTML = `
    <div class="tool-feedback">
      <h3>${missing.length ? 'Rancangan PEAS belum lengkap' : 'Rancangan PEAS siap ditinjau'}</h3>
      <ul>${values.map(field => `
        <li class="${field.value ? 'is-filled' : 'is-missing'}">
          <b>${escapeHtml(field.label)}:</b> ${field.value ? escapeHtml(field.value) : 'Belum diisi'}
        </li>`).join('')}</ul>
      <p>${task ? `Agen/tugas: <b>${escapeHtml(task)}</b>. ` : ''}${missing.length ? `Lengkapi ${missing.length} bagian, lalu cek kembali.` : 'Periksa apakah ukuran kinerja benar-benar mengukur tujuan agen dan apakah sensor/aktuator sesuai lingkungannya.'}</p>
    </div>`;
}

function prologAtom(value){
  let atom = normalizeRubricText(value).replace(/\s+/g, '_');
  if (!atom) return '';
  if (!/^[a-z]/.test(atom)) atom = `orang_${atom}`;
  return atom;
}

function buildPrologTool(mid){
  const mod = findModule(mid);
  if (!mod || !mod.swish) return;
  const fields = ['parentOne', 'childOne', 'parentTwo', 'childTwo'];
  const atoms = fields.map(name => prologAtom(readStudyToolField(mid, name)));
  if (atoms.some(atom => !atom)) {
    showStudyToolError(mid, 'Isi keempat nama agar fakta dan query Prolog dapat dibuat.');
    return;
  }
  const [parentOne, childOne, parentTwo, childTwo] = atoms;
  const code = [
    `parent(${parentOne}, ${childOne}).`,
    `parent(${parentTwo}, ${childTwo}).`,
    '',
    'grandparent(X, Z) :- parent(X, Y), parent(Y, Z).',
    '',
    `?- grandparent(${parentOne}, ${childTwo}).`,
  ].join('\n');
  const result = $(`#study-tool-result-${mid}`);
  result.innerHTML = `
    <div class="tool-feedback">
      <h3>Contoh program siap dicoba</h3>
      <pre>${escapeHtml(code)}</pre>
      <p>Salin kode ini ke editor SWISH, jalankan query, lalu ubah fakta untuk mencoba relasi keluarga lain.</p>
      <a class="btn btn-secondary" href="${escapeHtml(mod.swish)}" target="_blank" rel="noopener">Buka SWISH Prolog</a>
    </div>`;
}

function checkResnetTool(mid){
  const names = ['inputH', 'inputW', 'inputC', 'outputH', 'outputW', 'outputC'];
  const values = names.map(name => Number(readStudyToolField(mid, name)));
  if (values.some(value => !Number.isInteger(value) || value < 1 || value > 4096)) {
    showStudyToolError(mid, 'Masukkan setiap dimensi sebagai bilangan bulat antara 1 dan 4096.');
    return;
  }
  const inputShape = values.slice(0, 3);
  const outputShape = values.slice(3);
  const matches = inputShape.every((value, index) => value === outputShape[index]);
  const result = $(`#study-tool-result-${mid}`);
  result.innerHTML = `
    <div class="tool-feedback ${matches ? 'is-success' : 'is-warning'}">
      <h3>${matches ? 'Bentuk tensor cocok' : 'Shortcut perlu penyesuaian'}</h3>
      <p>Input shortcut: <code>${inputShape.join(' × ')}</code> · Keluaran F(x): <code>${outputShape.join(' × ')}</code></p>
      <p>${matches
        ? 'Dimensi cocok sehingga penjumlahan identitas y = F(x) + x dapat dilakukan.'
        : 'Dimensi berbeda; shortcut perlu diproyeksikan, misalnya dengan konvolusi 1×1 dan stride yang sesuai, agar bentuk akhirnya cocok sebelum dijumlahkan.'}</p>
    </div>`;
}

function submitModuleQuiz(mid){
  const mod = findModule(mid);
  const questions = MODULE_QUIZZES[mid];
  const form = $(`#quiz-form-${mid}`);
  const error = $(`#quiz-error-${mid}`);
  if (!mod || !questions || !form || !error) return;

  const formData = new FormData(form);
  const missing = questions.find(question => {
    const answer = formData.get(question.id);
    return answer === null || !String(answer).trim();
  });
  if (missing) {
    error.textContent = 'Jawab semua soal sebelum mengirim latihan.';
    const field = form.querySelector(`[name="${missing.id}"]`);
    if (field) field.focus();
    return;
  }
  error.textContent = '';

  let earnedPoints = 0;
  const feedback = questions.map((question, index) => {
    const rawAnswer = String(formData.get(question.id));
    if (question.type === 'choice') {
      const selected = Number(rawAnswer);
      const validSelection = Number.isInteger(selected) && selected >= 0 && selected < question.options.length;
      const correct = validSelection && selected === question.answer;
      if (correct) earnedPoints += 1;
      return {
        question,
        index,
        score: correct ? 1 : 0,
        status: correct ? 'Jawaban benar' : 'Belum tepat',
        answer: validSelection ? question.options[selected] : 'Pilihan tidak valid',
        correctAnswer: question.options[question.answer],
      };
    }

    const matched = question.rubric.filter(criterion =>
      criterion.keywords.some(keyword => rubricContains(rawAnswer, keyword))
    );
    const score = matched.length / question.rubric.length;
    earnedPoints += score;
    return {
      question,
      index,
      score,
      status: score === 1 ? 'Rubrik terpenuhi' : score > 0 ? 'Sebagian sesuai' : 'Perlu diperbaiki',
      answer: rawAnswer,
      matched,
    };
  });
  const accuracy = Math.round((earnedPoints / questions.length) * 100);
  const results = feedback.map(item => {
    const { question } = item;
    const lesson = mod.lessons.find(candidate => candidate.id === question.lessonId);
    const answerKey = question.type === 'choice'
      ? `<p><b>Kunci jawaban:</b> ${escapeHtml(item.correctAnswer)}</p>`
      : `<div class="essay-rubric">
           <p><b>Kata kunci terdeteksi:</b> ${item.matched.length}/${question.rubric.length} indikator.</p>
           <ul>${question.rubric.map(criterion => `
             <li class="${item.matched.includes(criterion) ? 'is-filled' : 'is-missing'}">${item.matched.includes(criterion) ? '✓' : '○'} ${escapeHtml(criterion.label)}</li>`).join('')}</ul>
           <p><b>Contoh jawaban:</b> ${escapeHtml(question.sampleAnswer)}</p>
         </div>`;
    return `
      <li class="quiz-feedback-item ${item.score === 1 ? 'is-correct' : item.score > 0 ? 'is-partial' : 'is-incorrect'}">
        <div class="quiz-feedback-heading"><b>Soal ${item.index + 1}</b><span>${item.status} · ${Math.round(item.score * 100)}%</span></div>
        <p>${escapeHtml(question.explanation)}</p>
        <p><b>Jawabanmu:</b> ${escapeHtml(item.answer)}</p>
        ${answerKey}
        ${lesson ? `<button class="btn btn-secondary" data-act="jump" data-id="${escapeHtml(lesson.id)}">Baca ulang: ${escapeHtml(lesson.title)}</button>` : ''}
      </li>`;
  }).join('');

  $(`#quiz-result-${mid}`).innerHTML = `
    <section class="quiz-results">
      <div class="quiz-score"><span>Akurasi jawaban</span><strong>${accuracy}%</strong></div>
      <p>Skor gabungan: <b>${earnedPoints.toFixed(1)} / ${questions.length}</b> poin. Pilihan ganda dinilai benar/salah; essay dinilai dari indikator kata kunci rubrik.</p>
      <ol class="quiz-feedback-list">${results}</ol>
      <button class="btn btn-outline" data-act="reset-quiz" data-mid="${mid}">Ulangi latihan</button>
    </section>`;
}

function resetModuleQuiz(mid){
  const form = $(`#quiz-form-${mid}`);
  if (!form) return;
  form.reset();
  $(`#quiz-error-${mid}`).textContent = '';
  $(`#quiz-result-${mid}`).innerHTML = '';
}

// Event delegation
document.addEventListener('click', e => {
  // Navigasi
  const goEl = e.target.closest('[data-go]');
  if (goEl && !e.target.closest('[data-act]')) {
    e.preventDefault();
    go(goEl.getAttribute('data-go'));
    return;
  }

  // Aksi
  const actEl = e.target.closest('[data-act]');
  if (!actEl) return;
  const act = actEl.getAttribute('data-act');

  if (act === 'forgot') return renderPasswordResetRequest();
  if (act === 'register' || act === 'show-register') return renderRegister();
  if (act === 'show-login') {
    const emailInput = $('#email') || $('#resetEmail') || $('#identifier');
    return renderLogin({ identifier: emailInput ? emailInput.value.trim() : '' });
  }
  if (act === 'toggle-password') {
    const input = document.getElementById(actEl.getAttribute('data-target'));
    if (!input) return;
    const visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    actEl.setAttribute('aria-label', `${visible ? 'Sembunyikan' : 'Tampilkan'} kata sandi`);
    actEl.setAttribute('aria-pressed', String(visible));
    $('.eye-open', actEl).hidden = visible;
    $('.eye-closed', actEl).hidden = !visible;
    return;
  }
  if (act === 'close-sim') return closeSimModal();
  if (act === 'jump-section') {
    const section = document.getElementById(actEl.getAttribute('data-target'));
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  if (act === 'check-peas') return checkPeasTool(actEl.getAttribute('data-mid'));
  if (act === 'build-prolog') return buildPrologTool(actEl.getAttribute('data-mid'));
  if (act === 'check-resnet') return checkResnetTool(actEl.getAttribute('data-mid'));
  if (act === 'submit-quiz') return submitModuleQuiz(actEl.getAttribute('data-mid'));
  if (act === 'reset-quiz') return resetModuleQuiz(actEl.getAttribute('data-mid'));
  if (act === 'guide-toggle') return setGuideOpen(!GUIDE.open);
  if (act === 'guide-close') return setGuideOpen(false);
  if (act === 'guide-next' && currentGuideStop().route === 'sequence') return finishGuide();
  if (act === 'guide-next' || act === 'guide-previous') {
    navigateGuide(actEl.getAttribute('data-route'));
    return;
  }
  if (act === 'logout') {
    API.logout().catch(() => toast('Sesi tidak dapat ditutup. Coba lagi.'));
    State.user = null;
    State.progress = {};
    localStorage.removeItem('ai_user');
    go('login');
    return;
  }

  if (act === 'toggle-lesson') {
    const id = actEl.getAttribute('data-id');
    const lesson = document.getElementById('lesson-' + id);
    if (lesson) lesson.classList.toggle('open');
    // Update subnav active
    $$('.subnav a').forEach(a => a.classList.remove('active'));
    const sub = $(`.subnav a[data-id="${id}"]`);
    if (sub) sub.classList.add('active');
    return;
  }

  if (act === 'jump') {
    const id = actEl.getAttribute('data-id');
    const lesson = document.getElementById('lesson-' + id);
    if (lesson) {
      lesson.classList.add('open');
      lesson.scrollIntoView({ behavior: 'smooth', block: 'start' });
      $$('.subnav a').forEach(a => a.classList.remove('active'));
      actEl.classList.add('active');
    }
    return;
  }

  if (act === 'toggle-done') {
    const mid = actEl.getAttribute('data-mid');
    const lid = actEl.getAttribute('data-id');
    const now = !isDone(mid, lid);
    if (now) {
      State.progress[mid] = State.progress[mid] || [];
      if (!State.progress[mid].includes(lid)) State.progress[mid].push(lid);
    } else {
      State.progress[mid] = (State.progress[mid] || []).filter(x => x !== lid);
    }
    persistProgress();
    API.setProgress({ userId: State.user.email, moduleId: mid, lessonId: lid, done: now })
      .catch(() => toast('Progress tersimpan di perangkat, tetapi gagal disinkronkan secara online.'));
    toast(now ? '✓ Sub-materi ditandai selesai' : 'Status dibatalkan');
    renderModule(mid);
    // buka kembali lesson yang tadi
    const el = document.getElementById('lesson-' + lid);
    if (el) el.classList.add('open');
    return;
  }

  if (act === 'open-sim') {
    openSimModal(actEl.getAttribute('data-type'));
    return;
  }
  if (act === 'run-knn') return runKNN();
  if (act === 'run-nb') return runNB();
  if (act === 'run-bp') return runBP();
});

// Muat progress dari backend saat pertama kali login
function progressStorageKey(){
  return `ai_progress_${State.user.email}`;
}

async function syncProgress(){
  if (!State.user) return true;
  try {
    State.progress = JSON.parse(localStorage.getItem(progressStorageKey()) || '{}');
  } catch (e) {
    State.progress = {};
  }
  try {
    const data = await API.getProgress(State.user.email);
    State.progress = data || {};
    return true;
  } catch (e) {
    return false;
  }
}

// Simpan progress ke localStorage setiap kali berubah
function persistProgress(){
  try { localStorage.setItem(progressStorageKey(), JSON.stringify(State.progress)); } catch(e) {}
}
// Start
(async function boot(){
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const searchParams = new URLSearchParams(window.location.search);
  const isPasswordRecovery = hashParams.get('type') === 'recovery'
    || searchParams.get('flow') === 'password-reset';
  try {
    const session = await API.getSession();
    State.user = session.user;
    if (isPasswordRecovery) {
      if (!State.user) throw new Error('Sesi pemulihan tidak valid. Minta tautan reset yang baru.');
      renderPasswordReset();
      return;
    }
  } catch (error) {
    State.user = null;
    renderLogin();
    toast(error.message || 'Tidak dapat memeriksa sesi. Periksa koneksi lalu coba lagi.');
    return;
  }
  if (State.user) {
    await syncProgress();
    welcomeGuide();
    go('dashboard');
  }
  else renderLogin();
})();