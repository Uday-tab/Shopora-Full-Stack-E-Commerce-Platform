/* ============================================================
   Shopora — js/services/authService.js
   Authentication & session management for all roles.
   ============================================================ */

const AuthService = (() => {
  const login = (email, password, role = 'customer') => {
    const table = role === 'seller' ? 'sellers' : role === 'admin' ? 'admins' : 'users';
    const user = ShoporaDB.query(table, u => u.email === email && u.password === password)[0];
    if (!user) return { success: false, message: 'Invalid email or password.' };
    ShoporaDB.setSession({ ...user, role });
    return { success: true, user };
  };

  const register = (data, role = 'customer') => {
    const table = role === 'seller' ? 'sellers' : 'users';
    const existing = ShoporaDB.query(table, u => u.email === data.email);
    if (existing.length) return { success: false, message: 'An account with this email already exists.' };

    let record;
    if (role === 'seller') {
      record = { id: ShoporaDB.uid(), email: data.email, password: data.password, role: 'seller', companyName: data.companyName || '', revenue: 0, productsCount: 0, status: 'active', joinDate: new Date().toISOString().slice(0,10) };
    } else {
      record = { id: ShoporaDB.uid(), email: data.email, password: data.password, role: 'customer', name: data.name || '', addresses: [], wishlist: [], recentlyViewed: [], notifications: [] };
    }
    ShoporaDB.insert(table, record);
    ShoporaDB.setSession({ ...record, role });
    return { success: true, user: record };
  };

  const logout = () => { ShoporaDB.clearSession(); };
  const getCurrentUser = () => ShoporaDB.getSession();
  const isLoggedIn = () => !!ShoporaDB.getSession();
  const hasRole = (role) => { const s = ShoporaDB.getSession(); return s && s.role === role; };

  const updateProfile = (patch) => {
    const session = ShoporaDB.getSession();
    if (!session) return null;
    const table = session.role === 'seller' ? 'sellers' : 'users';
    const updated = ShoporaDB.update(table, session.id, patch);
    if (updated) ShoporaDB.setSession({ ...updated, role: session.role });
    return updated;
  };

  return { login, register, logout, getCurrentUser, isLoggedIn, hasRole, updateProfile };
})();
