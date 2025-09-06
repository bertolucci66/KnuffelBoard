import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryService, HistoryGame } from '../services/history.service';

@Component({
  selector: 'app-history-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history-view.component.html',
})
export class HistoryViewComponent implements OnInit {
  private historyService = inject(HistoryService);
  history: HistoryGame[] = [];

  ngOnInit(): void {
    this.historyService.list().subscribe(h => this.history = h);
  }
}
