# 303 Apparel Store

303 Apparel is a full-stack apparel e-commerce website built with HTML, CSS, JavaScript, Node.js, Express.js, and MongoDB. It features a clothing catalog, an online ordering flow, promotional content, and an administrative dashboard for managing store records. The original frontend was later connected to an Express REST API and MongoDB Atlas using Mongoose.

**Live Demo:** [303 Apparel Store](https://three03apparel-store.onrender.com)  
**GitHub Repository:** [thebeancheese/303apparel-store](https://github.com/thebeancheese/303apparel-store)

## Authors
- Manjot Chamdal
- Vince Raiezen M. Cruzada
- John Paul S. David
- Emilson Lio F. Madla
- Erinne Karl Gabriel D. Sicat
- Clarence Matthew F. Yabut

## Features

### Storefront and Shopping
- Responsive homepage with featured apparel, a promotional banner and countdown, video, and digital brochure
- Product catalog with search, category filters, sorting, and pagination (eight products per page)
- Product detail galleries with multiple photos and gallery navigation
- Shopping cart, checkout, order creation, and customer records
- Promotional code checking and discount support
- Contact form for customer inquiries

### Promotional and Informational Pages
- **Home:** Brand introduction, featured items, campaign banner, promotional video, and brochure
- **Features:** Store and brand highlights
- **Products:** Browsable and searchable product catalog
- **Contact:** Customer inquiry form and company information
- **Social:** “Cop the Drop” campaign and a carousel of promotional posters
- **Infographic:** “The Fit Formula” visual content
- **Credits:** Project credits and acknowledgments
- **404:** Branded page-not-found design

### Administrator Dashboard
- Administrator login protected by a server-side administrator key
- Add, edit, and delete products, including product photos
- Toggle featured products
- Manage promotional codes
- View customers and contact messages
- Reset the product catalog to its original seed data

### Media and Design
- Navy and cream visual identity (`#2a3f62` and `#fef9ea`)
- Promotional video section and draggable, resizable floating mini player
- In-page image viewer for the brochure and infographic
- Multi-image product galleries

## Technologies Used

| Category | Technology |
| --- | --- |
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Object Data Modeling | Mongoose |
| Deployment | Render |
| Version Control | Git and GitHub |

## Project Structure

```text
303apparel-store/
├── public/
│   ├── index.html             # Homepage
│   ├── products.html          # Product catalog
│   ├── features.html          # Features page
│   ├── contact.html           # Contact page
│   ├── social.html            # Social campaign
│   ├── infographic.html       # Infographic
│   ├── credits.html           # Credits
│   ├── admin.html             # Administrator dashboard
│   ├── 404.html               # Branded error page
│   └── assets/                # CSS, JavaScript, images, and video
├── server.js                  # Express server and REST API
├── models.js                  # Mongoose models
├── seed.js                    # Initial database data
├── package.json               # Node.js scripts and dependencies
├── .env.example               # Environment variable template
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/thebeancheese/303apparel-store.git
cd 303apparel-store
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the environment

Create a `.env` file using `.env.example` as a guide:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/303apparel?retryWrites=true&w=majority
ADMIN_KEY=your_secure_admin_key
PORT=3000
```

Use your own MongoDB Atlas connection string and a strong administrator key. Ensure that Atlas Network Access allows connections from your development or hosting environment.

### 4. Run the application

```bash
npm start
```

Visit **http://localhost:3000** in your browser. The full-stack version requires the server and MongoDB connection; opening `index.html` directly is not sufficient.

## Database and API

The backend uses Mongoose models and MongoDB collections for:

| Collection | Stored Information |
| --- | --- |
| `products` | Apparel, prices, categories, available stock, images, and featured status |
| `customers` | Customer details and order-related information |
| `orders` | Submitted orders and purchased items |
| `messages` | Inquiries from the contact form |
| `promos` | Promotional codes and discount settings |

The browser communicates with the backend through `/api` endpoints. `public/assets/js/store.js` handles the API requests, while `server.js` processes them and uses Mongoose to access MongoDB. Administrator-only requests require authentication.

To populate the database with initial data:

```bash
npm run seed
```

A `seed:reset` command is also available, but **use it cautiously** because it resets seeded data.

## Deployment

The website is deployed as a **Render Web Service** connected to **MongoDB Atlas**.

| Render Setting | Value |
| --- | --- |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Required Environment Variables | `MONGODB_URI`, `ADMIN_KEY` |

Live site: **https://three03apparel-store.onrender.com**

## Notes

- This README documents the current full-stack version. The earlier frontend-only version used `localStorage`; product, order, customer, message, and promo operations now use the Express/MongoDB API.
- Keep `.env`, database credentials, and administrator secrets out of the repository.
- Store-specific contact details and social links should be reviewed before production use if they are still placeholders.
- The promotional code **15-0FF** was originally configured for 15% off through **October 15, 2026**; current offers are controlled by the store's promo settings.
