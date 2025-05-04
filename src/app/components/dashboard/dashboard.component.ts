import { MatDialog } from '@angular/material/dialog';
import { DeckSelectionDialogComponent } from '../deck-selection-dialog/deck-selection-dialog.component';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Deck } from '../../shared/models/deck';
import { Game } from '../../shared/models/game';
import { Player } from '../../shared/models/player';
import { User } from '../../shared/models/user';
import { AuthService } from '../../shared/services/auth.service';
import { DeckService } from '../../shared/services/deck.service';
import { GameService } from '../../shared/services/game.service';
import { GameNameDialogComponent } from '../game-name-dialog/game-name-dialog.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  games: Game[] = [];
  decks: Deck[] = [];
  public players: Player[] = [];
  user: User | undefined;
  selectedDeck: Deck | undefined;

  public constructor(
    public gameService: GameService, 
    public authService: AuthService,
    public deckService: DeckService,
    public router: Router,
    public dialog: MatDialog // Inject MatDialog
  ) {}

  public ngOnInit(): void {
    this.user = this.authService.userData;
    this.fetchGames();
    this.fetchDecks();
  }

  fetchGames(): void {
    this.gameService.getGames().subscribe((games) => {
      this.games = games.filter(game => game.state === 'P');
    });
  }

  fetchDecks(): void {
    this.deckService.getDecks().subscribe((decks) => {
      this.decks = decks;
    });
  }

  joinGame(game: Game): void {
    this.openDeckSelectionDialog().then((selectedDeck) => {
      if (selectedDeck) {
        if (selectedDeck.name === 'Random') {
          const randomIndex = Math.floor(Math.random() * this.decks.length);
          selectedDeck = this.decks[randomIndex];
        }
        game.players?.push({
          displayName: this.user?.displayName || 'Anonymous',
          deck: selectedDeck.name,
          hp: 10,
          shields: 0,
        });
        this.gameService.updateGame(game).then(() => {
          this.gameService.setCurrentGame(game);
          this.router.navigate(['game']);
        }).catch((error) => {
          alert('Error joining game: ' + error.message); 
        });
      }
    });
  }
  
  public createGame(): void {
    this.openGameNameDialog().then((gameName) => {
      if (gameName) {
        this.openDeckSelectionDialog().then((selectedDeck) => {
          if (selectedDeck && this.user) {
            if (selectedDeck.name === 'Random') {
              const randomIndex = Math.floor(Math.random() * this.decks.length);
              selectedDeck = this.decks[randomIndex];
            }
            this.players.push({
              displayName: this.user.displayName,
              deck: selectedDeck.name,
              hp: 10,
              shields: 0,
            });
            const game: Game = {
              name: gameName,
              players: this.players,
              state: 'P',
            };
            this.gameService.createGame(game).then((id) => {
              game.id = id;
              this.gameService.setCurrentGame(game);
              this.router.navigate(['game']);
            }).catch((error) => {
              console.error('Error creating game: ', error);
            });
          }
        });
      }
    });
  }
  
  private openGameNameDialog(): Promise<string | undefined> {
    const dialogRef = this.dialog.open(GameNameDialogComponent, {
      width: '400px',
    });
  
    return dialogRef.afterClosed().toPromise();
  }

  private openDeckSelectionDialog(): Promise<Deck | undefined> {
    const dialogRef = this.dialog.open(DeckSelectionDialogComponent, {
      width: '400px',
      data: { decks: this.decks },
    });

    return dialogRef.afterClosed().toPromise();
  }
}