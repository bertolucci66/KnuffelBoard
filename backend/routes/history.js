import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /api/history - list of finished games with players and totals
router.get('/', (req, res) => {
  try {
    const games = db.prepare("SELECT id, started_at, ended_at, status FROM games WHERE status = 'finished' ORDER BY ended_at DESC").all();
    const getPlayers = db.prepare(`
      SELECT p.name, p.id FROM game_players gp JOIN players p ON p.id = gp.player_id WHERE gp.game_id = ? ORDER BY gp.order_index ASC
    `);
    const getTotals = db.prepare('SELECT player_id, SUM(value) as sum_no_bonus FROM scores WHERE game_id = ? GROUP BY player_id');
    const getUpper = db.prepare(`SELECT player_id, SUM(value) as upper FROM scores WHERE game_id = ? AND category IN ('ones','twos','threes','fours','fives','sixes') GROUP BY player_id`);

    const out = games.map(g => {
      const players = getPlayers.all(g.id);
      const totals = Object.fromEntries(getTotals.all(g.id).map(r => [r.player_id, r.sum_no_bonus]));
      const uppers = Object.fromEntries(getUpper.all(g.id).map(r => [r.player_id, r.upper]));
      const playersWithTotals = players.map(p => {
        const upper = uppers[p.id] || 0;
        const bonus = upper >= 63 ? 35 : 0;
        const total = (totals[p.id] || 0) + bonus;
        return { name: p.name, total };
      });
      playersWithTotals.sort((a,b)=>b.total - a.total);
      return { game_id: g.id, ended_at: g.ended_at, players: playersWithTotals };
    });

    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed to load history' });
  }
});

export default router;
