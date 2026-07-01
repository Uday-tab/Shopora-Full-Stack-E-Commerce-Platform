    let tags = [], features = [], specs = [], variants = [], images = [];
    let editId = null;

    document.addEventListener('DOMContentLoaded', () => {
      if (!AuthService.hasRole('seller')) { window.location.href = 'seller-login.html'; return; }

      Components.injectDashboardHeader('seller');
      Components.injectSellerSidebar();

      editId = new URLSearchParams(window.location.search).get('edit');
      let editProduct = null;

      if (editId) {
        editProduct = ProductService.getById(editId);
        if (editProduct) {
          tags = editProduct.tags || [];
          features = editProduct.features || [];
          specs = Object.entries(editProduct.specifications || {}).map(([k, v]) => ({ key: k, val: v }));
          variants = editProduct.variants || [];
          images = editProduct.images || [];
        }
      }

      /* Render form first (creates DOM elements), then populate fields */
      renderForm();

      if (editProduct) {
        document.getElementById('p-title').value = editProduct.title;
        document.getElementById('p-desc').value = editProduct.description;
        document.getElementById('p-brand').value = editProduct.brand;
        document.getElementById('p-category').value = editProduct.category;
        document.getElementById('p-subcat').value = editProduct.subcategory || '';
        document.getElementById('p-price').value = editProduct.price;
        document.getElementById('p-discount').value = editProduct.discount || 0;
        document.getElementById('p-sku').value = editProduct.id;
        document.getElementById('p-delivery').value = editProduct.deliveryDays || 3;
        renderTags();
        renderFeatures();
        renderSpecs();
        renderVariants();
        renderPreview();
      }
    });

    function renderForm() {
      document.getElementById('add-content').innerHTML = `
        <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:1.5rem;">
          ${editId ? 'Edit Product' : 'Add New Product'}
        </h2>

        <div class="sp-add-product-grid">
          <div>
            <!-- Basic Information -->
            <div class="sp-form-card">
              <h3>Basic Information</h3>
              <div class="sp-form-group">
                <label>Product Title *</label>
                <input id="p-title" placeholder="e.g. Premium Wireless Headphones" oninput="renderPreview()">
              </div>
              <div class="sp-form-group">
                <label>Description *</label>
                <textarea
                  id="p-desc"
                  rows="4"
                  placeholder="Detailed product description..."
                  style="width:100%;padding:.6rem;border:1px solid var(--border);border-radius:var(--radius);resize:vertical;"
                ></textarea>
              </div>
              <div class="sp-form-row">
                <div class="sp-form-group">
                  <label>Brand *</label>
                  <input id="p-brand" placeholder="Brand name">
                </div>
                <div class="sp-form-group">
                  <label>Category *</label>
                  <select
                    id="p-category"
                    style="width:100%;padding:.6rem;border:1px solid var(--border);border-radius:var(--radius);"
                  >
                    ${ShoporaDB.getAll('categories').map(c => `<option value="${c.value}">${c.label}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="sp-form-row">
                <div class="sp-form-group">
                  <label>Subcategory</label>
                  <input id="p-subcat" placeholder="e.g. laptops, audio">
                </div>
                <div class="sp-form-group">
                  <label>SKU / Product Code</label>
                  <input id="p-sku" placeholder="Auto-generated if empty">
                </div>
              </div>
            </div>

            <!-- Pricing & Delivery -->
            <div class="sp-form-card">
              <h3>Pricing & Delivery</h3>
              <div class="sp-form-row">
                <div class="sp-form-group">
                  <label>Price ($) *</label>
                  <input type="number" id="p-price" step="0.01" placeholder="99.99" oninput="renderPreview()">
                </div>
                <div class="sp-form-group">
                  <label>Discount (%)</label>
                  <input type="number" id="p-discount" value="0" min="0" max="99" oninput="renderPreview()">
                </div>
              </div>
              <div class="sp-form-group">
                <label>Delivery Days</label>
                <input type="number" id="p-delivery" value="3" min="1" max="30">
              </div>
            </div>

            <!-- Tags / Keywords -->
            <div class="sp-form-card">
              <h3>Tags / Keywords</h3>
              <div class="sp-tag-input-wrap" id="tags-wrap">
                <input
                  id="tag-input"
                  placeholder="Type and press Enter..."
                  onkeydown="if(event.key==='Enter'){event.preventDefault();addTag();}"
                >
              </div>
            </div>

            <!-- Specifications -->
            <div class="sp-form-card">
              <h3>Specifications</h3>
              <div id="specs-list"></div>
              <div class="sp-form-row" style="margin-top:.5rem;">
                <input id="spec-key" placeholder="Key (e.g. CPU)">
                <input id="spec-val" placeholder="Value (e.g. Intel i9)">
              </div>
              <button class="sp-btn sp-btn-outline" onclick="addSpec()" style="margin-top:.5rem;">
                + Add Specification
              </button>
            </div>

            <!-- Features & Highlights -->
            <div class="sp-form-card">
              <h3>Features & Highlights</h3>
              <div id="features-list"></div>
              <div style="display:flex;gap:.5rem;margin-top:.5rem;">
                <input
                  id="feature-input"
                  placeholder="e.g. Wireless charging"
                  style="flex:1;padding:.5rem;border:1px solid var(--border);border-radius:var(--radius);"
                >
                <button class="sp-btn sp-btn-outline" onclick="addFeature()">+ Add</button>
              </div>
            </div>

            <!-- Product Variants -->
            <div class="sp-form-card">
              <h3>Product Variants</h3>
              <div id="variants-list"></div>
              <button class="sp-btn sp-btn-outline" onclick="addVariantRow()" style="margin-top:.75rem;">
                + Add Variant
              </button>
            </div>

            <!-- Product Images -->
            <div class="sp-form-card">
              <h3>Product Images</h3>
              <p style="font-size:.8rem;color:var(--text-muted);margin-bottom:.75rem;">
                Upload product images (PNG, JPG, WebP, GIF, or SVG). Max 500KB per image.
              </p>
              <div id="images-list"></div>
              <button class="sp-btn sp-btn-outline" onclick="addImageSlot()">+ Add Image</button>
            </div>

            <!-- Action Buttons -->
            <div class="sp-btn-group" style="margin-top:1.5rem;">
              <button class="sp-btn sp-btn-outline" onclick="saveProduct('draft')">Save as Draft</button>
              <button class="sp-btn sp-btn-primary" onclick="saveProduct('published')">Publish Product</button>
            </div>
          </div>

          <!-- Live Preview Sidebar -->
          <div class="sp-product-preview" id="preview-card">
            <h4 style="margin-bottom:1rem;font-size:.9rem;color:var(--text-muted);">Live Preview</h4>
            <div id="preview-content"></div>
          </div>
        </div>
      `;

      renderTags();
      renderFeatures();
      renderSpecs();
      renderVariants();

      if (!images.length) {
        addImageSlot();
      } else {
        renderImages();
      }

      renderPreview();
    }

    function addTag() {
      const v = document.getElementById('tag-input').value.trim();
      if (v && !tags.includes(v)) {
        tags.push(v);
        document.getElementById('tag-input').value = '';
        renderTags();
      }
    }

    function removeTag(i) {
      tags.splice(i, 1);
      renderTags();
    }

    function renderTags() {
      const wrap = document.getElementById('tags-wrap');
      if (!wrap) return;

      const input = wrap.querySelector('input');
      wrap.innerHTML = tags.map((t, i) =>
        `<span class="sp-tag">${t}<button onclick="removeTag(${i})">×</button></span>`
      ).join('');

      wrap.appendChild(
        input || Object.assign(document.createElement('input'), {
          id: 'tag-input',
          placeholder: 'Type and press Enter...',
          onkeydown: function(e) { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }
        })
      );
    }

    function addFeature() {
      const v = document.getElementById('feature-input').value.trim();
      if (v) {
        features.push(v);
        document.getElementById('feature-input').value = '';
        renderFeatures();
      }
    }

    function renderFeatures() {
      const el = document.getElementById('features-list');
      if (!el) return;

      el.innerHTML = features.map((f, i) =>
        `<div style="display:flex;justify-content:space-between;align-items:center;padding:.4rem 0;border-bottom:1px solid var(--border);font-size:.85rem;">
          <span>✓ ${f}</span>
          <button
            onclick="features.splice(${i},1);renderFeatures();"
            style="background:none;border:none;color:var(--danger);cursor:pointer;"
          >×</button>
        </div>`
      ).join('');
    }

    function addSpec() {
      const k = document.getElementById('spec-key').value.trim();
      const v = document.getElementById('spec-val').value.trim();

      if (k && v) {
        specs.push({ key: k, val: v });
        document.getElementById('spec-key').value = '';
        document.getElementById('spec-val').value = '';
        renderSpecs();
      }
    }

    function renderSpecs() {
      const el = document.getElementById('specs-list');
      if (!el) return;

      el.innerHTML = specs.map((s, i) =>
        `<div style="display:flex;justify-content:space-between;padding:.4rem 0;border-bottom:1px solid var(--border);font-size:.85rem;">
          <span><strong>${s.key}:</strong> ${s.val}</span>
          <button
            onclick="specs.splice(${i},1);renderSpecs();"
            style="background:none;border:none;color:var(--danger);cursor:pointer;"
          >×</button>
        </div>`
      ).join('');
    }

    function addVariantRow() {
      variants.push({ color: '', size: '', storage: 'N/A', ram: 'N/A', stock: 10, price: 0 });
      renderVariants();
    }

    function renderVariants() {
      const el = document.getElementById('variants-list');
      if (!el) return;

      el.innerHTML = variants.map((v, i) =>
        `<div class="sp-variant-builder">
          <div style="display:flex;justify-content:space-between;margin-bottom:.5rem;">
            <strong style="font-size:.8rem;">Variant ${i + 1}</strong>
            <button
              onclick="variants.splice(${i},1);renderVariants();"
              style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:.85rem;"
            >Remove</button>
          </div>
          <div class="sp-form-row">
            <div class="sp-form-group">
              <label>Color</label>
              <input value="${v.color}" onchange="variants[${i}].color=this.value">
            </div>
            <div class="sp-form-group">
              <label>Size</label>
              <input value="${v.size}" onchange="variants[${i}].size=this.value">
            </div>
          </div>
          <div class="sp-form-row">
            <div class="sp-form-group">
              <label>Storage</label>
              <input value="${v.storage}" onchange="variants[${i}].storage=this.value">
            </div>
            <div class="sp-form-group">
              <label>RAM</label>
              <input value="${v.ram}" onchange="variants[${i}].ram=this.value">
            </div>
          </div>
          <div class="sp-form-row">
            <div class="sp-form-group">
              <label>Stock</label>
              <input type="number" value="${v.stock}" onchange="variants[${i}].stock=+this.value">
            </div>
            <div class="sp-form-group">
              <label>Price ($)</label>
              <input type="number" step="0.01" value="${v.price}" onchange="variants[${i}].price=+this.value">
            </div>
          </div>
        </div>`
      ).join('');
    }

    function addImageSlot() {
      images.push('');
      renderImages();
    }

    function handleImageUpload(index, file) {
      if (!file) return;
      if (file.size > 512000) { Toast.show('Image too large. Max 500KB.', 'warn'); return; }

      const reader = new FileReader();
      reader.onload = (e) => {
        images[index] = e.target.result;
        renderImages();
        renderPreview();
      };

      if (file.type === 'image/svg+xml') {
        /* Read SVG as text and convert to safe data URL */
        const textReader = new FileReader();
        textReader.onload = (e) => {
          let svgContent = e.target.result;
          if (typeof DOMPurify !== 'undefined') {
            svgContent = DOMPurify.sanitize(svgContent);
          }
          images[index] = 'data:image/svg+xml,' + encodeURIComponent(svgContent);
          renderImages();
          renderPreview();
        };
        textReader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    }

    function renderImages() {
      const el = document.getElementById('images-list');
      if (!el) return;

      el.innerHTML = images.map((img, i) =>
        `<div style="margin-bottom:.75rem;">
          <label style="font-size:.8rem;font-weight:600;">Image ${i + 1}</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            onchange="handleImageUpload(${i}, this.files[0])"
            style="display:block;margin-top:.25rem;font-size:.8rem;"
          >
          ${img ? `<div style="background:#f1f5f9;border-radius:var(--radius);height:80px;display:flex;align-items:center;justify-content:center;padding:.5rem;margin-top:.25rem;overflow:hidden;">
            <img src="${img}" alt="Preview ${i + 1}" style="max-width:100%;max-height:100%;object-fit:contain;">
          </div>` : ''}
          <button
            onclick="images.splice(${i},1);renderImages();renderPreview();"
            style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:.75rem;"
          >Remove</button>
        </div>`
      ).join('');
    }

    function renderPreview() {
      const title = document.getElementById('p-title')?.value || 'Product Title';
      const price = parseFloat(document.getElementById('p-price')?.value) || 0;
      const discount = parseInt(document.getElementById('p-discount')?.value) || 0;
      const ep = discount ? +(price * (1 - discount / 100)).toFixed(2) : price;
      const imgSrc = images.find(i => i && i.trim()) || '';

      const el = document.getElementById('preview-content');
      if (!el) return;

      el.innerHTML = `
        <div style="background:#f1f5f9;border-radius:var(--radius);height:180px;display:flex;align-items:center;justify-content:center;padding:1rem;margin-bottom:1rem;overflow:hidden;">
          ${imgSrc
            ? `<img src="${imgSrc}" alt="Preview" style="max-width:100%;max-height:100%;object-fit:contain;">`
            : '<span style="color:var(--text-muted);">No image</span>'}
        </div>
        <div style="font-weight:600;margin-bottom:.4rem;">${title}</div>
        <div style="font-size:1.2rem;font-weight:800;font-family:var(--font-heading);">
          $${ep.toFixed(2)}
          ${discount
            ? `<span style="font-size:.8rem;text-decoration:line-through;color:var(--text-muted);margin-left:.3rem;">$${price.toFixed(2)}</span>
               <span style="font-size:.75rem;color:var(--accent);margin-left:.3rem;">-${discount}%</span>`
            : ''}
        </div>
        <div style="font-size:.8rem;color:var(--text-muted);margin-top:.5rem;">
          ${tags.length
            ? tags.map(t =>
                `<span style="background:var(--accent-light);color:var(--accent);padding:.1rem .4rem;border-radius:.2rem;font-size:.7rem;margin-right:.2rem;">${t}</span>`
              ).join('')
            : 'No tags'}
        </div>
      `;
    }

    function saveProduct(status) {
      const seller = AuthService.getCurrentUser();
      const title = document.getElementById('p-title').value.trim();
      const price = parseFloat(document.getElementById('p-price').value);

      if (!title) { Toast.show('Title is required.', 'warn'); return; }
      if (!price || price <= 0) { Toast.show('Valid price is required.', 'warn'); return; }

      const data = {
        title,
        description: document.getElementById('p-desc').value.trim(),
        brand: document.getElementById('p-brand').value.trim(),
        category: document.getElementById('p-category').value,
        subcategory: document.getElementById('p-subcat').value.trim(),
        price,
        discount: parseInt(document.getElementById('p-discount').value) || 0,
        images: images.filter(i => i && i.trim()),
        specifications: Object.fromEntries(specs.map(s => [s.key, s.val])),
        features,
        variants,
        tags,
        deliveryDays: parseInt(document.getElementById('p-delivery').value) || 3,
        sellerId: seller.id,
        sellerName: seller.companyName || 'Seller',
        status
      };

      if (editId) {
        ProductService.updateProduct(editId, data);
        Toast.show('Product updated!', 'success');
      } else {
        ProductService.create(data);
        Toast.show('Product created!', 'success');
      }

      setTimeout(() => window.location.href = 'seller-products.html', 800);
    }
