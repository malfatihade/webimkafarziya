// server.js — Backend API sederhana untuk Web Pembelajaran AI
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'modules.json');
const SESSION_COOKIE = 'ai_learning_session';
const sessions = new Map();
const dummySalt = crypto.randomBytes(16);

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

// ---- Helper baca/tulis "database" JSON ----
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify({ progress: {}, users: {} }, null, 2));
  }
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  if (!db.progress || typeof db.progress !== 'object' || Array.isArray(db.progress)) db.progress = {};
  if (!db.users || typeof db.users !== 'object' || Array.isArray(db.users)) db.users = {};
  return db;
}
function writeDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function getSessionToken(req) {
  const cookie = (req.headers.cookie || '').split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${SESSION_COOKIE}=`));
  return cookie ? cookie.slice(SESSION_COOKIE.length + 1) : '';
}

function getSessionEmail(req) {
  return sessions.get(getSessionToken(req)) || null;
}

function getPublicUser(email, user) {
  return {
    email,
    username: user.username || email.split('@')[0],
  };
}

function findUserByUsername(users, username) {
  const normalized = username.toLowerCase();
  return Object.entries(users).find(([, user]) =>
    (user.username || '').toLowerCase() === normalized
  ) || null;
}

function verifyPassword(user, password) {
  const salt = Buffer.from(user.salt, 'hex');
  const actualHash = crypto.scryptSync(password, salt, 64);
  const expectedHash = Buffer.from(user.passwordHash, 'hex');
  return expectedHash.length === actualHash.length
    && crypto.timingSafeEqual(actualHash, expectedHash);
}

function setSessionCookie(req, res, token, maxAge) {
  const secure = req.secure ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`);
}

// ---- API: Account registration and login ----
app.post('/api/auth/register', (req, res) => {
  const body = req.body || {};
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const normalizedUsername = username.toLowerCase();
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!/^[a-zA-Z0-9._-]{3,30}$/.test(username)) {
    return res.status(400).json({ field: 'username', error: 'Username harus 3–30 karakter dan hanya boleh berisi huruf, angka, titik, garis bawah, atau tanda hubung.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ field: 'email', error: 'Masukkan alamat email yang valid.' });
  }
  if (password.length < 8 || password.length > 128) {
    return res.status(400).json({ field: 'password', error: 'Kata sandi harus terdiri dari 8–128 karakter.' });
  }

  const db = readDB();
  if (db.users[email]) {
    return res.status(409).json({ field: 'email', error: 'Email ini sudah terdaftar.' });
  }
  if (findUserByUsername(db.users, normalizedUsername)) {
    return res.status(409).json({ field: 'username', error: 'Username ini sudah digunakan.' });
  }

  const salt = crypto.randomBytes(16);
  const passwordHash = crypto.scryptSync(password, salt, 64);
  db.users[email] = {
    username: normalizedUsername,
    salt: salt.toString('hex'),
    passwordHash: passwordHash.toString('hex'),
  };
  writeDB(db);
  res.status(201).json({ ok: true });
});

app.post('/api/auth/login', (req, res) => {
  const body = req.body || {};
  const identifier = typeof body.identifier === 'string'
    ? body.identifier.trim()
    : typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!identifier || identifier.length > 254) {
    return res.status(400).json({ field: 'identifier', error: 'Masukkan email atau username.' });
  }
  if (!password || password.length > 128) {
    return res.status(400).json({ field: 'password', error: 'Masukkan kata sandi.' });
  }

  const db = readDB();
  let email = identifier.toLowerCase();
  let user = db.users[email];
  if (!user && !identifier.includes('@')) {
    const match = findUserByUsername(db.users, identifier);
    if (match) [email, user] = match;
  }
  const salt = user ? Buffer.from(user.salt, 'hex') : dummySalt;
  const actualHash = crypto.scryptSync(password, salt, 64);
  const expectedHash = user ? Buffer.from(user.passwordHash, 'hex') : Buffer.alloc(64);
  const valid = expectedHash.length === actualHash.length && crypto.timingSafeEqual(actualHash, expectedHash);

  if (!user || !valid) {
    return res.status(401).json({ field: 'password', error: 'Email/username atau kata sandi tidak sesuai.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, email);
  setSessionCookie(req, res, token, 60 * 60 * 24);
  res.json({ user: getPublicUser(email, user) });
});

app.post('/api/auth/password-reset', async (req, res) => {
  const body = req.body || {};
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ field: 'email', error: 'Masukkan alamat email yang valid.' });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM, APP_BASE_URL } = process.env;
  const smtpPort = Number(SMTP_PORT);
  if (!SMTP_HOST || !Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535
      || !['true', 'false'].includes(SMTP_SECURE) || !SMTP_USER || !SMTP_PASS || !SMTP_FROM || !APP_BASE_URL) {
    return res.status(503).json({ error: 'Layanan pemulihan email belum tersedia saat ini. Silakan coba lagi nanti.' });
  }
  let baseUrl;
  try {
    baseUrl = new URL(APP_BASE_URL);
  } catch (error) {
    return res.status(503).json({ error: 'Konfigurasi APP_BASE_URL tidak valid.' });
  }
  if (!['http:', 'https:'].includes(baseUrl.protocol) || baseUrl.username || baseUrl.password) {
    return res.status(503).json({ error: 'Konfigurasi APP_BASE_URL tidak valid.' });
  }

  const db = readDB();
  const user = db.users[email];
  if (!user) {
    return res.status(202).json({ ok: true });
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
  user.resetTokenExpiresAt = Date.now() + 60 * 60 * 1000;
  writeDB(db);

  const resetUrl = new URL(baseUrl.toString());
  resetUrl.hash = `reset=${token}`;
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: smtpPort,
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: 'Atur ulang kata sandi AI Learning',
      text: `Gunakan tautan berikut untuk mengatur ulang kata sandi Anda. Tautan berlaku selama satu jam dan hanya dapat digunakan sekali:\n\n${resetUrl.toString()}\n\nJika Anda tidak meminta reset, abaikan email ini.`,
    });
  } catch (error) {
    delete user.resetTokenHash;
    delete user.resetTokenExpiresAt;
    writeDB(db);
    console.error('Gagal mengirim email pemulihan kata sandi:', error.message);
    return res.status(502).json({ error: 'Email pemulihan tidak dapat dikirim saat ini. Silakan coba lagi nanti.' });
  }
  res.status(202).json({ ok: true });
});

