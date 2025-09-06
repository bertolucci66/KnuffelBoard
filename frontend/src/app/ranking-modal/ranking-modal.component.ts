import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export type RankingEntry = { place:number; player_id:number; name:string; upper:number; bonus:number; lower:number; total:number };

@Component({
  selector: 'app-ranking-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking-modal.component.html',
  styleUrls: ['./ranking-modal.component.css']
})
export class RankingModalComponent implements OnChanges {
  @Input() open = false;
  @Input() ranking: RankingEntry[] = [];
  @Input() onClose: (()=>void) | undefined;

  showWin = false;
  topName: string | null = null;
  confettiPieces = Array.from({ length: 50 });
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
      // hide overlay after a few seconds
      this.hideTimer = setTimeout(() => this.showWin = false, 4500);
    } else {
      this.showWin = false;
      this.topName = null;
    }
  }

  confettiStyle(i: number) {
    // distribute across width with random colors/delays/durations
    const left = (i * (100 / this.confettiPieces.length)) + (Math.random()*2);
    const duration = 2500 + Math.random()*1500; // 2.5s - 4s
    const delay = Math.random()*400; // stagger start slightly
    const colors = ['#fbbf24','#22c55e','#38bdf8','#ef4444','#eab308','#a78bfa','#f472b6'];
    const bg = colors[i % colors.length];
    const rotate = Math.random()*360;
    return {
      left: `${left}%`,
      background: bg,
      transform: `rotate(${rotate}deg)`,
      animationDuration: `${duration}ms, 900ms`,
      animationDelay: `${delay}ms, 0ms`,
    } as any;
  }
}
