import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { combineLatest, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { Deck } from '../models/deck';
import { Card } from '../models/card';

@Injectable({
  providedIn: 'root',
})
export class DeckService {
  private decksCollection;
  private cachedDecks: Deck[] | null = null;

  constructor(private afs: AngularFirestore) {
    this.decksCollection = this.afs.collection<Deck>('decks');
  }

  getDecks(): Observable<Deck[]> {
    if (this.cachedDecks) {
      console.log('Returning cached decks:', this.cachedDecks);
      return of(this.cachedDecks);
    }
  
    console.log('Fetching decks from Firestore...');
    return this.decksCollection.valueChanges({ idField: 'id' }).pipe(
      switchMap((decks: Deck[]) => {
        console.log('Fetched decks:', decks); // Debugging log
  
        // Map each deck to include its cards
        const deckWithCards$ = decks.map((deck) =>
          this.afs
            .collection<Card>(`decks/${deck.id}/cards`)
            .valueChanges()
            .pipe(
              map((cards) => {
                console.log(`Cards for deck ${deck.id}:`, cards); // Debugging log
                deck.cards = cards;
                return deck;
              })
            )
        );
  
        // Combine all deck observables into a single observable
        return combineLatest(deckWithCards$);
      }),
      map((decksWithCards) => {
        this.cachedDecks = decksWithCards;
        console.log('Fetched decks with cards:', decksWithCards); // Debugging log
        return decksWithCards;
      })
    );
  }
}