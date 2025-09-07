import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfettiService } from '../services/confetti.service';

export type RankingEntry = { place:number; player_id:number; name:string; upper:number; bonus:number; lower:number; total:number };

@Component({
  selector: 'app-ranking-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking-modal.component.html',
  styleUrls: ['./ranking-modal.component.css']
})
export class RankingModalComponent implements OnChanges {
  private confetti = inject(ConfettiService);

  @Input() open = false;
  @Input() ranking: RankingEntry[] = [];
  @Input() onClose: (()=>void) | undefined;

  showWin = false;
  topName: string | null = null;
  private hideTimer: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] || changes['ranking']) {
      this.maybeStartAnimation();
    }
  }

  private maybeStartAnimation() {
    clearTimeout(this.hideTimer);
    if (this.open && this.ranking && this.ranking.length) {
      const top = this.ranking[0];
      this.topName = top?.name || null;
      this.showWin = true;
      // Trigger full-window confetti explosions for ~7.5s
      this.confetti.startExplosions(7500);
      // hide trophy overlay after a few seconds
      this.hideTimer = setTimeout(() => this.showWin = false, 7500);
    } else {
      this.showWin = false;
      this.topName = null;
      this.confetti.stop();
    }
  }
}