app.post('/api/auth/password-reset/confirm', (req, res) => {
  const body = req.body || {};
  const token = typeof body.token === 'string' ? body.token : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return res.status(400).json({ field: 'token', error: 'Tautan reset tidak valid atau sudah kedaluwarsa.' });
  }
  if (password.length < 8 || password.length > 128) {
    return res.status(400).json({ field: 'password', error: 'Kata sandi harus terdiri dari 8–128 karakter.' });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest();
  const db = readDB();
  const userEntry = Object.entries(db.users).find(([, user]) => {
    if (!user.resetTokenHash || !/^[a-f0-9]{64}$/.test(user.resetTokenHash)) return false;
    const storedHash = Buffer.from(user.resetTokenHash, 'hex');
    return storedHash.length === tokenHash.length && crypto.timingSafeEqual(storedHash, tokenHash);
  });
  const user = userEntry && userEntry[1];
  if (!user || !Number.isFinite(user.resetTokenExpiresAt) || user.resetTokenExpiresAt <= Date.now()) {
    return res.status(400).json({ field: 'token', error: 'Tautan reset tidak valid atau sudah kedaluwarsa.' });
  }

  const salt = crypto.randomBytes(16);
  user.salt = salt.toString('hex');
  user.passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');
  delete user.resetTokenHash;
  delete user.resetTokenExpiresAt;
  writeDB(db);
  for (const [sessionToken, sessionEmail] of sessions) {
    if (sessionEmail === userEntry[0]) sessions.delete(sessionToken);
  }
  res.json({ ok: true });
});

app.get('/api/auth/session', (req, res) => {
  const email = getSessionEmail(req);
  const user = email ? readDB().users[email] : null;
  res.json({ user: user ? getPublicUser(email, user) : null });
});

