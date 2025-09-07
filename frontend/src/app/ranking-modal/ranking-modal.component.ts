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
      // hide overlay after a few seconds (allow rain to finish)
      this.hideTimer = setTimeout(() => this.showWin = false, 7500);
    } else {
      this.showWin = false;
      this.topName = null;
    }
  }

  confettiStyle(i: number) {
    // Random explosion vector from center and horizontal drift
    const angle = Math.random() * Math.PI * 2; // 0..2π
    const radius = 40 + Math.random() * 120; // px distance of initial burst
    const vx = Math.cos(angle) * radius;
    const vy = Math.sin(angle) * radius;
    const hx = (Math.random() - 0.5) * 160; // horizontal drift during fall (px)

    // timings slowed down: explode 700-1100ms, drift 3200-4600ms
    const explodeMs = 700 + Math.random()*400;
    const driftMs = 3200 + Math.random()*1400;
    const delay = Math.random()*450; // slightly wider stagger

    const colors = ['#fbbf24','#22c55e','#38bdf8','#ef4444','#eab308','#a78bfa','#f472b6'];
    const color = colors[i % colors.length];

    // slight size/shape variety
    const w = 8 + Math.random()*6;
    const h = 10 + Math.random()*10;

    // spin duration and direction, sway duration (slower for natural flutter)
    const spin = (Math.random() < 0.5 ? -1 : 1) * (1400 + Math.random()*800); // ms
    const swayDur = 1600 + Math.random()*1000; // ms

    return {
      '--vx': `${vx}px`,
      '--vy': `${vy}px`,
      '--hx': `${hx}px`,
      '--spin': `${Math.abs(spin)}ms`,
      '--swayDur': `${swayDur}ms`,
      width: `${w}px`,
      height: `${h}px`,
      color,
      animationDuration: `${explodeMs}ms, ${driftMs}ms`,
      animationDelay: `${delay}ms, ${explodeMs + delay}ms`,
    } as any;
  }
}
