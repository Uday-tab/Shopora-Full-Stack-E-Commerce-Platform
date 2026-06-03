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
      pendingOrders, shippedOrders, deliveredOrders,
      totalStock, lowStockCount, totalReviews
    };
  };

  const getSellerRevenueChart = (sellerId) => {
    const orders = OrderService.getOrdersBySeller(sellerId);
    const months = {};
    orders.forEach(o => {
      const m = o.date ? o.date.slice(0, 7) : 'Unknown';
      months[m] = (months[m] || 0) + (o.total || 0);
    });
    const labels = Object.keys(months).sort();
    const data = labels.map(l => +months[l].toFixed(2));
    return { labels, data };
  };

  const getSellerTopProducts = (sellerId, limit = 5) => {
    return ShoporaDB.query('products', p => p.sellerId === sellerId)
      .sort((a, b) => b.ratings.length - a.ratings.length)
      .slice(0, limit);
  };

  const getPlatformStats = () => {
    const a = JSON.parse(localStorage.getItem('analytics')) || {};
    return {
      totalRevenue: a.totalRevenue || 0,
      totalOrders: ShoporaDB.count('orders'),
      totalUsers: ShoporaDB.count('users'),
      totalSellers: ShoporaDB.count('sellers'),
      totalProducts: ShoporaDB.getAll('products').filter(p => p.status === 'published').length,
      totalReviews: ShoporaDB.getAll('products').reduce((s, p) => s + (p.reviews || []).length, 0),
      pendingReports: ShoporaDB.getAll('reports').filter(r => r.status !== 'resolved').length
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

  return { getSellerStats, getSellerRevenueChart, getSellerTopProducts, getPlatformStats, getPlatformRevenueChart };
})();
