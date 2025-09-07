import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameSetupComponent } from '../game-setup/game-setup.component';
import { ScoreboardComponent } from '../scoreboard/scoreboard.component';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, GameSetupComponent, ScoreboardComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private gameService = inject(GameService);
  gameId = signal<number | null>(null);
  canResume = signal(false);

  constructor() {
    // On app load, check if there is an interrupted game
    try {
      const raw = localStorage.getItem('activeGameId');
      const id = raw ? Number(raw) : NaN;
      if (!isNaN(id)) {
        // Optionally verify with backend to avoid dangling ids
        this.gameService.getGame(id).subscribe({
          next: g => { if (g.status === 'active') this.canResume.set(true); else localStorage.removeItem('activeGameId'); },
          error: () => { localStorage.removeItem('activeGameId'); this.canResume.set(false); }
        });
      }
    } catch {}
  }

  onStart(players: string[]) {
    this.gameService.startGame(players).subscribe(res => {
      this.gameId.set(Number(res.id));
      try { localStorage.setItem('activeGameId', String(res.id)); } catch {}
    });
  }

  onResume() {
    try {
      const raw = localStorage.getItem('activeGameId');
      if (!raw) return;
      const id = Number(raw);
      if (!isNaN(id)) this.gameId.set(id);
    } catch {}
  }

  onAbort() {
    // Simply clear current game; unfinished results are not saved to history
    this.gameId.set(null);
    try { localStorage.removeItem('activeGameId'); } catch {}
    this.canResume.set(false);
  }
}
