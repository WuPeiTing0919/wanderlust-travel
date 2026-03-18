import { Router } from 'express';
import pool from '../db.js';
import { authRequired, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/cart
router.get('/', authRequired, async (req: AuthRequest, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.*, d.title, d.location, d.price, d.image, d.rating
       FROM cart_items c
       JOIN destinations d ON c.destination_id = d.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [req.user!.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart
router.post('/', authRequired, async (req: AuthRequest, res) => {
  const { destination_id, check_in, check_out, guests } = req.body;
  if (!destination_id || !check_in || !check_out) {
    res.status(400).json({ error: 'destination_id, check_in, check_out are required' });
    return;
  }

  try {
    await pool.execute(
      'INSERT INTO cart_items (user_id, destination_id, check_in, check_out, guests) VALUES (?, ?, ?, ?, ?)',
      [req.user!.id, destination_id, check_in, check_out, guests || 1]
    );
    // Return updated count
    const [countRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM cart_items WHERE user_id = ?',
      [req.user!.id]
    );
    res.status(201).json({ message: 'Added to cart', cartCount: (countRows as any)[0].count });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// DELETE /api/cart/:id
router.delete('/:id', authRequired, async (req: AuthRequest, res) => {
  try {
    await pool.execute('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user!.id]);
    res.json({ message: 'Removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// POST /api/cart/checkout
router.post('/checkout', authRequired, async (req: AuthRequest, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [items] = await conn.execute(
      `SELECT c.*, d.price FROM cart_items c
       JOIN destinations d ON c.destination_id = d.id
       WHERE c.user_id = ?`,
      [req.user!.id]
    );
    const cartItems = items as any[];

    if (cartItems.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    let totalAmount = 0;
    for (const item of cartItems) {
      const nights = Math.ceil(
        (new Date(item.check_out).getTime() - new Date(item.check_in).getTime()) / (1000 * 60 * 60 * 24)
      );
      const itemTotal = Number(item.price) * Math.max(nights, 1);
      totalAmount += itemTotal;

      await conn.execute(
        'INSERT INTO bookings (user_id, destination_id, check_in, check_out, guests, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.user!.id, item.destination_id, item.check_in, item.check_out, item.guests, itemTotal, 'confirmed']
      );
    }

    await conn.execute('DELETE FROM cart_items WHERE user_id = ?', [req.user!.id]);
    await conn.commit();

    res.json({ message: 'Checkout successful', bookings: cartItems.length, totalAmount });
  } catch (error) {
    await conn.rollback();
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Checkout failed' });
  } finally {
    conn.release();
  }
});

export default router;
