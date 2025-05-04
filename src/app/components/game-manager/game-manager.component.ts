import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Player } from '../../shared/models/player';
import { GameService } from '../../shared/services/game.service';
import { Card } from '../../shared/models/card';
import { Router } from '@angular/router';
import { DeckService } from '../../shared/services/deck.service';
import { CARD_TYPES } from '../../shared/utils/constants';
import { PlayerSelectionDialogComponent } from '../player-selection-dialog/player-selection-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ActionLog } from '../../shared/models/action-log';
import { ActionLogService } from '../../shared/services/action-log.service';
import { GameOverDialogComponent } from '../game-over-dialog/game-over-dialog.component';
import { CardAnimationDialogComponent } from '../card-animation-dialog/card-animation-dialog.component';

@Component({
  selector: 'app-game-manager',
  templateUrl: './game-manager.component.html',
  styleUrl: './game-manager.component.css'
})
export class GameManagerComponent implements OnInit {
  drawPile: Card[] = [];
  playerHand: Card[] = [];
  selectedCardIndex: number | null = null;
  numActions = 0;
  lastProcessedTurn: number | null = null;
  playerDeckType: string | undefined;
  CARD_TYPES: any = CARD_TYPES
  playerDeckDescription: string = '';

  public constructor(
    public authService: AuthService,
    public gameService: GameService,
    public deckService: DeckService,
    public actionLogService: ActionLogService,
    public router: Router,
    public dialog: MatDialog
  ) {}  

  ngOnInit(): void {
    if (!this.gameService.currentGame) {
      this.router.navigate(['dashboard']);
    } else {
      // Subscribe to real-time updates for the current game
      this.gameService.getGame(this.gameService.currentGame.id!).subscribe((updatedGame) => {
        if (updatedGame) {
          const previousGameState = this.gameService.currentGame.state;
          this.gameService.currentGame = updatedGame;

          if (this.gameService.currentGame.state === 'IP' && previousGameState === 'P') {
            this.initializeGame();
          }
          if (this.gameService.currentGame.state === 'F' && previousGameState === 'IP') {
            this.actionLogService.getGameStats(this.gameService.currentGame.id!).subscribe((stats) => {
              this.dialog.open(GameOverDialogComponent, {
                width: '400px',
                data: {
                  winner: this.gameService.currentGame.winner,
                  mostDamage: stats.mostDamage,
                  mostHealing: stats.mostHealing,
                  mostShields: stats.mostShields,
                },
              }).afterClosed().subscribe(() => { 
                this.router.navigate(['dashboard']);
              });
              this.gameService.currentGame = { id: '', state: '', name: '', players: [], currentTurn: undefined, winner: '' };
            });
          }
  
          // Only handle the start of the turn if the turn has changed and hasn't been processed yet
          if (this.lastProcessedTurn !== updatedGame.currentTurn) {
            this.lastProcessedTurn = updatedGame.currentTurn ?? null; // Update the last processed turn
            this.handleStartOfTurn();
          }
        }
      });
      this.actionLogService.getActionLogsByGame(this.gameService.currentGame.id!).subscribe((actionLogs) => {
        if (actionLogs) {
          const latestLog = actionLogs[actionLogs.length - 1];
          this.actionLogService.currentGameActionLogs = actionLogs;
  
          // Show a pop-up for the latest action if it's a card play
          if (latestLog && latestLog.action && latestLog.displayName !== this.authService.userData?.displayName) {
            this.showCardPlayPopup(latestLog);
          }
        }
      });
    }
  }

  showCardPlayPopup(log: ActionLog): void {
    this.dialog.open(CardAnimationDialogComponent, {
      width: '400px',
      height: '300px',
      data: {
        cardName: log.action,
        qty: log.qty,
        playedBy: log.displayName,
        target: log.targetDisplayName || null,
      },
    });
  
    // Automatically close the dialog after 2 seconds
    setTimeout(() => {
      this.dialog.closeAll();
    }, 3500);
  }