app.patch('/api/auth/profile', (req, res) => {
  const email = getSessionEmail(req);
  if (!email) return res.status(401).json({ error: 'Silakan login kembali.' });

  const body = req.body || {};
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const normalizedUsername = username.toLowerCase();
  const updatedEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

  if (!/^[a-zA-Z0-9._-]{3,30}$/.test(username)) {
    return res.status(400).json({ field: 'username', error: 'Username harus 3–30 karakter dan hanya boleh berisi huruf, angka, titik, garis bawah, atau tanda hubung.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedEmail)) {
    return res.status(400).json({ field: 'email', error: 'Masukkan alamat email yang valid.' });
  }
  if (newPassword && (newPassword.length < 8 || newPassword.length > 128)) {
    return res.status(400).json({ field: 'newPassword', error: 'Kata sandi baru harus terdiri dari 8–128 karakter.' });
  }

  const db = readDB();
  const user = db.users[email];
  if (!user) return res.status(401).json({ error: 'Akun tidak ditemukan. Silakan login kembali.' });
  if (!currentPassword || !verifyPassword(user, currentPassword)) {
    return res.status(400).json({ field: 'currentPassword', error: 'Kata sandi saat ini tidak sesuai.' });
  }
  if (updatedEmail !== email && db.users[updatedEmail]) {
    return res.status(409).json({ field: 'email', error: 'Email ini sudah digunakan akun lain.' });
  }
  const usernameOwner = findUserByUsername(db.users, normalizedUsername);
  if (usernameOwner && usernameOwner[0] !== email) {
    return res.status(409).json({ field: 'username', error: 'Username ini sudah digunakan.' });
  }

  user.username = normalizedUsername;
  if (newPassword) {
    const salt = crypto.randomBytes(16);
    user.salt = salt.toString('hex');
    user.passwordHash = crypto.scryptSync(newPassword, salt, 64).toString('hex');
  }
  if (updatedEmail !== email) {
    db.users[updatedEmail] = user;
    delete db.users[email];
    if (db.progress[email]) {
      db.progress[updatedEmail] = db.progress[email];
      delete db.progress[email];
    }
    for (const [token, sessionEmail] of sessions) {
      if (sessionEmail === email) sessions.set(token, updatedEmail);
    }
  }
  writeDB(db);
  res.json({ user: getPublicUser(updatedEmail, user) });
});

app.post('/api/auth/logout', (req, res) => {
  sessions.delete(getSessionToken(req));
  setSessionCookie(req, res, '', 0);
  res.json({ ok: true });
});

// ---- API: Progress (self-paced tracking) ----
// Body: { userId, moduleId, lessonId, done }
app.post('/api/progress', (req, res) => {
  const email = getSessionEmail(req);
  if (!email) return res.status(401).json({ error: 'Silakan login kembali.' });

  const { userId, moduleId, lessonId, done } = req.body || {};
  if (userId !== email) return res.status(403).json({ error: 'Tidak memiliki akses ke progress ini.' });
  if (!moduleId || !lessonId) {
    return res.status(400).json({ error: 'moduleId & lessonId wajib diisi' });
  }
  const db = readDB();
  db.progress[email] = db.progress[email] || {};
  db.progress[email][moduleId] = db.progress[email][moduleId] || [];
  const arr = db.progress[email][moduleId];

  if (done) {
    if (!arr.includes(lessonId)) arr.push(lessonId);
  } else {
    const idx = arr.indexOf(lessonId);
    if (idx > -1) arr.splice(idx, 1);
  }
  writeDB(db);
  res.json({ ok: true, progress: db.progress[email] });
});

// Ambil semua progress user
app.get('/api/progress/:userId', (req, res) => {
  const email = getSessionEmail(req);
  if (!email) return res.status(401).json({ error: 'Silakan login kembali.' });
  if (req.params.userId.toLowerCase() !== email) {
    return res.status(403).json({ error: 'Tidak memiliki akses ke progress ini.' });
  }
  const db = readDB();
  res.json(db.progress[email] || {});
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Endpoint API tidak ditemukan.' });
});

// ---- SPA fallback: semua route non-API diarahkan ke index.html ----
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ AI Learning Web berjalan di http://localhost:${PORT}`);
});