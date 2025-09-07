import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsService, PlayerStats, PlayerRow } from '../services/stats.service';

@Component({
  selector: 'app-stats-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stats-modal.component.html'
})
export class StatsModalComponent implements OnChanges { 
  private svc = inject(StatsService);
  @Input() open = false;
  // filter & listing
  filter = '';
  rows: PlayerRow[] = [];
  debounceId: any;
  // legacy per-player detailed stats (kept if needed somewhere)
  name = '';
  stats: PlayerStats | null = null;
  @Input() onClose: (()=>void) | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.stats = null;
      this.name = '';
      this.filter = '';
      this.rows = [];
      this.scheduleLoad();
    }
  }

  onFilterChange() { this.scheduleLoad(); }

  private scheduleLoad() {
    clearTimeout(this.debounceId);
    this.debounceId = setTimeout(() => this.fetch(), 250);
  }

  private fetch() {
    this.svc.listAll(this.filter).subscribe(rows => this.rows = rows);
  }

  // Optional: still allow detailed lookup by exact name (not used in UI now)
  load() {
    const n = this.name.trim();
    if (!n) return;
    this.svc.getStats(n).subscribe(s => this.stats = s);
  }

  close() { this.onClose?.(); }
}