  createDrawPile(deckType: string): Promise<void> {
    return new Promise((resolve) => {
      this.deckService.getDecks().subscribe((decks) => {
        console.log('createDrawPile', decks);
        const deck = decks.find(deck => deck.name === deckType);
        if (deck) {
          deck.cards.forEach((card: Card) => {
            for (let i = 0; i < card.qty; i++) {
              const newcard = { ...card };
              if (card.min && card.max) {
                newcard.qty = Math.floor(Math.random() * (card.max - card.min + 1)) + card.min;
              } else {
                newcard.qty = 0;
              }
              this.drawPile.push(newcard);
            }
          });
          resolve();
        } else {
          resolve();
        }
      });
    });
  }

  startGame() {
    this.gameService.currentGame.state = 'IP';
    if (this.gameService.currentGame.players) {
      this.gameService.currentGame.currentTurn = Math.floor(Math.random() * this.gameService.currentGame.players.length);
    }
    this.gameService.updateGame(this.gameService.currentGame);
    this.initializeGame();
  }

  async initializeGame(): Promise<void> {
    console.log('Initializing game...');
    this.playerDeckType = this.gameService.currentGame?.players?.find((player: Player) => player.displayName === this.authService.userData?.displayName)?.deck;
    if (this.playerDeckType) {
     this.deckService.getDecks().subscribe((decks) => {
        const deck = decks.find(deck => deck.name === this.playerDeckType);
        if (deck) {
          this.playerDeckDescription = deck.description;
        }
      });
      await this.createDrawPile(this.playerDeckType);
      console.log(this.drawPile);
      this.drawCard(3);
      this.numActions = 1;
    }
  }

  async drawCard(numCards: number): Promise<void> {
    for (let i = 0; i < numCards; i++) {
      if (this.drawPile.length > 0) {
        const randomIndex = Math.floor(Math.random() * this.drawPile.length);
        const drawnCard = this.drawPile.splice(randomIndex, 1)[0];
        if (drawnCard) {
          this.playerHand.push(drawnCard);
        }
      } else {
        await this.createDrawPile(this.playerDeckType!);
        const randomIndex = Math.floor(Math.random() * this.drawPile.length);
        const drawnCard = this.drawPile.splice(randomIndex, 1)[0];
        if (drawnCard) {
          this.playerHand.push(drawnCard);
        }
      }
    }
  }

  selectCard(index: number): void {
    this.selectedCardIndex = this.selectedCardIndex === index ? null : index;
  }
  
  async playCard(card: any, event: Event): Promise<void> {
    console.log('numActions', this.numActions);
    event.stopPropagation();
  
    this.selectedCardIndex = null;
    this.playerHand = this.playerHand.filter(c => c !== card);
  
    await this.handleCardEffect(card);
  
    if (this.playerHand.length === 0) {
      this.drawCard(3);
    }
  
    this.numActions--;
    console.log('numActions after decrement:', this.numActions);
  
    if (this.numActions <= 0) {
      console.log('Advancing turn...');
      this.gameService.advanceTurn();
    }
  }

