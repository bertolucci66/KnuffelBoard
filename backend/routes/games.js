import express from 'express';
import db, { nowIso, ALL_CATEGORIES, calcTotal, hasColumn } from '../db.js';

const router = express.Router();
const GAMES_HAS_ACTIVE = hasColumn('games', 'active');

function getGame(gameId) {
  return db.prepare('SELECT * FROM games WHERE id = ?').get(gameId);
}

function getPlayersForGame(gameId) {
  return db.prepare(`
    SELECT p.id, p.name, gp.order_index
    FROM game_players gp
    JOIN players p ON p.id = gp.player_id
    WHERE gp.game_id = ?
    ORDER BY gp.order_index ASC
  `).all(gameId);
}

function getScoresForGame(gameId) {
  const rows = db.prepare('SELECT player_id, category, value FROM scores WHERE game_id = ?').all(gameId);
  const scores = {};
  for (const r of rows) {
    if (!scores[r.player_id]) scores[r.player_id] = {};
    scores[r.player_id][r.category] = r.value;
  }
  return scores;
}

function computePerPlayerTotals(players, scores) {
  const result = {};
  for (const p of players) {
    const byCat = scores[p.id] || {};
    result[p.id] = { ...calcTotal(byCat) };
  }
  return result;
}

function isAllFilled(players, scores) {
  return players.every(p => {
    const s = scores[p.id] || {};
    return ALL_CATEGORIES.every(c => typeof s[c] === 'number');
  });
}

// POST /api/games - start new game
router.post('/', (req, res) => {
  try {
    const { players } = req.body || {};
    if (!Array.isArray(players) || players.length < 1 || players.length > 4) {
      return res.status(400).json({ error: 'players must be array of 1-4 names' });
    }
    const sanitized = players.map(n => String(n || '').trim()).filter(Boolean);
    if (sanitized.length !== players.length) {
      return res.status(400).json({ error: 'all player names must be non-empty' });
    }

    const started_at = nowIso();
    const insertGame = db.prepare("INSERT INTO games (started_at, status) VALUES (?, 'active')");
    const gameId = insertGame.run(started_at).lastInsertRowid;
    if (GAMES_HAS_ACTIVE) {
      try {
        db.prepare('UPDATE games SET active = 1 WHERE id = ?').run(gameId);
      } catch (e) {
        // ignore if legacy column not present
      }
    }

    const getOrCreatePlayer = db.prepare('INSERT OR IGNORE INTO players (name) VALUES (?)');
    const selectPlayer = db.prepare('SELECT * FROM players WHERE name = ?');
    const insertGamePlayer = db.prepare('INSERT INTO game_players (game_id, player_id, order_index) VALUES (?, ?, ?)');

    const tx = db.transaction(() => {
      sanitized.forEach((name, idx) => {
        getOrCreatePlayer.run(name);
        const player = selectPlayer.get(name);
        insertGamePlayer.run(gameId, player.id, idx);
      });
    });
    tx();

    const playersOut = getPlayersForGame(gameId);
    res.json({ id: gameId, started_at, status: 'active', players: playersOut });
  } catch (e) {
    console.error('POST /api/games failed:', e);
    const dev = process.env.NODE_ENV !== 'production';
    res.status(500).json({ error: 'failed to start game', detail: dev ? String(e?.message || e) : undefined });
  }
});

// GET /api/games/:id - get game state
router.get('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const game = getGame(id);
    if (!game) return res.status(404).json({ error: 'not found' });
    const players = getPlayersForGame(id);
    const scores = getScoresForGame(id);
    const computed = computePerPlayerTotals(players, scores);
    const allFilled = isAllFilled(players, scores);
    res.json({ ...game, players, scores, computed, allFilled, categories: ALL_CATEGORIES });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed to load game' });
  }
});

// POST /api/games/:id/score - set/update score
router.post('/:id/score', (req, res) => {
  try {
    const id = Number(req.params.id);
    const game = getGame(id);
    if (!game) return res.status(404).json({ error: 'not found' });
    if (game.status !== 'active') return res.status(400).json({ error: 'game not active' });

    const { player_id, category, value } = req.body || {};
    if (!player_id || !ALL_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'invalid player_id or category' });
    }
    const intValue = Number(value);
    if (!Number.isInteger(intValue) || intValue < 0) {
      return res.status(400).json({ error: 'value must be integer >= 0' });
    }

    const isPlayerInGame = db.prepare('SELECT 1 FROM game_players WHERE game_id = ? AND player_id = ?').get(id, player_id);
    if (!isPlayerInGame) return res.status(400).json({ error: 'player not in game' });

    db.prepare(`INSERT INTO scores (game_id, player_id, category, value)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(game_id, player_id, category)
                DO UPDATE SET value = excluded.value`).run(id, player_id, category, intValue);

    const players = getPlayersForGame(id);
    const scores = getScoresForGame(id);
    const computed = computePerPlayerTotals(players, scores);
    const allFilled = isAllFilled(players, scores);
    res.json({ ok: true, allFilled, computed });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed to set score' });
  }
});

// POST /api/games/:id/finish - finish game & ranking
router.post('/:id/finish', (req, res) => {
  try {
    const id = Number(req.params.id);
    const game = getGame(id);
    if (!game) return res.status(404).json({ error: 'not found' });
    if (game.status !== 'active') return res.status(400).json({ error: 'game already finished' });

    const players = getPlayersForGame(id);
    const scores = getScoresForGame(id);
    if (!isAllFilled(players, scores)) {
      return res.status(400).json({ error: 'not all scores set' });
    }

    const computed = players.map(p => {
      const totals = calcTotal(scores[p.id] || {});
      return { player_id: p.id, name: p.name, ...totals };
    });
    computed.sort((a,b) => b.total - a.total);
    const ranking = computed.map((r, idx) => ({ place: idx+1, ...r }));

    const ended_at = nowIso();
    const tx = db.transaction(() => {
      // always update status & ended_at
      db.prepare("UPDATE games SET status = 'finished', ended_at = ? WHERE id = ?").run(ended_at, id);
      // try to maintain legacy 'active' column if present
      if (GAMES_HAS_ACTIVE) {
        try {
          db.prepare('UPDATE games SET active = 0 WHERE id = ?').run(id);
        } catch (e) {
          // ignore if column not present
        }
      }
      const insertHigh = db.prepare('INSERT INTO highscores (player_name, score, achieved_at) VALUES (?, ?, ?)');
      for (const r of computed) {
        insertHigh.run(r.name, r.total, ended_at);
      }
    });
    tx();

    res.json({ ended_at, ranking });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed to finish game' });
  }
});

export default router;
