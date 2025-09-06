import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-game-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-setup.component.html',
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
