import { Component, Input, OnInit, OnDestroy, inject, signal, Output, EventEmitter } from '@angular/core';
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
  <div *ngIf="game() as g" class="overflow-x-auto card paper-card compact">
    <div class="card-body p-0">
      <div class="flex items-center justify-between p-3 border-b border-base-300 bg-base-200/60">
        <div class="h3 m-0">Spielzettel
          <div class="text-xs opacity-70 font-normal">Erstellt von Norbert Gutbrod</div>
        </div>
        <div class="flex items-center gap-2">
          <span class="badge badge-ghost" *ngIf="g.status==='active'">Laufzeit: {{ elapsed() }}</span>
          <button class="btn btn-error btn-sm" (click)="requestAbort()" title="Neues Spiel starten – aktuelles verwerfen">Neues Spiel</button>
          <span class="opacity-70 hidden md:inline">{{ unlocked ? 'Entsperrt – Änderungen erlaubt' : 'Gesperrt – zum Bearbeiten entsperren' }}</span>
          <button class="btn btn-sm" [class.btn-warning]="unlocked" [class.btn-ghost]="!unlocked" (click)="toggleUnlock()">
            <span class="mr-1">{{ unlocked ? 'Sperren' : 'Entsperren' }}</span>
            <span>{{ unlocked ? '🔒' : '🔓' }}</span>
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="table">
          <thead class="sticky top-0 z-10 bg-base-200">
            <tr>
              <th class="text-lg">Kategorie</th>
              <th class="text-lg" *ngFor="let p of g.players">{{p.name}}</th>
            </tr>
          </thead>
          <tbody>
            <ng-container>
              <tr class="bg-base-200/70">
                <td class="font-bold" colspan="{{ 1 + g.players.length }}">Oberer Teil</td>
              </tr>
              <tr *ngFor="let c of upper" class="border-b border-base-300">
                <td class="font-semibold">{{ label(c) }}</td>
                <td *ngFor="let p of g.players" class="align-middle">
                  <div class="flex items-center gap-2">
                    <input class="input input-md input-bordered w-28 blue-outlined" type="number" min="0" inputmode="numeric" pattern="[0-9]*"
                      [disabled]="isLocked(p.id,c)" [(ngModel)]="cellValues[p.id][c]" (blur)="commit(p.id,c)" (keyup.enter)="commit(p.id,c)" />
                    <button class="btn btn-xs btn-ghost" [disabled]="isLocked(p.id,c)" (click)="strike(p.id,c)" title="Streichen (0)">✖︎</button>
                    <span *ngIf="upperTendency(p.id, c) as t" class="badge badge-sm px-2 py-0.5 ml-1" [class.badge-success]="t.kind==='over'" [class.badge-warning]="t.kind==='under'" [class.badge-ghost]="t.kind==='on'">{{ t.label }}</span>
                  </div>
                </td>
              </tr>
              <tr class="bg-base-200">
                <td class="font-semibold">Oberer Teil Summe</td>
                <td class="text-xl font-bold" *ngFor="let p of g.players">
                  {{ g.computed[p.id]?.upper ?? 0 }}
                  <span *ngIf="upperSumTendency(p.id) as t" class="badge badge-sm px-2 py-0.5 ml-2" [class.badge-success]="t.kind==='over'" [class.badge-warning]="t.kind==='under'" [class.badge-ghost]="t.kind==='on'">{{ t.label }}</span>
                </td>
              </tr>
              <tr class="bg-base-200 border-b-2 border-base-300">
                <td class="font-semibold">Bonus</td>
                <td class="text-xl font-bold" *ngFor="let p of g.players">{{ g.computed[p.id]?.bonus ?? 0 }}</td>
              </tr>
              <tr class="bg-base-200/70 border-t-2 border-base-300">
                <td class="font-bold" colspan="{{ 1 + g.players.length }}">Unterer Teil</td>
              </tr>
              <tr *ngFor="let c of lower" class="border-b border-base-300">
                <td class="font-semibold">{{ label(c) }}</td>
                <td *ngFor="let p of g.players" class="align-middle">
                  <div class="flex items-center gap-2">
                    <input class="input input-md input-bordered w-28 blue-outlined" type="number" min="0" inputmode="numeric" pattern="[0-9]*"
                      [disabled]="isLocked(p.id,c)" [(ngModel)]="cellValues[p.id][c]" (blur)="commit(p.id,c)" (keyup.enter)="commit(p.id,c)" />
                    <button class="btn btn-xs btn-ghost" [disabled]="isLocked(p.id,c)" (click)="strike(p.id,c)" title="Streichen (0)">✖︎</button>
                  </div>
                </td>
              </tr>
              <!-- Kniffel Bonus row -->
              <tr class="border-b border-base-300">
                <td class="font-semibold">Kniffel‑Bonus</td>
                <td *ngFor="let p of g.players" class="align-middle">
                  <div class="flex items-center gap-2">
                    <button class="btn btn-xs" [class.btn-ghost]="!canAdjustBonus(p.id)" [class.btn-outline]="canAdjustBonus(p.id)"
                      [disabled]="!canAdjustBonus(p.id) || bonusValue(p.id) <= 0" (click)="adjustBonus(p.id,-50)">− 50</button>
                    <input class="input input-md input-bordered w-28 blue-outlined" [value]="bonusValue(p.id)" readonly disabled />
                    <button class="btn btn-xs" [class.btn-ghost]="!canAdjustBonus(p.id)" [class.btn-outline]="canAdjustBonus(p.id)"
                      [disabled]="!canAdjustBonus(p.id)" (click)="adjustBonus(p.id,50)">+ 50</button>
                  </div>
                  <div class="text-xs opacity-60" *ngIf="!canAdjustBonus(p.id)">Benötigt gültigen Kniffel (50)</div>
                </td>
              </tr>
              <tr class="bg-base-200">
                <td class="font-semibold">Unterer Teil Summe</td>
                <td class="text-xl font-bold" *ngFor="let p of g.players">{{ g.computed[p.id]?.lower ?? 0 }}</td>
              </tr>
              <tr class="bg-base-300 font-extrabold">
                <td>Gesamt</td>
                <td class="text-2xl" *ngFor="let p of g.players">{{ g.computed[p.id]?.total ?? 0 }}</td>
              </tr>
            </ng-container>
          </tbody>
        </table>
      </div>
      <div class="p-4 flex flex-col md:flex-row md:justify-between gap-3 items-start md:items-center">
        <div class="text-sm opacity-70">
          <div>- Eingetragene Felder werden gesperrt. Zum Ändern bitte oben entsperren.</div>
          <div>- „Streichen“ setzt den Wert auf 0 und sperrt das Feld.</div>
        </div>
        <div class="flex items-center gap-3 self-end md:self-auto">
          <span class="opacity-70" *ngIf="!g.allFilled">Bitte alle Felder ausfüllen.</span>
          <button class="btn btn-primary btn-lg" [disabled]="!g.allFilled" (click)="finish()">Spiel beenden & werten</button>
        </div>
      </div>
    </div>
  </div>
  <app-ranking-modal [open]="isRanking()" [ranking]="ranking()" [onClose]="closeRanking"></app-ranking-modal>
  `
})
export class ScoreboardComponent implements OnInit, OnDestroy {
  private gameService = inject(GameService);
  @Input() gameId!: number;
  game = signal<GameState | null>(null);
  upper = UPPER;
  lower = LOWER;
  isRanking = signal(false);
  ranking = signal<RankingEntry[]>([]);

  @Output() abort = new EventEmitter<void>();

  // local input buffer to keep typing without losing focus
  cellValues: Record<number, Record<string, string>> = {};
  // sheet unlock toggle (default locked behaviour)
  unlocked = false;
  // timer tick to trigger view updates
  private intervalId: any;
  nowTick = signal(0);
 
  ngOnInit(): void {
    this.reload();
    // update every second while component is alive
    this.intervalId = setInterval(() => this.nowTick.update(v => v + 1), 1000);
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

  toggleUnlock() { this.unlocked = !this.unlocked; }

  isLocked(playerId: number, category: string): boolean {
    const g = this.game();
    if (!g) return true;
    const hasVal = typeof g.scores?.[playerId]?.[category] === 'number';
    // if unlocked, allow editing even if previously set
    return !this.unlocked && hasVal;
  }

  closeRanking = () => this.isRanking.set(false);

  label(c: string) {
    const m: Record<string,string> = {
      ones:"1'er", twos:"2'er", threes:"3'er", fours:"4'er", fives:"5'er", sixes:"6'er",
      three_kind:'Dreierpasch', four_kind:'Viererpasch', full_house:'Full House (25)',
      small_straight:'Kleine Straße (30)', large_straight:'Große Straße (40)', kniffel:'Kniffel (50)', chance:'Chance', kniffel_bonus:'Kniffel‑Bonus'
    };
    return m[c] || c;
  }

  reload() {
    this.gameService.getGame(this.gameId).subscribe(g => {
      this.game.set(g);
      this.initBuffer(g);
    });
  }

  private isValid(category: string, value: number): boolean {
    if (!Number.isInteger(value) || value < 0) return false;
    switch (category) {
      case 'ones': return [0,1,2,3,4,5].includes(value);
      case 'twos': return [0,2,4,6,8,10].includes(value);
      case 'threes': return [0,3,6,9,12,15].includes(value);
      case 'fours': return [0,4,8,12,16,20].includes(value);
      case 'fives': return [0,5,10,15,20,25].includes(value);
      case 'sixes': return [0,6,12,18,24,30].includes(value);
      case 'three_kind': return value >= 0 && value <= 30;
      case 'four_kind': return value >= 0 && value <= 30;
      case 'full_house': return value === 0 || value === 25;
      case 'small_straight': return value === 0 || value === 30;
      case 'large_straight': return value === 0 || value === 40;
      case 'kniffel': return value === 0 || value === 50;
      case 'chance': return value >= 0 && value <= 30;
      case 'kniffel_bonus': return value >= 0 && value % 50 === 0;
      default: return true;
    }
  }

  commit(playerId: number, category: string) {
    const g = this.game();
    if (!g) return;
    const raw = this.cellValues?.[playerId]?.[category] ?? '';
    if (raw === '') return; // nothing typed yet
    const n = Number(raw);

    if (!this.isValid(category, n)) {
      // reset to previous value if invalid
      const prev = g.scores?.[playerId]?.[category];
      this.cellValues[playerId][category] = (typeof prev === 'number') ? String(prev) : '';
      return;
    }

    const prevVal = g.scores?.[playerId]?.[category];
    if (prevVal === n) return; // nothing to do

    this.gameService.setScore(g.id, playerId, category, n).subscribe(res => {
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

  strike(playerId: number, category: string) {
    this.cellValues[playerId][category] = '0';
    this.commit(playerId, category);
  }

  bonusValue(playerId: number): number {
    const g = this.game();
    return (g?.scores?.[playerId]?.['kniffel_bonus'] as number) ?? 0;
  }
  hasKniffel(playerId: number): boolean {
    const g = this.game();
    return (g?.scores?.[playerId]?.['kniffel'] as number) === 50;
  }
  canAdjustBonus(playerId: number): boolean {
    const g = this.game();
    if (!g || g.status !== 'active') return false;
    return this.hasKniffel(playerId);
  }
  adjustBonus(playerId: number, delta: number) {
    if (!this.canAdjustBonus(playerId)) return;
    const current = this.bonusValue(playerId);
    const next = Math.max(0, current + delta);
    // Only allow multiples of 50
    const normalized = Math.round(next / 50) * 50;
    const g = this.game();
    if (!g) return;
    if (normalized === current) return;
    this.gameService.setScore(g.id, playerId, 'kniffel_bonus', normalized).subscribe(res => {
      const cur = this.game(); if (!cur) return;
      cur.scores[playerId] = cur.scores[playerId] || {} as any;
      (cur.scores as any)[playerId]['kniffel_bonus'] = normalized;
      (cur as any).computed = res.computed;
      (cur as any).allFilled = res.allFilled;
      this.game.set({ ...cur });
    });
  }

  private upperTarget(category: string): number | null {
    const idx = this.upper.indexOf(category);
    if (idx === -1) return null;
    const face = idx + 1;
    return face * 3; // target is three of this face
  }

  upperTendency(playerId: number, category: string): { kind:'under'|'on'|'over'; label:string; delta:number } | null {
    const g = this.game();
    if (!g) return null;
    const v = g.scores?.[playerId]?.[category];
    if (typeof v !== 'number') return null; // no info until a value is set
    const tgt = this.upperTarget(category);
    if (tgt == null) return null;
    const delta = v - tgt;
    if (delta === 0) return { kind: 'on', label: 'im Plan', delta };
    if (delta > 0) return { kind: 'over', label: `darüber (+${delta})`, delta };
    return { kind: 'under', label: `darunter (${delta})`, delta };
  }

  upperSumTendency(playerId: number): { kind:'under'|'on'|'over'; label:string; delta:number } | null {
    const g = this.game();
    if (!g) return null;
    const s = g.scores?.[playerId] || {} as Record<string, number>;
    // Only count categories that already have a number filled
    let target = 0;
    let any = false;
    for (let i = 0; i < this.upper.length; i++) {
      const cat = this.upper[i];
      const val = s[cat];
      if (typeof val === 'number') {
        any = true;
        target += (i + 1) * 3;
      }
    }
    if (!any) return null; // no tendency until at least one upper cell filled
    const current = g.computed[playerId]?.upper ?? 0;
    const delta = current - target;
    if (delta === 0) return { kind: 'on', label: 'im Plan', delta };
    if (delta > 0) return { kind: 'over', label: `darüber (+${delta})`, delta };
    return { kind: 'under', label: `darunter (${delta})`, delta };
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

  requestAbort() {
    const confirmed = confirm('Neues Spiel starten? Aktuelles Spiel wird verworfen und nicht gespeichert.');
    if (confirmed) this.abort.emit();
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  // Format elapsed time since game start
  elapsed(): string {
    const g = this.game();
    if (!g?.started_at) return '00:00:00';
    const start = new Date(g.started_at).getTime();
    const now = Date.now(); // nowTick() keeps change detection alive
    void this.nowTick();
    let sec = Math.max(0, Math.floor((now - start) / 1000));
    const h = Math.floor(sec / 3600); sec -= h * 3600;
    const m = Math.floor(sec / 60); sec -= m * 60;
    const pad = (n:number) => n.toString().padStart(2,'0');
    return `${pad(h)}:${pad(m)}:${pad(sec)}`;
  }
 }
