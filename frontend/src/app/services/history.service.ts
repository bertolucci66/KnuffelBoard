import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type HistoryGame = { game_id:number; ended_at:string; players: Array<{ name:string; total:number }> };

const API_BASE = '/api';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private http = inject(HttpClient);

  list(): Observable<HistoryGame[]> {
    return this.http.get<HistoryGame[]>(`${API_BASE}/history`);
  }
}
