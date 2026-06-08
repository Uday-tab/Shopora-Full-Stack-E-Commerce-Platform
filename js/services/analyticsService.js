/* ============================================================
   Shopora — js/services/analyticsService.js
   Aggregation engine for seller and admin dashboards.
   ============================================================ */

const AnalyticsService = (() => {
  const getSellerStats = (sellerId) => {
    const seller = ShoporaDB.getById('sellers', sellerId);
    const products = ShoporaDB.query('products', p => p.sellerId === sellerId);
    const orders = OrderService.getOrdersBySeller(sellerId);

    const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);
    const lowStockCount = products.filter(p => p.stock < 10).length;
    const totalReviews = products.reduce((s, p) => s + (p.reviews || []).length, 0);

    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const shippedOrders = orders.filter(o => o.status === 'shipped').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

    return {
      revenue: seller ? seller.revenue : 0,
      totalProducts: products.length,
      publishedProducts: products.filter(p => p.status === 'published').length,
      draftProducts: products.filter(p => p.status === 'draft').length,
      totalOrders: orders.length,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      totalStock,
      lowStockCount,
      totalReviews
    };
  };

  const getSellerRevenueChart = (sellerId) => {
    const orders = OrderService.getOrdersBySeller(sellerId);
    const months = {};

    orders.forEach(o => {
      const m = o.date ? o.date.slice(0, 7) : 'Unknown';

      /* Sum only items belonging to THIS seller, not the full order total */
      const sellerTotal = (o.items || [])
        .filter(item => item.sellerId === sellerId)
        .reduce(
          (sum, item) =>
            sum + (item.variantPrice || item.effectivePrice || item.price) * (item.quantity || 1),
          0
        );

      months[m] = (months[m] || 0) + sellerTotal;
    });

    const labels = Object.keys(months).sort();
    const data = labels.map(l => +months[l].toFixed(2));

    return { labels, data };
  };

  const getSellerTopProducts = (sellerId, limit = 5) => {
    const products = ShoporaDB.query('products', p => p.sellerId === sellerId);
    const orders = OrderService.getOrdersBySeller(sellerId);

    /* Calculate total units sold per product from actual orders */
    const salesMap = {};
    orders.forEach(o => {
      (o.items || []).forEach(item => {
        salesMap[item.productId] = (salesMap[item.productId] || 0) + (item.quantity || 1);
      });
    });

    /* Combined score: units sold + (reviews × 2) + avg rating
       This balances sales volume with customer engagement */
    return products
      .map(p => {
        const unitsSold = salesMap[p.id] || 0;
        const reviewCount = (p.reviews || []).length;
        const avgRating = p.ratings && p.ratings.length
          ? p.ratings.reduce((a, b) => a + b, 0) / p.ratings.length
          : 0;
        const score = unitsSold + (reviewCount * 2) + avgRating;

        return {
          ...p,
          _unitsSold: unitsSold,
          _score: Math.round(score * 10) / 10
        };
      })
      .sort((a, b) => b._score - a._score)
      .slice(0, limit);
  };

  const getPlatformStats = () => {
    const a = ShoporaDB.getObject('analytics');

    return {
      totalRevenue: a.totalRevenue || 0,
      totalOrders: ShoporaDB.count('orders'),
      totalUsers: ShoporaDB.count('users'),
      totalSellers: ShoporaDB.count('sellers'),
      totalProducts: ShoporaDB.getAll('products')
        .filter(p => p.status === 'published').length,
      totalReviews: ShoporaDB.getAll('products')
        .reduce((s, p) => s + (p.reviews || []).length, 0),
      pendingReports: ShoporaDB.getAll('reports')
        .filter(r => r.status !== 'resolved').length
    };
  };

  const getPlatformRevenueChart = () => {
    const orders = ShoporaDB.getAll('orders');
    const months = {};

    orders.forEach(o => {
      const m = o.date ? o.date.slice(0, 7) : 'Unknown';
      months[m] = (months[m] || 0) + (o.total || 0);
    });

    const labels = Object.keys(months).sort();
    const data = labels.map(l => +months[l].toFixed(2));

    return { labels, data };
  };

  return {
    getSellerStats,
    getSellerRevenueChart,
    getSellerTopProducts,
    getPlatformStats,
    getPlatformRevenueChart
  };
})();
