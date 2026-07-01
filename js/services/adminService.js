/* ============================================================
   Shopora — js/services/adminService.js
   Admin moderation: users, sellers, reviews, reports.
   ============================================================ */

const AdminService = (() => {
  const getAllUsers = () => ShoporaDB.getAll('users');

  const getAllSellers = () => ShoporaDB.getAll('sellers');

  const getAllProducts = () => ShoporaDB.getAll('products');

  const banSeller = (sellerId) => {
    return ShoporaDB.update('sellers', sellerId, { status: 'banned' });
  };

  const activateSeller = (sellerId) => {
    return ShoporaDB.update('sellers', sellerId, { status: 'active' });
  };

  const removeProduct = (productId) => {
    const p = ShoporaDB.getById('products', productId);

    if (p) {
      ShoporaDB.remove('products', productId);
      const seller = ShoporaDB.getById('sellers', p.sellerId);
      if (seller) {
        ShoporaDB.update('sellers', seller.id, {
          productsCount: Math.max(0, (seller.productsCount || 1) - 1)
        });
      }
    }
  };

  const flagReview = (productId, reviewIndex) => {
    const p = ShoporaDB.getById('products', productId);

    if (p && p.reviews[reviewIndex]) {
      p.reviews[reviewIndex].flagged = true;
      ShoporaDB.update('products', productId, { reviews: p.reviews });
    }
  };

  const removeReview = (productId, reviewIndex) => {
    const p = ShoporaDB.getById('products', productId);

    if (p && (p.reviews || [])[reviewIndex]) {
      p.reviews.splice(reviewIndex, 1);

      /* ratings array is parallel to reviews — remove by same index */
      if (p.ratings && p.ratings.length > reviewIndex) {
        p.ratings.splice(reviewIndex, 1);
      }

      ShoporaDB.update('products', productId, {
        reviews: p.reviews,
        ratings: p.ratings
      });
    }
  };

  const createReport = (report) => {
    return ShoporaDB.insert('reports', {
      ...report,
      status: 'open',
      date: new Date().toISOString().slice(0, 10)
    });
  };

  const getReports = () => ShoporaDB.getAll('reports');

  const resolveReport = (reportId) => {
    return ShoporaDB.update('reports', reportId, { status: 'resolved' });
  };

  const deleteUser = (userId) => {
    /* Clean up reviews this user left on products */
    const allProducts = ShoporaDB.getAll('products');

    allProducts.forEach(p => {
      if (!p.reviews || !p.reviews.length) return;

      const originalLen = p.reviews.length;

      /* Find indices of reviews by this user (reverse order to splice safely) */
      for (let i = p.reviews.length - 1; i >= 0; i--) {
        if (p.reviews[i].userId === userId) {
          p.reviews.splice(i, 1);
          if (p.ratings && p.ratings.length > i) {
            p.ratings.splice(i, 1);
          }
        }
      }

      if (p.reviews.length !== originalLen) {
        ShoporaDB.update('products', p.id, {
          reviews: p.reviews,
          ratings: p.ratings
        });
      }
    });

    /* Remove user's orders */
    const userOrders = ShoporaDB.query('orders', o => o.userId === userId);
    userOrders.forEach(o => ShoporaDB.remove('orders', o.id));

    /* Clear user's cart */
    ShoporaDB.setObject('shopora_cart_' + userId, []);

    /* Remove user record */
    ShoporaDB.remove('users', userId);
  };

  /* ----- Categories ----- */
  const addCategory = (categoryObj) => {
    return ShoporaDB.insert('categories', categoryObj);
  };

  const removeCategory = (categoryId) => {
    return ShoporaDB.remove('categories', categoryId);
  };

  /* ----- Payouts ----- */
  const getAllPayouts = () => ShoporaDB.getAll('payouts');

  const approvePayout = (payoutId) => {
    return ShoporaDB.update('payouts', payoutId, { status: 'approved' });
  };

  return {
    getAllUsers,
    getAllSellers,
    getAllProducts,
    banSeller,
    activateSeller,
    removeProduct,
    flagReview,
    removeReview,
    createReport,
    getReports,
    resolveReport,
    deleteUser,
    addCategory,
    removeCategory,
    getAllPayouts,
    approvePayout
  };
})();
