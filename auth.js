// ===== AUTH.JS — Authentication using MySQL API =====

const API = `http://${window.location.hostname}:3000/api`;
const ADMIN_CREDENTIALS = { username: 'Trendcart Innovators', password: 'Admin@101' };
const SESSION_KEY = 'tc_session';

// ── Auth State ──
const AUTH_STATE = { isAdmin: false, currentAuthUser: null };

// ── Session ──
const Session = {
  get()       { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; } },
  save(s)     { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); },
  clear()     { localStorage.removeItem(SESSION_KEY); },
};

// ── API Client ──
const AuthManager = {
  async register({ id, name, email, username, password, gender }) {
    try {
      const r = await fetch(`${API}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, email, username, password, gender }),
      });
      return await r.json();
    } catch { return { ok: false, msg: 'Cannot reach server. Is it running? (node server.js)' }; }
  },
  async login(username, password) {
    try {
      const r = await fetch(`${API}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      return await r.json();
    } catch { return { ok: false, msg: 'Cannot reach server. Is it running? (node server.js)' }; }
  },
  adminLogin(username, password) {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password)
      return { ok: true };
    return { ok: false, msg: 'Invalid admin credentials.' };
  },
  async getUsers() {
    try {
      const r = await fetch(`${API}/users`);
      const d = await r.json();
      return d.ok ? d.users : [];
    } catch { return []; }
  },
  async getUserById(id) {
    try {
      const r = await fetch(`${API}/users/${id}`);
      const d = await r.json();
      return d.ok ? d.user : null;
    } catch { return null; }
  },
  async updateUser(id, fields) {
    try {
      await fetch(`${API}/users/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
    } catch {}
  },
  async requestPasswordChange(username, newPassword) {
    try {
      const r = await fetch(`${API}/password-requests`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, newPassword }),
      });
      return await r.json();
    } catch { return { ok: false, msg: 'Server unreachable.' }; }
  },
  async approvePasswordChange(userId) {
    try {
      await fetch(`${API}/password-requests/${userId}/approve`, { method: 'PUT' });
    } catch {}
  },
  async rejectPasswordChange(userId) {
    try {
      await fetch(`${API}/password-requests/${userId}/reject`, { method: 'PUT' });
    } catch {}
  },
  async placeOrder(orderData) {
    try {
      const r = await fetch(`${API}/orders`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      return await r.json();
    } catch { return { ok: false, msg: 'Server unreachable.' }; }
  },
  async getOrders() {
    try {
      const r = await fetch(`${API}/orders`);
      const d = await r.json();
      return d.ok ? d.orders : [];
    } catch { return []; }
  },
  async getUserOrders(userId) {
    try {
      const r = await fetch(`${API}/orders/user/${userId}`);
      const d = await r.json();
      return d.ok ? d.orders : [];
    } catch { return []; }
  },
  clearSession() { Session.clear(); },
  saveSession(s) { Session.save(s); },
  getSession()   { return Session.get(); },
};

// ── Auth Screen ──
function renderAuthScreen() {
  const screen = document.getElementById('auth-screen');
  screen.innerHTML = `
  <div class="auth-bg">
    <div class="auth-orb auth-orb-1"></div>
    <div class="auth-orb auth-orb-2"></div>
    <div class="auth-orb auth-orb-3"></div>
  </div>
  <div class="auth-card">
    <div class="auth-logo">
      <span class="auth-logo-icon">✦</span>
      <span class="auth-logo-text">SmartShop<span class="auth-logo-accent">AI</span></span>
    </div>
    <p class="auth-tagline">Powered by Trendcart Innovators</p>

    <div class="auth-role-tabs">
      <button class="role-tab active" id="tab-user"  onclick="switchRoleTab('user')">👤 User</button>
      <button class="role-tab"        id="tab-admin" onclick="switchRoleTab('admin')">🛡️ Admin</button>
    </div>

    <!-- USER PANEL -->
    <div id="user-panel" class="auth-panel">
      <div class="auth-sub-tabs">
        <button class="sub-tab active" id="subtab-signin"   onclick="switchSubTab('signin')">Sign In</button>
        <button class="sub-tab"        id="subtab-register" onclick="switchSubTab('register')">Create Account</button>
      </div>

      <!-- Sign In -->
      <form id="signin-form" class="auth-form" onsubmit="handleUserLogin(event)">
        <div class="auth-error" id="signin-error"></div>
        <div class="form-group">
          <label>Username</label>
          <input type="text" id="signin-username" class="auth-input" placeholder="Enter username" required autocomplete="username">
        </div>
        <div class="form-group">
          <label>Password</label>
          <div class="input-eye-wrap">
            <input type="password" id="signin-password" class="auth-input" placeholder="Enter password" required autocomplete="current-password">
            <button type="button" class="eye-btn" onclick="togglePwd('signin-password',this)">👁</button>
          </div>
        </div>
        <button type="submit" class="auth-btn" id="signin-submit-btn">Sign In →</button>
        <p class="auth-foot">Forgot password? <a href="#" onclick="showPwdChangeForm(event)">Request change</a></p>
      </form>

      <!-- Register -->
      <form id="register-form" class="auth-form hidden" onsubmit="handleRegister(event)">
        <div class="auth-error" id="register-error"></div>
        <div class="form-row">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="reg-name" class="auth-input" placeholder="Your full name" required>
          </div>
          <div class="form-group">
            <label>Gender</label>
            <select id="reg-gender" class="auth-input" required>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="reg-email" class="auth-input" placeholder="your@email.com" required>
        </div>
        <div class="form-group">
          <label>Username</label>
          <input type="text" id="reg-username" class="auth-input" placeholder="Choose a username" required>
        </div>
        <div class="form-group">
          <label>Password</label>
          <div class="input-eye-wrap">
            <input type="password" id="reg-password" class="auth-input" placeholder="Min 6 characters" required minlength="6">
            <button type="button" class="eye-btn" onclick="togglePwd('reg-password',this)">👁</button>
          </div>
        </div>
        <button type="submit" class="auth-btn" id="register-submit-btn">Create Account →</button>
      </form>

      <!-- Password Change Request -->
      <form id="pwdchange-form" class="auth-form hidden" onsubmit="handlePwdChangeRequest(event)">
        <div class="auth-error" id="pwdchange-error"></div>
        <h3 style="color:var(--text-muted);margin-bottom:12px;font-size:0.95rem;">Request Password Change</h3>
        <div class="form-group">
          <label>Username</label>
          <input type="text" id="pwdchg-username" class="auth-input" placeholder="Your username" required>
        </div>
        <div class="form-group">
          <label>New Password</label>
          <div class="input-eye-wrap">
            <input type="password" id="pwdchg-newpwd" class="auth-input" placeholder="New password" required minlength="6">
            <button type="button" class="eye-btn" onclick="togglePwd('pwdchg-newpwd',this)">👁</button>
          </div>
        </div>
        <button type="submit" class="auth-btn">Send Request →</button>
        <p class="auth-foot"><a href="#" onclick="cancelPwdChange(event)">← Back to Sign In</a></p>
      </form>
    </div>

    <!-- ADMIN PANEL -->
    <div id="admin-panel" class="auth-panel hidden">
      <form id="admin-form" class="auth-form" onsubmit="handleAdminLogin(event)">
        <div class="auth-error" id="admin-error"></div>
        <div class="auth-admin-badge">🛡️ Administrator Access</div>
        <div class="form-group">
          <label>Admin Username</label>
          <input type="text" id="admin-username" class="auth-input" placeholder="Admin username" required autocomplete="off">
        </div>
        <div class="form-group">
          <label>Password</label>
          <div class="input-eye-wrap">
            <input type="password" id="admin-password" class="auth-input" placeholder="Admin password" required>
            <button type="button" class="eye-btn" onclick="togglePwd('admin-password',this)">👁</button>
          </div>
        </div>
        <button type="submit" class="auth-btn admin-btn">Admin Sign In →</button>
      </form>
    </div>
  </div>`;
}

// ── Tab helpers ──
function switchRoleTab(role) {
  document.getElementById('tab-user').classList.toggle('active',  role === 'user');
  document.getElementById('tab-admin').classList.toggle('active', role === 'admin');
  document.getElementById('user-panel').classList.toggle('hidden',  role !== 'user');
  document.getElementById('admin-panel').classList.toggle('hidden', role !== 'admin');
}
function switchSubTab(tab) {
  document.getElementById('subtab-signin').classList.toggle('active',   tab === 'signin');
  document.getElementById('subtab-register').classList.toggle('active', tab === 'register');
  document.getElementById('signin-form').classList.toggle('hidden',   tab !== 'signin');
  document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
  document.getElementById('pwdchange-form').classList.add('hidden');
}
function showPwdChangeForm(e) {
  e && e.preventDefault();
  document.getElementById('signin-form').classList.add('hidden');
  document.getElementById('register-form').classList.add('hidden');
  document.getElementById('pwdchange-form').classList.remove('hidden');
}
function cancelPwdChange(e) {
  e && e.preventDefault();
  switchSubTab('signin');
}
function togglePwd(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
  else { inp.type = 'password'; btn.textContent = '👁'; }
}
function setAuthError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = msg ? 'block' : 'none';
}
function setBtnLoading(id, loading) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait...' : btn.dataset.label;
}

// ── Form Handlers ──
async function handleUserLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('signin-submit-btn');
  btn.disabled = true; btn.textContent = 'Signing in...';
  const username = document.getElementById('signin-username').value.trim();
  const password = document.getElementById('signin-password').value;
  const result = await AuthManager.login(username, password);
  btn.disabled = false; btn.textContent = 'Sign In →';
  if (!result.ok) { setAuthError('signin-error', result.msg); return; }
  setAuthError('signin-error', '');
  AUTH_STATE.isAdmin = false;
  AUTH_STATE.currentAuthUser = result.user;
  AuthManager.saveSession({ type: 'user', userId: result.user.id });
  launchApp();
}

async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('register-submit-btn');
  btn.disabled = true; btn.textContent = 'Creating account...';
  const name     = document.getElementById('reg-name').value.trim();
  const gender   = document.getElementById('reg-gender').value;
  const email    = document.getElementById('reg-email').value.trim();
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;
  if (!gender) { setAuthError('register-error', 'Please select a gender.'); btn.disabled=false; btn.textContent='Create Account →'; return; }
  const id = 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
  const result = await AuthManager.register({ id, name, email, username, password, gender });
  btn.disabled = false; btn.textContent = 'Create Account →';
  if (!result.ok) { setAuthError('register-error', result.msg); return; }
  setAuthError('register-error', '');
  AUTH_STATE.isAdmin = false;
  AUTH_STATE.currentAuthUser = result.user;
  AuthManager.saveSession({ type: 'user', userId: result.user.id });
  launchApp();
}

function handleAdminLogin(e) {
  e.preventDefault();
  const username = document.getElementById('admin-username').value.trim();
  const password = document.getElementById('admin-password').value;
  const result   = AuthManager.adminLogin(username, password);
  if (!result.ok) { setAuthError('admin-error', result.msg); return; }
  setAuthError('admin-error', '');
  AUTH_STATE.isAdmin = true;
  AUTH_STATE.currentAuthUser = null;
  AuthManager.saveSession({ type: 'admin' });
  launchApp();
}

async function handlePwdChangeRequest(e) {
  e.preventDefault();
  const username = document.getElementById('pwdchg-username').value.trim();
  const newPwd   = document.getElementById('pwdchg-newpwd').value;
  const result   = await AuthManager.requestPasswordChange(username, newPwd);
  if (!result.ok) { setAuthError('pwdchange-error', result.msg); return; }
  setAuthError('pwdchange-error', '');
  alert('✅ Password change request submitted! Admin will review it soon.');
  cancelPwdChange();
}

// ── Launch App ──
function launchApp() {
  const authScreen = document.getElementById('auth-screen');
  authScreen.style.opacity   = '0';
  authScreen.style.transform = 'scale(1.05)';
  setTimeout(() => {
    authScreen.style.display = 'none';
    initApp();
  }, 400);
}

// ── Restore session on reload ──
async function checkExistingSession() {
  const session = AuthManager.getSession();
  if (!session) return false;
  if (session.type === 'admin') {
    AUTH_STATE.isAdmin = true;
    AUTH_STATE.currentAuthUser = null;
    launchApp(); return true;
  }
  if (session.type === 'user' && session.userId) {
    const user = await AuthManager.getUserById(session.userId);
    if (user) {
      AUTH_STATE.isAdmin = false;
      AUTH_STATE.currentAuthUser = user;
      launchApp(); return true;
    }
  }
  AuthManager.clearSession();
  return false;
}

// ── Boot ──
document.addEventListener('DOMContentLoaded', async () => {
  renderAuthScreen();
  const sessionRestored = await checkExistingSession();
  if (!sessionRestored) {
    document.getElementById('auth-screen').style.display = 'flex';
  }
});
