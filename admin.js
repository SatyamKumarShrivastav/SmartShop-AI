// ===== ADMIN.JS — Admin Panel (async API version) =====

async function renderAdminView() {
  const container = document.getElementById('view-admin');
  if (!container) return;
  container.innerHTML = `<div class="admin-header">
    <div>
      <h1 class="page-title">🛡️ Admin Panel</h1>
      <p class="page-subtitle">Trendcart Innovators — System Control Center</p>
    </div>
    <div class="admin-stats-row" id="admin-stats-row">
      <div class="admin-stat-pill">⏳ Loading...</div>
    </div>
  </div>
  <div class="admin-tabs">
    <button class="admin-tab active" onclick="showAdminTab('users',this)">👥 Users</button>
    <button class="admin-tab"        onclick="showAdminTab('products',this)">🛍️ Products</button>
    <button class="admin-tab"        onclick="showAdminTab('orders',this)">📦 Orders</button>
    <button class="admin-tab"        onclick="showAdminTab('dataset',this)">📊 Dataset</button>
  </div>
  <div id="admin-tab-users"    class="admin-tab-content"><div class="empty-state">⏳ Loading users...</div></div>
  <div id="admin-tab-products" class="admin-tab-content hidden">${renderProductsTable()}</div>
  <div id="admin-tab-orders"   class="admin-tab-content hidden"><div class="empty-state">⏳ Loading orders...</div></div>
  <div id="admin-tab-dataset"  class="admin-tab-content hidden">${renderDatasetPanel()}</div>`;

  // Load data async
  const [users, orders] = await Promise.all([AuthManager.getUsers(), AuthManager.getOrders()]);
  const pending = users.filter(u => u.passwordChangeRequest && u.passwordChangeRequest.status === 'pending').length;

  document.getElementById('admin-stats-row').innerHTML = `
    <div class="admin-stat-pill">👥 ${users.length} Users</div>
    <div class="admin-stat-pill">🛍️ ${PRODUCTS.length} Products</div>
    <div class="admin-stat-pill">📦 ${orders.length} Orders</div>
    <div class="admin-stat-pill pending-pill">⏳ ${pending} Pending Requests</div>`;

  document.getElementById('admin-tab-users').innerHTML  = renderUsersTable(users);
  document.getElementById('admin-tab-orders').innerHTML = renderOrdersTable(orders);
}

function showAdminTab(tab, btn) {
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  ['users','products','orders','dataset'].forEach(t => {
    const el = document.getElementById(`admin-tab-${t}`);
    if (el) el.classList.toggle('hidden', t !== tab);
  });
}

