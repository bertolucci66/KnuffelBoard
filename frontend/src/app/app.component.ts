import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { HighscoreModalComponent } from './highscore-modal/highscore-modal.component';
import { StatsModalComponent } from './stats-modal/stats-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HighscoreModalComponent, StatsModalComponent],
  template: `
    <div class="navbar bg-base-100 shadow">
      <div class="flex-1">
        <a class="btn btn-ghost text-xl" (click)="goHome()">🎲 KnuffelBoard</a>
      </div>
      <div class="flex-none gap-2 pr-4">
        <button class="btn btn-sm" (click)="showHighscores()">Highscores</button>
        <button class="btn btn-sm" (click)="showStats()">Statistiken</button>
        <button class="btn btn-sm" (click)="showHistory()">Historie</button>
      </div>
    </div>

    <main class="container py-6">
      <router-outlet></router-outlet>
    </main>

    <app-highscore-modal [open]="isHighscores()" [onClose]="closeHighscores"></app-highscore-modal>
    <app-stats-modal [open]="isStats()" [onClose]="closeStats"></app-stats-modal>
  `
})
export class AppComponent {
  private router = inject(Router);
  isHighscores = signal(false);
  isStats = signal(false);

  goHome() { this.router.navigateByUrl('/'); }
  showHighscores() { this.isHighscores.set(true); }
  showStats() { this.isStats.set(true); }
  showHistory() { this.router.navigateByUrl('/history'); }

  closeHighscores = () => this.isHighscores.set(false);
  closeStats = () => this.isStats.set(false);
}
