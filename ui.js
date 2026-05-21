// ===== UI.JS — DOM Rendering Helpers =====

function starRating(rating) {
  const full = Math.floor(rating), half = rating % 1 >= 0.5 ? 1 : 0, empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function formatPrice(price) { return `$${price.toLocaleString()}`; }

function renderProductCard(product, opts = {}) {
  const { score, matchPct, reason, showMatch = false, compact = false } = opts;
  const user = getCurrentUser();
  const inCart = STATE.cart.includes(product.id);
  const inWishlist = user && user.viewHistory.includes(product.id);
  const trend = product.monthlySales ? getTrendBadge(parseFloat((((product.monthlySales[11]-product.monthlySales[10])/product.monthlySales[10])*100).toFixed(1))) : null;

  return `
  <div class="product-card ${compact?'compact':''}" data-id="${product.id}" onclick="openProductModal(${product.id})">
    <div class="card-image" style="background:linear-gradient(135deg,${product.color}22,${product.color}44)">
      <span class="card-emoji">${product.emoji}</span>
      ${product.badge ? `<span class="card-badge">${product.badge}</span>` : ''}
      ${showMatch && matchPct ? `<span class="match-badge">${matchPct}% match</span>` : ''}
      ${trend ? `<span class="trend-pill ${trend.cls}">${trend.icon} ${trend.label}</span>` : ''}
    </div>
    <div class="card-body">
      <span class="card-category">${product.category}</span>
      <h3 class="card-name">${product.name}</h3>
      <div class="card-rating">
        <span class="stars" style="color:#F59E0B">${starRating(product.rating)}</span>
        <span class="rating-val">${product.rating}</span>
        <span class="reviews">(${product.reviews.toLocaleString()})</span>
      </div>
      ${reason ? `<p class="card-reason">💡 ${reason}</p>` : ''}
      <div class="card-footer">
        <div class="card-price">
          <span class="price-current">${formatPrice(product.price)}</span>
          ${product.originalPrice > product.price ? `<span class="price-original">${formatPrice(product.originalPrice)}</span>` : ''}
        </div>
        <div class="card-actions">
          <button class="btn-icon wishlist-btn ${inWishlist?'active':''}" onclick="event.stopPropagation();toggleWishlist(${product.id})" title="Wishlist">♥</button>
          <button class="btn-cart ${inCart?'in-cart':''}" onclick="event.stopPropagation();addToCart(${product.id})">${inCart?'✓ Added':'+ Cart'}</button>
        </div>
      </div>
    </div>
  </div>`;
}

function renderProductGrid(containerId, products, opts = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!products.length) {
    container.innerHTML = '<div class="empty-state">😕 No products found matching your filters.</div>';
    return;
  }
  container.innerHTML = products.map(p => renderProductCard(p, opts)).join('');
}

function renderHomeView() {
  const user = getCurrentUser();

  // ── Hero greeting (gender-aware, admin-aware) ──
  const heroName = document.getElementById('hero-username');
  if (heroName) {
    if (typeof AUTH_STATE !== 'undefined' && AUTH_STATE.isAdmin) {
      heroName.textContent = 'CEO Sir';
    } else if (typeof AUTH_STATE !== 'undefined' && AUTH_STATE.currentAuthUser) {
      const au = AUTH_STATE.currentAuthUser;
      const salutation = au.gender === 'Male' ? 'Mr.' : 'Mrs./Miss';
      const firstName  = au.name.trim().split(/\s+/)[0];
      heroName.textContent = `${salutation} ${firstName}`;
    } else {
      heroName.textContent = user.name.split(' ')[0];
    }
  }

  // Recommendations
  const userId = STATE.currentUserId;
  const recs = getHybridRecommendations(userId, 6);
  const recContainer = document.getElementById('recommendations-grid');
  if (recContainer) {
    recContainer.innerHTML = recs.map(p => renderProductCard(p, {
      showMatch: true, matchPct: p.matchPct,
      reason: getRecommendationReason(userId, p)
    })).join('');
  }

  // Trending
  const trending = getTrendingProducts(6);
  renderProductGrid('trending-grid', trending);

  // Also Like — related to last viewed
  const lastViewed = user.viewHistory[user.viewHistory.length - 1];
  const related = lastViewed ? getRelatedProducts(lastViewed, 4) : PRODUCTS.slice(0,4);
  renderProductGrid('also-like-grid', related);
}

