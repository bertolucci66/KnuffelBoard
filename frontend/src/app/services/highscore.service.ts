import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Highscore = { player_name: string; score: number; achieved_at: string };

const API_BASE = '/api';

@Injectable({ providedIn: 'root' })
export class HighscoreService {
  private http = inject(HttpClient);

  list(limit = 50): Observable<Highscore[]> {
    return this.http.get<Highscore[]>(`${API_BASE}/highscores?limit=${limit}`);
  }
}
