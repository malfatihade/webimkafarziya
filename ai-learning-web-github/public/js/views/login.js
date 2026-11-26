// views/login.js — Login and registration screens
function setAuthFieldError(id, message){
  const field = $(`#${id}`);
  field.classList.toggle('invalid', Boolean(message));
  const error = $('.err', field);
  error.textContent = message || '';
  field.querySelector('input').setAttribute('aria-invalid', String(Boolean(message)));
}

function clearAuthFormError(){
  const error = $('#authFormError');
  error.textContent = '';
  error.classList.remove('visible');
}

function showAuthFormError(message){
  const error = $('#authFormError');
  error.textContent = message;
  error.classList.add('visible');
}

function passwordToggleButton(target, label){
  return `
    <button class="password-toggle" type="button" data-act="toggle-password" data-target="${target}"
      aria-label="Tampilkan ${label}" aria-pressed="false">
      <svg class="eye-open" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
      <svg class="eye-closed" viewBox="0 0 24 24" aria-hidden="true" hidden>
        <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"></path>
        <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a15.7 15.7 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10.7 10.7 0 0 0 4.1-.8"></path>
      </svg>
    </button>`;
}

function renderLogin(options = {}){
  document.body.classList.remove('menu-open');
  $('#app').innerHTML = `
    <div class="login">
      <div class="login-left">
        ${brandRow('login-brandrow')}
        <div class="appname">AI Learning</div>
        <div class="login-hero">
          <div class="kicker">PEMBELAJARAN INTERAKTIF</div>
          <h1>Mulai perjalanan<br>belajar AI kamu.</h1>
          <p>Akses materi Kecerdasan Buatan secara terstruktur, interaktif, dan mandiri.</p>
        </div>
        <img class="mascot" src="${appAsset('assets/maskot%20imk.png')}" alt="Maskot pemandu AI Learning">
      </div>
      <div class="login-right">
        <div class="login-card">
          <h2>Selamat datang</h2>
          <div class="sub">Login untuk melanjutkan pembelajaran.</div>
          <form id="loginForm" novalidate>
            <div class="field" id="fEmail">
              <label for="identifier">Email atau username</label>
              <input id="identifier" type="text" value="${escapeHtml(options.identifier || options.email || '')}" placeholder="nama@email.com atau username" autocomplete="username" aria-describedby="fEmailError" required>
              <div class="err" id="fEmailError" aria-live="polite"></div>
            </div>
            <div class="field" id="fPw">
              <label for="pw">Kata sandi</label>
              <div class="password-control">
                <input id="pw" type="password" placeholder="Masukkan kata sandi" autocomplete="current-password" aria-describedby="fPwError" required>
                ${passwordToggleButton('pw', 'kata sandi')}
              </div>
              <div class="err" id="fPwError" aria-live="polite"></div>
            </div>
            <div class="row">
              <label><input id="rememberEmail" type="checkbox"> Ingat saya</label>
              <a class="link" data-act="forgot">Lupa password?</a>
            </div>
            <div class="form-error" id="authFormError" role="alert"></div>
            <button class="btn btn-primary btn-login" type="submit">Masuk ke akun →</button>
          </form>
          <div class="alt">Belum memiliki akun?<a data-act="show-register">Daftar</a></div>
          <div class="note">Daftar akun untuk menyimpan progress belajar Anda.</div>
        </div>
      </div>
    </div>`;

  const rememberedEmail = localStorage.getItem('ai_remembered_email');
  const emailInput = $('#identifier');
  const rememberInput = $('#rememberEmail');
  if (!options.email && !options.identifier && rememberedEmail) {
    emailInput.value = rememberedEmail;
    rememberInput.checked = true;
  }

  $('#loginForm').addEventListener('input', e => {
    if (e.target.id === 'identifier') setAuthFieldError('fEmail', '');
    if (e.target.id === 'pw') setAuthFieldError('fPw', '');
    clearAuthFormError();
  });

  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    clearAuthFormError();
    setAuthFieldError('fEmail', '');
    setAuthFieldError('fPw', '');

    const identifier = emailInput.value.trim();
    const password = $('#pw').value;
    let firstInvalid = null;

    if (!identifier || identifier.length > 254) {
      setAuthFieldError('fEmail', 'Masukkan email atau username.');
      firstInvalid = emailInput;
    }
    if (!password) {
      setAuthFieldError('fPw', 'Masukkan kata sandi.');
      firstInvalid = firstInvalid || $('#pw');
    }
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const submit = $('#loginForm button[type="submit"]');
    submit.disabled = true;
    try {
      const { user } = await API.login({ identifier, password });
      State.user = user;
      if (rememberInput.checked) localStorage.setItem('ai_remembered_email', identifier);
      else localStorage.removeItem('ai_remembered_email');
      const synced = await syncProgress();
      welcomeGuide();
      go('dashboard');
      toast(synced
        ? 'Berhasil masuk. Selamat belajar!'
        : 'Berhasil masuk. Progress online tidak tersedia; data lokal digunakan.');
    } catch (error) {
      submit.disabled = false;
      if (error.field === 'identifier' || error.field === 'email') setAuthFieldError('fEmail', error.message);
      else if (error.field === 'password' || error.status === 401) setAuthFieldError('fPw', error.message);
      else showAuthFormError(error.status
        ? error.message
        : 'Server aplikasi tidak merespons. Pastikan server berjalan lalu coba lagi.');
      const field = error.field === 'identifier' || error.field === 'email' ? emailInput : $('#pw');
      field.focus();
    }
  });
}

