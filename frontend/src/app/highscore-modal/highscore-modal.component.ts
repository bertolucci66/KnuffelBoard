import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighscoreService, Highscore } from '../services/highscore.service';

@Component({
  selector: 'app-highscore-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
  <dialog class="modal" [open]="open">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Highscores</h3>
      <div class="py-2 max-h-80 overflow-auto">
        <ol class="list-decimal pl-6">
          <li *ngFor="let h of highscores">{{h.player_name}} — {{h.score}} <span class="opacity-60">({{h.achieved_at | date:'dd.MM.yyyy HH:mm:ss'}})</span></li>
        </ol>
        <p *ngIf="highscores.length===0" class="opacity-70">Keine Einträge.</p>
      </div>
      <div class="modal-action">
        <button class="btn" (click)="close()">Schließen</button>
      </div>
    </div>
  </dialog>
  `
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
