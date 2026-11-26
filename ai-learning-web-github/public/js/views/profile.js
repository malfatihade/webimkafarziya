// views/profile.js — View and edit the signed-in user's account
function renderProfile(){
  const user = State.user;
  const main = `
    <div class="crumb">Profil Saya</div>
    <h1 class="title">Profil akun</h1>
    <div class="subtitle">Lihat dan perbarui informasi akun pembelajaranmu.</div>
    <section class="card profile-card">
      <div class="profile-heading">
        <div class="profile-avatar" aria-hidden="true">${escapeHtml((user.username || user.email).slice(0, 1).toUpperCase())}</div>
        <div><h2>${escapeHtml(user.username || user.email.split('@')[0])}</h2><p>${escapeHtml(user.email)}</p></div>
      </div>
      <form id="profileForm" novalidate>
        <div class="field" id="fUsername">
          <label for="profileUsername">Username</label>
          <input id="profileUsername" type="text" value="${escapeHtml(user.username || user.email.split('@')[0])}" autocomplete="username" minlength="3" maxlength="30" required>
          <div class="err" aria-live="polite"></div>
        </div>
        <div class="field" id="fEmail">
          <label for="profileEmail">Email</label>
          <input id="profileEmail" type="email" value="${escapeHtml(user.email)}" autocomplete="email" required>
          <div class="err" aria-live="polite"></div>
        </div>
        <div class="profile-password-note">Isi kata sandi baru hanya jika ingin menggantinya.</div>
        <div class="field" id="fNewPassword">
          <label for="profileNewPassword">Kata sandi baru (opsional)</label>
          <input id="profileNewPassword" type="password" autocomplete="new-password" minlength="8" maxlength="128" placeholder="Minimal 8 karakter">
          <div class="err" aria-live="polite"></div>
        </div>
        <div class="field" id="fConfirmPassword">
          <label for="profileConfirmPassword">Ulangi kata sandi baru</label>
          <input id="profileConfirmPassword" type="password" autocomplete="new-password" placeholder="Ulangi kata sandi baru">
          <div class="err" aria-live="polite"></div>
        </div>
        <div class="field" id="fCurrentPassword">
          <label for="profileCurrentPassword">Kata sandi saat ini</label>
          <input id="profileCurrentPassword" type="password" autocomplete="current-password" required>
          <div class="err" aria-live="polite"></div>
        </div>
        <div class="form-error" id="profileFormError" role="alert"></div>
        <button class="btn btn-primary" type="submit">Simpan perubahan</button>
      </form>
    </section>`;

  $('#app').innerHTML = shell('profile', main);
  const form = $('#profileForm');
  form.addEventListener('input', e => {
    const field = e.target.closest('.field');
    if (field) {
      field.classList.remove('invalid');
      $('.err', field).textContent = '';
    }
    $('#profileFormError').textContent = '';
    $('#profileFormError').classList.remove('visible');
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    ['fUsername', 'fEmail', 'fNewPassword', 'fConfirmPassword', 'fCurrentPassword']
      .forEach(id => setAuthFieldError(id, ''));
    $('#profileFormError').textContent = '';
    $('#profileFormError').classList.remove('visible');

    const username = $('#profileUsername').value.trim();
    const email = $('#profileEmail').value.trim().toLowerCase();
    const newPassword = $('#profileNewPassword').value;
    const confirmPassword = $('#profileConfirmPassword').value;
    const currentPassword = $('#profileCurrentPassword').value;
    let firstInvalid = null;

    if (!/^[a-zA-Z0-9._-]{3,30}$/.test(username)) {
      setAuthFieldError('fUsername', 'Username harus 3–30 karakter dan hanya boleh berisi huruf, angka, titik, garis bawah, atau tanda hubung.');
      firstInvalid = $('#profileUsername');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAuthFieldError('fEmail', 'Masukkan alamat email yang valid.');
      firstInvalid = firstInvalid || $('#profileEmail');
    }
    if (newPassword && (newPassword.length < 8 || newPassword.length > 128)) {
      setAuthFieldError('fNewPassword', 'Kata sandi baru harus terdiri dari 8–128 karakter.');
      firstInvalid = firstInvalid || $('#profileNewPassword');
    }
    if (newPassword !== confirmPassword) {
      setAuthFieldError('fConfirmPassword', 'Kata sandi baru belum sama.');
      firstInvalid = firstInvalid || $('#profileConfirmPassword');
    }
    if (!currentPassword) {
      setAuthFieldError('fCurrentPassword', 'Masukkan kata sandi saat ini untuk menyimpan perubahan.');
      firstInvalid = firstInvalid || $('#profileCurrentPassword');
    }
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      const previousEmail = State.user.email;
      const { user: updatedUser, emailChangePending } = await API.updateProfile({
        username, email, currentPassword, newPassword,
      });
      State.user = updatedUser;
      if (localStorage.getItem('ai_remembered_email') === previousEmail) {
        localStorage.setItem('ai_remembered_email', updatedUser.email);
      }
      await syncProgress();
      renderProfile();
      toast(emailChangePending
        ? 'Profil diperbarui. Periksa email baru untuk mengonfirmasi perubahan alamat.'
        : 'Profil berhasil diperbarui.');
    } catch (error) {
      submit.disabled = false;
      const fieldMap = {
        username: 'fUsername',
        email: 'fEmail',
        newPassword: 'fNewPassword',
        currentPassword: 'fCurrentPassword',
      };
      if (fieldMap[error.field]) setAuthFieldError(fieldMap[error.field], error.message);
      else {
        const formError = $('#profileFormError');
        formError.textContent = error.message || 'Profil tidak dapat diperbarui. Periksa koneksi lalu coba lagi.';
        formError.classList.add('visible');
      }
    }
  });
}