function renderPasswordResetRequest(){
  document.body.classList.remove('menu-open');
  $('#app').innerHTML = `
    <div class="login">
      <div class="login-left">
        ${brandRow('login-brandrow')}
        <div class="appname">AI Learning</div>
        <div class="login-hero">
          <div class="kicker">PEMULIHAN AKUN</div>
          <h1>Atur ulang<br>kata sandi.</h1>
          <p>Masukkan email akun Anda. Kami akan mengirim tautan pemulihan jika email tersebut terdaftar.</p>
        </div>
        <img class="mascot" src="${appAsset('assets/maskot%20imk.png')}" alt="Maskot pemandu AI Learning">
      </div>
      <div class="login-right">
        <div class="login-card">
          <h2>Lupa kata sandi?</h2>
          <div class="sub">Anda dapat memulihkan akun sendiri tanpa menghubungi administrator.</div>
          <form id="resetRequestForm" novalidate>
            <div class="field" id="fEmail">
              <label for="resetEmail">Email akun</label>
              <input id="resetEmail" type="email" placeholder="nama@email.com" autocomplete="email" aria-describedby="fEmailError" required>
              <div class="err" id="fEmailError" aria-live="polite"></div>
            </div>
            <div class="form-error" id="authFormError" role="alert"></div>
            <button class="btn btn-primary btn-login" type="submit">Kirim tautan reset</button>
          </form>
          <div class="alt"><a data-act="show-login">Kembali ke login</a></div>
          <div class="note">Tautan reset berlaku selama satu jam dan hanya dapat digunakan sekali.</div>
        </div>
      </div>
    </div>`;

  const form = $('#resetRequestForm');
  const emailInput = $('#resetEmail');
  form.addEventListener('input', () => {
    setAuthFieldError('fEmail', '');
    clearAuthFormError();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    clearAuthFormError();
    setAuthFieldError('fEmail', '');
    const email = emailInput.value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAuthFieldError('fEmail', 'Masukkan alamat email yang valid.');
      emailInput.focus();
      return;
    }

    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      await API.requestPasswordReset(email);
      form.innerHTML = '<p role="status">Jika email tersebut terdaftar, tautan untuk mengatur ulang kata sandi akan segera dikirim. Silakan periksa kotak masuk Anda.</p>';
    } catch (error) {
      submit.disabled = false;
      showAuthFormError(error.message || 'Tidak dapat mengirim tautan reset. Periksa konfigurasi email server lalu coba lagi.');
    }
  });
}

