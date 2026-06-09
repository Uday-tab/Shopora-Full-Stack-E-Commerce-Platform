/* ============================================================
   Shopora — js/components.js
   Shared UI component injector: navbar, footer, sidebars.
   ============================================================ */

// Set theme immediately during load to prevent flash
(function() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
})();

const Components = (() => {
  /* ---- helpers ---- */
  const _pathPrefix = (() => {
    const p = window.location.pathname;
    if (p.includes('/pages/customer/')) return '../../';
    if (p.includes('/pages/seller/'))   return '../../';
    if (p.includes('/pages/admin/'))    return '../../';
    return './';
  })();

  const _customerPath = _pathPrefix + 'pages/customer/';
  const _sellerPath   = _pathPrefix + 'pages/seller/';
  const _adminPath    = _pathPrefix + 'pages/admin/';
  const _cssPath      = _pathPrefix + 'css/';
  const _currentPage  = window.location.pathname.split('/').pop() || 'index.html';

  const _isActive = (page) => _currentPage === page ? 'active' : '';

  /* ---- SVG icons (inline) ---- */
  const icons = {
    cart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
      + '<circle cx="9" cy="21" r="1"/>'
      + '<circle cx="20" cy="21" r="1"/>'
      + '<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>'
      + '</svg>',

    search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
      + '<circle cx="11" cy="11" r="8"/>'
      + '<line x1="21" y1="21" x2="16.65" y2="16.65"/>'
      + '</svg>',

    user: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
      + '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>'
      + '<circle cx="12" cy="7" r="4"/>'
      + '</svg>',

    home: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
      + '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'
      + '<polyline points="9 22 9 12 15 12 15 22"/>'
      + '</svg>',

    box: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
      + '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8'
      + 'a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>'
      + '</svg>',

    plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
      + '<line x1="12" y1="5" x2="12" y2="19"/>'
      + '<line x1="5" y1="12" x2="19" y2="12"/>'
      + '</svg>',

    orders: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
      + '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>'
      + '<polyline points="14 2 14 8 20 8"/>'
      + '<line x1="16" y1="13" x2="8" y2="13"/>'
      + '<line x1="16" y1="17" x2="8" y2="17"/>'
      + '</svg>',

    chart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
      + '<line x1="18" y1="20" x2="18" y2="10"/>'
      + '<line x1="12" y1="20" x2="12" y2="4"/>'
      + '<line x1="6" y1="20" x2="6" y2="14"/>'
      + '</svg>',

    inventory: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
      + '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>'
      + '<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>'
      + '</svg>',

    dash: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
      + '<rect x="3" y="3" width="7" height="7"/>'
      + '<rect x="14" y="3" width="7" height="7"/>'
      + '<rect x="14" y="14" width="7" height="7"/>'
      + '<rect x="3" y="14" width="7" height="7"/>'
      + '</svg>',

    users: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
      + '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>'
      + '<circle cx="9" cy="7" r="4"/>'
      + '<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>'
      + '<path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
      + '</svg>',

    flag: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
      + '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>'
      + '<line x1="4" y1="22" x2="4" y2="15"/>'
      + '</svg>',

    heart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
      + '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06'
      + 'a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06'
      + 'a5.5 5.5 0 0 0 0-7.78z"/>'
      + '</svg>',

    settings: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
      + '<circle cx="12" cy="12" r="3"/>'
      + '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06'
      + 'a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09'
      + 'A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83'
      + 'l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09'
      + 'A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0'
      + 'l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09'
      + 'a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83'
      + 'l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09'
      + 'a1.65 1.65 0 0 0-1.51 1z"/>'
      + '</svg>',

    menu: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
      + '<line x1="3" y1="12" x2="21" y2="12"/>'
      + '<line x1="3" y1="6" x2="21" y2="6"/>'
      + '<line x1="3" y1="18" x2="21" y2="18"/>'
      + '</svg>',

    sun: '<svg class="sp-theme-icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none"'
      + ' stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
      + '<circle cx="12" cy="12" r="5"></circle>'
      + '<line x1="12" y1="1" x2="12" y2="3"></line>'
      + '<line x1="12" y1="21" x2="12" y2="23"></line>'
      + '<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>'
      + '<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>'
      + '<line x1="1" y1="12" x2="3" y2="12"></line>'
      + '<line x1="21" y1="12" x2="23" y2="12"></line>'
      + '<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>'
      + '<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>'
      + '</svg>',

    moon: '<svg class="sp-theme-icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none"'
      + ' stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
      + '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>'
      + '</svg>',
  };

  /* ==== CUSTOMER NAVBAR ==== */
  const injectCustomerNav = () => {
    const session = typeof AuthService !== 'undefined'
      ? AuthService.getCurrentUser()
      : null;
    const cartCount = typeof CartService !== 'undefined'
      ? CartService.getItemCount()
      : 0;

    const header = document.createElement('header');
    header.className = 'sp-header';
    header.innerHTML = `
      <a href="${_customerPath}index.html" class="sp-logo">
        shopora<span class="dot">.</span>
      </a>

      <nav class="sp-nav">
        <a href="${_customerPath}index.html" class="${_isActive('index.html')}">Home</a>
        <a href="${_customerPath}search.html" class="${_isActive('search.html')}">Shop</a>
        <a href="${_sellerPath}seller-login.html">Sell on Shopora</a>
        <a href="${_adminPath}admin-login.html">Admin</a>
      </nav>

      <div class="sp-header-actions">
        <div class="sp-search-wrap">
          <span class="sp-search-icon">${icons.search}</span>
          <input type="text"
                 id="sp-global-search"
                 placeholder="Search products..."
                 autocomplete="off">
          <div class="sp-autocomplete" id="sp-autocomplete"></div>
        </div>

        <button id="sp-theme-toggle"
                class="sp-theme-toggle-btn"
                title="Toggle Theme"
                aria-label="Toggle Theme">
          ${icons.sun}
          ${icons.moon}
        </button>

        <a href="${_customerPath}profile.html?tab=wishlist"
           class="sp-cart-btn"
           title="Wishlist"
           style="gap:.35rem;">
          ${icons.heart} Wishlist
        </a>

        <a href="${_customerPath}cart.html" class="sp-cart-btn">
          ${icons.cart} Cart
          <span class="sp-cart-badge" id="sp-cart-count">${cartCount}</span>
        </a>

        ${session && session.role === 'customer'
          ? `<a href="${_customerPath}profile.html"
                class="sp-auth-btn"
                style="text-decoration:none;">
              ${icons.user} ${session.name || 'Account'}
            </a>`
          : `<a href="${_customerPath}login.html"
                class="sp-auth-btn"
                style="text-decoration:none;">
              Sign In
            </a>`
        }
      </div>
    `;
    document.body.prepend(header);

    /* theme toggle listener */
    const themeToggleBtn = document.getElementById('sp-theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme') === 'dark'
          ? 'light'
          : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      });
    }

    /* search autocomplete */
    const searchInput = document.getElementById('sp-global-search');
    const acBox = document.getElementById('sp-autocomplete');

    if (searchInput && typeof ProductService !== 'undefined') {
      searchInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val.length < 2) {
          acBox.classList.remove('open');
          acBox.innerHTML = '';
          return;
        }

        const results = ProductService.autocomplete(val);
        if (!results.length) {
          acBox.classList.remove('open');
          return;
        }

        acBox.innerHTML = results.map(r =>
          `<div class="sp-autocomplete-item" data-id="${r.id}">
            <span>${r.title}</span>
            <span style="font-weight:700;color:var(--accent);">
              $${r.price.toFixed(2)}
            </span>
          </div>`
        ).join('');

        acBox.classList.add('open');

        acBox.querySelectorAll('.sp-autocomplete-item').forEach(item => {
          item.addEventListener('click', () => {
            window.location.href = `${_customerPath}product.html?id=${item.dataset.id}`;
          });
        });
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          window.location.href =
            `${_customerPath}search.html?q=${encodeURIComponent(searchInput.value)}`;
        }
      });

      document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !acBox.contains(e.target)) {
          acBox.classList.remove('open');
        }
      });
    }
  };

  /* ==== SELLER SIDEBAR ==== */
  const injectSellerSidebar = () => {
    const sidebar = document.createElement('aside');
    sidebar.className = 'sp-sidebar';
    sidebar.id = 'sp-seller-sidebar';
    sidebar.innerHTML = `
      <div class="sp-sidebar-section">
        <div class="sp-sidebar-label">Seller Portal</div>
        <a href="${_sellerPath}seller-dashboard.html"
           class="${_isActive('seller-dashboard.html')}">
          ${icons.dash} Dashboard
        </a>
        <a href="${_sellerPath}seller-products.html"
           class="${_isActive('seller-products.html')}">
          ${icons.box} My Products
        </a>
        <a href="${_sellerPath}seller-add-product.html"
           class="${_isActive('seller-add-product.html')}">
          ${icons.plus} Add Product
        </a>
        <a href="${_sellerPath}seller-orders.html"
           class="${_isActive('seller-orders.html')}">
          ${icons.orders} Orders
        </a>
        <a href="${_sellerPath}seller-inventory.html"
           class="${_isActive('seller-inventory.html')}">
          ${icons.inventory} Inventory
        </a>
        <a href="${_sellerPath}seller-analytics.html"
           class="${_isActive('seller-analytics.html')}">
          ${icons.chart} Analytics
        </a>
      </div>

      <div class="sp-sidebar-section" style="margin-top:auto;">
        <a href="${_customerPath}index.html">
          ${icons.home} Visit Storefront
        </a>
        <a href="#" id="sp-seller-logout" style="color:var(--danger);">
          Logout
        </a>
      </div>
    `;

    const gridEl = document.querySelector('.sp-page-grid');
    if (gridEl) gridEl.prepend(sidebar);

    const logoutBtn = document.getElementById('sp-seller-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof AuthService !== 'undefined') AuthService.logout();
        window.location.href = _sellerPath + 'seller-login.html';
      });
    }
  };

  /* ==== ADMIN SIDEBAR ==== */
  const injectAdminSidebar = () => {
    const sidebar = document.createElement('aside');
    sidebar.className = 'sp-sidebar';
    sidebar.id = 'sp-admin-sidebar';
    sidebar.innerHTML = `
      <div class="sp-sidebar-section">
        <div class="sp-sidebar-label">Admin Panel</div>
        <a href="${_adminPath}admin-dashboard.html"
           class="${_isActive('admin-dashboard.html')}">
          ${icons.dash} Dashboard
        </a>
        <a href="${_adminPath}admin-products.html"
           class="${_isActive('admin-products.html')}">
          ${icons.box} Products
        </a>
        <a href="${_adminPath}admin-users.html"
           class="${_isActive('admin-users.html')}">
          ${icons.users} Users
        </a>
        <a href="${_adminPath}admin-sellers.html"
           class="${_isActive('admin-sellers.html')}">
          ${icons.inventory} Sellers
        </a>
        <a href="${_adminPath}admin-reports.html"
           class="${_isActive('admin-reports.html')}">
          ${icons.flag} Reports
        </a>
      </div>

      <div class="sp-sidebar-section" style="margin-top:auto;">
        <a href="${_customerPath}index.html">
          ${icons.home} Visit Storefront
        </a>
        <a href="#" id="sp-admin-logout" style="color:var(--danger);">
          Logout
        </a>
      </div>
    `;

    const gridEl = document.querySelector('.sp-page-grid');
    if (gridEl) gridEl.prepend(sidebar);

    const logoutBtn = document.getElementById('sp-admin-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof AuthService !== 'undefined') AuthService.logout();
        window.location.href = _adminPath + 'admin-login.html';
      });
    }
  };

  /* ==== SELLER / ADMIN HEADER (minimal) ==== */
  const injectDashboardHeader = (type = 'seller') => {
    const session = typeof AuthService !== 'undefined'
      ? AuthService.getCurrentUser()
      : null;

    const header = document.createElement('header');
    header.className = 'sp-header';
    header.innerHTML = `
      <div style="display:flex;align-items:center;gap:1rem;">
        <button id="sp-sidebar-toggle"
                style="background:none;border:none;color:#fff;display:none;"
                class="sp-mobile-menu-btn">
          ${icons.menu}
        </button>

        <a href="${_customerPath}index.html" class="sp-logo">
          shopora<span class="dot">.</span>
        </a>

        <span class="sp-badge sp-badge-${type === 'admin' ? 'danger' : 'info'}"
              style="font-size:.7rem;padding:.25rem .6rem;">
          ${type === 'admin' ? 'ADMIN' : 'SELLER'}
        </span>
      </div>

      <div class="sp-header-actions">
        <button id="sp-theme-toggle"
                class="sp-theme-toggle-btn"
                title="Toggle Theme">
          ${icons.sun}
          ${icons.moon}
        </button>

        <span style="font-size:.85rem;color:#94a3b8;">
          ${session ? (session.companyName || session.name || session.email) : ''}
        </span>
      </div>
    `;
    document.body.prepend(header);

    /* theme toggle listener */
    const themeToggleBtn = document.getElementById('sp-theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme') === 'dark'
          ? 'light'
          : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      });
    }

    /* Mobile sidebar toggle */
    const toggleBtn = document.getElementById('sp-sidebar-toggle');
    if (toggleBtn && window.innerWidth <= 768) {
      toggleBtn.style.display = 'block';
      toggleBtn.addEventListener('click', () => {
        const sb = document.getElementById(`sp-${type}-sidebar`);
        if (sb) sb.classList.toggle('open');
      });
    }
  };

  /* ==== FOOTER ==== */
  const injectFooter = () => {
    const footer = document.createElement('footer');
    footer.className = 'sp-footer';
    footer.innerHTML = `
      <div class="sp-footer-grid">
        <div>
          <h4>Shopora</h4>
          <a href="${_customerPath}index.html">Home</a>
          <a href="${_customerPath}search.html">Shop</a>
          <a href="${_customerPath}cart.html">Cart</a>
        </div>
        <div>
          <h4>Sell</h4>
          <a href="${_sellerPath}seller-login.html">Seller Login</a>
          <a href="${_sellerPath}seller-signup.html">Become a Seller</a>
        </div>
        <div>
          <h4>Support</h4>
          <a href="javascript:void(0)" onclick="const msg='Support pages are not implemented in this educational demo.'; if(typeof Toast!=='undefined'){Toast.show(msg,'info');}else{alert(msg);}">Help Center</a>
          <a href="javascript:void(0)" onclick="const msg='Returns/Exchange portal is not active in this demo.'; if(typeof Toast!=='undefined'){Toast.show(msg,'info');}else{alert(msg);}">Returns</a>
          <a href="javascript:void(0)" onclick="const msg='Shipping policy document is placeholder only.'; if(typeof Toast!=='undefined'){Toast.show(msg,'info');}else{alert(msg);}">Shipping</a>
        </div>
        <div>
          <h4>Company</h4>
          <a href="javascript:void(0)" onclick="const msg='Shopora is an educational e-commerce demonstration project.'; if(typeof Toast!=='undefined'){Toast.show(msg,'info');}else{alert(msg);}">About</a>
          <a href="javascript:void(0)" onclick="const msg='Careers portal is inactive.'; if(typeof Toast!=='undefined'){Toast.show(msg,'info');}else{alert(msg);}">Careers</a>
          <a href="javascript:void(0)" onclick="const msg='Privacy Policy statement is a placeholder.'; if(typeof Toast!=='undefined'){Toast.show(msg,'info');}else{alert(msg);}">Privacy</a>
        </div>
      </div>
      <div class="sp-footer-bottom">
        &copy; ${new Date().getFullYear()} Shopora. All rights reserved.
        Built for educational demonstration.
      </div>
    `;
    document.body.appendChild(footer);
  };

  /* ==== Product Card HTML Generator ==== */
  const renderProductCard = (product, linkPrefix = '', showRemoveWishlist = false) => {
    const ep = typeof ProductService !== 'undefined'
      ? ProductService.getEffectivePrice(product)
      : product.price;
    const avg = typeof ProductService !== 'undefined'
      ? ProductService.getAvgRating(product)
      : 0;
    const stars = '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg));
    const href = linkPrefix
      ? `${linkPrefix}product.html?id=${product.id}`
      : `${_customerPath}product.html?id=${product.id}`;

    const removeBtn = showRemoveWishlist
      ? `<button class="sp-card-wishlist-remove"
            onclick="event.stopPropagation();
              if(typeof removeFromWishlist!=='undefined'){
                removeFromWishlist('${product.id}');
              } else {
                event.preventDefault();
              }"
            title="Remove from Wishlist"
            style="position:absolute;top:.6rem;right:.6rem;
                   background:#fff;border:1px solid var(--border);
                   color:var(--danger);width:26px;height:26px;
                   border-radius:50%;display:flex;align-items:center;
                   justify-content:center;font-weight:bold;font-size:1.1rem;
                   z-index:2;cursor:pointer;transition:all var(--transition);
                   box-shadow:var(--shadow);"
            onmouseover="this.style.background='var(--danger)';this.style.color='#fff';"
            onmouseout="this.style.background='#fff';this.style.color='var(--danger)';">
          ×
        </button>`
      : '';

    return `
      <div class="sp-card"
           onclick="window.location.href='${href}'"
           style="cursor:pointer;">

        ${product.tag
          ? `<span class="sp-card-badge">${product.tag}</span>`
          : (product.discount > 0
            ? `<span class="sp-card-badge">${product.discount}% OFF</span>`
            : '')
        }

        ${removeBtn}

        <div class="sp-card-img">
          ${product.images && product.images[0]
            ? `<img src="${product.images[0]}"
                    alt="${product.title}"
                    style="width:100%;height:100%;object-fit:contain;">`
            : ''
          }
        </div>

        <div class="sp-card-body">
          <div class="sp-card-seller">
            ${product.sellerName || product.brand}
          </div>
          <div class="sp-card-title">${product.title}</div>
          <div class="sp-card-rating">
            <span class="sp-stars">${stars}</span>
            (${(product.ratings || []).length})
          </div>
          <div class="sp-card-delivery">
            ✓ Free ${product.deliveryDays || 3}-day delivery
          </div>
          <div class="sp-card-price-row">
            <div>
              <span class="sp-card-price">$${ep.toFixed(2)}</span>
              ${product.discount > 0
                ? `<span class="sp-card-old-price">$${product.price.toFixed(2)}</span>`
                : ''
              }
            </div>
            <button class="sp-card-cart-btn"
                    onclick="event.stopPropagation();
                      if(typeof CartService!=='undefined'){
                        CartService.addToCart('${product.id}');
                        Components.updateCartBadge();
                        if(typeof Toast!=='undefined') Toast.show('Added to cart!','success');
                      }">
              ${icons.plus}
            </button>
          </div>
        </div>
      </div>
    `;
  };

  /* ==== Cart badge updater ==== */
  const updateCartBadge = () => {
    const badge = document.getElementById('sp-cart-count');
    if (badge && typeof CartService !== 'undefined') {
      badge.textContent = CartService.getItemCount();
    }
  };

  /* ==== Script loader helper ==== */
  const getScriptBasePath = () => _pathPrefix;

  return {
    injectCustomerNav,
    injectSellerSidebar,
    injectAdminSidebar,
    injectDashboardHeader,
    injectFooter,
    renderProductCard,
    updateCartBadge,
    icons,
    getScriptBasePath
  };
})();
