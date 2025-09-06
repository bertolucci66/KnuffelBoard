import express from 'express';
import cors from 'cors';
import db from './db.js';
import gamesRouter from './routes/games.js';
import highscoresRouter from './routes/highscores.js';
import statsRouter from './routes/stats.js';
import historyRouter from './routes/history.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/games', gamesRouter);
app.use('/api/highscores', highscoresRouter);
app.use('/api/stats', statsRouter);
app.use('/api/history', historyRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`KnuffelBoard backend listening on http://localhost:${PORT}`);
});
