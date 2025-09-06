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
    <div class="navbar bg-base-100/90 backdrop-blur sticky top-0 z-50 shadow-lg border-b border-base-300">
      <div class="flex-1">
        <a class="btn btn-ghost normal-case text-2xl font-extrabold" (click)="goHome()">
          <span class="dice-chip mr-2"><span class="dice-pip"></span></span>
          KnuffelBoard
        </a>
      </div>
      <div class="flex-none gap-2 pr-4">
        <button class="btn btn-sm btn-ghost" (click)="showHighscores()">Highscores</button>
        <button class="btn btn-sm btn-ghost" (click)="showStats()">Statistiken</button>
        <button class="btn btn-sm btn-primary" (click)="showHistory()">Historie</button>
      </div>
    </div>

    <main class="container py-3 md:py-4">
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
