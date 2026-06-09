    let currentRating = 0;
    let currentView = 3;

    document.addEventListener('DOMContentLoaded', () => {
      Components.injectCustomerNav();
      Components.injectFooter();

      // Stats
      const allProds = ProductService.getAll();
      const cats = ProductService.getCategories();
      const brands = ProductService.getBrands();

      document.getElementById('shop-stats').innerHTML = `
        <div class="shop-hero-stat">
          <div class="val">${allProds.length}</div>
          <div class="lbl">Products</div>
        </div>
        <div class="shop-hero-stat">
          <div class="val">${cats.length}</div>
          <div class="lbl">Categories</div>
        </div>
        <div class="shop-hero-stat">
          <div class="val">${brands.length}</div>
          <div class="lbl">Brands</div>
        </div>
      `;

      buildFilterUI();

      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || '';
      const cat = params.get('category') || '';

      if (q) {
        const searchInput = document.getElementById('sp-global-search');
        if (searchInput) searchInput.value = q;
      }
      if (cat) {
        const cb = document.querySelector(`#filter-categories input[value="${cat}"]`);
        if (cb) cb.checked = true;
      }

      applyFilters();
    });

    function buildFilterUI() {
      const cats = ProductService.getCategories();
      document.getElementById('filter-categories').innerHTML = cats.map(c =>
        `<label class="filter-check">
          <input type="checkbox" value="${c}" onchange="applyFilters()">
          ${c.charAt(0).toUpperCase() + c.slice(1)}
        </label>`
      ).join('');

      const brands = ProductService.getBrands();
      document.getElementById('filter-brands').innerHTML = brands.map(b =>
        `<label class="filter-check">
          <input type="checkbox" value="${b}" onchange="applyFilters()">
          ${b}
        </label>`
      ).join('');

      const ratingEl = document.getElementById('filter-rating');
      for (let i = 1; i <= 5; i++) {
        const btn = document.createElement('button');
        btn.textContent = '★'.repeat(i) + '☆'.repeat(5 - i);
        btn.onclick = () => {
          currentRating = currentRating === i ? 0 : i;
          ratingEl.querySelectorAll('button').forEach((b, idx) =>
            b.classList.toggle('active', idx < currentRating)
          );
          applyFilters();
        };
        ratingEl.appendChild(btn);
      }
    }

    function setView(cols) {
      currentView = cols;
      const grid = document.getElementById('results-grid');
      grid.classList.toggle('two-col', cols === 2);
      document.getElementById('grid3-btn').classList.toggle('active', cols === 3);
      document.getElementById('grid2-btn').classList.toggle('active', cols === 2);
    }

    function applyFilters() {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || document.getElementById('sp-global-search')?.value || '';

      const checkedCats = [...document.querySelectorAll('#filter-categories input:checked')]
        .map(c => c.value);
      const checkedBrands = [...document.querySelectorAll('#filter-brands input:checked')]
        .map(b => b.value);
      const minPrice = parseFloat(document.getElementById('filter-min-price').value) || undefined;
      const maxPrice = parseFloat(document.getElementById('filter-max-price').value) || undefined;
      const sort = document.getElementById('sort-select').value || undefined;

      let results = q ? ProductService.search(q) : ProductService.getAll();

      if (checkedCats.length) {
        results = results.filter(p => checkedCats.includes(p.category));
      }
      if (checkedBrands.length) {
        results = results.filter(p => checkedBrands.includes(p.brand));
      }
      if (minPrice !== undefined) {
        results = results.filter(p => ProductService.getEffectivePrice(p) >= minPrice);
      }
      if (maxPrice !== undefined) {
        results = results.filter(p => ProductService.getEffectivePrice(p) <= maxPrice);
      }
      if (currentRating > 0) {
        results = results.filter(p => ProductService.getAvgRating(p) >= currentRating);
      }

      if (sort) {
        switch (sort) {
          case 'price-low':
            results.sort((a, b) =>
              ProductService.getEffectivePrice(a) - ProductService.getEffectivePrice(b));
            break;
          case 'price-high':
            results.sort((a, b) =>
              ProductService.getEffectivePrice(b) - ProductService.getEffectivePrice(a));
            break;
          case 'rating':
            results.sort((a, b) =>
              ProductService.getAvgRating(b) - ProductService.getAvgRating(a));
            break;
          case 'newest':
            results.sort((a, b) =>
              new Date(b.createdAt) - new Date(a.createdAt));
            break;
          case 'popular':
            results.sort((a, b) =>
              (b.ratings || []).length - (a.ratings || []).length);
            break;
        }
      }

      // Update results header
      const titleEl = document.getElementById('results-title');
      const countEl = document.getElementById('results-count');
      if (q) {
        titleEl.innerHTML =
          `Results for "${q}" <span id="results-count">${results.length}</span>`;
      } else {
        titleEl.innerHTML =
          `All Products <span id="results-count">${results.length}</span>`;
      }

      // Active filter tags
      const tagsHtml = [];

      checkedCats.forEach(c => tagsHtml.push(
        `<span class="active-filter-tag">${c} <button onclick="removeFilter('cat','${c}')">×</button></span>`
      ));

      checkedBrands.forEach(b => tagsHtml.push(
        `<span class="active-filter-tag">${b} <button onclick="removeFilter('brand','${b}')">×</button></span>`
      ));

      if (minPrice !== undefined) {
        tagsHtml.push(
          `<span class="active-filter-tag">Min $${minPrice} <button onclick="document.getElementById('filter-min-price').value='';applyFilters();">×</button></span>`
        );
      }
      if (maxPrice !== undefined) {
        tagsHtml.push(
          `<span class="active-filter-tag">Max $${maxPrice} <button onclick="document.getElementById('filter-max-price').value='';applyFilters();">×</button></span>`
        );
      }
      if (currentRating > 0) {
        tagsHtml.push(
          `<span class="active-filter-tag">${currentRating}+ Stars <button onclick="currentRating=0;document.querySelectorAll('#filter-rating button').forEach(b=>b.classList.remove('active'));applyFilters();">×</button></span>`
        );
      }

      document.getElementById('active-filters').innerHTML = tagsHtml.join('');

      // Render grid
      const grid = document.getElementById('results-grid');
      const empty = document.getElementById('no-results');
      if (results.length) {
        grid.innerHTML = results.map(p => Components.renderProductCard(p)).join('');
        grid.style.display = '';
        empty.style.display = 'none';
      } else {
        grid.style.display = 'none';
        empty.style.display = '';
      }
    }

    function removeFilter(type, val) {
      if (type === 'cat') {
        const cb = document.querySelector(`#filter-categories input[value="${val}"]`);
        if (cb) cb.checked = false;
      } else if (type === 'brand') {
        const cb = document.querySelector(`#filter-brands input[value="${val}"]`);
        if (cb) cb.checked = false;
      }
      applyFilters();
    }

    function resetFilters() {
      document.querySelectorAll('.filter-panel input[type=checkbox]').forEach(c => c.checked = false);
      document.getElementById('filter-min-price').value = '';
      document.getElementById('filter-max-price').value = '';
      currentRating = 0;
      document.querySelectorAll('#filter-rating button').forEach(b => b.classList.remove('active'));
      document.getElementById('sort-select').value = '';
      applyFilters();
    }
