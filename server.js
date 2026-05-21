// ===== SERVER.JS — Express + MySQL Backend for SmartShop AI =====
const express = require('express');
const mysql   = require('mysql2/promise');
const cors    = require('cors');
const path    = require('path');
const os      = require('os');

const app  = express();
const PORT = 3000;

// ── DB Config ──
const DB_CONFIG = {
  host:     'localhost',
  user:     'root',
  password: 'Kri&Satya$19@sql',
  multipleStatements: true,
};
const DB_NAME = 'trendcart_db';

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));  // serve index.html + js/css

// ── Create DB & Tables ──
async function initDB() {
  const conn = await mysql.createConnection(DB_CONFIG);

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  await conn.query(`USE \`${DB_NAME}\``);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            VARCHAR(40)  PRIMARY KEY,
      name          VARCHAR(120) NOT NULL,
      email         VARCHAR(120) NOT NULL UNIQUE,
      username      VARCHAR(60)  NOT NULL UNIQUE,
      password      VARCHAR(120) NOT NULL,
      gender        ENUM('Male','Female') NOT NULL,
      bio           TEXT,
      preferences   JSON,
      view_history  JSON,
      purchases     JSON,
      ratings       JSON,
      registered_at BIGINT
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS password_requests (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      user_id      VARCHAR(40) NOT NULL,
      new_password VARCHAR(120) NOT NULL,
      status       ENUM('pending','approved','rejected') DEFAULT 'pending',
      requested_at BIGINT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id               INT AUTO_INCREMENT PRIMARY KEY,
      user_id          VARCHAR(40) NOT NULL,
      user_name        VARCHAR(120),
      items            JSON NOT NULL,
      total_amount     DECIMAL(10,2) NOT NULL,
      payment_method   ENUM('upi','cod') NOT NULL,
      upi_txn_id       VARCHAR(100),
      delivery_name    VARCHAR(120),
      delivery_phone   VARCHAR(20),
      delivery_address TEXT,
      delivery_city    VARCHAR(80),
      delivery_state   VARCHAR(80),
      delivery_pincode VARCHAR(10),
      status           ENUM('pending','confirmed','shipped','delivered') DEFAULT 'pending',
      created_at       BIGINT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await conn.end();
  console.log('✅ Database & tables ready.');
}

// ── Pool ──
let pool;
async function getPool() {
  if (!pool) {
    pool = mysql.createPool({ ...DB_CONFIG, database: DB_NAME, waitForConnections: true, connectionLimit: 20 });
  }
  return pool;
}

// ───────────────────────────────────────────
//  AUTH ROUTES
// ───────────────────────────────────────────

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { id, name, email, username, password, gender } = req.body;
    if (!name || !email || !username || !password || !gender)
      return res.status(400).json({ ok: false, msg: 'All fields required.' });

    const db = await getPool();
    // Check duplicates
    const [rows] = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?', [username, email]
    );
    if (rows.length) {
      const dup = rows[0];
      return res.status(409).json({ ok: false, msg: 'Username or email already exists.' });
    }

    const userId = id || ('u_' + Date.now() + '_' + Math.random().toString(36).slice(2,7));
    const bio    = `${gender === 'Male' ? 'Mr.' : 'Miss'} ${name} — new member`;
    await db.query(
      `INSERT INTO users (id, name, email, username, password, gender, bio, preferences, view_history, purchases, ratings, registered_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, '[]', '[]', '[]', '{}', ?)`,
      [userId, name, email, username, password, gender, bio, Date.now()]
    );
    const [user] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    res.json({ ok: true, user: formatUser(user[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Server error: ' + err.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = await getPool();
    const [rows] = await db.query(
      'SELECT * FROM users WHERE username = ? AND password = ?', [username, password]
    );
    if (!rows.length) return res.status(401).json({ ok: false, msg: 'Invalid username or password.' });
    res.json({ ok: true, user: formatUser(rows[0]) });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// GET /api/users — all users (admin)
app.get('/api/users', async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.query('SELECT * FROM users ORDER BY registered_at DESC');
    // Also fetch pending password requests
    const [reqs] = await db.query("SELECT * FROM password_requests WHERE status = 'pending'");
    const reqMap = {};
    reqs.forEach(r => { reqMap[r.user_id] = r; });
    const users = rows.map(u => ({
      ...formatUser(u),
      passwordChangeRequest: reqMap[u.id]
        ? { newPassword: reqMap[u.id].new_password, requestedAt: reqMap[u.id].requested_at, status: 'pending', reqId: reqMap[u.id].id }
        : null,
    }));
    res.json({ ok: true, users });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// GET /api/users/:id
app.get('/api/users/:id', async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ ok: false, msg: 'User not found.' });
    res.json({ ok: true, user: formatUser(rows[0]) });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// PUT /api/users/:id — update view_history / purchases / ratings / preferences
app.put('/api/users/:id', async (req, res) => {
  try {
    const db = await getPool();
    const { view_history, purchases, ratings, preferences } = req.body;
    const fields = [];
    const vals   = [];
    if (view_history !== undefined) { fields.push('view_history = ?'); vals.push(JSON.stringify(view_history)); }
    if (purchases    !== undefined) { fields.push('purchases = ?');    vals.push(JSON.stringify(purchases)); }
    if (ratings      !== undefined) { fields.push('ratings = ?');      vals.push(JSON.stringify(ratings)); }
    if (preferences  !== undefined) { fields.push('preferences = ?');  vals.push(JSON.stringify(preferences)); }
    if (!fields.length) return res.json({ ok: true });
    vals.push(req.params.id);
    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, vals);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// ───────────────────────────────────────────
//  PASSWORD CHANGE REQUESTS
// ───────────────────────────────────────────

// POST /api/password-requests
app.post('/api/password-requests', async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    const db = await getPool();
    const [rows] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (!rows.length) return res.status(404).json({ ok: false, msg: 'Username not found.' });
    const userId = rows[0].id;
    // Delete old pending request for this user
    await db.query("DELETE FROM password_requests WHERE user_id = ? AND status = 'pending'", [userId]);
    await db.query(
      'INSERT INTO password_requests (user_id, new_password, status, requested_at) VALUES (?, ?, ?, ?)',
      [userId, newPassword, 'pending', Date.now()]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// PUT /api/password-requests/:userId/approve
app.put('/api/password-requests/:userId/approve', async (req, res) => {
  try {
    const db = await getPool();
    const [reqs] = await db.query(
      "SELECT * FROM password_requests WHERE user_id = ? AND status = 'pending' LIMIT 1",
      [req.params.userId]
    );
    if (!reqs.length) return res.status(404).json({ ok: false, msg: 'No pending request.' });
    const { new_password, id: reqId } = reqs[0];
    await db.query('UPDATE users SET password = ? WHERE id = ?', [new_password, req.params.userId]);
    await db.query("UPDATE password_requests SET status = 'approved' WHERE id = ?", [reqId]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// PUT /api/password-requests/:userId/reject
app.put('/api/password-requests/:userId/reject', async (req, res) => {
  try {
    const db = await getPool();
    await db.query("UPDATE password_requests SET status = 'rejected' WHERE user_id = ? AND status = 'pending'", [req.params.userId]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// ───────────────────────────────────────────
//  ORDERS
// ───────────────────────────────────────────

// POST /api/orders
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, userName, items, totalAmount, paymentMethod, upiTxnId,
            deliveryName, deliveryPhone, deliveryAddress, deliveryCity, deliveryState, deliveryPincode } = req.body;
    const db = await getPool();
    const [result] = await db.query(
      `INSERT INTO orders
        (user_id, user_name, items, total_amount, payment_method, upi_txn_id,
         delivery_name, delivery_phone, delivery_address, delivery_city, delivery_state, delivery_pincode, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [userId, userName, JSON.stringify(items), totalAmount, paymentMethod, upiTxnId || null,
       deliveryName, deliveryPhone, deliveryAddress, deliveryCity, deliveryState, deliveryPincode, Date.now()]
    );
    // Also update purchases in users table
    const [userRow] = await db.query('SELECT purchases FROM users WHERE id = ?', [userId]);
    if (userRow.length) {
      let purchases = safeJSON(userRow[0].purchases, []);
      items.forEach(item => { if (!purchases.includes(item.id)) purchases.push(item.id); });
      await db.query('UPDATE users SET purchases = ? WHERE id = ?', [JSON.stringify(purchases), userId]);
    }
    res.json({ ok: true, orderId: result.insertId });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// GET /api/orders — all (admin)
app.get('/api/orders', async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json({ ok: true, orders: rows.map(o => ({ ...o, items: JSON.parse(o.items || '[]') })) });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// GET /api/orders/user/:userId
app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId]);
    res.json({ ok: true, orders: rows.map(o => ({ ...o, items: JSON.parse(o.items || '[]') })) });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// PUT /api/orders/:id/status — update delivery status (admin)
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending','confirmed','shipped','delivered'];
    if (!allowed.includes(status)) return res.status(400).json({ ok: false, msg: 'Invalid status.' });
    const db = await getPool();
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// ───────────────────────────────────────────
//  HELPERS
// ───────────────────────────────────────────
// mysql2 returns JSON columns as already-parsed objects — handle both cases
function safeJSON(val, fallback) {
  if (val === null || val === undefined) return fallback;
  if (typeof val !== 'string') return val; // already a JS object/array
  try { return JSON.parse(val); } catch { return fallback; }
}

function formatUser(u) {
  return {
    id:           u.id,
    name:         u.name,
    email:        u.email,
    username:     u.username,
    password:     u.password,
    gender:       u.gender,
    bio:          u.bio,
    preferences:  safeJSON(u.preferences,  []),
    viewHistory:  safeJSON(u.view_history, []),
    purchases:    safeJSON(u.purchases,    []),
    ratings:      safeJSON(u.ratings,      {}),
    registeredAt: u.registered_at,
  };
}

// ── Local IP Helper ──
function getLocalIP() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

// ── Start ──
initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    const ip = getLocalIP();
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║       SmartShop AI — Server Running             ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║  Local:    http://localhost:${PORT}                 ║`);
    console.log(`║  Network:  http://${ip}:${PORT}              ║`);
    console.log('║                                                  ║');
    console.log('║  Share the Network URL with phones/laptops       ║');
    console.log('║  on the same Wi-Fi to access the app!            ║');
    console.log('╚══════════════════════════════════════════════════╝\n');
  });
}).catch(err => {
  console.error('❌ Failed to connect to MySQL:', err.message);
  console.error('Make sure MySQL is running and credentials are correct.');
  process.exit(1);
});