 async handleCardEffect(card: Card) {
    console.log('Handling card effect:', card.type);
    const currentPlayer = this.gameService.currentGame.players?.find((player: Player) => player.displayName === this.authService.userData?.displayName);
    if (card.type === CARD_TYPES.Attack) {
      if (this.gameService.currentGame.players?.length === 2) {
        const otherPlayer = this.gameService.currentGame.players?.find((player: Player) => player.displayName !== this.authService.userData?.displayName);
        this.attackPlayer(otherPlayer, card);
      } else {
        await this.openPlayerSelectionDialogForAttack(card);
      }
    } else if (card.type === CARD_TYPES.Shield) {
      if (currentPlayer) {
        currentPlayer.shields = card.qty;
        this.gameService.updateGame(this.gameService.currentGame);
        this.actionLogService.createActionLog({
          gameId: this.gameService.currentGame.id,
          displayName: currentPlayer.displayName,
          action: CARD_TYPES.Shield,
          qty: card.qty,
          timestamp: new Date()
        } as ActionLog);
      }
    } else if (card.type === CARD_TYPES.Heal) {
      if (currentPlayer) {
        currentPlayer.hp = Math.min(10, currentPlayer.hp += card.qty);
        this.gameService.updateGame(this.gameService.currentGame);
        this.actionLogService.createActionLog({
          gameId: this.gameService.currentGame.id,
          displayName: currentPlayer.displayName,
          action: CARD_TYPES.Heal,
          qty: card.qty,
          timestamp: new Date()
        } as ActionLog);
      }
    } else if (card.type === CARD_TYPES['Extra Action']) {
      this.numActions += card.qty;
      this.gameService.updateGame(this.gameService.currentGame);
      this.actionLogService.createActionLog({
        gameId: this.gameService.currentGame.id,
        displayName: currentPlayer?.displayName || '',
        action: CARD_TYPES['Extra Action'],
        qty: card.qty,
        timestamp: new Date()
      } as ActionLog);
    } else {
      await this.handleMightyCard(card, currentPlayer);
    }
  }

  async handleMightyCard(card: Card, currentPlayer: Player | undefined) {
    if (card.type === CARD_TYPES.MU01) { // life drain
      let selectedPlayer: Player | undefined;
      // if there are is only one other player above 0hp, then automatically select that player
      if (this.gameService.currentGame.players?.filter(player => player.hp > 0).length === 2) {
        selectedPlayer = this.gameService.currentGame.players?.find(player => player.displayName !== currentPlayer?.displayName && player.hp > 0);
      } else {
        const dialogRef = this.dialog.open(PlayerSelectionDialogComponent, {
          width: '300px',
          data: {
            players: this.gameService.currentGame.players?.filter(player => currentPlayer && player.displayName !== currentPlayer.displayName && player.hp > 0) || [],
            currentPlayer: currentPlayer
          }
        });
        selectedPlayer = await dialogRef.afterClosed().toPromise();
      }
      if (selectedPlayer) {
        const hpToSteal = Math.min(5, selectedPlayer.hp);

        currentPlayer!.hp += hpToSteal;
        selectedPlayer.hp -= hpToSteal;

        currentPlayer!.hp = Math.min(10, currentPlayer!.hp);
        selectedPlayer.hp = Math.max(0, selectedPlayer.hp);

        console.log(this.gameService.currentGame.players);

        this.gameService.updateGame(this.gameService.currentGame);
        this.checkGameOver();

        this.actionLogService.createActionLog({
            gameId: this.gameService.currentGame.id,
            displayName: currentPlayer?.displayName || '',
            action: 'MIGHTY - Life Drain',
            qty: hpToSteal,
            timestamp: new Date(),
            targetDisplayName: selectedPlayer.displayName
        } as ActionLog);
      }
    } else if (card.type === CARD_TYPES.MNE01) { // fan of knives
      const otherPlayers = this.gameService.currentGame.players?.filter(player => currentPlayer && player.displayName !== currentPlayer.displayName && player.hp > 0) || [];
      for (const player of otherPlayers) {
        if (player.shields > 0) {
          player.shields -= 3;
          if (player.shields < 0) {
            player.hp += player.shields;
            player.shields = 0;
          }
        } else {
          player.hp -= 3;
        }
        player.hp = Math.floor(Math.max(player.hp, 0));
      }
      this.gameService.updateGame(this.gameService.currentGame);
      this.checkGameOver();
        this.actionLogService.createActionLog({
          gameId: this.gameService.currentGame.id,
          displayName: this.getCurrentPlayer()?.displayName || '',
          action: 'MIGHTY - Fan of Knives',
          qty: 3,
          timestamp: new Date(),
        } as ActionLog);
    } else if (card.type === CARD_TYPES.MH01) { // Divine Shield
      if (currentPlayer) {
        currentPlayer.shields = currentPlayer.shields ? currentPlayer.shields + card.qty : card.qty;
        this.gameService.updateGame(this.gameService.currentGame);
          this.actionLogService.createActionLog({
            gameId: this.gameService.currentGame.id,
            displayName: this.getCurrentPlayer()?.displayName || '',
            action: 'MIGHTY - Divine Shield',
            qty: card.qty,
            timestamp: new Date(),
          } as ActionLog);
      }
    } else if (card.type === CARD_TYPES.MO01) { // Chain Lightning
      let selectedPlayer: Player | undefined;
      if (this.gameService.currentGame.players?.filter(player => player.hp > 0).length === 2) {
        selectedPlayer = this.gameService.currentGame.players?.find(player => player.displayName !== currentPlayer?.displayName && player.hp > 0);
      } else {
        const dialogRef = this.dialog.open(PlayerSelectionDialogComponent, {
          width: '300px',
          data: {
            players: this.gameService.currentGame.players?.filter(player => currentPlayer && player.displayName !== currentPlayer.displayName && player.hp > 0) || [],
            currentPlayer: currentPlayer
          }
        });
       selectedPlayer = await dialogRef.afterClosed().toPromise();
      }
      if (!selectedPlayer) {
        return; // If no player is selected, exit the function
      } 
      const attackCard: Card = {
        type: card.type,
        qty: 3,
        name: 'MIGHTY - Chain Lightning',
        description: 'Deal ' + card.qty + ' damage to a player.', 
      };
      this.attackPlayer(selectedPlayer, attackCard);
      // bounce damage to next player in turn order for one less damage than qty
      const players = this.gameService.currentGame.players || [];
      const currentIndex = players.findIndex(player => player.displayName === currentPlayer?.displayName);
      const excludedPlayers: Player[] = [selectedPlayer, currentPlayer!];
      const nextPlayer = this.getNextTurnPlayer(currentIndex, excludedPlayers);
      if (nextPlayer) {
        const bounceCard: Card = {   
          type: card.type,
          qty: attackCard.qty - 1,
          name: 'Chain Lightning Bounce',
          description: 'Deal ' + (attackCard.qty - 1) + ' damage to the next player in turn order.',
        }; 
        this.attackPlayer(nextPlayer, bounceCard);
      }
      excludedPlayers.push(nextPlayer!);
      // bounce damage to next player in turn order for one less damage than qty
      const nextNextPlayer = this.getNextTurnPlayer((currentIndex + 1) % players.length, excludedPlayers);
      if (nextNextPlayer) {
        const bounceCard2: Card = {
          type: card.type,
          qty: attackCard.qty - 2,
          name: 'Chain Lightning Bounce 2',
          description: 'Deal ' + (attackCard.qty - 2) + ' damage to the next player in turn order.',
        };
        this.attackPlayer(nextNextPlayer, bounceCard2);
      }
      this.gameService.updateGame(this.gameService.currentGame);
      }
  }

