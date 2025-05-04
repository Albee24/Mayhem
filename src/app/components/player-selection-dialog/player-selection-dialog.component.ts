import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Player } from '../../shared/models/player';

@Component({
  selector: 'app-player-selection-dialog',
  templateUrl: './player-selection-dialog.component.html',
  styleUrls: ['./player-selection-dialog.component.css']
})
export class PlayerSelectionDialogComponent {
  otherPlayers: Player[] = [];
  selectedPlayer: Player | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { players: Player[], currentPlayer: Player }) {
    this.otherPlayers = data.players.filter(player => player !== data.currentPlayer);
  }
}