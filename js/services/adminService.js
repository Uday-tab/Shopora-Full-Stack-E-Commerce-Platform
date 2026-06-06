/* ============================================================
   Shopora — js/services/adminService.js
   Admin moderation: users, sellers, reviews, reports.
   ============================================================ */

const AdminService = (() => {
  const getAllUsers = () => ShoporaDB.getAll('users');
  const getAllSellers = () => ShoporaDB.getAll('sellers');
  const getAllProducts = () => ShoporaDB.getAll('products');

  const banSeller = (sellerId) => ShoporaDB.update('sellers', sellerId, { status: 'banned' });
  const activateSeller = (sellerId) => ShoporaDB.update('sellers', sellerId, { status: 'active' });

  const removeProduct = (productId) => {
    const p = ShoporaDB.getById('products', productId);
    if (p) {
      ShoporaDB.remove('products', productId);
      const seller = ShoporaDB.getById('sellers', p.sellerId);
      if (seller) ShoporaDB.update('sellers', seller.id, { productsCount: Math.max(0, (seller.productsCount || 1) - 1) });
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
    if (p && (p.reviews||[])[reviewIndex]) {
      p.reviews.splice(reviewIndex, 1);
      /* ratings array is parallel to reviews — remove by same index */
      if (p.ratings && p.ratings.length > reviewIndex) {
        p.ratings.splice(reviewIndex, 1);
      }
      ShoporaDB.update('products', productId, { reviews: p.reviews, ratings: p.ratings });
    }
  };

  const createReport = (report) => ShoporaDB.insert('reports', { ...report, status: 'open', date: new Date().toISOString().slice(0, 10) });
  const getReports = () => ShoporaDB.getAll('reports');
  const resolveReport = (reportId) => ShoporaDB.update('reports', reportId, { status: 'resolved' });
  const deleteUser = (userId) => ShoporaDB.remove('users', userId);

  return { getAllUsers, getAllSellers, getAllProducts, banSeller, activateSeller, removeProduct, flagReview, removeReview, createReport, getReports, resolveReport, deleteUser };
})();
