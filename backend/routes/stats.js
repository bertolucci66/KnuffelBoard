import express from 'express';
import db from '../db.js';

const router = express.Router();

// Helper to compute per-game totals for a player
function totalsForPlayer(playerName) {
  const rows = db.prepare(`
    SELECT g.id as game_id, g.ended_at, p.id as player_id, p.name, SUM(s.value) as sum_values
    FROM games g
    JOIN game_players gp ON gp.game_id = g.id
    JOIN players p ON p.id = gp.player_id
    LEFT JOIN scores s ON s.game_id = g.id AND s.player_id = p.id
    WHERE g.status = 'finished' AND p.name = ?
    GROUP BY g.id, p.id
    ORDER BY g.ended_at ASC
  `).all(playerName);
  // The sum_values here is the sum of all categories; we still need to add bonus according to rules.
  // To apply the exact bonus, recompute by fetching category splits for each finished game.
  const getScores = db.prepare('SELECT category, value FROM scores WHERE game_id = ? AND player_id = ?');
  const C_UPPER = ['ones','twos','threes','fours','fives','sixes'];
  return rows.map(r => {
    const cats = getScores.all(r.game_id, r.player_id);
    const byCat = Object.fromEntries(cats.map(c => [c.category, c.value]));
    const upper = C_UPPER.reduce((a,c)=>a+(byCat[c]||0),0);
    const bonus = upper >= 63 ? 35 : 0;
    const total = (r.sum_values || 0) + bonus;
    return { game_id: r.game_id, ended_at: r.ended_at, total };
  });
}

// GET /api/stats/:playerName - stats for a player
router.get('/:playerName', (req, res) => {
  try {
    const playerName = String(req.params.playerName);
    const games = totalsForPlayer(playerName);
    const count = games.length;
    const best = count ? Math.max(...games.map(g => g.total)) : 0;
    const avg = count ? Math.round(games.reduce((a,g)=>a+g.total,0) / count) : 0;
    const top3 = games.sort((a,b)=>b.total - a.total).slice(0,3);
    res.json({ player: playerName, games: count, bestScore: best, averageScore: avg, top3 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed to load stats' });
  }
});

// GET /api/history - game history
router.get('/history/all', (req, res) => {
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
