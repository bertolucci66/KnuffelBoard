import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoryService, HistoryGame } from '../services/history.service';

@Component({
  selector: 'app-history-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history-view.component.html',
})
export class HistoryViewComponent implements OnInit {
  private historyService = inject(HistoryService);
  history: HistoryGame[] = [];
  filter = '';
  debounceId: any;

  ngOnInit(): void {
    this.load();
  }

  load() {
    const q = this.filter.trim().toLowerCase();
    this.historyService.list().subscribe(h => {
      if (!q) { this.history = h; return; }
      // client-side filter by player name substring
      this.history = h.filter(g => g.players.some(p => p.name.toLowerCase().includes(q)));
    });
  }

  onFilterChange() {
    clearTimeout(this.debounceId);
    this.debounceId = setTimeout(()=> this.load(), 250);
  }
}
