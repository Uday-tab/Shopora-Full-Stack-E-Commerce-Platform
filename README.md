# Shopora — Full-Stack E-Commerce Platform

## Overview

Shopora is a production-style multi-page e-commerce web application inspired by Amazon's architecture and workflow. Built entirely with HTML5, CSS3, and vanilla JavaScript, it demonstrates how a complete online marketplace can be implemented without frontend frameworks or backend dependencies.

The platform includes dedicated Customer, Seller, and Admin portals, simulating real-world e-commerce operations such as product management, order processing, inventory tracking, analytics, moderation, and user management.

---

## Features

### Customer Storefront

* Product browsing and search
* Advanced filtering and sorting
* Product detail pages with variants and reviews
* Shopping cart management
* Checkout workflow
* Order confirmation system
* User authentication
* Profile management
* Wishlist functionality
* Address management

### Seller Dashboard

* Sales analytics dashboard
* Product management (Add/Edit/Delete)
* Inventory tracking
* Order management
* Revenue monitoring
* Performance analytics using Chart.js

### Admin Panel

* Platform overview dashboard
* Product moderation tools
* User and seller management
* Account activation and banning
* Reports and issue resolution system

---

## Architecture

### Multi-Page Application

Unlike Single Page Applications (SPA), Shopora follows a traditional multi-page architecture consisting of 24 standalone HTML pages connected through navigation.

### Simulated Backend

The application uses a custom localStorage-powered database called **ShoporaDB**, providing:

* Persistent data storage
* Full CRUD operations
* Automatic database seeding
* Real-time updates
* Browser-based persistence

### Modular Service Layer

Business logic is separated into dedicated service modules:

* Authentication Service
* Product Service
* Cart Service
* Order Service
* Analytics Service
* Admin Service

### Shared Component System

Reusable UI components are injected dynamically through `components.js`, ensuring consistency across all pages.

Components include:

* Navigation bars
* Headers
* Footers
* Sidebars
* Product cards
* Toast notifications

---

## Technology Stack

* HTML5
* CSS3
* Vanilla JavaScript (ES6+)
* localStorage
* Chart.js
* Google Fonts (Inter & Outfit)

---

## Design System

### Color Palette

* Primary: Navy (#0B1523)
* Accent: Orange (#ea580c)

### UI Features

* Responsive design
* CSS Custom Properties
* Sticky navigation
* Hover animations
* Status badges
* Toast notifications

### Responsive Breakpoints

* Desktop: 1024px+
* Tablet: 768px
* Mobile: 480px

---

## Simulated E-Commerce Workflow

1. Seller uploads products.
2. Products appear instantly on the storefront.
3. Customer searches and filters products.
4. Customer adds products to cart.
5. Checkout creates an order.
6. Inventory is automatically updated.
7. Seller revenue is recorded.
8. Analytics data is generated.
9. Admin can moderate products and manage users.

---

## Project Structure

```text
amz/
├── css/
│   └── style.css
│
├── js/
│   ├── db/
│   │   └── storage.js
│   │
│   ├── services/
│   │   ├── auth.js
│   │   ├── product.js
│   │   ├── cart.js
│   │   ├── order.js
│   │   ├── analytics.js
│   │   └── admin.js
│   │
│   ├── utils/
│   │   ├── toast.js
│   │   ├── logger.js
│   │   └── chartHelper.js
│   │
│   └── components.js
│
└── pages/
    ├── customer/
    ├── seller/
    └── admin/
```

---

## Statistics

* 24 HTML Pages
* 3 Independent Portals
* 12 Seeded Products
* 37+ Project Files
* 100% Frontend Implementation
* Zero Backend Dependencies

---

## Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/shopora.git
```

2. Open the project folder.

3. Launch `index.html` in a browser.

No installation, build process, or backend setup is required.

---

## Learning Outcomes

This project demonstrates:

* Frontend architecture design
* State management without frameworks
* Local storage database simulation
* Modular JavaScript development
* Responsive UI design
* CRUD operations
* E-commerce workflow implementation
* Dashboard and analytics development

---

## Future Enhancements

* Payment gateway integration
* Backend API support
* User authentication with JWT
* Product recommendations
* Real-time notifications
* Multi-vendor support
* Wishlist synchronization
* Order tracking system

---

## Author

Uday

Built as a full-stack simulation project using HTML, CSS, and JavaScript to replicate real-world e-commerce platform workflows.