// ── Users Table ──
function renderUsersTable(users) {
  if (!users || !users.length) return `<div class="empty-state">No registered users yet.</div>`;
  const rows = users.map(u => {
    const salutation   = u.gender === 'Male' ? 'Mr.' : 'Miss';
    const purchaseNames = (u.purchases || []).map(id => {
      const p = PRODUCTS.find(pr => pr.id === id);
      return p ? `${p.emoji} ${p.name}` : `#${id}`;
    }).join(', ') || '—';
    const pending = u.passwordChangeRequest && u.passwordChangeRequest.status === 'pending';
    return `
    <tr>
      <td><span class="uid-badge">${u.id.slice(0,12)}…</span></td>
      <td><strong>${salutation} ${u.name}</strong></td>
      <td><span class="gender-pill ${u.gender.toLowerCase()}">${u.gender}</span></td>
      <td>${u.email}</td>
      <td>@${u.username}</td>
      <td class="purchase-cell">${purchaseNames}</td>
      <td>
        <span class="pwd-hidden" id="pwd-${u.id}">••••••••</span>
        <button class="eye-sm" onclick="toggleAdminPwd('${u.id}','${u.password}')">👁</button>
      </td>
      <td>
        ${pending
          ? `<div class="pwd-request-row">
               <span class="req-badge">New pwd pending</span>
               <button class="btn-approve" onclick="adminApprovePwd('${u.id}')">✅ Approve</button>
               <button class="btn-reject"  onclick="adminRejectPwd('${u.id}')">❌ Reject</button>
             </div>`
          : `<span class="no-req">—</span>`}
      </td>
    </tr>`;
  }).join('');

  return `
  <div class="table-card">
    <div class="table-card-header"><h3>Registered Users</h3></div>
    <div class="table-scroll">
      <table class="admin-table">
        <thead><tr>
          <th>User ID</th><th>Name</th><th>Gender</th><th>Email</th>
          <th>Username</th><th>Purchased Items</th><th>Password</th><th>Pwd Change Request</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;
}

function toggleAdminPwd(userId, password) {
  const el = document.getElementById(`pwd-${userId}`);
  if (!el) return;
  el.textContent = el.textContent === '••••••••' ? password : '••••••••';
}

async function adminApprovePwd(userId) {
  if (!confirm('Approve this password change request?')) return;
  await AuthManager.approvePasswordChange(userId);
  showToast('✅ Password change approved!');
  renderAdminView();
}

async function adminRejectPwd(userId) {
  if (!confirm('Reject this request?')) return;
  await AuthManager.rejectPasswordChange(userId);
  showToast('Password change rejected.', 'info');
  renderAdminView();
}

// ── Products Table ──
function renderProductsTable() {
  return `
  <div class="table-card">
    <div class="table-card-header"><h3>Product Catalog</h3><span class="table-hint">Click any field to edit inline</span></div>
    <div class="table-scroll">
      <table class="admin-table">
        <thead><tr>
          <th>ID</th><th>Emoji</th><th>Name</th><th>Category</th>
          <th>Price (₹)</th><th>Original (₹)</th><th>Stock</th><th>Badge</th><th>Rating</th>
        </tr></thead>
        <tbody>
          ${PRODUCTS.map(p => `
          <tr>
            <td><span class="uid-badge">#${p.id}</span></td>
            <td>${p.emoji}</td>
            <td><span class="editable" contenteditable="true" onblur="saveProductField(${p.id},'name',this.textContent.trim())">${p.name}</span></td>
            <td>
              <select class="admin-select" onchange="saveProductField(${p.id},'category',this.value)">
                ${CATEGORIES.map(c=>`<option ${c===p.category?'selected':''}>${c}</option>`).join('')}
              </select>
            </td>
            <td><span class="editable" contenteditable="true" onblur="saveProductField(${p.id},'price',+this.textContent)">${p.price}</span></td>
            <td><span class="editable" contenteditable="true" onblur="saveProductField(${p.id},'originalPrice',+this.textContent)">${p.originalPrice}</span></td>
            <td><span class="editable" contenteditable="true" onblur="saveProductField(${p.id},'stock',+this.textContent)">${p.stock}</span></td>
            <td><span class="editable" contenteditable="true" onblur="saveProductField(${p.id},'badge',this.textContent.trim()||null)">${p.badge||''}</span></td>
            <td>${p.rating} ⭐</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

function saveProductField(productId, field, value) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  product[field] = value;
  showToast(`✅ Updated ${field} for product #${productId}`);
}

// ── Orders Table ──
function renderOrdersTable(orders) {
  if (!orders || !orders.length) return `<div class="empty-state">No orders placed yet.</div>`;
  const rows = orders.map(o => {
    const date = new Date(o.created_at).toLocaleDateString('en-IN');
    const items = (o.items || []).map(i => `${i.emoji||'📦'} ${i.name}`).join(', ') || '—';
    const statusClass = { pending:'status-pending', confirmed:'status-confirmed', shipped:'status-shipped', delivered:'status-delivered' }[o.status] || '';
    return `
    <tr>
      <td><span class="uid-badge">#${o.id}</span></td>
      <td>${o.user_name || '—'}</td>
      <td class="purchase-cell">${items}</td>
      <td><strong>₹${Number(o.total_amount).toLocaleString()}</strong></td>
      <td>${o.payment_method === 'upi' ? '📱 UPI' : '💵 COD'}</td>
      <td>${o.delivery_name}<br><small>${o.delivery_city}, ${o.delivery_state} ${o.delivery_pincode}</small></td>
      <td>
        <select class="admin-select ${statusClass}" onchange="updateOrderStatus(${o.id},this.value)">
          <option ${o.status==='pending'   ?'selected':''} value="pending">⏳ Pending</option>
          <option ${o.status==='confirmed' ?'selected':''} value="confirmed">✅ Confirmed</option>
          <option ${o.status==='shipped'   ?'selected':''} value="shipped">🚚 Shipped</option>
          <option ${o.status==='delivered' ?'selected':''} value="delivered">📬 Delivered</option>
        </select>
      </td>
      <td>${date}</td>
    </tr>`;
  }).join('');

  return `
  <div class="table-card">
    <div class="table-card-header"><h3>All Orders</h3></div>
    <div class="table-scroll">
      <table class="admin-table">
        <thead><tr>
          <th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th>
          <th>Payment</th><th>Delivery Address</th><th>Status</th><th>Date</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;
}

async function updateOrderStatus(orderId, status) {
  try {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    showToast(`Order #${orderId} marked as ${status}`);
  } catch { showToast('Failed to update status.', 'warning'); }
}

// ── Dataset Panel ──
function renderDatasetPanel() {
  return `
  <div class="dataset-panel">
    <div class="dataset-section">
      <h3 class="dataset-title">📊 Current Dataset</h3>
      <p class="page-subtitle">${PRODUCTS.length} products</p>
      <textarea class="dataset-textarea" id="dataset-view" readonly>${JSON.stringify(PRODUCTS, null, 2)}</textarea>
    </div>
    <div class="dataset-section">
      <h3 class="dataset-title">⬆️ Upload New Dataset</h3>
      <p class="page-subtitle">Paste JSON array or upload a .json file</p>
      <div class="upload-zone" onclick="document.getElementById('dataset-file-input').click()">
        <span class="upload-icon">📁</span>
        <p>Click to upload .json file</p>
        <input type="file" id="dataset-file-input" accept=".json" style="display:none" onchange="handleDatasetFile(event)">
      </div>
      <p class="dataset-or">— or paste JSON below —</p>
      <textarea class="dataset-textarea editable-ds" id="dataset-paste" placeholder="Paste your products JSON array here..."></textarea>
      <div class="dataset-actions">
        <button class="btn btn-primary" onclick="applyDataset()">✅ Apply Dataset</button>
        <button class="btn btn-outline" onclick="resetDataset()">↩ Reset to Original</button>
      </div>
      <div class="checkout-error" id="dataset-error" style="margin-top:8px"></div>
    </div>
  </div>`;
}

function handleDatasetFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('dataset-paste').value = e.target.result;
    showToast(`📁 "${file.name}" loaded. Click Apply.`, 'info');
  };
  reader.readAsText(file);
}

