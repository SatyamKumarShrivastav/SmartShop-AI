// ===== CHECKOUT.JS — Cart, Payment (UPI/COD), Delivery Address =====

const UPI_ID   = '8405828589@upi';
const UPI_NAME = 'TrendCart Innovators';

// ── Open Checkout Modal ──
function openCheckout() {
  if (!AUTH_STATE.currentAuthUser && !AUTH_STATE.isAdmin) {
    showToast('Please sign in to place an order.', 'info'); return;
  }
  if (STATE.cart.length === 0) {
    showToast('Your cart is empty!', 'info'); return;
  }

  const items  = STATE.cart.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
  const total  = items.reduce((s, p) => s + p.price, 0);
  const qrData = encodeURIComponent(`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${total}&cu=INR&tn=SmartShop+Order`);
  const qrUrl  = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}`;
  const upiLink= `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${total}&cu=INR&tn=SmartShop+Order`;

  const modal = document.getElementById('checkout-modal');
  modal.innerHTML = `
  <div class="checkout-card">
    <div class="checkout-header">
      <h2 class="checkout-title">🛒 Checkout</h2>
      <button class="modal-close-btn" onclick="closeCheckout()">✕</button>
    </div>

    <!-- Step indicator -->
    <div class="checkout-steps">
      <div class="cstep active" id="cstep-1"><span>1</span> Address</div>
      <div class="cstep-line"></div>
      <div class="cstep" id="cstep-2"><span>2</span> Payment</div>
      <div class="cstep-line"></div>
      <div class="cstep" id="cstep-3"><span>3</span> Confirm</div>
    </div>

    <!-- ORDER SUMMARY (always visible) -->
    <div class="checkout-summary">
      <div class="summary-items">
        ${items.map(p => `
          <div class="summary-item">
            <span class="si-emoji">${p.emoji}</span>
            <span class="si-name">${p.name}</span>
            <span class="si-price">₹${p.price.toLocaleString()}</span>
          </div>`).join('')}
      </div>
      <div class="summary-total">
        <span>Total</span>
        <strong>₹${total.toLocaleString()}</strong>
      </div>
    </div>

    <!-- STEP 1 — Delivery Address -->
    <div id="checkout-step-1" class="checkout-step">
      <h3 class="step-title">📦 Delivery Address</h3>
      <div class="checkout-error" id="addr-error"></div>
      <div class="addr-form">
        <div class="form-row">
          <div class="form-group">
            <label>Full Name</label>
            <input id="del-name" class="auth-input" placeholder="Recipient name" value="${AUTH_STATE.currentAuthUser?.name || ''}" required>
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input id="del-phone" class="auth-input" placeholder="10-digit mobile" maxlength="10" required>
          </div>
        </div>
        <div class="form-group">
          <label>Street Address</label>
          <input id="del-address" class="auth-input" placeholder="House no., Street, Area" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>City</label>
            <input id="del-city" class="auth-input" placeholder="City" required>
          </div>
          <div class="form-group">
            <label>State</label>
            <input id="del-state" class="auth-input" placeholder="State" required>
          </div>
          <div class="form-group">
            <label>PIN Code</label>
            <input id="del-pincode" class="auth-input" placeholder="6-digit PIN" maxlength="6" required>
          </div>
        </div>
      </div>
      <button class="auth-btn" onclick="goToPayment(${total})">Continue to Payment →</button>
    </div>

    <!-- STEP 2 — Payment -->
    <div id="checkout-step-2" class="checkout-step hidden">
      <h3 class="step-title">💳 Choose Payment Method</h3>
      <div class="payment-options">
        <label class="payment-option" id="pay-upi-label">
          <input type="radio" name="pay-method" value="upi" id="pay-upi" checked>
          <div class="pay-option-body">
            <span class="pay-icon">📱</span>
            <div>
              <strong>UPI Payment</strong>
              <small>Pay via any UPI app (GPay, PhonePe, Paytm…)</small>
            </div>
          </div>
        </label>
        <label class="payment-option" id="pay-cod-label">
          <input type="radio" name="pay-method" value="cod" id="pay-cod">
          <div class="pay-option-body">
            <span class="pay-icon">💵</span>
            <div>
              <strong>Cash on Delivery</strong>
              <small>Pay when your order arrives</small>
            </div>
          </div>
        </label>
      </div>

      <!-- UPI Section -->
      <div id="upi-section" class="upi-section">
        <div class="upi-id-box">
          <span class="upi-label">UPI ID</span>
          <span class="upi-value">${UPI_ID}</span>
          <button class="copy-btn" onclick="copyUPI()">📋 Copy</button>
        </div>
        <div class="upi-qr-wrap">
          <img src="${qrUrl}" alt="UPI QR Code" class="upi-qr" loading="lazy">
          <p class="upi-hint">Scan with any UPI app</p>
        </div>
        <a href="${upiLink}" class="upi-deep-link" target="_blank">📲 Open UPI App</a>
        <div class="form-group" style="margin-top:14px">
          <label>Transaction ID (after payment)</label>
          <input id="upi-txn-id" class="auth-input" placeholder="Enter UPI transaction ID">
        </div>
      </div>

      <!-- COD Section -->
      <div id="cod-section" class="cod-section hidden">
        <div class="cod-info">
          <span class="cod-icon">🏠</span>
          <div>
            <strong>Cash on Delivery</strong>
            <p>Keep ₹${total.toLocaleString()} ready at the time of delivery.</p>
            <p class="cod-note">Orders are typically delivered within 3–5 business days.</p>
          </div>
        </div>
      </div>

      <div class="checkout-nav">
        <button class="btn btn-outline" onclick="goToStep(1)">← Back</button>
        <button class="auth-btn" onclick="goToConfirm()">Review Order →</button>
      </div>
    </div>

    <!-- STEP 3 — Confirm -->
    <div id="checkout-step-3" class="checkout-step hidden">
      <h3 class="step-title">✅ Order Summary</h3>
      <div id="confirm-details" class="confirm-details"></div>
      <div class="checkout-error" id="order-error"></div>
      <div class="checkout-nav">
        <button class="btn btn-outline" onclick="goToStep(2)">← Back</button>
        <button class="auth-btn place-order-btn" id="place-order-btn" onclick="placeOrder(${total})">🎉 Place Order</button>
      </div>
    </div>

  </div>`;

  modal.classList.add('open');

  // Radio change handler
  modal.querySelectorAll('input[name="pay-method"]').forEach(r => {
    r.addEventListener('change', () => {
      const isUPI = document.getElementById('pay-upi').checked;
      document.getElementById('upi-section').classList.toggle('hidden', !isUPI);
      document.getElementById('cod-section').classList.toggle('hidden',  isUPI);
    });
  });
}

function closeCheckout() {
  document.getElementById('checkout-modal').classList.remove('open');
}

function goToStep(step) {
  [1,2,3].forEach(s => {
    document.getElementById(`checkout-step-${s}`)?.classList.toggle('hidden', s !== step);
    document.getElementById(`cstep-${s}`)?.classList.toggle('active', s === step);
    document.getElementById(`cstep-${s}`)?.classList.toggle('done',   s <  step);
  });
}

function goToPayment(total) {
  const name    = document.getElementById('del-name')?.value.trim();
  const phone   = document.getElementById('del-phone')?.value.trim();
  const address = document.getElementById('del-address')?.value.trim();
  const city    = document.getElementById('del-city')?.value.trim();
  const state   = document.getElementById('del-state')?.value.trim();
  const pincode = document.getElementById('del-pincode')?.value.trim();
  const errEl   = document.getElementById('addr-error');

  if (!name || !phone || !address || !city || !state || !pincode) {
    errEl.textContent = 'Please fill all address fields.'; errEl.style.display='block'; return;
  }
  if (!/^\d{10}$/.test(phone)) {
    errEl.textContent = 'Enter a valid 10-digit phone number.'; errEl.style.display='block'; return;
  }
  if (!/^\d{6}$/.test(pincode)) {
    errEl.textContent = 'Enter a valid 6-digit PIN code.'; errEl.style.display='block'; return;
  }
  errEl.style.display = 'none';
  goToStep(2);
}

function copyUPI() {
  navigator.clipboard.writeText(UPI_ID).then(() => showToast('📋 UPI ID copied!', 'info'));
}

function goToConfirm() {
  const isUPI    = document.getElementById('pay-upi').checked;
  const txnId    = document.getElementById('upi-txn-id')?.value.trim();
  const name     = document.getElementById('del-name').value.trim();
  const phone    = document.getElementById('del-phone').value.trim();
  const address  = document.getElementById('del-address').value.trim();
  const city     = document.getElementById('del-city').value.trim();
  const state    = document.getElementById('del-state').value.trim();
  const pincode  = document.getElementById('del-pincode').value.trim();
  const items    = STATE.cart.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
  const total    = items.reduce((s, p) => s + p.price, 0);

  const details = document.getElementById('confirm-details');
  details.innerHTML = `
    <div class="confirm-block">
      <h4>📦 Delivery To</h4>
      <p><strong>${name}</strong> &nbsp;|&nbsp; 📞 ${phone}</p>
      <p>${address}, ${city}, ${state} — ${pincode}</p>
    </div>
    <div class="confirm-block">
      <h4>💳 Payment</h4>
      <p>${isUPI ? `UPI Payment${txnId ? ` &nbsp;|&nbsp; TXN: <code>${txnId}</code>` : ' (pending confirmation)'}` : 'Cash on Delivery'}</p>
    </div>
    <div class="confirm-block">
      <h4>🛍️ Items (${items.length})</h4>
      ${items.map(p => `<p>${p.emoji} ${p.name} — ₹${p.price.toLocaleString()}</p>`).join('')}
      <p class="confirm-total">Total: <strong>₹${total.toLocaleString()}</strong></p>
    </div>`;

  goToStep(3);
}

async function placeOrder(total) {
  const btn = document.getElementById('place-order-btn');
  btn.disabled = true; btn.textContent = 'Placing order...';

  const isUPI  = document.getElementById('pay-upi').checked;
  const user   = AUTH_STATE.currentAuthUser;
  const items  = STATE.cart.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean)
                           .map(p => ({ id: p.id, name: p.name, price: p.price, emoji: p.emoji }));

  const orderData = {
    userId:          user ? user.id : 'guest',
    userName:        user ? user.name : 'Guest',
    items,
    totalAmount:     total,
    paymentMethod:   isUPI ? 'upi' : 'cod',
    upiTxnId:        isUPI ? (document.getElementById('upi-txn-id')?.value.trim() || null) : null,
    deliveryName:    document.getElementById('del-name').value.trim(),
    deliveryPhone:   document.getElementById('del-phone').value.trim(),
    deliveryAddress: document.getElementById('del-address').value.trim(),
    deliveryCity:    document.getElementById('del-city').value.trim(),
    deliveryState:   document.getElementById('del-state').value.trim(),
    deliveryPincode: document.getElementById('del-pincode').value.trim(),
  };

  const result = await AuthManager.placeOrder(orderData);
  btn.disabled = false; btn.textContent = '🎉 Place Order';

  if (!result.ok) {
    document.getElementById('order-error').textContent = '❌ ' + result.msg;
    document.getElementById('order-error').style.display = 'block';
    return;
  }

  // Update local user purchases
  if (user) {
    items.forEach(it => {
      if (!user.purchases.includes(it.id)) user.purchases.push(it.id);
    });
  }

  // Clear cart
  STATE.cart = [];
  const cc = document.getElementById('cart-count');
  if (cc) cc.textContent = '0';

  closeCheckout();
  showOrderSuccess(result.orderId, isUPI ? 'UPI' : 'Cash on Delivery', total);
}

function showOrderSuccess(orderId, method, total) {
  const modal = document.getElementById('checkout-modal');
  modal.innerHTML = `
  <div class="checkout-card order-success">
    <div class="success-anim">🎉</div>
    <h2 class="success-title">Order Placed!</h2>
    <p class="success-sub">Order <strong>#${orderId}</strong> confirmed</p>
    <div class="success-details">
      <div class="sd-row"><span>Payment</span><strong>${method}</strong></div>
      <div class="sd-row"><span>Total</span><strong>₹${total.toLocaleString()}</strong></div>
      <div class="sd-row"><span>Delivery</span><strong>3–5 business days</strong></div>
    </div>
    <button class="auth-btn" onclick="closeCheckout();navigate('home')">← Continue Shopping</button>
  </div>`;
  modal.classList.add('open');
}
