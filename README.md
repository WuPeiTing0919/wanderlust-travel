# Wanderlust Travel

A full-stack travel booking web application built with React 19 + Express.js + MySQL.

Browse destinations, add trips to your cart, book travel experiences, and manage everything through a comprehensive admin dashboard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, React Router 7, Tailwind CSS 4 |
| Backend | Express.js 4, Node.js |
| Database | MySQL (mysql2) |
| Auth | JWT + bcryptjs |
| Build | Vite 6 |
| Icons | Lucide React |
| Animation | Motion (Framer Motion) |

## Features

### Public Pages
- **Home** — Hero section, featured destinations, search, category browsing, newsletter subscription
- **Destinations** — Full listing with search & category filter, favorites, add to cart
- **Destination Detail** — Detailed info, OpenStreetMap, travel planning content, related destinations
- **Tours** — Category feature cards, popular tours per category
- **About** — Company story, stats, values, team
- **Contact** — Contact form, FAQ accordion, map

### User Features (Login Required)
- **Shopping Cart** — Add multiple destinations, manage items, checkout
- **Profile** — View favorites & booking history
- **Favorites** — Save/remove favorite destinations
- **Bookings** — View booking status (confirmed / completed / cancelled)

### Admin Dashboard (`/admin`)
- **Dashboard** — Stats overview (orders, revenue, users, subscribers)
- **Destinations** — Full CRUD management
- **Orders** — View all orders, update status
- **Users** — View & delete users
- **Subscribers** — View & delete newsletter subscribers

## Project Structure

```
wanderlust-travel/
├── server/
│   ├── index.ts              # Express server entry
│   ├── db.ts                 # MySQL connection pool
│   ├── init-db.ts            # Database initialization & seed data
│   ├── middleware/
│   │   └── auth.ts           # JWT auth & admin middleware
│   └── routes/
│       ├── auth.ts           # Register / Login
│       ├── destinations.ts   # List & detail
│       ├── categories.ts     # Category list
│       ├── bookings.ts       # User bookings
│       ├── cart.ts           # Cart CRUD & checkout
│       ├── favorites.ts      # Favorites management
│       ├── subscribers.ts    # Newsletter subscription
│       └── admin.ts          # Admin CRUD (all entities)
├── src/
│   ├── main.tsx              # Entry point (BrowserRouter)
│   ├── App.tsx               # Routes & shared state
│   ├── components/
│   │   ├── Navbar.tsx        # Navigation bar
│   │   └── AuthModal.tsx     # Login / Signup modal
│   └── pages/
│       ├── Home.tsx
│       ├── DestinationsPage.tsx
│       ├── DestinationDetail.tsx
│       ├── ToursPage.tsx
│       ├── AboutPage.tsx
│       ├── ContactPage.tsx
│       ├── Profile.tsx
│       ├── Cart.tsx
│       └── admin/
│           ├── AdminLayout.tsx
│           ├── Dashboard.tsx
│           ├── Destinations.tsx
│           ├── Orders.tsx
│           └── Users.tsx
├── .env                      # Environment variables (not committed)
├── .env.example              # Environment template
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |

### Destinations
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/destinations` | List all (supports `?search=` & `?category=`) |
| GET | `/api/destinations/:id` | Get detail by ID |

### Cart (Auth Required)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart` | Add to cart |
| DELETE | `/api/cart/:id` | Remove item |
| POST | `/api/cart/checkout` | Checkout → create bookings |

### Bookings (Auth Required)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/bookings` | Get user's bookings |
| POST | `/api/bookings` | Create booking |

### Favorites (Auth Required)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/favorites` | Get favorited destination IDs |
| GET | `/api/favorites/details` | Get full favorite details |
| POST | `/api/favorites` | Add favorite |
| DELETE | `/api/favorites/:id` | Remove favorite |

### Admin (Admin Auth Required)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET/POST | `/api/admin/destinations` | List / Create |
| PUT/DELETE | `/api/admin/destinations/:id` | Update / Delete |
| GET | `/api/admin/orders` | List all orders |
| PUT | `/api/admin/orders/:id` | Update order status |
| GET | `/api/admin/users` | List all users |
| DELETE | `/api/admin/users/:id` | Delete user (cascade) |
| GET | `/api/admin/subscribers` | List subscribers |
| DELETE | `/api/admin/subscribers/:id` | Delete subscriber |

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL database

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Create a `.env` file:
```env
DB_HOST=your_mysql_host
DB_PORT=3306
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
SERVER_PORT=3001
```

### 3. Initialize database
```bash
npm run init-db
```
This creates all tables and seeds sample data including an admin account:
- Email: `admin@wanderlust.com`
- Password: `admin123`

### 4. Run in development
Start both servers:
```bash
# Terminal 1 — Backend
npm run server

# Terminal 2 — Frontend
npm run dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Vite proxies `/api` requests to the backend automatically.

### 5. Build for production
```bash
npm run build
npm run start
```
Express serves both the API and the built frontend from a single port.

## Database Schema

| Table | Description |
|-------|-------------|
| `users` | User accounts with role (user/admin) |
| `destinations` | Travel destinations with location, price, rating, coordinates |
| `categories` | Destination categories (Beach, City, Nature, Adventure, Flights) |
| `bookings` | User bookings with status tracking |
| `cart_items` | Shopping cart items |
| `favorites` | User favorite destinations |
| `subscribers` | Newsletter email subscribers |

## Deployment

The project is configured for single-service deployment. Express serves both the API and the static frontend build.

**Build Command:** `npm install && npm run build`
**Start Command:** `npm run start`

Set all `.env` variables as environment variables on your hosting platform. Use `PORT` for the server port (most platforms set this automatically).

## License

MIT
