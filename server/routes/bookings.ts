import { Router } from 'express';
import pool from '../db.js';
import { authRequired, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/bookings
router.get('/', authRequired, async (req: AuthRequest, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT b.*, d.title, d.location, d.image
       FROM bookings b
       JOIN destinations d ON b.destination_id = d.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user!.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// POST /api/bookings
router.post('/', authRequired, async (req: AuthRequest, res) => {
  const { destination_id, check_in, check_out, guests } = req.body;

  if (!destination_id || !check_in || !check_out || !guests) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  try {
    // Get destination price
    const [dests] = await pool.execute('SELECT price FROM destinations WHERE id = ?', [destination_id]);
    const dest = (dests as any[])[0];
    if (!dest) {
      res.status(404).json({ error: 'Destination not found' });
      return;
    }

    const nights = Math.ceil(
      (new Date(check_out).getTime() - new Date(check_in).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (nights <= 0) {
      res.status(400).json({ error: 'Check-out must be after check-in' });
      return;
    }

    const totalPrice = Number(dest.price) * nights;

    const [result] = await pool.execute(
      'INSERT INTO bookings (user_id, destination_id, check_in, check_out, guests, total_price) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user!.id, destination_id, check_in, check_out, guests, totalPrice]
    );

    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        id: (result as any).insertId,
        nights,
        total_price: totalPrice,
      },
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

export default router;
