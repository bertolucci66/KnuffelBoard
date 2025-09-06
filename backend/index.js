import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import gamesRouter from './routes/games.js';
import highscoresRouter from './routes/highscores.js';
import statsRouter from './routes/stats.js';
import historyRouter from './routes/history.js';

const app = express();
app.use(cors());
app.use(express.json());

// --- API routes ---
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});
app.use('/api/games', gamesRouter);
app.use('/api/highscores', highscoresRouter);
app.use('/api/stats', statsRouter);
app.use('/api/history', historyRouter);

// --- Serve Angular frontend build at "/" ---
// Resolve repo root from this file location
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Angular default output path in this project: frontend/dist/knuffelboard
const frontendDist = path.resolve(__dirname, '../frontend/dist/knuffelboard');

app.use(express.static(frontendDist));

// SPA fallback: for any non-API route, return index.html
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`KnuffelBoard backend listening on http://localhost:${PORT}`);
  console.log(`Serving frontend from ${frontendDist}`);
});
