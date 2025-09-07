import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type PlayerStats = { player: string; games: number; bestScore: number; averageScore: number; top3: Array<{ game_id:number; ended_at:string; total:number }> };
export type PlayerRow = { name: string; games: number; bestScore: number; averageScore: number };

const API_BASE = '/api';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private http = inject(HttpClient);

  getStats(playerName: string): Observable<PlayerStats> {
    return this.http.get<PlayerStats>(`${API_BASE}/stats/${encodeURIComponent(playerName)}`);
  }

  listAll(filter: string): Observable<PlayerRow[]> {
    const q = encodeURIComponent(filter||'');
    return this.http.get<PlayerRow[]>(`${API_BASE}/stats/list?q=${q}`);
  }
}
