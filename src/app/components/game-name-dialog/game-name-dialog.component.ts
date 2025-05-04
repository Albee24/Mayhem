import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-game-name-dialog',
  template: `
    <h1 mat-dialog-title>Enter Game Name</h1>
    <div mat-dialog-content>
      <mat-form-field appearance="fill" style="width: 100%;">
        <mat-label>Game Name</mat-label>
        <input matInput [(ngModel)]="gameName" />
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button color="primary" (click)="onConfirm()">Create</button>
    </div>
  `,
})
export class GameNameDialogComponent {
  public gameName: string = '';

  constructor(public dialogRef: MatDialogRef<GameNameDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(this.gameName);
  }
}