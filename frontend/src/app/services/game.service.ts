import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export type Player = { id: number; name: string; order_index: number };
export type GameState = {
  id: number;
  started_at: string;
  ended_at?: string;
  status: 'active'|'finished';
  players: Player[];
  scores: Record<string, Record<string, number>>;
  computed: Record<string, { upper:number; bonus:number; lower:number; total:number }>;
  allFilled: boolean;
  categories: string[];
};

export type StartGameResponse = { id: number; started_at: string; status: 'active'; players: Player[] };
export type SetScoreResponse = { ok: true; allFilled: boolean; computed: GameState['computed'] };
export type FinishResponse = { ended_at: string; ranking: Array<{ place:number; player_id:number; name:string; upper:number; bonus:number; lower:number; total:number }>} 

const API_BASE = '/api';

@Injectable({ providedIn: 'root' })
export class GameService {
  private http = inject(HttpClient);

  startGame(players: string[]): Observable<StartGameResponse> {
    return this.http.post<StartGameResponse>(`${API_BASE}/games`, { players });
  }

  getGame(id: number): Observable<GameState> {
    return this.http.get<GameState>(`${API_BASE}/games/${id}`);
  }

  setScore(gameId: number, player_id: number, category: string, value: number): Observable<SetScoreResponse> {
    return this.http.post<SetScoreResponse>(`${API_BASE}/games/${gameId}/score`, { player_id, category, value });
  }

  finish(gameId: number): Observable<FinishResponse> {
    return this.http.post<FinishResponse>(`${API_BASE}/games/${gameId}/finish`, {});
  }
}
