import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /api/highscores - list highscores (top 50)
router.get('/', (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const rows = db.prepare('SELECT player_name, score, achieved_at FROM highscores ORDER BY score DESC, achieved_at ASC LIMIT ?').all(limit);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed to load highscores' });
  }
});

export default router;