function renderCatalogView() {
  const { category, priceMin, priceMax, minRating, sort } = STATE.filters;
  const q = STATE.searchQuery.toLowerCase();

  let products = PRODUCTS.filter(p => {
    if (category.length && !category.includes(p.category)) return false;
    if (p.price < priceMin || p.price > priceMax) return false;
    if (p.rating < minRating) return false;
    if (q && !p.name.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q) && !p.tags.some(t=>t.includes(q))) return false;
    return true;
  });

  if (sort === 'price-asc') products.sort((a,b)=>a.price-b.price);
  else if (sort === 'price-desc') products.sort((a,b)=>b.price-a.price);
  else if (sort === 'rating') products.sort((a,b)=>b.rating-a.rating);
  else if (sort === 'sales') products.sort((a,b)=>(b.monthlySales[11]||0)-(a.monthlySales[11]||0));
  else {
    // Recommended sort — blend score
    const recs = getHybridRecommendations(STATE.currentUserId, 30);
    const scoreMap = {};
    recs.forEach(r => { scoreMap[r.id] = r.score; });
    products.sort((a,b)=>(scoreMap[b.id]||0)-(scoreMap[a.id]||0));
  }

  const count = document.getElementById('result-count');
  if (count) count.textContent = `${products.length} product${products.length!==1?'s':''} found`;
  renderProductGrid('catalog-grid', products);

  // Category filter pills
  const catFilters = document.getElementById('category-filters');
  if (catFilters) {
    catFilters.innerHTML = CATEGORIES.map(cat => `
      <label class="filter-checkbox">
        <input type="checkbox" value="${cat}" ${category.includes(cat)?'checked':''} onchange="toggleCategoryFilter('${cat}')">
        <span>${cat}</span>
      </label>`).join('');
  }
}

function renderAnalyticsView() {
  // KPIs
  const kpiGrid = document.getElementById('kpi-grid');
  if (kpiGrid) {
    kpiGrid.innerHTML = getKPIs().map(k => `
      <div class="kpi-card ${k.cls}">
        <div class="kpi-icon">${k.icon}</div>
        <div class="kpi-body">
          <div class="kpi-value">${k.value}</div>
          <div class="kpi-label">${k.label}</div>
          <div class="kpi-change ${k.up?'up':'down'}">${k.up?'↑':'↓'} ${k.change} vs last month</div>
        </div>
      </div>`).join('');
  }

  // Charts — defer to next tick so canvas is in DOM
  setTimeout(() => {
    initRevenueChart();
    initCategoryChart();
    initDonutChart();
    renderTopProductsTable();
  }, 50);
}

function renderTopProductsTable() {
  const tbody = document.getElementById('top-products-tbody');
  if (!tbody) return;
  const top = getTopProducts(5);
  tbody.innerHTML = top.map((p, i) => {
    const tb = getTrendBadge(p.trendPct);
    return `<tr>
      <td><span class="rank">#${i+1}</span></td>
      <td><span class="prod-emoji">${p.emoji}</span> ${p.name}</td>
      <td><span class="cat-tag">${p.category}</span></td>
      <td>${p.totalSales.toLocaleString()}</td>
      <td>$${(p.revenue/1000).toFixed(0)}K</td>
      <td><span class="${tb.cls} trend-pill-sm">${tb.icon} ${tb.label}</span></td>
    </tr>`;
  }).join('');
}

