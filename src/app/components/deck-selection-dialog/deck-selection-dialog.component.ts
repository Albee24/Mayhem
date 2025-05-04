import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Deck } from '../../shared/models/deck';

@Component({
  selector: 'app-deck-selection-dialog',
  templateUrl: './deck-selection-dialog.component.html',
  styleUrl: './deck-selection-dialog.component.css'
})
export class DeckSelectionDialogComponent {
  selectedDeck: Deck | undefined;

  constructor(
    public dialogRef: MatDialogRef<DeckSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { decks: Deck[] }
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

  confirmSelection(): void {
    this.dialogRef.close(this.selectedDeck);
  }
}