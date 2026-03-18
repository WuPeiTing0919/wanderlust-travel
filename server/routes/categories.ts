import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/categories
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM categories ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