function renderProfileView() {
  const user = getCurrentUser();
  const container = document.getElementById('profile-container');
  if (!container) return;

  const purchased = user.purchases.map(id => PRODUCTS.find(p=>p.id===id)).filter(Boolean);
  const viewed = user.viewHistory.map(id => PRODUCTS.find(p=>p.id===id)).filter(Boolean);
  const recs = getHybridRecommendations(user.id, 4);

  container.innerHTML = `
    <div class="profile-header-card">
      <div class="profile-avatar">${user.avatar}</div>
      <div class="profile-info">
        <h2 class="profile-name">${user.name}</h2>
        <p class="profile-bio">${user.bio}</p>
        <div class="profile-prefs">
          ${user.preferences.map(p=>`<span class="pref-tag">${p}</span>`).join('')}
        </div>
      </div>
      <div class="profile-stats">
        <div class="pstat"><span>${user.purchases.length}</span><small>Purchases</small></div>
        <div class="pstat"><span>${user.viewHistory.length}</span><small>Viewed</small></div>
        <div class="pstat"><span>${Object.keys(user.ratings).length}</span><small>Ratings</small></div>
      </div>
    </div>

    <div class="profile-grid">
      <div class="profile-section">
        <h3>🛍️ Purchase History</h3>
        <div class="mini-product-list">
          ${purchased.map(p=>`
            <div class="mini-product" onclick="openProductModal(${p.id})">
              <span class="mini-emoji">${p.emoji}</span>
              <div><strong>${p.name}</strong><br><small>${p.category} · ${formatPrice(p.price)}</small></div>
              <span class="stars-sm">${starRating(user.ratings[p.id]||p.rating)}</span>
            </div>`).join('')}
        </div>
      </div>

      <div class="profile-section">
        <h3>👁️ Recently Viewed</h3>
        <div class="mini-product-list">
          ${viewed.slice().reverse().slice(0,5).map(p=>`
            <div class="mini-product" onclick="openProductModal(${p.id})">
              <span class="mini-emoji">${p.emoji}</span>
              <div><strong>${p.name}</strong><br><small>${p.category} · ${formatPrice(p.price)}</small></div>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <div class="profile-section full-width">
      <h3>🤖 Your AI Recommendations</h3>
      <div class="product-grid">${recs.map(p=>renderProductCard(p,{showMatch:true,matchPct:p.matchPct,reason:getRecommendationReason(user.id,p)})).join('')}</div>
    </div>`;
}

function openProductModal(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  // Update user view history
  const user = getCurrentUser();
  if (!user.viewHistory.includes(productId)) {
    user.viewHistory.push(productId);
  }
  STATE.viewedProduct = productId;

  const related = getRelatedProducts(productId, 4);
  const trend = getTrendBadge(parseFloat((((product.monthlySales[11]-product.monthlySales[10])/product.monthlySales[10])*100).toFixed(1)));
  const forecast = predictNext(product.monthlySales, 3);
  const inCart = STATE.cart.includes(productId);

  const modal = document.getElementById('product-modal');
  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = `
    <div class="modal-product">
      <div class="modal-image" style="background:linear-gradient(135deg,${product.color}22,${product.color}55)">
        <span class="modal-emoji">${product.emoji}</span>
        ${product.badge?`<span class="card-badge">${product.badge}</span>`:''}
      </div>
      <div class="modal-details">
        <span class="card-category">${product.category}</span>
        <h2 class="modal-title">${product.name}</h2>
        <div class="card-rating" style="margin:8px 0">
          <span class="stars" style="color:#F59E0B">${starRating(product.rating)}</span>
          <span class="rating-val">${product.rating}</span>
          <span class="reviews">(${product.reviews.toLocaleString()} reviews)</span>
        </div>
        <div class="modal-price">
          <span class="price-current large">${formatPrice(product.price)}</span>
          ${product.originalPrice>product.price?`<span class="price-original">${formatPrice(product.originalPrice)}</span><span class="discount-badge">${Math.round((1-product.price/product.originalPrice)*100)}% OFF</span>`:''}
        </div>
        <div class="modal-tags">${product.tags.map(t=>`<span class="tag">#${t}</span>`).join('')}</div>
        <div class="modal-meta">
          <div class="meta-item"><span>📦 Stock</span><strong>${product.stock} units</strong></div>
          <div class="meta-item"><span>📈 Trend</span><strong class="${trend.cls}">${trend.icon} ${trend.label}</strong></div>
          <div class="meta-item"><span>🔮 3-Mo Forecast</span><strong>+${forecast.reduce((a,b)=>a+b,0)} units</strong></div>
        </div>
        <div class="modal-chart-wrapper">
          <p class="chart-subtitle">Sales & Forecast Trend</p>
          <canvas id="product-trend-chart" height="160"></canvas>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary full-width ${inCart?'in-cart':''}" id="modal-cart-btn" onclick="addToCart(${productId});document.getElementById('modal-cart-btn').textContent='✓ Added to Cart';document.getElementById('modal-cart-btn').classList.add('in-cart')">
            ${inCart?'✓ Added to Cart':'🛒 Add to Cart'}
          </button>
        </div>
      </div>
    </div>
    <div class="modal-related">
      <h3>Related Products</h3>
      <div class="related-grid">${related.map(p=>renderProductCard(p,{compact:true})).join('')}</div>
    </div>`;

  modal.classList.add('open');
  setTimeout(() => initProductTrendChart(productId), 80);
}

function closeModal() {
  document.getElementById('product-modal').classList.remove('open');
  if (productTrendChart) { productTrendChart.destroy(); productTrendChart = null; }
  if (STATE.currentView === 'home') renderHomeView();
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type==='success'?'✅':type==='info'?'💡':'⚠️'}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(()=>toast.remove(), 400); }, 3000);
}

function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  if (!STATE.cart.includes(productId)) {
    STATE.cart.push(productId);
    showToast(`${product.emoji} ${product.name} added to cart!`);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) cartCount.textContent = STATE.cart.length;
    // refresh cards if on catalog
    if (STATE.currentView === 'catalog') renderCatalogView();
  } else {
    showToast(`${product.name} is already in your cart`, 'info');
  }
}

function toggleWishlist(productId) {
  const user = getCurrentUser();
  const idx = user.viewHistory.indexOf(productId);
  const product = PRODUCTS.find(p=>p.id===productId);
  if (idx > -1) { user.viewHistory.splice(idx,1); showToast(`Removed from wishlist`, 'info'); }
  else { user.viewHistory.push(productId); showToast(`${product?.emoji} Added to wishlist!`); }
  if (STATE.currentView === 'catalog') renderCatalogView();
  else if (STATE.currentView === 'home') renderHomeView();
}
