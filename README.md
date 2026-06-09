# 🛍️ Shopora - Full-Stack E-Commerce Platform

A production-style multi-role e-commerce platform inspired by Amazon's architecture and workflows. Built entirely with HTML5, CSS3, and Vanilla JavaScript, Shopora simulates a complete online marketplace featuring Customer, Seller, and Admin portals with secure authentication, analytics, inventory management, and real-world business workflows.

---

## 🚀 Key Features

### Customer Portal

* Product browsing and search
* Advanced filtering and sorting
* Product detail pages with variants
* Shopping cart management
* Checkout workflow
* Order history tracking
* Wishlist functionality
* Address management
* User authentication

### Seller Portal

* Product management (Create, Edit, Delete)
* Inventory tracking
* Order management
* Revenue monitoring
* Performance analytics dashboard
* Product image uploads

### Admin Portal

* Platform-wide analytics
* Product moderation
* User management
* Seller management
* Report resolution system
* Account activation and banning

---

## 🏗️ Architecture

### Multi-Page Application

Shopora is built as a traditional multi-page web application consisting of:

* 24 standalone HTML pages
* 3 independent portals
* Shared reusable components
* Modular service-based architecture

### Service Layer

Business logic is separated into dedicated services:

* Auth Service
* Product Service
* Cart Service
* Order Service
* Analytics Service
* Admin Service

### Local Database Engine

ShoporaDB provides:

* Full CRUD operations
* Auto-seeded sample data
* Persistent browser storage
* Deep object merging
* Transaction-safe updates

---

## 🔒 Security Improvements

### Password Protection

* Eliminated plain-text password storage
* Implemented password hashing before persistence

### XSS Protection

* Integrated DOMPurify for SVG sanitization
* Protected user-generated content
* Secured notification rendering against HTML injection

### Role Integrity

* Prevented duplicate account registration across Customer, Seller, and Admin roles
* Enforced email uniqueness across all user tables

---

## 💾 Data Integrity Improvements

### Deep Merge Engine

Implemented a custom deep merge system to prevent nested data loss during updates.

Fixed issues affecting:

* Product variants
* Product features
* User metadata
* Nested objects

### Cart Recovery

Prevented accidental cart deletion during failed order processing or storage quota errors.

### Analytics Restoration

Rebuilt the analytics pipeline to ensure accurate:

* Revenue tracking
* Order counts
* Seller metrics
* Platform statistics

---

## ⚡ Performance Optimizations

### Selective Script Loading

Previously, every page loaded all application scripts.

Now:

* Customer pages load customer services only
* Seller pages load seller services only
* Admin pages load admin services only

### Modular CSS Architecture

Refactored styling into:

```text
customer.css
seller.css
admin.css
```

Benefits:

* Reduced style conflicts
* Better maintainability
* Easier scaling

### Code Extraction

Removed large inline JavaScript blocks and moved them into dedicated modules:

* search.js
* product.js
* seller-add-product.js

Improving readability and maintainability.

---

## 🎨 User Experience Enhancements

### Loading States

Implemented reusable loading spinners to eliminate blank page flashes during initialization.

### Accessibility

* Added missing ARIA labels
* Improved semantic structure

### Admin Safety

Added confirmation dialogs for destructive actions:

* Ban Seller
* Activate Seller
* Moderation actions

### SEO Improvements

* Meta descriptions added across all pages
* Consistent favicon implementation

---

## 📊 Technology Stack

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript (ES6+)

### Libraries

* Chart.js
* DOMPurify
* Google Fonts (Inter & Outfit)

### Storage

* localStorage
* Custom ShoporaDB engine

---

## 📁 Project Structure

```text
Shopora/
│
├── css/
│   ├── style.css
│   ├── customer.css
│   ├── seller.css
│   └── admin.css
│
├── js/
│   ├── db/
│   │   └── storage.js
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── cartService.js
│   │   ├── orderService.js
│   │   ├── analyticsService.js
│   │   └── adminService.js
│   │
│   ├── utils/
│   │   ├── toast.js
│   │   ├── logger.js
│   │   └── chartHelper.js
│   │
│   ├── pages/
│   │   ├── search.js
│   │   ├── product.js
│   │   └── seller-add-product.js
│   │
│   └── components.js
│
└── pages/
    ├── customer/
    ├── seller/
    └── admin/
```

---

## 🔄 Simulated Marketplace Workflow

1. Seller creates a product
2. Product appears on storefront
3. Customer searches and filters products
4. Customer adds items to cart
5. Customer completes checkout
6. Order is generated
7. Inventory updates automatically
8. Seller revenue updates
9. Analytics dashboards refresh
10. Admin can moderate and manage platform activity

---

## 📈 Project Statistics

* 24 HTML Pages
* 3 User Portals
* 6 Service Modules
* 37+ Files
* Responsive Design
* Secure Authentication
* Analytics Dashboard
* Inventory Management
* Product Moderation System

---

## 🎯 Learning Outcomes

This project demonstrates:

* Frontend Architecture Design
* State Management
* Authentication Systems
* Security Best Practices
* Data Integrity Handling
* Modular JavaScript Development
* Dashboard Development
* E-Commerce Workflow Design
* Performance Optimization
* UI/UX Engineering

---

## 🔮 Future Improvements

* Node.js Backend
* Express REST API
* MongoDB Database
* JWT Authentication
* Payment Gateway Integration
* Automated Testing
* CI/CD Pipelines
* TypeScript Migration
* Docker Deployment

---

## 👨‍💻 Author

**Uday**

A production-style e-commerce platform built to explore scalable frontend architecture, security, performance optimization, and real-world marketplace workflows using Vanilla JavaScript.
