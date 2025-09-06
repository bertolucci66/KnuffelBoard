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

  onStart(players: string[]) {
    this.gameService.startGame(players).subscribe(res => this.gameId.set(Number(res.id)));
  }

  onAbort() {
    // Simply clear current game; unfinished results are not saved to history
    this.gameId.set(null);
  }
}
