import { Player } from "./player";

export interface Game {
        name: string;
        id?: string;
        state: string;
        players: Player[] | null;
        currentTurn?: number;
        winner?: string;
     }