function renderPasswordReset(){
  document.body.classList.remove('menu-open');
  $('#app').innerHTML = `
    <div class="login">
      <div class="login-left">
        ${brandRow('login-brandrow')}
        <div class="appname">AI Learning</div>
        <div class="login-hero">
          <div class="kicker">PEMULIHAN AKUN</div>
          <h1>Buat kata sandi<br>yang baru.</h1>
          <p>Pilih kata sandi baru untuk melanjutkan pembelajaran Anda.</p>
        </div>
        <img class="mascot" src="${appAsset('assets/maskot%20imk.png')}" alt="Maskot pemandu AI Learning">
      </div>
      <div class="login-right">
        <div class="login-card">
          <h2>Atur ulang kata sandi</h2>
          <div class="sub">Gunakan kata sandi baru yang terdiri dari 8–128 karakter.</div>
          <form id="resetPasswordForm" novalidate>
            <div class="field" id="fPw">
              <label for="newPw">Kata sandi baru</label>
              <input id="newPw" type="password" autocomplete="new-password" minlength="8" maxlength="128" aria-describedby="fPwError" required>
              <div class="err" id="fPwError" aria-live="polite"></div>
            </div>
            <div class="field" id="fConfirm">
              <label for="confirmPw">Ulangi kata sandi baru</label>
              <input id="confirmPw" type="password" autocomplete="new-password" aria-describedby="fConfirmError" required>
              <div class="err" id="fConfirmError" aria-live="polite"></div>
            </div>
            <div class="form-error" id="authFormError" role="alert"></div>
            <button class="btn btn-primary btn-login" type="submit">Simpan kata sandi baru</button>
          </form>
        </div>
      </div>
    </div>`;

  const form = $('#resetPasswordForm');
  const passwordInput = $('#newPw');
  const confirmInput = $('#confirmPw');
  form.addEventListener('input', () => {
    setAuthFieldError('fPw', '');
    setAuthFieldError('fConfirm', '');
    clearAuthFormError();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    clearAuthFormError();
    setAuthFieldError('fPw', '');
    setAuthFieldError('fConfirm', '');
    const password = passwordInput.value;
    let firstInvalid = null;
    if (password.length < 8 || password.length > 128) {
      setAuthFieldError('fPw', 'Kata sandi harus terdiri dari 8–128 karakter.');
      firstInvalid = passwordInput;
    }
    if (confirmInput.value !== password) {
      setAuthFieldError('fConfirm', 'Kata sandi belum sama.');
      firstInvalid = firstInvalid || confirmInput;
    }
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      await API.resetPassword({ password });
      window.history.replaceState(null, '', window.location.pathname);
      renderLogin();
      toast('Kata sandi berhasil diatur ulang. Silakan masuk.');
    } catch (error) {
      submit.disabled = false;
      if (error.field === 'token') showAuthFormError('Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan reset yang baru.');
      else if (error.field === 'password') setAuthFieldError('fPw', error.message);
      else showAuthFormError(error.message || 'Tidak dapat mengatur ulang kata sandi. Coba lagi.');
    }
  });
}

