import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type RankingEntry = { place:number; player_id:number; name:string; upper:number; bonus:number; lower:number; total:number };

@Component({
  selector: 'app-ranking-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
  <dialog class="modal" [open]="open">
    <div class="modal-box paper-modal">
      <h3 class="h2 flex items-center gap-2"><span class="text-primary">🏆</span> Endwertung</h3>
      <div class="py-3">
        <ol class="list-decimal pl-6 space-y-2">
          <li *ngFor="let r of ranking" class="flex justify-between items-center">
            <span class="font-semibold">{{r.place}}. {{r.name}}</span>
            <span class="badge badge-lg">{{r.total}}</span>
          </li>
        </ol>
      </div>
      <div class="modal-action">
        <button class="btn btn-primary" (click)="onClose?.()">Schließen</button>
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
