import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import destinationsRouter from './routes/destinations.js';
import categoriesRouter from './routes/categories.js';
import subscribersRouter from './routes/subscribers.js';
import authRouter from './routes/auth.js';
import favoritesRouter from './routes/favorites.js';
import bookingsRouter from './routes/bookings.js';
import cartRouter from './routes/cart.js';
import adminRouter from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || Number(process.env.SERVER_PORT) || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/destinations', destinationsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/subscribers', subscribersRouter);
app.use('/api/auth', authRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/admin', adminRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Production: serve frontend static files
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback: all non-API routes serve index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