function renderRegister(){
  document.body.classList.remove('menu-open');
  $('#app').innerHTML = `
    <div class="login">
      <div class="login-left">
        ${brandRow('login-brandrow')}
        <div class="appname">AI Learning</div>
        <div class="login-hero">
          <div class="kicker">AKUN PEMBELAJARAN</div>
          <h1>Buat akun,<br>mulai belajar AI.</h1>
          <p>Progress belajarmu tersimpan dan bisa dilanjutkan saat kembali.</p>
        </div>
        <img class="mascot" src="${appAsset('assets/maskot%20imk.png')}" alt="Maskot pemandu AI Learning">
      </div>
      <div class="login-right">
        <div class="login-card">
          <h2>Daftar akun</h2>
          <div class="sub">Isi data berikut untuk membuat akun baru.</div>
          <form id="registerForm" novalidate>
            <div class="field" id="fUsername">
              <label for="username">Username</label>
              <input id="username" type="text" placeholder="3–30 karakter" autocomplete="username" minlength="3" maxlength="30" aria-describedby="fUsernameError" required>
              <div class="err" id="fUsernameError" aria-live="polite"></div>
            </div>
            <div class="field" id="fEmail">
              <label for="email">Email</label>
              <input id="email" type="email" placeholder="nama@email.com" autocomplete="email" aria-describedby="fEmailError" required>
              <div class="err" id="fEmailError" aria-live="polite"></div>
            </div>
            <div class="field" id="fPw">
              <label for="pw">Kata sandi</label>
              <div class="password-control">
                <input id="pw" type="password" placeholder="Minimal 8 karakter" autocomplete="new-password" minlength="8" maxlength="128" aria-describedby="fPwError" required>
                ${passwordToggleButton('pw', 'kata sandi')}
              </div>
              <div class="err" id="fPwError" aria-live="polite"></div>
            </div>
            <div class="field" id="fConfirm">
              <label for="confirmPw">Ulangi kata sandi</label>
              <div class="password-control">
                <input id="confirmPw" type="password" placeholder="Masukkan ulang kata sandi" autocomplete="new-password" aria-describedby="fConfirmError" required>
                ${passwordToggleButton('confirmPw', 'konfirmasi kata sandi')}
              </div>
              <div class="err" id="fConfirmError" aria-live="polite"></div>
            </div>
            <div class="form-error" id="authFormError" role="alert"></div>
            <button class="btn btn-primary btn-login" type="submit">Buat akun →</button>
          </form>
          <div class="alt">Sudah memiliki akun?<a data-act="show-login">Masuk</a></div>
          <div class="note">Kata sandi dikelola dengan aman oleh layanan autentikasi Supabase.</div>
        </div>
      </div>
    </div>`;

  $('#registerForm').addEventListener('input', e => {
    const fieldId = e.target.id === 'confirmPw' ? 'fConfirm'
      : e.target.id === 'username' ? 'fUsername'
      : e.target.id === 'email' ? 'fEmail'
      : 'fPw';
    setAuthFieldError(fieldId, '');
    clearAuthFormError();
  });

  $('#registerForm').addEventListener('submit', async e => {
    e.preventDefault();
    clearAuthFormError();
    ['fUsername', 'fEmail', 'fPw', 'fConfirm'].forEach(id => setAuthFieldError(id, ''));

    const usernameInput = $('#username');
    const emailInput = $('#email');
    const passwordInput = $('#pw');
    const confirmInput = $('#confirmPw');
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;
    let firstInvalid = null;

    if (!/^[a-zA-Z0-9._-]{3,30}$/.test(username)) {
      setAuthFieldError('fUsername', 'Username harus 3–30 karakter dan hanya boleh berisi huruf, angka, titik, garis bawah, atau tanda hubung.');
      firstInvalid = usernameInput;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAuthFieldError('fEmail', 'Masukkan alamat email yang valid.');
      firstInvalid = firstInvalid || emailInput;
    }
    if (password.length < 8 || password.length > 128) {
      setAuthFieldError('fPw', 'Kata sandi harus terdiri dari 8–128 karakter.');
      firstInvalid = firstInvalid || passwordInput;
    }
    if (confirmPassword !== password) {
      setAuthFieldError('fConfirm', 'Kata sandi belum sama.');
      firstInvalid = firstInvalid || confirmInput;
    }
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const submit = $('#registerForm button[type="submit"]');
    submit.disabled = true;
    try {
      const { confirmationRequired } = await API.register({ username, email, password });
      renderLogin({ email });
      toast(confirmationRequired
        ? 'Akun dibuat. Periksa email untuk mengonfirmasi akun sebelum masuk.'
        : 'Akun berhasil dibuat. Silakan masuk dengan kata sandi Anda.');
    } catch (error) {
      submit.disabled = false;
      if (error.field === 'username') setAuthFieldError('fUsername', error.message);
      else if (error.field === 'email') setAuthFieldError('fEmail', error.message);
      else if (error.field === 'password') setAuthFieldError('fPw', error.message);
      else showAuthFormError(error.message || 'Pendaftaran gagal. Periksa koneksi lalu coba lagi.');
      const field = error.field === 'username' ? usernameInput : error.field === 'email' ? emailInput : error.field === 'password' ? passwordInput : null;
      if (field) field.focus();
    }
  });
}
