import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighscoreService, Highscore } from '../services/highscore.service';

@Component({
  selector: 'app-highscore-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './highscore-modal.component.html'
})
export class HighscoreModalComponent implements OnChanges {
  private svc = inject(HighscoreService);
  @Input() open = false;
  highscores: Highscore[] = [];
  @Input() onClose: (()=>void) | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.svc.list().subscribe(list => this.highscores = list);
    }
  }

  close() {
    this.onClose?.();
  }
}
