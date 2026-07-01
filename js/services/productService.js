/* ============================================================
   Shopora — js/services/productService.js
   Product CRUD, search indexing, filtering, recommendations.
   ============================================================ */

const ProductService = (() => {
  const getAll = (filters = {}) => {
    let items = ShoporaDB.getAll('products')
      .filter(p => p.status === 'published');

    if (filters.category && filters.category !== 'all') {
      items = items.filter(p => p.category === filters.category);
    }
    if (filters.subcategory) {
      items = items.filter(p => p.subcategory === filters.subcategory);
    }
    if (filters.brand) {
      items = items.filter(p => p.brand.toLowerCase() === filters.brand.toLowerCase());
    }
    if (filters.minPrice !== undefined) {
      items = items.filter(p => _effectivePrice(p) >= filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      items = items.filter(p => _effectivePrice(p) <= filters.maxPrice);
    }
    if (filters.minRating) {
      items = items.filter(p => _avgRating(p) >= filters.minRating);
    }
    if (filters.sellerId) {
      items = items.filter(p => p.sellerId === filters.sellerId);
    }

    if (filters.sort) {
      switch (filters.sort) {
        case 'price-low':
          items.sort((a, b) => _effectivePrice(a) - _effectivePrice(b));
          break;
        case 'price-high':
          items.sort((a, b) => _effectivePrice(b) - _effectivePrice(a));
          break;
        case 'rating':
          items.sort((a, b) => _avgRating(b) - _avgRating(a));
          break;
        case 'newest':
          items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'popular':
          items.sort((a, b) => (b.ratings || []).length - (a.ratings || []).length);
          break;
      }
    }

    return items;
  };

  const getAllIncludingDrafts = (sellerId) => {
    return ShoporaDB.getAll('products')
      .filter(p => p.sellerId === sellerId);
  };

  const getById = (id) => ShoporaDB.getById('products', id);

  const search = (keyword) => {
    if (!keyword || !keyword.trim()) return getAll();

    const kw = keyword.toLowerCase().trim();
    const tokens = kw.split(/\s+/);

    return ShoporaDB.getAll('products').filter(p => {
      if (p.status !== 'published') return false;

      const haystack = `${p.title} ${p.brand} ${p.category} ${p.subcategory || ''} ${p.description} ${(p.tags || []).join(' ')}`
        .toLowerCase();

      return tokens.every(t => haystack.includes(t));
    });
  };

  const autocomplete = (keyword) => {
    if (!keyword || keyword.length < 2) return [];

    const kw = keyword.toLowerCase();
    const results = ShoporaDB.getAll('products')
      .filter(p => p.status === 'published' && p.title.toLowerCase().includes(kw));

    return results.slice(0, 6).map(p => ({
      id: p.id,
      title: p.title,
      price: _effectivePrice(p)
    }));
  };

  const create = (productData) => {
    const product = {
      id: ShoporaDB.uid(),
      ...productData,
      ratings: [],
      reviews: [],
      createdAt: new Date().toISOString().slice(0, 10)
    };

    product.stock = (product.variants || [])
      .reduce((s, v) => s + (v.stock || 0), 0);

    ShoporaDB.insert('products', product);

    // update seller count
    const seller = ShoporaDB.getById('sellers', product.sellerId);
    if (seller) {
      ShoporaDB.update('sellers', seller.id, {
        productsCount: (seller.productsCount || 0) + 1
      });
    }

    return product;
  };

  const updateProduct = (id, patch) => {
    if (patch.variants) {
      patch.stock = patch.variants.reduce((s, v) => s + (v.stock || 0), 0);
    }
    return ShoporaDB.update('products', id, patch);
  };

  const deleteProduct = (id) => {
    const p = ShoporaDB.getById('products', id);
    ShoporaDB.remove('products', id);

    if (p) {
      const seller = ShoporaDB.getById('sellers', p.sellerId);
      if (seller) {
        ShoporaDB.update('sellers', seller.id, {
          productsCount: Math.max(0, (seller.productsCount || 1) - 1)
        });
      }
    }
  };

  const addReview = (productId, review) => {
    const p = ShoporaDB.getById('products', productId);
    if (!p) return null;

    p.reviews.push(review);
    p.ratings.push(review.rating);

    return ShoporaDB.update('products', productId, {
      reviews: p.reviews,
      ratings: p.ratings
    });
  };

  const getRecommendations = (productId, limit = 4) => {
    const p = getById(productId);
    if (!p) return [];

    return ShoporaDB.getAll('products')
      .filter(x =>
        x.id !== productId &&
        x.status === 'published' &&
        (x.category === p.category || (p.tags || []).some(t => (x.tags || []).includes(t)))
      )
      .slice(0, limit);
  };

  const getCategories = () => {
    return ShoporaDB.getAll('categories');
  };

  const getBrands = () => {
    const prods = ShoporaDB.getAll('products')
      .filter(p => p.status === 'published');
    return [...new Set(prods.map(p => p.brand))];
  };

  const _effectivePrice = (p) => {
    return p.discount
      ? +(p.price * (1 - p.discount / 100)).toFixed(2)
      : p.price;
  };

  const _avgRating = (p) => {
    return (p.ratings || []).length
      ? +((p.ratings || []).reduce((a, b) => a + b, 0) / (p.ratings || []).length).toFixed(1)
      : 0;
  };

  const getEffectivePrice = _effectivePrice;
  const getAvgRating = _avgRating;

  return {
    getAll,
    getAllIncludingDrafts,
    getById,
    search,
    autocomplete,
    create,
    updateProduct,
    deleteProduct,
    addReview,
    getRecommendations,
    getCategories,
    getBrands,
    getEffectivePrice,
    getAvgRating
  };
})();
