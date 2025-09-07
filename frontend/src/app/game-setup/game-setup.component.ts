import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-game-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-setup.component.html',
})
export class GameSetupComponent implements OnInit {
  @Output() startGame = new EventEmitter<string[]>();
  @Output() resumeGame = new EventEmitter<void>();
  @Input() canResume: boolean = false;
  players: (string | undefined)[] = new Array(4).fill('');

  ngOnInit(): void {
    try {
      const raw = localStorage.getItem('lastPlayers');
      if (raw) {
        const names = JSON.parse(raw) as string[];
        for (let i = 0; i < Math.min(4, names.length); i++) this.players[i] = names[i];
      }
    } catch {}
  }

  get validCount() {
    return this.sanitized().length;
  }

  sanitized(): string[] {
    return this.players.map(p => (p||'').trim()).filter(Boolean) as string[];
  }

  start() {
    const names = this.sanitized();
    if (names.length>=1 && names.length<=4) {
      try { localStorage.setItem('lastPlayers', JSON.stringify(names)); } catch {}
      this.startGame.emit(names);
    }
  }
}
