// ===== APP.JS — Router, State Management, Event Listeners =====

function navigate(view) {
  // Admin-only guard
  if (view === 'admin' && !AUTH_STATE.isAdmin) return;

  STATE.currentView = view;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.view === view);
  });
  document.querySelectorAll('.view').forEach(el => {
    el.classList.toggle('active', el.id === `view-${view}`);
  });

  if (view === 'home') renderHomeView();
  else if (view === 'catalog') renderCatalogView();
  else if (view === 'analytics') renderAnalyticsView();
  else if (view === 'profile') renderProfileView();
  else if (view === 'admin') renderAdminView();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleCategoryFilter(category) {
  const idx = STATE.filters.category.indexOf(category);
  if (idx > -1) STATE.filters.category.splice(idx, 1);
  else STATE.filters.category.push(category);
  renderCatalogView();
}

// ── Welcome Greeting ──
function getSalutation(gender) {
  return gender === 'Male' ? 'Mr.' : 'Mrs./Miss';
}

function updateWelcomeUI() {
  const chip = document.getElementById('welcome-chip');
  const heroName = document.getElementById('hero-username');
  const heroSubtitle = document.getElementById('hero-subtitle');

  if (AUTH_STATE.isAdmin) {
    // Admin: hero says "CEO Sir", chip says "Welcome! Trendcart Innovators"
    if (chip) chip.textContent = '🛡️ Welcome! Trendcart Innovators';
    if (heroName) heroName.textContent = 'CEO Sir';
    if (heroSubtitle) heroSubtitle.textContent = 'Administrator Dashboard — Full system control at your fingertips.';

    // Show admin nav, hide user-only items
    document.querySelectorAll('.nav-admin-only').forEach(el => el.classList.remove('hidden'));
    document.querySelectorAll('.user-only-btn').forEach(el => el.classList.add('hidden'));
    document.getElementById('nav-profile')?.classList.add('hidden');
  } else {
    const user = AUTH_STATE.currentAuthUser;
    if (!user) return;
    // e.g. "Satyam Kumar Shrivastav" → firstName = "Satyam"
    // Male → "Mr. Satyam"  |  Female → "Mrs./Miss Lakshmi"
    const salutation = getSalutation(user.gender);
    const firstName = user.name.trim().split(/\s+/)[0];
    const heroGreeting = `${salutation} ${firstName}`;    // "Mr. Satyam"
    const chipGreeting = `Welcome! ${salutation} ${firstName}`; // "Welcome! Mr. Satyam"

    if (chip) chip.textContent = `👋 ${chipGreeting}`;
    if (heroName) heroName.textContent = heroGreeting;
    if (heroSubtitle) heroSubtitle.textContent = `Discover products curated just for you by our intelligent hybrid recommendation engine`;

    document.querySelectorAll('.nav-admin-only').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.user-only-btn').forEach(el => el.classList.remove('hidden'));
    document.getElementById('nav-profile')?.classList.remove('hidden');
  }
}

// ── Logout ──
function logoutUser() {
  if (!confirm('Are you sure you want to logout?')) return;
  AuthManager.clearSession();
  window.location.reload();
}

// ── Current User for Recommendations ──
function getCurrentUser() {
  if (AUTH_STATE.isAdmin) return USERS[0]; // fallback for admin browsing
  if (AUTH_STATE.currentAuthUser) {
    // Map auth user to USERS-compatible structure
    const au = AUTH_STATE.currentAuthUser;
    return {
      id: au.id,
      name: au.name,
      avatar: au.gender === 'Male' ? '👨' : '👩',
      preferences: au.preferences || [],
      viewHistory: au.viewHistory || [],
      purchases: au.purchases || [],
      ratings: au.ratings || {},
      bio: au.bio || '',
    };
  }
  return USERS.find(u => u.id === STATE.currentUserId);
}

