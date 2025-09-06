import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsService, PlayerStats } from '../services/stats.service';

@Component({
  selector: 'app-stats-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <dialog class="modal" [open]="open">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Spieler-Statistiken</h3>
      <div class="py-2">
        <div class="form-control">
          <label class="label"><span class="label-text">Spielername</span></label>
          <input class="input input-bordered" [(ngModel)]="name" placeholder="Name" />
        </div>
        <div class="mt-2">
          <button class="btn btn-sm btn-primary" (click)="load()" [disabled]="!name.trim()">Laden</button>
        </div>
        <div class="mt-4" *ngIf="stats">
          <p><b>{{stats.player}}</b>: {{stats.games}} Spiele, Bestscore {{stats.bestScore}}, Ø {{stats.averageScore}}</p>
          <h4 class="font-semibold mt-2">Top 3</h4>
          <ul class="list-disc pl-6">
            <li *ngFor="let t of stats.top3">{{t.total}} <span class="opacity-60">({{t.ended_at | date:'dd.MM.yyyy HH:mm:ss'}})</span></li>
          </ul>
        </div>
      </div>
      <div class="modal-action">
        <button class="btn" (click)="close()">Schließen</button>
      </div>
    </div>
  </dialog>
  `
})
export class StatsModalComponent implements OnChanges {
  private svc = inject(StatsService);
  @Input() open = false;
  name = '';
  stats: PlayerStats | null = null;
  @Input() onClose: (()=>void) | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.stats = null;
      this.name = '';
    }
  }

  load() {
    const n = this.name.trim();
    if (!n) return;
    this.svc.getStats(n).subscribe(s => this.stats = s);
  }

  close() { this.onClose?.(); }
}
