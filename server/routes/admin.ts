import { Router } from 'express';
import pool from '../db.js';
import { adminRequired } from '../middleware/auth.js';

const router = Router();

// All routes require admin
router.use(adminRequired);

// GET /api/admin/stats
router.get('/stats', async (_req, res) => {
  try {
    const [[orders]] = await pool.execute('SELECT COUNT(*) as count, COALESCE(SUM(total_price),0) as revenue FROM bookings') as any;
    const [[users]] = await pool.execute('SELECT COUNT(*) as count FROM users') as any;
    const [[subscribers]] = await pool.execute('SELECT COUNT(*) as count FROM subscribers') as any;
    const [[destinations]] = await pool.execute('SELECT COUNT(*) as count FROM destinations') as any;
    const [recentOrders] = await pool.execute(
      `SELECT b.*, u.name as user_name, d.title as destination_title
       FROM bookings b JOIN users u ON b.user_id = u.id JOIN destinations d ON b.destination_id = d.id
       ORDER BY b.created_at DESC LIMIT 5`
    );
    res.json({
      orders: orders.count,
      revenue: Number(orders.revenue),
      users: users.count,
      subscribers: subscribers.count,
      destinations: destinations.count,
      recentOrders,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// --- Destinations CRUD ---
router.get('/destinations', async (_req, res) => {
  const [rows] = await pool.execute('SELECT * FROM destinations ORDER BY id DESC');
  res.json(rows);
});

router.post('/destinations', async (req, res) => {
  const { title, location, price, rating, reviews, image, category } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO destinations (title, location, price, rating, reviews, image, category) VALUES (?,?,?,?,?,?,?)',
      [title, location, price, rating || 0, reviews || 0, image, category]
    );
    res.status(201).json({ id: (result as any).insertId, message: 'Destination created' });
  } catch (error) {
    console.error('Create destination error:', error);
    res.status(500).json({ error: 'Failed to create destination' });
  }
});

router.put('/destinations/:id', async (req, res) => {
  const { title, location, price, rating, reviews, image, category } = req.body;
  try {
    await pool.execute(
      'UPDATE destinations SET title=?, location=?, price=?, rating=?, reviews=?, image=?, category=? WHERE id=?',
      [title, location, price, rating, reviews, image, category, req.params.id]
    );
    res.json({ message: 'Destination updated' });
  } catch (error) {
    console.error('Update destination error:', error);
    res.status(500).json({ error: 'Failed to update destination' });
  }
});

router.delete('/destinations/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM destinations WHERE id = ?', [req.params.id]);
    res.json({ message: 'Destination deleted' });
  } catch (error) {
    console.error('Delete destination error:', error);
    res.status(500).json({ error: 'Failed to delete destination' });
  }
});

// --- Orders ---
router.get('/orders', async (_req, res) => {
  const [rows] = await pool.execute(
    `SELECT b.*, u.name as user_name, u.email as user_email, d.title as destination_title, d.location as destination_location
     FROM bookings b JOIN users u ON b.user_id = u.id JOIN destinations d ON b.destination_id = d.id
     ORDER BY b.created_at DESC`
  );
  res.json(rows);
});

router.put('/orders/:id', async (req, res) => {
  const { status } = req.body;
  if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }
  await pool.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ message: 'Order status updated' });
});

// --- Users ---
router.get('/users', async (_req, res) => {
  const [rows] = await pool.execute('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC');
  res.json(rows);
});

router.delete('/users/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM favorites WHERE user_id = ?', [req.params.id]);
    await pool.execute('DELETE FROM cart_items WHERE user_id = ?', [req.params.id]);
    await pool.execute('DELETE FROM bookings WHERE user_id = ?', [req.params.id]);
    await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// --- Subscribers ---
router.get('/subscribers', async (_req, res) => {
  const [rows] = await pool.execute('SELECT * FROM subscribers ORDER BY id DESC');
  res.json(rows);
});

router.delete('/subscribers/:id', async (req, res) => {
  await pool.execute('DELETE FROM subscribers WHERE id = ?', [req.params.id]);
  res.json({ message: 'Subscriber deleted' });
});

export default router;
