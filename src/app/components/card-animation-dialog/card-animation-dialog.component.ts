import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-card-animation-dialog',
  template: `
    <div class="card-animation-container">
      <div class="card-animation">
        <h2>{{ data.cardName }}</h2>
        <p><strong>Effect:</strong> {{ data.qty }}</p>
        <p><strong>Played By:</strong> {{ data.playedBy }}</p>
        <p *ngIf="data.target"><strong>Target:</strong> {{ data.target }}</p>
      </div>
    </div>
  `,
  styles: [`
    .card-animation-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
    }
    .card-animation {
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      animation: fadeInOut 2s ease-in-out;
    }
    @keyframes fadeInOut {
      0% { opacity: 0; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(0.8); }
    }
  `]
})
export class CardAnimationDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}