function initEventListeners() {
  // Sidebar nav
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigate(el.dataset.view);
    });
  });

  // Global search
  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        STATE.searchQuery = searchInput.value;
        if (STATE.searchQuery.length > 0) navigate('catalog');
        else renderCatalogView();
      }, 300);
    });
  }

  // Price range filters
  const priceMin = document.getElementById('price-min');
  const priceMax = document.getElementById('price-max');
  if (priceMin && priceMax) {
    priceMin.addEventListener('input', () => {
      STATE.filters.priceMin = parseInt(priceMin.value);
      document.getElementById('price-min-label').textContent = `$${priceMin.value}`;
      renderCatalogView();
    });
    priceMax.addEventListener('input', () => {
      STATE.filters.priceMax = parseInt(priceMax.value);
      document.getElementById('price-max-label').textContent = `$${priceMax.value}`;
      renderCatalogView();
    });
  }

  // Rating filter
  document.querySelectorAll('.rating-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.filters.minRating = parseFloat(btn.dataset.rating);
      renderCatalogView();
    });
  });

  // Sort
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      STATE.filters.sort = sortSelect.value;
      renderCatalogView();
    });
  }

  // Clear filters
  const clearBtn = document.getElementById('clear-filters');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      STATE.filters = { category: [], priceMin: 0, priceMax: 700, minRating: 0, sort: 'default' };
      STATE.searchQuery = '';
      if (document.getElementById('global-search')) document.getElementById('global-search').value = '';
      if (priceMin) priceMin.value = 0;
      if (priceMax) priceMax.value = 700;
      document.getElementById('price-min-label').textContent = '$0';
      document.getElementById('price-max-label').textContent = '$700';
      document.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('.rating-btn[data-rating="0"]')?.classList.add('active');
      renderCatalogView();
    });
  }

  // Grid/List toggle
  document.getElementById('grid-view-btn')?.addEventListener('click', () => {
    document.getElementById('catalog-grid').classList.remove('list-view');
    document.getElementById('grid-view-btn').classList.add('active');
    document.getElementById('list-view-btn').classList.remove('active');
  });
  document.getElementById('list-view-btn')?.addEventListener('click', () => {
    document.getElementById('catalog-grid').classList.add('list-view');
    document.getElementById('list-view-btn').classList.add('active');
    document.getElementById('grid-view-btn').classList.remove('active');
  });

  // Modal close
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('product-modal')?.addEventListener('click', e => {
    if (e.target.id === 'product-modal') closeModal();
  });

  // Mobile menu toggle
  document.getElementById('menu-toggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Cart btn — open checkout
  document.getElementById('cart-btn')?.addEventListener('click', () => openCheckout());

  // Share / network btn
  document.getElementById('share-btn')?.addEventListener('click', () => {
    const banner = document.getElementById('network-banner');
    banner.classList.toggle('hidden');
    setNetworkUrl();
  });
}

function initApp() {
  const loader = document.getElementById('app-loader');
  const app = document.getElementById('app');
  const progress = document.querySelector('.loader-progress');
  const loaderText = document.querySelector('.loader-text');

  loader.classList.remove('hidden');

  const steps = [
    'Loading product catalog...',
    'Initializing recommendation engine...',
    'Running collaborative filtering...',
    'Computing sales predictions...',
    'Rendering AI dashboard...',
  ];

  let step = 0;
  const interval = setInterval(() => {
    if (step < steps.length) {
      if (loaderText) loaderText.textContent = steps[step];
      if (progress) progress.style.width = `${((step + 1) / steps.length) * 100}%`;
      step++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.transform = 'scale(1.05)';
        setTimeout(() => {
          loader.classList.add('hidden');
          loader.style.opacity = '';
          loader.style.transform = '';
          app.classList.remove('hidden');
          app.style.opacity = '0';
          setTimeout(() => { app.style.transition = 'opacity 0.5s'; app.style.opacity = '1'; }, 10);
        }, 500);

        updateWelcomeUI();
        navigate('home');
        initEventListeners();

        if (!AUTH_STATE.isAdmin) {
          setTimeout(() => showToast('💡 Welcome! Personalized recommendations are ready for you.', 'info'), 1500);
        } else {
          setTimeout(() => showToast('🛡️ Admin access granted. Welcome, Trendcart Innovators!', 'success'), 1000);
        }
      }, 400);
    }
  }, 350);
}

// ── Network URL helpers ──
function setNetworkUrl() {
  const url    = window.location.origin + window.location.pathname.replace('index.html','');
  const anchor = document.getElementById('network-url');
  if (anchor) { anchor.href = url; anchor.textContent = url; }
  // Auto-show banner once
  const banner = document.getElementById('network-banner');
  if (banner) banner.classList.remove('hidden');
}

function copyNetworkUrl() {
  const url = window.location.origin + window.location.pathname.replace('index.html','');
  navigator.clipboard.writeText(url).then(() => showToast('🌐 Network URL copied! Share with others on Wi-Fi.', 'info'));
}

// Re-export navigate so admin view can be async
const _origNavigate = navigate;
// patch navigate to handle async admin render
(function() {
  const orig = navigate;
  window.navigate = function(view) {
    if (view === 'admin') {
      STATE.currentView = 'admin';
      document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.view === 'admin'));
      document.querySelectorAll('.view').forEach(el => el.classList.toggle('active', el.id === 'view-admin'));
      renderAdminView();          // async — returns promise, no need to await
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      orig(view);
    }
  };
})();