  getNextTurnPlayer(currentIndex: number, excludedPlayers: Player[]): Player | undefined {
    const totalPlayers = excludedPlayers.length;
  
    // Start from the next player in turn order
    let nextIndex = (currentIndex + 1) % totalPlayers;
  
    // Loop through the players to find the next valid player
    while (nextIndex !== currentIndex) {
      const nextPlayer = this.gameService.currentGame?.players ? this.gameService.currentGame.players[nextIndex] : undefined;
  
      // Check if the player is alive and not in the excludedPlayers array
      if (nextPlayer && nextPlayer.hp > 0 && !excludedPlayers.some(player => player.displayName === nextPlayer.displayName)) {
        return nextPlayer;
      }
  
      // Move to the next player in turn order
      nextIndex = (nextIndex + 1) % totalPlayers;
    }
  
    // If no valid player is found, return undefined
    return undefined;
  }

  getCurrentPlayer(): Player | undefined {
    if (this.gameService.currentGame && this.gameService.currentGame.players) {
      return this.gameService.currentGame.players[this.gameService.currentGame.currentTurn!];
    }
    return undefined;
  }

  isPlayerTurn(): any {
    const currentPlayer = this.getCurrentPlayer();
    return currentPlayer && currentPlayer.displayName === this.authService.userData?.displayName;
  }

