/* ============================================================
   Shopora — js/services/cartService.js
   Persistent cart management across pages.
   Routes all data through ShoporaDB — no direct localStorage.
   ============================================================ */

const CartService = (() => {
  const _key = 'shopora_cart';
  const _get = () => {
    const data = ShoporaDB.getObject(_key);
    return Array.isArray(data) ? data : (data.items || []);
  };
  const _save = (cart) => ShoporaDB.setObject(_key, cart);

  const getCart = () => _get();

  const addToCart = (productId, variant = null, qty = 1) => {
    const cart = _get();
    const product = ShoporaDB.getById('products', productId);
    if (!product) return cart;

    /* Determine available stock — variant-level if selected, else product-level */
    const maxStock = (variant && typeof variant.stock === 'number') ? variant.stock : (product.stock || 0);

    const matchIdx = cart.findIndex(item => item.productId === productId && JSON.stringify(item.variant) === JSON.stringify(variant));

    if (matchIdx > -1) {
      const newQty = cart[matchIdx].quantity + qty;
      cart[matchIdx].quantity = Math.min(newQty, maxStock);
    } else {
      if (maxStock <= 0) return cart; /* out of stock */
      const effectivePrice = typeof ProductService !== 'undefined'
        ? ProductService.getEffectivePrice(product)
        : (product.discount ? +(product.price * (1 - product.discount / 100)).toFixed(2) : product.price);
      const variantPrice = variant && variant.price
        ? +(variant.price * (1 - (product.discount || 0) / 100)).toFixed(2)
        : effectivePrice;
      cart.push({
        productId, title: product.title, price: product.price,
        effectivePrice,
        variantPrice,
        discount: product.discount || 0,
        variant: variant ? { color: variant.color, size: variant.size, storage: variant.storage, ram: variant.ram, stock: variant.stock, price: variant.price } : null,
        quantity: Math.min(qty, maxStock), sellerId: product.sellerId, sellerName: product.sellerName || '',
        deliveryDays: product.deliveryDays || 3
      });
    }
    _save(cart);
    return cart;
  };

  const updateQuantity = (index, qty) => {
    const cart = _get();
    if (index < 0 || index >= cart.length) return cart;
    if (qty <= 0) {
      cart.splice(index, 1);
    } else {
      /* Cap at available stock */
      const item = cart[index];
      const product = ShoporaDB.getById('products', item.productId);
      const maxStock = product
        ? ((item.variant && typeof item.variant.stock === 'number') ? item.variant.stock : (product.stock || 0))
        : qty;
      cart[index].quantity = Math.min(qty, maxStock);
    }
    _save(cart);
    return cart;
  };

  const removeItem = (index) => {
    const cart = _get();
    cart.splice(index, 1);
    _save(cart);
    return cart;
  };

  const clearCart = () => { _save([]); return []; };

  const getItemCount = () => _get().reduce((sum, item) => sum + item.quantity, 0);

  const getSubtotal = () => _get().reduce((sum, item) => sum + (item.variantPrice || item.effectivePrice) * item.quantity, 0);

  const getSavings = () => _get().reduce((sum, item) => sum + (item.price - (item.variantPrice || item.effectivePrice)) * item.quantity, 0);

  return { getCart, addToCart, updateQuantity, removeItem, clearCart, getItemCount, getSubtotal, getSavings };
})();
