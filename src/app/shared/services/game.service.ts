import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Game } from '../models/game';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private gamesCollection;
  public currentGame!: Game;

  constructor(private afs: AngularFirestore, private authService: AuthService) {
     this.gamesCollection = this.afs.collection<Game>('games');
  }

  setCurrentGame(game: Game) {
    this.currentGame = game;
  }

  // Create a new game
  createGame(game: Game): Promise<string> {
    console.log('creating new game', game);
    const id = this.afs.createId(); // Generates a unique ID
    return this.gamesCollection.doc(id).set({
      ...game,
      id: id,
      currentTurn: 0
    }).then(() => {
      return id;
    });
  }

  // Get all games
  getGames(): Observable<Game[]> {
    return this.gamesCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Game;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  // Get a specific game by ID
  getGame(id: string): Observable<Game | undefined> {
    return this.gamesCollection.doc<Game>(id).valueChanges();
  }

  // Update an existing game
  updateGame(game: Game): Promise<void> {
    return this.gamesCollection.doc(game.id).update(game);
  }

  // Delete a game
  deleteGame(id: string): Promise<void> {
    return this.gamesCollection.doc(id).delete();
  }

  advanceTurn(): void {
    if (this.currentGame && this.currentGame.players) {
        const totalPlayers = this.currentGame.players.length;
        if (this.currentGame.currentTurn != undefined) {
          if (this.currentGame.currentTurn == totalPlayers - 1) {
              this.currentGame.currentTurn = 0;
          } else {
              this.currentGame.currentTurn = this.currentGame.currentTurn + 1;
          }
          this.updateGame(this.currentGame);
        }
    }
  }

  isMyTurn(): boolean {
    if (this.currentGame && this.currentGame.players && this.currentGame.currentTurn != undefined) {
        const currentPlayer = this.currentGame.players[this.currentGame.currentTurn];
        if (currentPlayer.displayName === this.authService.userData?.displayName) {
            return true;
        }
    }
    return false;
  }
  
}