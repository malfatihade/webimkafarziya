const GUIDE = { open: false };

const GUIDE_STOPS = [
  {
    route: 'dashboard',
    title: 'Mulai dari dashboard',
    message: 'Di sini kamu bisa melihat ringkasan materi dan progress. Pilih “Mulai belajar” atau buka salah satu kartu modul.',
    next: 'modules',
    nextLabel: 'Lihat daftar materi',
  },
  {
    route: 'modules',
    title: 'Pilih materi',
    message: 'Materi disusun menjadi enam modul. Buka kartu untuk membaca tujuan, submateri, dan aktivitas belajarnya.',
    previous: 'dashboard',
    next: 'module:m1',
    nextLabel: 'Contohkan Modul 1',
  },
  {
    route: 'module',
    title: 'Belajar satu langkah demi satu',
    message: 'Baca tujuan dan isi submateri, coba simulasi jika tersedia, lalu tandai selesai agar progress-mu tercatat.',
    previous: 'modules',
    next: 'progress',
    nextLabel: 'Lihat progress',
  },
  {
    route: 'progress',
    title: 'Pantau progress',
    message: 'Progress Saya menampilkan penyelesaian tiap modul. Pilih baris modul untuk melanjutkan belajar.',
    previous: 'module:m1',
    next: 'sequence',
    nextLabel: 'Lihat urutan belajar',
  },
  {
    route: 'sequence',
    title: 'Ikuti urutan pembelajaran',
    message: 'Halaman ini merangkum alur materi dan status setiap submateri. Kamu bisa membuka modul langsung dari alur tersebut.',
    previous: 'progress',
    next: 'dashboard',
    nextLabel: 'Selesaikan panduan',
  },
];

function currentGuideStop(){
  const index = GUIDE_STOPS.findIndex(stop =>
    stop.route === State.route || (stop.route === 'module' && State.route.startsWith('module:'))
  );
  return GUIDE_STOPS[index === -1 ? 0 : index];
}

function currentGuidePose(){
  if (State.route === 'modules') return 'modules';
  if (State.route.startsWith('module:')) return 'lesson';
  if (State.route === 'progress') return 'progress';
  if (State.route === 'sequence') return 'sequence';
  return 'dashboard';
}

function guideWidget(){
  if (!State.user) return '';
  const stop = currentGuideStop();
  return `
    <div class="guide-widget guide-widget--${currentGuidePose()}">
      <section class="guide-panel ${GUIDE.open ? 'is-open' : ''}" aria-label="Panduan maskot" aria-live="polite">
        <div class="guide-panel-head">
          <video autoplay muted loop playsinline preload="metadata" poster="${appAsset('assets/maskot%20imk.png')}" aria-hidden="true">
            <source src="${appAsset('assets/video%20maskot%20bergerak.mp4')}" type="video/mp4">
          </video>
          <div><small>PANDUAN AI LEARNING</small><b>${escapeHtml(stop.title)}</b></div>
          <button class="guide-close" data-act="guide-close" aria-label="Tutup panduan">×</button>
        </div>
        <p>${escapeHtml(stop.message)}</p>
        <div class="guide-actions">
          ${stop.previous ? `<button class="btn btn-outline" data-act="guide-previous" data-route="${stop.previous}">← Kembali</button>` : ''}
          <button class="btn btn-primary" data-act="guide-next" data-route="${stop.next}">${escapeHtml(stop.nextLabel)} →</button>
        </div>
      </section>
      <button class="guide-trigger" data-act="guide-toggle" aria-label="Buka panduan maskot" aria-expanded="${GUIDE.open}">
        <video autoplay muted loop playsinline preload="metadata" poster="${appAsset('assets/maskot%20imk.png')}" aria-hidden="true">
          <source src="${appAsset('assets/video%20maskot%20bergerak.mp4')}" type="video/mp4">
        </video>
        <span>Panduan</span>
      </button>
    </div>`;
}

function welcomeGuide(){
  GUIDE.open = false;
  if (!State.user) return;
  const key = `ai_guide_seen_${encodeURIComponent(State.user.email)}`;
  if (localStorage.getItem(key)) return;
  GUIDE.open = true;
  localStorage.setItem(key, 'true');
}

function setGuideOpen(open){
  GUIDE.open = open;
  const widget = $('.guide-widget');
  if (widget) {
    const panel = $('.guide-panel', widget);
    const trigger = $('.guide-trigger', widget);
    panel.classList.toggle('is-open', GUIDE.open);
    trigger.setAttribute('aria-expanded', String(GUIDE.open));
  }
}

function navigateGuide(route){
  setGuideOpen(true);
  go(route);
}

function finishGuide(){
  setGuideOpen(false);
  go('dashboard');
  toast('Panduan selesai. Kamu bisa mulai belajar!');
}
