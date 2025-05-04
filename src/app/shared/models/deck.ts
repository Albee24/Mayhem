import { Card } from "./card";

export interface Deck {
        name: string;
        description: string;
        cards: Card[];
        imageUrl?: string;
        id?: string;
}