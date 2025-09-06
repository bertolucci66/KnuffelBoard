import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryService, HistoryGame } from '../services/history.service';

@Component({
  selector: 'app-history-view',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="bg-base-100 rounded-box p-4 border border-base-300">
    <h3 class="text-xl font-semibold mb-4">Vergangene Spiele</h3>
    <div class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>Datum</th>
            <th>Spieler & Scores</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let g of history">
            <td>{{ g.ended_at | date:'dd.MM.yyyy HH:mm:ss' }}</td>
            <td>
              <div class="flex flex-wrap gap-2">
                <span class="badge" *ngFor="let p of g.players">{{p.name}}: {{p.total}}</span>
              </div>
            </td>
          </tr>
          <tr *ngIf="history.length===0">
            <td colspan="2" class="opacity-70">Keine Einträge.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `
})
export class HistoryViewComponent implements OnInit {
  private historyService = inject(HistoryService);
  history: HistoryGame[] = [];

  ngOnInit(): void {
    this.historyService.list().subscribe(h => this.history = h);
  }
}
