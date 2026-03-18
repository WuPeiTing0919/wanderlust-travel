import { Router } from 'express';
import pool from '../db.js';
import { authRequired, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/favorites
router.get('/', authRequired, async (req: AuthRequest, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT destination_id FROM favorites WHERE user_id = ?',
      [req.user!.id]
    );
    const ids = (rows as any[]).map(r => r.destination_id);
    res.json(ids);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// GET /api/favorites/details — full destination data for favorites
router.get('/details', authRequired, async (req: AuthRequest, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT d.*, f.created_at as favorited_at
       FROM favorites f JOIN destinations d ON f.destination_id = d.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [req.user!.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching favorite details:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// POST /api/favorites
router.post('/', authRequired, async (req: AuthRequest, res) => {
  const { destination_id } = req.body;
  if (!destination_id) {
    res.status(400).json({ error: 'destination_id is required' });
    return;
  }

  try {
    await pool.execute(
      'INSERT INTO favorites (user_id, destination_id) VALUES (?, ?)',
      [req.user!.id, destination_id]
    );
    res.status(201).json({ message: 'Added to favorites' });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Already in favorites' });
      return;
    }
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// DELETE /api/favorites/:destinationId
router.delete('/:destinationId', authRequired, async (req: AuthRequest, res) => {
  try {
    await pool.execute(
      'DELETE FROM favorites WHERE user_id = ? AND destination_id = ?',
      [req.user!.id, req.params.destinationId]
    );
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

export default router;
