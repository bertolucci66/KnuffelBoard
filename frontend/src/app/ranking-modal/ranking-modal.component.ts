import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export type RankingEntry = { place:number; player_id:number; name:string; upper:number; bonus:number; lower:number; total:number };

@Component({
  selector: 'app-ranking-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
  <dialog class="modal" [open]="open" aria-labelledby="modal-title">
    <div class="modal-box paper-modal relative overflow-hidden">
      <!-- Winner overlay animation -->
      <div *ngIf="showWin && topName" class="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        <div class="win-glow"></div>
        <div class="text-6xl md:text-7xl animate-trophy mb-3">🏆</div>
        <div class="text-2xl md:text-3xl font-extrabold text-center drop-shadow-lg">
          Gewinner: <span class="text-primary">{{ topName }}</span>
        </div>
        <div class="sr-only" aria-live="polite">Gewinner: {{ topName }}</div>
      </div>

      <!-- Confetti pieces -->
      <ng-container *ngIf="showWin">
        <div *ngFor="let c of confettiPieces; let i = index" class="confetti" [ngStyle]="confettiStyle(i)"></div>
      </ng-container>

      <h3 id="modal-title" class="h2 flex items-center gap-2 relative z-10"><span class="text-primary">🏆</span> Endwertung</h3>
      <div class="py-3 relative z-10">
        <ol class="list-decimal pl-6 space-y-2">
          <li *ngFor="let r of ranking" class="flex justify-between items-center">
            <span class="font-semibold" [class.text-primary]="r.place===1">{{r.place}}. {{r.name}}</span>
            <span class="badge badge-lg" [class.badge-primary]="r.place===1">{{r.total}}</span>
          </li>
        </ol>
      </div>
      <div class="modal-action relative z-10">
        <button class="btn btn-primary" (click)="onClose?.()">Schließen</button>
      </div>
    </div>
  </dialog>
  `,
  styles: [`
    :host { display: contents; }
    .win-glow { position: absolute; width: 140%; height: 140%; border-radius: 50%; filter: blur(40px); background: radial-gradient(circle, rgba(212,175,55,0.35), rgba(255,255,255,0.0)); animation: glow 3s ease-in-out forwards; }
    @keyframes glow { 0% { opacity: 0; transform: scale(0.8);} 40% { opacity: 1; } 100% { opacity: 0; transform: scale(1.1);} }
    .animate-trophy { animation: bounceIn 700ms ease-out, pulseGlow 2.2s ease-in-out 700ms 2; }
    @keyframes bounceIn { 0% { transform: scale(0.2) translateY(40px); opacity: 0; } 60% { transform: scale(1.1) translateY(0); opacity: 1; } 100% { transform: scale(1); } }
    @keyframes pulseGlow { 0%,100% { text-shadow: 0 0 0 rgba(212,175,55,0.0);} 50% { text-shadow: 0 0 24px rgba(212,175,55,0.75);} }
    .confetti { position: absolute; top: -10%; width: 10px; height: 14px; background: #fbbf24; opacity: 0.95; border-radius: 2px; animation-name: fall, spin; animation-timing-function: linear, ease-in-out; animation-iteration-count: 1, infinite; }
    @keyframes fall { to { transform: translateY(140%); opacity: 1; } }
    @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
    @media (prefers-reduced-motion: reduce) { .animate-trophy, .confetti, .win-glow { animation: none !important; } }
  `]
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
