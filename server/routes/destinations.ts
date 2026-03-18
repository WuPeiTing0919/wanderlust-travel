import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/destinations?search=keyword&category=Beach
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let sql = 'SELECT * FROM destinations WHERE 1=1';
    const params: string[] = [];

    if (search && typeof search === 'string') {
      sql += ' AND (title LIKE ? OR location LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category && typeof category === 'string') {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY id ASC';

    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

// GET /api/destinations/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM destinations WHERE id = ?', [req.params.id]);
    const dests = rows as any[];
    if (dests.length === 0) {
      res.status(404).json({ error: 'Destination not found' });
      return;
    }
    res.json(dests[0]);
  } catch (error) {
    console.error('Error fetching destination:', error);
    res.status(500).json({ error: 'Failed to fetch destination' });
  }
});

export default router;
