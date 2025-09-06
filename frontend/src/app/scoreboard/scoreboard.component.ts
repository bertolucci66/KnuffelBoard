import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService, GameState } from '../services/game.service';
import { RankingModalComponent, RankingEntry } from '../ranking-modal/ranking-modal.component';

const UPPER = ['ones','twos','threes','fours','fives','sixes'];
const LOWER = ['three_kind','four_kind','full_house','small_straight','large_straight','kniffel','chance'];

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RankingModalComponent],
  template: `
  <div *ngIf="game() as g" class="overflow-x-auto bg-base-100 rounded-box border border-base-300">
    <table class="table">
      <thead>
        <tr>
          <th>Kategorie</th>
          <th *ngFor="let p of g.players">{{p.name}}</th>
        </tr>
      </thead>
      <tbody>
        <ng-container>
          <tr *ngFor="let c of upper">
            <td class="font-medium">{{ label(c) }}</td>
            <td *ngFor="let p of g.players">
              <input class="input input-sm input-bordered w-24" type="number" min="0" inputmode="numeric" pattern="[0-9]*"
                [(ngModel)]="cellValues[p.id][c]" (blur)="commit(p.id,c)" (keyup.enter)="commit(p.id,c)" />
            </td>
          </tr>
          <tr class="bg-base-200">
            <td>Oberer Teil Summe</td>
            <td *ngFor="let p of g.players">{{ g.computed[p.id]?.upper ?? 0 }}</td>
          </tr>
          <tr class="bg-base-200">
            <td>Bonus</td>
            <td *ngFor="let p of g.players">{{ g.computed[p.id]?.bonus ?? 0 }}</td>
          </tr>
          <tr *ngFor="let c of lower">
            <td class="font-medium">{{ label(c) }}</td>
            <td *ngFor="let p of g.players">
              <input class="input input-sm input-bordered w-24" type="number" min="0" inputmode="numeric" pattern="[0-9]*"
                [(ngModel)]="cellValues[p.id][c]" (blur)="commit(p.id,c)" (keyup.enter)="commit(p.id,c)" />
            </td>
          </tr>
          <tr class="bg-base-200">
            <td>Unterer Teil Summe</td>
            <td *ngFor="let p of g.players">{{ g.computed[p.id]?.lower ?? 0 }}</td>
          </tr>
          <tr class="bg-base-300 font-bold">
            <td>Gesamt</td>
            <td *ngFor="let p of g.players">{{ g.computed[p.id]?.total ?? 0 }}</td>
          </tr>
        </ng-container>
      </tbody>
    </table>
    <div class="p-4 flex justify-end items-center gap-2">
      <span class="opacity-70" *ngIf="!g.allFilled">Bitte alle Felder ausfüllen.</span>
      <button class="btn btn-primary" [disabled]="!g.allFilled" (click)="finish()">Spiel beenden & werten</button>
    </div>
  </div>
  <app-ranking-modal [open]="isRanking()" [ranking]="ranking()" [onClose]="closeRanking"></app-ranking-modal>
  `
})
export class ScoreboardComponent implements OnInit {
  private gameService = inject(GameService);
  @Input() gameId!: number;
  game = signal<GameState | null>(null);
  upper = UPPER;
  lower = LOWER;
  isRanking = signal(false);
  ranking = signal<RankingEntry[]>([]);

  // local input buffer to keep typing without losing focus
  cellValues: Record<number, Record<string, string>> = {};

  ngOnInit(): void {
    this.reload();
  }

  private initBuffer(g: GameState) {
    this.cellValues = {};
    for (const p of g.players) {
      this.cellValues[p.id] = {};
      for (const c of [...this.upper, ...this.lower]) {
        const v = g.scores?.[p.id]?.[c];
        this.cellValues[p.id][c] = (typeof v === 'number') ? String(v) : '';
      }
    }
  }

  closeRanking = () => this.isRanking.set(false);

  label(c: string) {
    const m: Record<string,string> = {
      ones:'Einsen', twos:'Zweien', threes:'Dreien', fours:'Vieren', fives:'Fünfen', sixes:'Sechsen',
      three_kind:'Dreierpasch', four_kind:'Viererpasch', full_house:'Full House (25)',
      small_straight:'Kleine Straße (30)', large_straight:'Große Straße (40)', kniffel:'Kniffel (50)', chance:'Chance'
    };
    return m[c] || c;
  }

  reload() {
    this.gameService.getGame(this.gameId).subscribe(g => {
      this.game.set(g);
      this.initBuffer(g);
    });
  }

  commit(playerId: number, category: string) {
    const g = this.game();
    if (!g) return;
    const raw = this.cellValues?.[playerId]?.[category] ?? '';
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 0) {
      // reset to previous value if invalid
      const prev = g.scores?.[playerId]?.[category];
      this.cellValues[playerId][category] = (typeof prev === 'number') ? String(prev) : '';
      return;
    }
    const prevVal = g.scores?.[playerId]?.[category];
    if (prevVal === n) return; // nothing to do

    this.gameService.setScore(g.id, playerId, category, n).subscribe(res => {
      // update local game state without full reload to preserve focus
      const cur = this.game();
      if (!cur) return;
      cur.scores[playerId] = cur.scores[playerId] || {} as any;
      (cur.scores as any)[playerId][category] = n;
      (cur as any).computed = res.computed;
      (cur as any).allFilled = res.allFilled;
      this.game.set({ ...cur });
      // ensure buffer stays in sync
      this.cellValues[playerId][category] = String(n);
    });
  }

  finish() {
    const g = this.game();
    if (!g) return;
    this.gameService.finish(g.id).subscribe(r => {
      this.ranking.set(r.ranking as RankingEntry[]);
      this.isRanking.set(true);
      this.reload();
    });
  }
}
