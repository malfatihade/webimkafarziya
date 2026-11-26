// Supabase-backed API for the static GitHub Pages frontend.
const API = (() => {
  const config = window.SUPABASE_CONFIG || {};
  const supabaseLibrary = window.supabase;
  const isConfigured = typeof config.url === 'string'
    && /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.url)
    && typeof config.anonKey === 'string'
    && config.anonKey.length > 20
    && !config.anonKey.includes('YOUR_');
  const client = isConfigured && supabaseLibrary && typeof supabaseLibrary.createClient === 'function'
    ? supabaseLibrary.createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
    : null;

  function makeError(message, field, status, code){
    const error = new Error(message || 'Permintaan tidak dapat diproses.');
    error.field = field;
    error.status = status;
    error.code = code;
    return error;
  }

  function ensureClient(){
    if (!client) {
      throw makeError(
        'Konfigurasi Supabase belum lengkap. Isi URL proyek dan anon key di js/supabase-config.js.',
        'config',
        503,
      );
    }
    return client;
  }

  function asError(error, field){
    const message = error && error.message ? error.message : 'Permintaan tidak dapat diproses.';
    const code = error && error.code ? error.code : '';
    const duplicateUsername = /username.*(already|duplicate|unique)|duplicate key.*username/i.test(message);
    const mappedField = duplicateUsername ? 'username' : field;
    return makeError(message, mappedField, error && error.status, code);
  }

  async function getPublicUser(authUser){
    const { data, error } = await ensureClient()
      .from('profiles')
      .select('username')
      .eq('id', authUser.id)
      .single();
    if (error) throw asError(error);
    return { email: authUser.email, username: data.username };
  }

  async function loginByUsername(username, password){
    const baseUrl = config.url.replace(/\/+$/, '');
    let response;
    try {
      response = await fetch(`${baseUrl}/functions/v1/login-by-username`, {
        method: 'POST',
        headers: {
          apikey: config.anonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.toLowerCase(), password }),
      });
    } catch (error) {
      throw makeError('Tidak dapat menghubungi layanan login. Periksa koneksi lalu coba lagi.', 'password');
    }

    let result;
    try {
      result = await response.json();
    } catch (error) {
      throw makeError('Respons layanan login tidak valid.', 'password', response.status);
    }
    if (!response.ok) {
      throw makeError(result.error || 'Username atau kata sandi tidak sesuai.', result.field || 'password', response.status);
    }

    const { data, error } = await ensureClient().auth.setSession(result.session);
    if (error) throw asError(error, 'password');
    return data.user;
  }

  return {
    async register(payload){
      const { data, error } = await ensureClient().auth.signUp({
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        options: { data: { username: payload.username.trim().toLowerCase() } },
      });
      if (error) {
        const duplicateUsername = /username.*(already|duplicate|unique)|duplicate key.*username/i.test(error.message);
        const duplicateEmail = /already registered|already exists|user exists/i.test(error.message);
        throw asError(error, duplicateUsername ? 'username' : duplicateEmail ? 'email' : 'password');
      }
      return { ok: true, confirmationRequired: !data.session };
    },

    async login(payload){
      const identifier = (payload.identifier || payload.email || '').trim();
      let authUser;
      if (identifier.includes('@')) {
        const { data, error } = await ensureClient().auth.signInWithPassword({
          email: identifier.toLowerCase(),
          password: payload.password,
        });
        if (error) throw asError(error, 'password');
        authUser = data.user;
      } else {
        authUser = await loginByUsername(identifier, payload.password);
      }
      return { user: await getPublicUser(authUser) };
    },

    async requestPasswordReset(email){
      const redirectUrl = new URL('./', document.baseURI);
      redirectUrl.searchParams.set('flow', 'password-reset');
      const redirectTo = redirectUrl.toString();
      const { error } = await ensureClient().auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw asError(error, 'email');
      return { ok: true };
    },

    async resetPassword(payload){
      const { error } = await ensureClient().auth.updateUser({ password: payload.password });
      if (error) throw asError(error, 'password');
      return { ok: true };
    },

    async getSession(){
      const { data, error } = await ensureClient().auth.getSession();
      if (error) throw asError(error);
      return { user: data.session ? await getPublicUser(data.session.user) : null };
    },

    async updateProfile(payload){
      const auth = ensureClient().auth;
      const { data: current, error: currentError } = await auth.getUser();
      if (currentError || !current.user) {
        throw asError(currentError || new Error('Silakan login kembali.'));
      }

      const { error: passwordError } = await auth.signInWithPassword({
        email: current.user.email,
        password: payload.currentPassword,
      });
      if (passwordError) throw asError(passwordError, 'currentPassword');

      const username = payload.username.trim().toLowerCase();
      const { data: available, error: availabilityError } = await ensureClient()
        .rpc('username_available', { candidate_username: username });
      if (availabilityError) throw asError(availabilityError, 'username');
      if (!available) {
        throw makeError('Username ini sudah digunakan.', 'username', 409);
      }

      const changes = {};
      if (payload.email.trim().toLowerCase() !== current.user.email) {
        changes.email = payload.email.trim().toLowerCase();
      }
      if (payload.newPassword) changes.password = payload.newPassword;
      if (Object.keys(changes).length) {
        const { error } = await auth.updateUser(changes);
        if (error) {
          const field = changes.email ? 'email' : 'newPassword';
          throw asError(error, field);
        }
      }

      const { data: profile, error: profileError } = await ensureClient()
        .from('profiles')
        .update({ username })
        .eq('id', current.user.id)
        .select('username')
        .single();
      if (profileError) throw asError(profileError, 'username');

      return {
        user: { email: current.user.email, username: profile.username },
        emailChangePending: Boolean(changes.email),
      };
    },

    async logout(){
      const { error } = await ensureClient().auth.signOut({ scope: 'local' });
      if (error) throw asError(error);
      return { ok: true };
    },

    async getProgress(){
      const { data: authData, error: authError } = await ensureClient().auth.getUser();
      if (authError || !authData.user) throw asError(authError || new Error('Silakan login kembali.'));

      const { data, error } = await ensureClient()
        .from('progress')
        .select('module_id, lesson_id')
        .eq('user_id', authData.user.id);
      if (error) throw asError(error);

      return data.reduce((progress, item) => {
        progress[item.module_id] = progress[item.module_id] || [];
        progress[item.module_id].push(item.lesson_id);
        return progress;
      }, {});
    },

    async setProgress(payload){
      const { data: authData, error: authError } = await ensureClient().auth.getUser();
      if (authError || !authData.user) throw asError(authError || new Error('Silakan login kembali.'));

      let result;
      if (payload.done) {
        result = await ensureClient().from('progress').upsert({
          user_id: authData.user.id,
          module_id: payload.moduleId,
          lesson_id: payload.lessonId,
        }, { onConflict: 'user_id,module_id,lesson_id' });
      } else {
        result = await ensureClient()
          .from('progress')
          .delete()
          .eq('user_id', authData.user.id)
          .eq('module_id', payload.moduleId)
          .eq('lesson_id', payload.lessonId);
      }
      if (result.error) throw asError(result.error);
      return { ok: true };
    },
  };
})();
