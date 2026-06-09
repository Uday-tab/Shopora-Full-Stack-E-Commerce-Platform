const fs = require('fs');

// Mock localStorage
global.localStorage = {
  _data: {},
  setItem: function(id, val) { this._data[id] = String(val); },
  getItem: function(id) { return this._data.hasOwnProperty(id) ? this._data[id] : null; },
  removeItem: function(id) { delete this._data[id]; },
  clear: function() { this._data = {}; }
};

// Mock Window and Crypto
global.window = {};
global.crypto = {
  subtle: {
    digest: async (algo, data) => {
      // Mock hash for fast testing
      return new Uint8Array([1,2,3,4]).buffer; 
    }
  }
};

let logOutput = [];
function log(msg) {
  console.log(msg);
  logOutput.push(msg);
}

// Load Scripts synchronously
const loadScript = (path) => {
  const code = fs.readFileSync(path, 'utf8');
  eval(code);
};

async function runTests() {
  log("🚀 Starting Full E-Commerce Platform Test Suite...");
  
  const code = [
    fs.readFileSync('./js/db/storage.js', 'utf8'),
    fs.readFileSync('./js/services/authService.js', 'utf8'),
    fs.readFileSync('./js/services/productService.js', 'utf8'),
    fs.readFileSync('./js/services/cartService.js', 'utf8'),
    fs.readFileSync('./js/services/orderService.js', 'utf8'),
    fs.readFileSync('./js/services/adminService.js', 'utf8'),
    fs.readFileSync('./js/services/analyticsService.js', 'utf8')
  ].join('\\n\\n');

  eval(code);

  log("✅ Core Services Loaded Successfully.");

  // Test 1: User & Seller Registration
  log("\\n--- Testing Authentication Flow ---");
  await AuthService.register({ name: 'Test User', email: 'user@test.com', password: 'password123', role: 'customer' });
  await AuthService.register({ name: 'Test Seller', email: 'seller@test.com', password: 'password123', role: 'seller', companyName: 'Seller Inc' });
  const users = ShoporaDB.getAll('users');
  const sellers = ShoporaDB.getAll('sellers');
  log(`✅ User Registration: ${users.length === 1 ? 'PASS' : 'FAIL'}`);
  log(`✅ Seller Registration: ${sellers.length === 1 ? 'PASS' : 'FAIL'}`);

  // Test 2: Login and Session
  const loginRes = await AuthService.login('user@test.com', 'password123');
  const session = AuthService.getCurrentUser();
  log(`✅ Login: ${session && session.email === 'user@test.com' ? 'PASS' : 'FAIL'}`);

  // Test 3: Seller Adds Product
  log("\\n--- Testing Product Flow ---");
  await AuthService.login('seller@test.com', 'password123'); // switch to seller
  const productData = {
    title: 'Test Laptop',
    price: 999.99,
    category: 'electronics',
    stock: 10,
    sellerId: sellers[0].id
  };
  const product = ProductService.create(productData);
  const products = ProductService.getAll();
  log(`✅ Create Product: ${products.length === 1 ? 'PASS' : 'FAIL'}`);
  log(`✅ Product Data Intact: ${products[0].title === 'Test Laptop' ? 'PASS' : 'FAIL'}`);

  // Test 4: Customer Adds to Cart
  log("\\n--- Testing Cart Flow ---");
  await AuthService.login('user@test.com', 'password123'); // switch to customer
  CartService.addItem(product.id, 2);
  const cart = CartService.getCart();
  log(`✅ Add to Cart: ${cart.length === 1 && cart[0].quantity === 2 ? 'PASS' : 'FAIL'}`);
  log(`✅ Subtotal Calculation: ${CartService.getSubtotal() === 999.99 * 2 ? 'PASS' : 'FAIL'}`);

  // Test 5: Checkout & Order Creation
  log("\\n--- Testing Checkout & Order Flow ---");
  const orderData = {
    userId: users[0].id,
    items: cart,
    total: CartService.getSubtotal() * 1.08 // plus tax
  };
  const order = OrderService.createOrder(orderData);
  CartService.clearCart(); // simulate post-checkout clear
  log(`✅ Order Creation: ${order && order.id ? 'PASS' : 'FAIL'}`);
  log(`✅ Cart Cleared: ${CartService.getCart().length === 0 ? 'PASS' : 'FAIL'}`);

  // Test 6: Inventory & Analytics updates
  log("\\n--- Testing Inventory & Analytics Integration ---");
  const updatedProduct = ProductService.getById(product.id);
  // OrderService reduce inventory feature test
  log(`✅ Inventory Reduced: ${updatedProduct.stock === 8 ? 'PASS' : 'FAIL'}`);
  
  const updatedSeller = ShoporaDB.getById('sellers', sellers[0].id);
  log(`✅ Seller Revenue Updated: ${updatedSeller.revenue > 0 ? 'PASS' : 'FAIL'}`);

  const analytics = ShoporaDB.getObject('analytics');
  log(`✅ Global Analytics Tracked: ${analytics.totalOrders === 1 ? 'PASS' : 'FAIL'}`);

  // Test 7: Admin Verification
  log("\\n--- Testing Admin Verification ---");
  const allOrders = OrderService.getAllOrders();
  log(`✅ Admin Access to All Orders: ${allOrders.length === 1 ? 'PASS' : 'FAIL'}`);

  log("\\n🎉 ALL TESTS COMPLETED.");

  fs.writeFileSync('./e2e_test_log.md', logOutput.join('\\n'));
}

runTests().catch(e => {
  log("❌ Test Suite Failed with Error: " + e.message);
  fs.writeFileSync('./e2e_test_log.md', logOutput.join('\\n'));
});