  async openPlayerSelectionDialogForAttack(card: Card): Promise<void> {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return;
  
    const dialogRef = this.dialog.open(PlayerSelectionDialogComponent, {
      width: '300px',
      data: {
        players: this.gameService.currentGame.players?.filter(player => player.displayName !== currentPlayer.displayName && player.hp > 0) || [],
        currentPlayer: currentPlayer
      }
    });
  
    // Wait for the dialog to close and get the selected player
    const selectedPlayer: Player = await dialogRef.afterClosed().toPromise();
    this.attackPlayer(selectedPlayer, card);
    
  }

  attackPlayer(player: Player | undefined, card: Card): void {
    if (player) {
      let cardActionLog = card.type;
      if (card.type.startsWith('M')) {
        cardActionLog = card.name;
      }
      if (player.shields <= 10000) {
        if (player.shields > 0) {
          player.shields -= card.qty;
          if (player.shields < 0) {
            player.hp += player.shields;
            player.shields = 0;
          }
        } else {
          player.hp -= card.qty;
        }
        player.hp = Math.floor(Math.max(player.hp, 0));
        this.checkGameOver();
        if (this.authService.userData) {
          this.actionLogService.createActionLog({
            gameId: this.gameService.currentGame.id,
            displayName: this.authService.userData.displayName,
            action: cardActionLog,
            qty: card.qty,
            timestamp: new Date(),
            targetDisplayName: player.displayName
          } as ActionLog);
        }
      } else {
          if (this.authService.userData) {
          this.actionLogService.createActionLog({
            gameId: this.gameService.currentGame.id,
            displayName: this.authService.userData.displayName,
            action: cardActionLog,
            qty: 0,
            timestamp: new Date(),
            targetDisplayName: player.displayName
          } as ActionLog);
        }
      }
    }
  }

  private checkGameOver() {
    if (this.gameService.currentGame.players?.filter(player => player.hp > 0).length === 1) {
      this.gameService.currentGame.state = 'F';
      this.gameService.currentGame.winner = this.gameService.currentGame.players?.find(player => player.hp > 0)?.displayName ?? '';
      this.gameService.updateGame(this.gameService.currentGame);
      this.actionLogService.getGameStats(this.gameService.currentGame.id!).subscribe((stats) => {
        this.dialog.open(GameOverDialogComponent, {
          width: '400px',
          data: {
            winner: this.gameService.currentGame.winner,
            mostDamage: stats.mostDamage,
            mostHealing: stats.mostHealing,
            mostShields: stats.mostShields,
          },
        }).afterClosed().subscribe(() => {
          this.router.navigate(['dashboard']);
        });
        this.gameService.currentGame = { id: '', state: '', name: '', players: [], currentTurn: undefined, winner: '' };
      });
    }
  }

  async handleStartOfTurn(): Promise<void> {
    const currentPlayer = this.getCurrentPlayer();
    const isMyTurn = currentPlayer && currentPlayer.displayName === this.authService.userData?.displayName;
  
    if (isMyTurn) {
      console.log("It's your turn now!");
      this.processOngoingEffects();
      this.drawCard(1);
      this.numActions = 1;
    } else {
      console.log("It's not your turn. Waiting for the other player.");
      this.numActions = 0;
    }
  }

  processOngoingEffects() {
    const currentPlayer = this.getCurrentPlayer();
    
    if (currentPlayer && currentPlayer.shields >= 100000) { //remove diving shield
      currentPlayer.shields = currentPlayer.shields - 100000;
    }
  }

  getCardImagePath(cardName: string | undefined) {
    if (!cardName) {
      return '/default-card.png';
    }
    const sanitizedCardName = cardName.replace(/['’]/g, '');
    console.log('getCardImagePath', sanitizedCardName);
    return `/cards/${encodeURIComponent(sanitizedCardName)}.png`;
  }

}