let ORIGINAL_PRODUCTS = null;
function applyDataset() {
  const raw   = document.getElementById('dataset-paste').value.trim();
  const errEl = document.getElementById('dataset-error');
  if (!raw) { errEl.textContent = 'Paste JSON first.'; errEl.style.display='block'; return; }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.length) throw new Error('Must be a non-empty JSON array.');
    if (!parsed[0].id || !parsed[0].name) throw new Error('Objects need at least "id" and "name".');
    if (!ORIGINAL_PRODUCTS) ORIGINAL_PRODUCTS = [...PRODUCTS];
    PRODUCTS.length = 0;
    parsed.forEach(p => PRODUCTS.push(p));
    errEl.style.display = 'none';
    document.getElementById('dataset-view').value = JSON.stringify(PRODUCTS, null, 2);
    showToast(`✅ ${parsed.length} products loaded.`);
  } catch (err) {
    errEl.textContent = `❌ ${err.message}`; errEl.style.display='block';
  }
}
function resetDataset() {
  if (ORIGINAL_PRODUCTS) {
    PRODUCTS.length = 0;
    ORIGINAL_PRODUCTS.forEach(p => PRODUCTS.push(p));
    ORIGINAL_PRODUCTS = null;
    document.getElementById('dataset-paste').value = '';
    document.getElementById('dataset-view').value  = JSON.stringify(PRODUCTS, null, 2);
    showToast('↩ Dataset reset.', 'info');
  } else { showToast('Already using original.', 'info'); }
}
