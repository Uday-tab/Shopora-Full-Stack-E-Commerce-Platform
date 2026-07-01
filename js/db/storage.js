/* ============================================================
   Shopora — js/db/storage.js
   Low-level localStorage relational database layer.
   All services call into this module; nothing else touches
   localStorage directly.
   ============================================================ */

const ShoporaDB = (() => {
  /* ---------- helpers ---------- */
  const _get = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  };

  const _set = (key, data) => localStorage.setItem(key, JSON.stringify(data));

  const _uid = () =>
    'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

  /* ---------- password hashing (synchronous, salted FNV-1a) ---------- */
  const _hashPw = (pw) => {
    if (!pw) return '';
    const salt = 'shopora_salt_v1';
    const str = salt + ':' + pw;
    let h1 = 0x811c9dc5 >>> 0;
    let h2 = 0xcbf29ce4 >>> 0;
    let h3 = 0x6c62272e >>> 0;

    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
      h2 = Math.imul(h2 ^ c, 0x100001b3) >>> 0;
      h3 = Math.imul(h3 ^ c, 0x01000289) >>> 0;
    }

    /* second pass (reversed) for better avalanche effect */
    for (let i = str.length - 1; i >= 0; i--) {
      const c = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
      h2 = Math.imul(h2 ^ c, 0x100001b3) >>> 0;
    }

    return h1.toString(16).padStart(8, '0')
      + h2.toString(16).padStart(8, '0')
      + h3.toString(16).padStart(8, '0');
  };

  /* ---------- generic CRUD (array-based tables) ---------- */
  const getAll = (table) => _get(table);

  const getById = (table, id) => _get(table).find(r => r.id === id) || null;

  const insert = (table, record) => {
    const rows = _get(table);
    record.id = record.id || _uid();
    rows.push(record);
    _set(table, rows);
    return record;
  };

  const _isObject = (item) => item && typeof item === 'object' && !Array.isArray(item);

  const _deepMerge = (target, source) => {
    if (!_isObject(target) || !_isObject(source)) return source;
    Object.keys(source).forEach(key => {
      const targetValue = target[key];
      const sourceValue = source[key];
      if (_isObject(targetValue) && _isObject(sourceValue)) {
        target[key] = _deepMerge(Object.assign({}, targetValue), sourceValue);
      } else {
        target[key] = sourceValue;
      }
    });
    return target;
  };

  const update = (table, id, patch) => {
    const rows = _get(table);
    const idx = rows.findIndex(r => r.id === id);
    if (idx === -1) return null;
    
    // Deep merge patch into the existing record
    rows[idx] = _deepMerge({ ...rows[idx] }, patch);
    _set(table, rows);
    return rows[idx];
  };

  const remove = (table, id) => {
    let rows = _get(table);
    rows = rows.filter(r => r.id !== id);
    _set(table, rows);
  };

  const query = (table, fn) => _get(table).filter(fn);
  const count = (table) => _get(table).length;
  const clear = (table) => _set(table, []);
  const uid = _uid;

  /* ---------- single-object storage (for analytics, settings, etc.) ---------- */
  const getObject = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || {};
    } catch {
      return {};
    }
  };

  const setObject = (key, obj) => localStorage.setItem(key, JSON.stringify(obj));

  /* ---------- session (active logged-in user) ---------- */
  const setSession = (user) => {
    /* Never store password in session */
    const safe = { ...user };
    delete safe.password;
    sessionStorage.setItem('shopora_session', JSON.stringify(safe));
  };

  const getSession = () => {
    try {
      return JSON.parse(sessionStorage.getItem('shopora_session'));
    } catch {
      return null;
    }
  };

  const clearSession = () => sessionStorage.removeItem('shopora_session');

  /* ================================================================
     AUTO-SEED — populates the database with demo data on first visit
     ================================================================ */
  const seed = () => {
    if (localStorage.getItem('shopora_seeded')) return;

    /* ----- users ----- */
    const users = [
      {
        id: 'user-1',
        email: 'user@shopora.com',
        password: _hashPw('user123'),
        role: 'customer',
        name: 'Jane Doe',
        addresses: [
          {
            label: 'Home',
            line1: '742 Evergreen Terrace',
            city: 'Seattle',
            state: 'WA',
            zip: '98101',
            phone: '555-0101'
          }
        ],
        wishlist: [],
        recentlyViewed: [],
        notifications: []
      },
      {
        id: 'user-2',
        email: 'alex@shopora.com',
        password: _hashPw('alex123'),
        role: 'customer',
        name: 'Alex Park',
        addresses: [],
        wishlist: [],
        recentlyViewed: [],
        notifications: []
      }
    ];
    _set('users', users);

    /* ----- sellers ----- */
    const sellers = [
      {
        id: 'seller-1',
        email: 'seller@shopora.com',
        password: _hashPw('seller123'),
        role: 'seller',
        companyName: 'Apex Technologies',
        revenue: 12480,
        productsCount: 0,
        status: 'active',
        joinDate: '2026-01-15'
      },
      {
        id: 'seller-2',
        email: 'nova@shopora.com',
        password: _hashPw('nova123'),
        role: 'seller',
        companyName: 'Nova Home Co.',
        revenue: 8920,
        productsCount: 0,
        status: 'active',
        joinDate: '2026-03-22'
      },
      {
        id: 'seller-3',
        email: 'threadline@shopora.com',
        password: _hashPw('thread123'),
        role: 'seller',
        companyName: 'Threadline Apparel',
        revenue: 5200,
        productsCount: 0,
        status: 'active',
        joinDate: '2026-04-10'
      }
    ];
    _set('sellers', sellers);

    /* ----- admins ----- */
    _set('admins', [
      {
        id: 'admin-1',
        email: 'admin@shopora.com',
        password: _hashPw('admin123'),
        role: 'admin',
        name: 'Root Admin'
      }
    ]);

    /* ----- categories ----- */
    _set('categories', [
      { id: 'cat-1', value: 'electronics', label: 'Electronics' },
      { id: 'cat-2', value: 'smarthome', label: 'Smart Home' },
      { id: 'cat-3', value: 'apparel', label: 'Apparel' },
      { id: 'cat-4', value: 'books', label: 'Books' }
    ]);

    /* ----- payouts ----- */
    _set('payouts', []);

    /* ----- product image generator (returns data URL for demo imagery) ----- */
    const svgImg = (bgColor, label, accent) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">`
        + `<rect width="300" height="300" fill="${bgColor}"/>`
        + `<rect x="40" y="60" width="220" height="180" rx="16" fill="${accent}" opacity="0.15"/>`
        + `<text x="150" y="160" text-anchor="middle" fill="${accent}" `
        + `font-family="Inter,sans-serif" font-size="18" font-weight="700">`
        + `${label}</text></svg>`;
      return 'data:image/svg+xml,' + encodeURIComponent(svg);
    };

    /* ----- products ----- */
    const products = [
      {
        id: 'prod-1',
        title: 'Apex UltraBook Pro 15',
        description: 'Premium ultrabook with 4K OLED display, Intel Core i9, and all-day battery life. '
          + 'Machined aluminum chassis with thunderbolt connectivity.',
        brand: 'Apex',
        category: 'electronics',
        subcategory: 'laptops',
        price: 1299.99,
        discount: 12,
        images: [
          svgImg('#0f172a', 'UltraBook Pro', '#0ea5e9'),
          svgImg('#1e293b', 'Side View', '#38bdf8'),
          svgImg('#0c1222', 'Keyboard', '#06b6d4')
        ],
        specifications: {
          'Processor': 'Intel Core i9-13900H',
          'RAM': '32GB DDR5',
          'Storage': '1TB NVMe SSD',
          'Display': '15.6" 4K OLED',
          'Battery': '72Wh, 12hr',
          'Weight': '1.65 kg',
          'OS': 'Windows 11 Pro'
        },
        features: [
          'Thunderbolt 4 ports',
          'Fingerprint reader',
          'Wi-Fi 6E',
          'Backlit keyboard',
          'MIL-STD-810H certified'
        ],
        variants: [
          { color: 'Space Grey', size: '15-inch', storage: '512GB', ram: '16GB', stock: 24, price: 1099.99 },
          { color: 'Space Grey', size: '15-inch', storage: '1TB', ram: '32GB', stock: 18, price: 1299.99 },
          { color: 'Silver', size: '15-inch', storage: '1TB', ram: '32GB', stock: 10, price: 1299.99 }
        ],
        sellerId: 'seller-1',
        sellerName: 'Apex Technologies',
        ratings: [5, 4, 5, 4, 5, 3, 5, 4],
        reviews: [
          {
            userId: 'user-1',
            username: 'Jane Doe',
            rating: 5,
            comment: 'Best laptop I have ever owned. The display is gorgeous and the performance is unreal.',
            date: '2026-05-10',
            flagged: false
          },
          {
            userId: 'user-2',
            username: 'Alex Park',
            rating: 4,
            comment: 'Great machine, slightly warm under heavy load but overall excellent.',
            date: '2026-05-18',
            flagged: false
          }
        ],
        stock: 52,
        tags: ['laptop', 'ultrabook', '4k', 'oled', 'intel', 'premium'],
        deliveryDays: 3,
        status: 'published',
        createdAt: '2026-04-01'
      },

      {
        id: 'prod-2',
        title: 'Apex Wireless ANC Headphones',
        description: 'Active noise cancelling over-ear headphones with spatial audio, '
          + '40-hour battery, and premium memory foam cushions.',
        brand: 'Apex',
        category: 'electronics',
        subcategory: 'audio',
        price: 299.99,
        discount: 15,
        images: [
          svgImg('#1a1a2e', 'ANC Headphones', '#a855f7'),
          svgImg('#16213e', 'Folded', '#c084fc')
        ],
        specifications: {
          'Driver': '40mm Custom',
          'ANC': 'Adaptive Hybrid',
          'Battery': '40 hours',
          'Bluetooth': '5.3',
          'Weight': '250g',
          'Codec': 'LDAC, AAC, SBC'
        },
        features: [
          'Adaptive noise cancellation',
          'Spatial audio',
          'Multi-point connection',
          'Foldable design',
          'USB-C fast charge'
        ],
        variants: [
          { color: 'Midnight Black', size: 'One Size', storage: 'N/A', ram: 'N/A', stock: 45, price: 299.99 },
          { color: 'Cloud White', size: 'One Size', storage: 'N/A', ram: 'N/A', stock: 30, price: 299.99 }
        ],
        sellerId: 'seller-1',
        sellerName: 'Apex Technologies',
        ratings: [5, 5, 4, 5, 4, 5],
        reviews: [
          {
            userId: 'user-2',
            username: 'Alex Park',
            rating: 5,
            comment: 'The ANC on these is incredible. Blocks out everything on flights.',
            date: '2026-05-20',
            flagged: false
          }
        ],
        stock: 75,
        tags: ['headphones', 'anc', 'wireless', 'audio', 'bluetooth'],
        deliveryDays: 2,
        status: 'published',
        createdAt: '2026-04-05'
      },

      {
        id: 'prod-3',
        title: 'SmartView 4K Monitor 27"',
        description: 'Professional 27-inch 4K IPS monitor with 99% DCI-P3 color gamut, '
          + 'USB-C PD 90W, and ergonomic stand.',
        brand: 'Apex',
        category: 'electronics',
        subcategory: 'monitors',
        price: 549.99,
        discount: 8,
        images: [
          svgImg('#0a0e1a', '4K Monitor', '#22d3ee'),
          svgImg('#111827', 'Rear Ports', '#06b6d4')
        ],
        specifications: {
          'Panel': '27" IPS 4K UHD',
          'Color': '99% DCI-P3',
          'Refresh': '60Hz',
          'Response': '5ms',
          'Ports': 'HDMI 2.1, DP 1.4, USB-C PD 90W',
          'VESA': '100x100mm'
        },
        features: [
          'USB-C 90W Power Delivery',
          'Hardware calibration',
          'Blue light filter',
          'Height adjustable stand',
          'Daisy-chain support'
        ],
        variants: [
          { color: 'Black', size: '27-inch', storage: 'N/A', ram: 'N/A', stock: 20, price: 549.99 }
        ],
        sellerId: 'seller-1',
        sellerName: 'Apex Technologies',
        ratings: [4, 5, 4, 4, 5],
        reviews: [],
        stock: 20,
        tags: ['monitor', '4k', 'usb-c', 'professional', 'display'],
        deliveryDays: 4,
        status: 'published',
        createdAt: '2026-04-10'
      },

      {
        id: 'prod-4',
        title: 'Nova Smart Air Purifier',
        description: 'HEPA-13 air purifier with real-time AQI display, '
          + 'whisper-quiet operation, and app control via Wi-Fi.',
        brand: 'Nova Home',
        category: 'smarthome',
        subcategory: 'appliances',
        price: 189.99,
        discount: 10,
        images: [
          svgImg('#0f2027', 'Air Purifier', '#10b981'),
          svgImg('#1a3a3a', 'Filter View', '#34d399')
        ],
        specifications: {
          'Filter': 'True HEPA-13',
          'Coverage': '500 sq ft',
          'Noise': '24 dB whisper mode',
          'Connectivity': 'Wi-Fi / Alexa / Google',
          'Modes': 'Auto, Sleep, Turbo',
          'Filter Life': '12 months'
        },
        features: [
          'Real-time AQI sensor',
          'Whisper mode at 24dB',
          'Washable pre-filter',
          'Child lock',
          'Schedule via app'
        ],
        variants: [
          { color: 'Matte White', size: 'Standard', storage: 'N/A', ram: 'N/A', stock: 35, price: 189.99 },
          { color: 'Charcoal', size: 'Standard', storage: 'N/A', ram: 'N/A', stock: 22, price: 189.99 }
        ],
        sellerId: 'seller-2',
        sellerName: 'Nova Home Co.',
        ratings: [5, 4, 5, 5, 4, 4, 5],
        reviews: [
          {
            userId: 'user-1',
            username: 'Jane Doe',
            rating: 5,
            comment: 'Completely silent on whisper mode. Air quality improved noticeably within days.',
            date: '2026-05-12',
            flagged: false
          }
        ],
        stock: 57,
        tags: ['air purifier', 'hepa', 'smart home', 'alexa', 'health'],
        deliveryDays: 3,
        status: 'published',
        createdAt: '2026-03-28'
      },

      {
        id: 'prod-5',
        title: 'Nova Smart Thermostat Pro',
        description: 'Learning thermostat with energy-saving AI, geofencing, and multi-zone support. '
          + 'Works with all major HVAC systems.',
        brand: 'Nova Home',
        category: 'smarthome',
        subcategory: 'climate',
        price: 229.99,
        discount: 5,
        images: [
          svgImg('#1a1a2e', 'Thermostat', '#f59e0b'),
          svgImg('#1e293b', 'Wall Mount', '#fbbf24')
        ],
        specifications: {
          'Display': '3.5" LCD Touch',
          'Sensors': 'Temperature, Humidity, Proximity, Ambient Light',
          'Connectivity': 'Wi-Fi, BLE, Thread',
          'Compatibility': '95% of HVAC systems',
          'Power': '24V C-wire or battery'
        },
        features: [
          'AI energy learning',
          'Geofencing auto-away',
          'Multi-zone scheduling',
          'Energy reports',
          'Voice control'
        ],
        variants: [
          { color: 'Brushed Steel', size: 'Standard', storage: 'N/A', ram: 'N/A', stock: 28, price: 229.99 },
          { color: 'Matte Black', size: 'Standard', storage: 'N/A', ram: 'N/A', stock: 15, price: 229.99 }
        ],
        sellerId: 'seller-2',
        sellerName: 'Nova Home Co.',
        ratings: [4, 5, 4, 5, 5],
        reviews: [],
        stock: 43,
        tags: ['thermostat', 'smart home', 'energy', 'climate', 'ai'],
        deliveryDays: 3,
        status: 'published',
        createdAt: '2026-04-15'
      },

      {
        id: 'prod-6',
        title: 'Nova Robot Vacuum S7',
        description: 'LiDAR navigation robot vacuum with mopping, auto-empty dock, '
          + 'and room-specific cleaning schedules.',
        brand: 'Nova Home',
        category: 'smarthome',
        subcategory: 'cleaning',
        price: 449.99,
        discount: 18,
        images: [
          svgImg('#0b0f19', 'Robot Vacuum', '#ec4899'),
          svgImg('#1e1b2e', 'Dock Station', '#f472b6')
        ],
        specifications: {
          'Suction': '5500 Pa',
          'Navigation': 'LiDAR 360°',
          'Battery': '5200mAh, 180min',
          'Dustbin': '400ml',
          'Water Tank': '300ml',
          'Noise': '65 dB'
        },
        features: [
          'LiDAR smart mapping',
          'Auto-empty dock',
          'Room scheduling',
          'Carpet detection boost',
          'App + Voice control'
        ],
        variants: [
          { color: 'Black', size: 'Standard', storage: 'N/A', ram: 'N/A', stock: 18, price: 449.99 },
          { color: 'White', size: 'Standard', storage: 'N/A', ram: 'N/A', stock: 12, price: 449.99 }
        ],
        sellerId: 'seller-2',
        sellerName: 'Nova Home Co.',
        ratings: [5, 4, 5, 4, 3, 5, 5],
        reviews: [
          {
            userId: 'user-2',
            username: 'Alex Park',
            rating: 5,
            comment: 'Fantastic mapping. Handles my multi-floor apartment perfectly.',
            date: '2026-05-22',
            flagged: false
          }
        ],
        stock: 30,
        tags: ['robot vacuum', 'lidar', 'mopping', 'smart home', 'cleaning'],
        deliveryDays: 4,
        status: 'published',
        createdAt: '2026-04-20'
      },

      {
        id: 'prod-7',
        title: 'Threadline Performance Jacket',
        description: 'Technical running jacket with water-resistant shell, reflective accents, '
          + 'and 4-way stretch fabric for unrestricted movement.',
        brand: 'Threadline',
        category: 'apparel',
        subcategory: 'outerwear',
        price: 129.99,
        discount: 20,
        images: [
          svgImg('#0d1b2a', 'Performance Jacket', '#3b82f6'),
          svgImg('#1b2838', 'Back View', '#60a5fa')
        ],
        specifications: {
          'Material': '92% Nylon, 8% Spandex',
          'Waterproof': '10K/10K rating',
          'Weight': '280g',
          'Pockets': '3 zippered',
          'Fit': 'Athletic'
        },
        features: [
          'DWR water-resistant coating',
          '360° reflective details',
          'Packable into pocket',
          'Thumbhole cuffs',
          'Ventilation panels'
        ],
        variants: [
          { color: 'Navy Blue', size: 'S', storage: 'N/A', ram: 'N/A', stock: 20, price: 129.99 },
          { color: 'Navy Blue', size: 'M', storage: 'N/A', ram: 'N/A', stock: 30, price: 129.99 },
          { color: 'Navy Blue', size: 'L', storage: 'N/A', ram: 'N/A', stock: 25, price: 129.99 },
          { color: 'Black', size: 'M', storage: 'N/A', ram: 'N/A', stock: 18, price: 129.99 },
          { color: 'Black', size: 'L', storage: 'N/A', ram: 'N/A', stock: 22, price: 129.99 }
        ],
        sellerId: 'seller-3',
        sellerName: 'Threadline Apparel',
        ratings: [4, 5, 4, 5, 4],
        reviews: [],
        stock: 115,
        tags: ['jacket', 'running', 'waterproof', 'athletic', 'reflective'],
        deliveryDays: 2,
        status: 'published',
        createdAt: '2026-04-08'
      },

      {
        id: 'prod-8',
        title: 'Threadline Merino Wool Crew',
        description: 'Premium merino wool crew-neck tee. Naturally temperature-regulating, '
          + 'odor-resistant, and incredibly soft for everyday wear.',
        brand: 'Threadline',
        category: 'apparel',
        subcategory: 'tops',
        price: 79.99,
        discount: 0,
        images: [
          svgImg('#1a0a0a', 'Merino Crew', '#f97316'),
          svgImg('#2a1a1a', 'Detail', '#fb923c')
        ],
        specifications: {
          'Material': '100% Merino Wool 17.5μm',
          'Weight': '170 GSM',
          'Care': 'Machine washable',
          'Fit': 'Regular',
          'Origin': 'New Zealand merino'
        },
        features: [
          'Natural temperature regulation',
          'Odor resistant',
          'UV protection UPF 30+',
          'Moisture wicking',
          'Flatlock seams'
        ],
        variants: [
          { color: 'Charcoal', size: 'S', storage: 'N/A', ram: 'N/A', stock: 40, price: 79.99 },
          { color: 'Charcoal', size: 'M', storage: 'N/A', ram: 'N/A', stock: 50, price: 79.99 },
          { color: 'Charcoal', size: 'L', storage: 'N/A', ram: 'N/A', stock: 35, price: 79.99 },
          { color: 'Forest Green', size: 'M', storage: 'N/A', ram: 'N/A', stock: 25, price: 79.99 },
          { color: 'Forest Green', size: 'L', storage: 'N/A', ram: 'N/A', stock: 20, price: 79.99 }
        ],
        sellerId: 'seller-3',
        sellerName: 'Threadline Apparel',
        ratings: [5, 5, 4, 5, 5, 4],
        reviews: [
          {
            userId: 'user-1',
            username: 'Jane Doe',
            rating: 5,
            comment: 'The softest tee I own. Merino wool is a game changer.',
            date: '2026-05-15',
            flagged: false
          }
        ],
        stock: 170,
        tags: ['merino', 'wool', 'tshirt', 'premium', 'sustainable'],
        deliveryDays: 2,
        status: 'published',
        createdAt: '2026-04-12'
      },

      {
        id: 'prod-9',
        title: 'Apex Mechanical Keyboard K7',
        description: 'Hot-swappable mechanical keyboard with CNC aluminum frame, '
          + 'per-key RGB, and QMK/VIA firmware support.',
        brand: 'Apex',
        category: 'electronics',
        subcategory: 'peripherals',
        price: 179.99,
        discount: 10,
        images: [
          svgImg('#0a0f1e', 'Mech Keyboard', '#ea580c'),
          svgImg('#1a1f2e', 'Keycaps', '#f97316')
        ],
        specifications: {
          'Layout': '75% compact',
          'Switches': 'Hot-swappable (MX compatible)',
          'Keycaps': 'Double-shot PBT',
          'Connection': 'USB-C / Bluetooth 5.1 / 2.4GHz',
          'Battery': '4000mAh',
          'Frame': 'CNC aluminum'
        },
        features: [
          'Triple-mode wireless',
          'Hot-swappable sockets',
          'Per-key RGB',
          'QMK/VIA programmable',
          'Gasket-mount design'
        ],
        variants: [
          { color: 'Space Grey', size: '75%', storage: 'N/A', ram: 'N/A', stock: 30, price: 179.99 },
          { color: 'Black', size: '75%', storage: 'N/A', ram: 'N/A', stock: 20, price: 179.99 }
        ],
        sellerId: 'seller-1',
        sellerName: 'Apex Technologies',
        ratings: [5, 4, 5, 5, 4, 5],
        reviews: [],
        stock: 50,
        tags: ['keyboard', 'mechanical', 'rgb', 'wireless', 'hot-swap'],
        deliveryDays: 3,
        status: 'published',
        createdAt: '2026-05-01'
      },

      {
        id: 'prod-10',
        title: 'Threadline Ultralight Running Shoes',
        description: 'Carbon-plate running shoes with nitrogen-infused foam midsole. '
          + 'Built for speed with a breathable engineered knit upper.',
        brand: 'Threadline',
        category: 'apparel',
        subcategory: 'footwear',
        price: 199.99,
        discount: 15,
        images: [
          svgImg('#0c1a0c', 'Running Shoes', '#22c55e'),
          svgImg('#1a2e1a', 'Sole View', '#4ade80')
        ],
        specifications: {
          'Upper': 'Engineered knit',
          'Midsole': 'Nitrogen-infused foam',
          'Plate': 'Full-length carbon',
          'Drop': '8mm',
          'Weight': '215g (M9)',
          'Outsole': 'High-abrasion rubber'
        },
        features: [
          'Carbon fiber propulsion plate',
          'Nitrogen foam energy return',
          'Breathable 3D knit upper',
          'Reflective heel tab',
          'Recycled materials'
        ],
        variants: [
          { color: 'Volt Green', size: '8', storage: 'N/A', ram: 'N/A', stock: 15, price: 199.99 },
          { color: 'Volt Green', size: '9', storage: 'N/A', ram: 'N/A', stock: 20, price: 199.99 },
          { color: 'Volt Green', size: '10', storage: 'N/A', ram: 'N/A', stock: 18, price: 199.99 },
          { color: 'Black', size: '9', storage: 'N/A', ram: 'N/A', stock: 12, price: 199.99 },
          { color: 'Black', size: '10', storage: 'N/A', ram: 'N/A', stock: 14, price: 199.99 }
        ],
        sellerId: 'seller-3',
        sellerName: 'Threadline Apparel',
        ratings: [5, 5, 4, 5],
        reviews: [],
        stock: 79,
        tags: ['shoes', 'running', 'carbon plate', 'lightweight', 'athletic'],
        deliveryDays: 3,
        status: 'published',
        createdAt: '2026-05-05'
      },

      {
        id: 'prod-11',
        title: 'Designing Data-Intensive Applications',
        description: 'The definitive guide to the big ideas behind reliable, scalable, and maintainable systems. '
          + 'Covers replication, partitioning, transactions, and distributed architectures.',
        brand: 'O\'Reilly',
        category: 'books',
        subcategory: 'technology',
        price: 44.99,
        discount: 0,
        images: [
          svgImg('#2e1a0a', 'DDIA Book', '#f59e0b'),
          svgImg('#3e2a1a', 'Back Cover', '#fbbf24')
        ],
        specifications: {
          'Author': 'Martin Kleppmann',
          'Pages': '616',
          'Publisher': 'O\'Reilly Media',
          'ISBN': '978-1449373320',
          'Format': 'Paperback & Kindle'
        },
        features: [
          'Covers distributed databases',
          'Stream processing deep-dive',
          'Encoding and schema evolution',
          'Consensus algorithms',
          'Real-world case studies'
        ],
        variants: [
          { color: 'N/A', size: 'Paperback', storage: 'N/A', ram: 'N/A', stock: 100, price: 44.99 },
          { color: 'N/A', size: 'Kindle', storage: 'N/A', ram: 'N/A', stock: 999, price: 29.99 }
        ],
        sellerId: 'seller-1',
        sellerName: 'Apex Technologies',
        ratings: [5, 5, 5, 5, 4, 5, 5, 5],
        reviews: [
          {
            userId: 'user-1',
            username: 'Jane Doe',
            rating: 5,
            comment: 'Essential reading for any backend engineer. Changed how I think about systems.',
            date: '2026-05-08',
            flagged: false
          }
        ],
        stock: 1099,
        tags: ['book', 'distributed systems', 'databases', 'engineering', 'architecture'],
        deliveryDays: 2,
        status: 'published',
        createdAt: '2026-03-01'
      },

      {
        id: 'prod-12',
        title: 'Nova Smart LED Strip 5m',
        description: 'Addressable RGBIC LED strip with music sync, scene modes, '
          + 'and segmented color control via app.',
        brand: 'Nova Home',
        category: 'smarthome',
        subcategory: 'lighting',
        price: 34.99,
        discount: 25,
        images: [
          svgImg('#0a0a1e', 'LED Strip', '#8b5cf6'),
          svgImg('#1a1a2e', 'Music Sync', '#a78bfa')
        ],
        specifications: {
          'Length': '5 meters',
          'LEDs': '60/m RGBIC',
          'Power': '24W',
          'Control': 'App / Voice / Remote',
          'IP Rating': 'IP65 (Indoor use)',
          'Lifespan': '50,000 hours'
        },
        features: [
          'RGBIC segmented colors',
          'Music reactive mode',
          '16 million colors',
          'Timer and scheduling',
          'Cut-to-size design'
        ],
        variants: [
          { color: 'RGBIC', size: '5m', storage: 'N/A', ram: 'N/A', stock: 80, price: 34.99 },
          { color: 'RGBIC', size: '10m', storage: 'N/A', ram: 'N/A', stock: 40, price: 54.99 }
        ],
        sellerId: 'seller-2',
        sellerName: 'Nova Home Co.',
        ratings: [4, 5, 4, 4, 5, 3],
        reviews: [],
        stock: 120,
        tags: ['led', 'strip', 'rgb', 'smart home', 'lighting', 'music'],
        deliveryDays: 2,
        status: 'published',
        createdAt: '2026-04-25'
      }
    ];
    _set('products', products);

    /* update seller product counts */
    sellers.forEach(s => {
      s.productsCount = products.filter(p => p.sellerId === s.id).length;
    });
    _set('sellers', sellers);

    /* ----- carts, orders, reports, analytics ----- */
    _set('carts', []);

    _set('orders', [
      {
        id: 'order-1',
        userId: 'user-1',
        items: [
          {
            productId: 'prod-2',
            title: 'Apex Wireless ANC Headphones',
            price: 254.99,
            quantity: 1,
            variant: { color: 'Midnight Black', size: 'One Size' }
          }
        ],
        status: 'delivered',
        total: 254.99,
        date: '2026-05-20',
        shippingAddress: {
          line1: '742 Evergreen Terrace',
          city: 'Seattle',
          state: 'WA',
          zip: '98101'
        },
        sellerId: 'seller-1'
      },
      {
        id: 'order-2',
        userId: 'user-2',
        items: [
          {
            productId: 'prod-8',
            title: 'Threadline Merino Wool Crew',
            price: 79.99,
            quantity: 2,
            variant: { color: 'Charcoal', size: 'M' }
          }
        ],
        status: 'shipped',
        total: 159.98,
        date: '2026-05-25',
        shippingAddress: {
          line1: '100 Main St',
          city: 'Portland',
          state: 'OR',
          zip: '97201'
        },
        sellerId: 'seller-3'
      }
    ]);

    _set('reports', []);

    _set('analytics', {
      totalRevenue: 26600,
      totalOrders: 2,
      totalUsers: 2,
      totalSellers: 3,
      totalProducts: 12,
      pageViews: 4820
    });

    localStorage.setItem('shopora_seeded', 'true');
  };

  /* run seed on load */
  seed();

  /* ---------- public API ---------- */
  return {
    getAll,
    getById,
    insert,
    update,
    remove,
    query,
    count,
    clear,
    uid,
    getObject,
    setObject,
    hashPassword: _hashPw,
    setSession,
    getSession,
    clearSession,
    seed
  };
})();
