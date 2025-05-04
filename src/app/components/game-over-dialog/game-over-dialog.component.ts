import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-game-over-dialog',
  template: `
    <h1 mat-dialog-title>Game Over!</h1>
    <div mat-dialog-content>
      <p><strong>{{ data.winner }}</strong> wins!</p>
      <p><strong>Stats:</strong></p>
      <ul>
        <li>Most Damage Dealt: {{ data.mostDamage || 'N/A' }}</li>
        <li>Most Healing Done: {{ data.mostHealing || 'N/A' }}</li>
        <li>Most Shields Played: {{ data.mostShields || 'N/A' }}</li>
      </ul>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="closeAllDialogs()">Close</button>
    </div>
  `,
})
export class GameOverDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog
  ) {}

  closeAllDialogs(): void {
    this.dialog.closeAll();
  }
}