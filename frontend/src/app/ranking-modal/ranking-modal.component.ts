import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type RankingEntry = { place:number; player_id:number; name:string; upper:number; bonus:number; lower:number; total:number };

@Component({
  selector: 'app-ranking-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
  <dialog class="modal" [open]="open">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Endwertung</h3>
      <div class="py-2">
        <ol class="list-decimal pl-6 space-y-1">
          <li *ngFor="let r of ranking">{{r.place}}. {{r.name}} — {{r.total}}</li>
        </ol>
      </div>
      <div class="modal-action">
        <button class="btn" (click)="onClose?.()">Schließen</button>
      </div>
    </div>
  </dialog>
  `
})
export class RankingModalComponent {
  @Input() open = false;
  @Input() ranking: RankingEntry[] = [];
  @Input() onClose: (()=>void) | undefined;
}
