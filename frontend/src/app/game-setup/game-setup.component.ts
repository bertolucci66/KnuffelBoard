import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-game-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
      <div *ngFor="let n of [0,1,2,3]; let i = index" class="form-control">
        <label class="label"><span class="label-text">Spieler {{ i+1 }}</span></label>
        <input [(ngModel)]="players[i]" class="input input-bordered" placeholder="Name optional" />
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button class="btn btn-primary" [disabled]="validCount===0" (click)="start()">Spiel starten</button>
      <span class="opacity-70">Bitte 1–4 Namen eingeben.</span>
    </div>
  </div>
  `
})
export class GameSetupComponent {
  @Output() startGame = new EventEmitter<string[]>();
  players: (string | undefined)[] = new Array(4).fill('');

  get validCount() {
    return this.sanitized().length;
  }

  sanitized(): string[] {
    return this.players.map(p => (p||'').trim()).filter(Boolean) as string[];
  }

  start() {
    const names = this.sanitized();
    if (names.length>=1 && names.length<=4) this.startGame.emit(names);
  }
}
