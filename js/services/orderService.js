/* ============================================================
   Shopora — js/services/orderService.js
   Order lifecycle: creation, status updates, history queries.
   ============================================================ */

const OrderService = (() => {
  const createOrder = (orderData) => {
    /* Strip heavy data (SVG images) from items before persisting */
    const leanItems = (orderData.items || []).map(item => ({
      productId: item.productId,
      title: item.title,
      price: item.price,
      effectivePrice: item.effectivePrice,
      variantPrice: item.variantPrice,
      discount: item.discount,
      quantity: item.quantity,
      sellerId: item.sellerId,
      sellerName: item.sellerName || '',
      variant: item.variant
        ? {
            color: item.variant.color,
            size: item.variant.size,
            storage: item.variant.storage,
            ram: item.variant.ram
          }
        : null
    }));

    const order = {
      id: 'ORD-' + ShoporaDB.uid(),
      ...orderData,
      items: leanItems,
      status: 'pending',
      date: new Date().toISOString().slice(0, 10)
    };

    try {
      ShoporaDB.insert('orders', order);
    } catch (e) {
      if (e.name === 'QuotaExceededError' || (e.message && e.message.includes('quota'))) {
        /* Free space by trimming old orders to last 20 */
        const allOrders = ShoporaDB.getAll('orders');
        if (allOrders.length > 20) {
          ShoporaDB.setObject('orders', allOrders.slice(-20));
        }
        /* Clear cart data to reclaim space */
        CartService.clearCart();
        ShoporaDB.insert('orders', order);
      } else {
        throw e;
      }
    }

    /* reduce inventory */
    (order.items || []).forEach(item => {
      const product = ShoporaDB.getById('products', item.productId);

      if (product) {
        const newStock = Math.max(0, (product.stock || 0) - item.quantity);

        /* reduce variant stock too — match on ALL variant fields */
        if (item.variant && product.variants) {
          const _match = (a, b) => (!a || a === 'N/A') && (!b || b === 'N/A') || a === b;

          const vi = product.variants.findIndex(v =>
            _match(v.color, item.variant.color) &&
            _match(v.size, item.variant.size) &&
            _match(v.storage, item.variant.storage) &&
            _match(v.ram, item.variant.ram)
          );

          if (vi > -1) {
            product.variants[vi].stock = Math.max(0, product.variants[vi].stock - item.quantity);
          }
        }

        ShoporaDB.update('products', product.id, {
          stock: newStock,
          variants: product.variants
        });
      }
    });

    /* update seller revenue */
    const sellerGroups = {};
    (order.items || []).forEach(item => {
      if (!sellerGroups[item.sellerId]) {
        sellerGroups[item.sellerId] = 0;
      }
      sellerGroups[item.sellerId] +=
        (item.variantPrice || item.effectivePrice || item.price) * item.quantity;
    });

    Object.entries(sellerGroups).forEach(([sid, rev]) => {
      const seller = ShoporaDB.getById('sellers', sid);
      if (seller) {
        ShoporaDB.update('sellers', sid, {
          revenue: +(seller.revenue + rev).toFixed(2)
        });
      }
    });

    /* update global analytics */
    const analytics = ShoporaDB.getObject('analytics');
    analytics.totalOrders = (analytics.totalOrders || 0) + 1;
    analytics.totalRevenue = +(((analytics.totalRevenue || 0) + order.total)).toFixed(2);
    ShoporaDB.setObject('analytics', analytics);

    return order;
  };

  const getOrdersByUser = (userId) => {
    return ShoporaDB.query('orders', o => o.userId === userId);
  };

  const getOrdersBySeller = (sellerId) => {
    return ShoporaDB.query('orders', o =>
      (o.sellerId === sellerId) ||
      (o.items && o.items.some(i => i.sellerId === sellerId))
    );
  };

  const getAllOrders = () => ShoporaDB.getAll('orders');

  const updateStatus = (orderId, status) => {
    return ShoporaDB.update('orders', orderId, { status });
  };

  const getById = (id) => ShoporaDB.getById('orders', id);

  return {
    createOrder,
    getOrdersByUser,
    getOrdersBySeller,
    getAllOrders,
    updateStatus,
    getById
  };
})();
