import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { HighscoreModalComponent } from './highscore-modal/highscore-modal.component';
import { StatsModalComponent } from './stats-modal/stats-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HighscoreModalComponent, StatsModalComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private router = inject(Router);
  isHighscores = signal(false);
  isStats = signal(false);
  // Displayed version info (can be updated per release)
  version = '1.0.0';
  versionDate = '06.09.2025';

  goHome() { this.router.navigateByUrl('/'); }
  showHighscores() { this.isHighscores.set(true); }
  showStats() { this.isStats.set(true); }
  showHistory() { this.router.navigateByUrl('/history'); }

  closeHighscores = () => this.isHighscores.set(false);
  closeStats = () => this.isStats.set(false);
}
