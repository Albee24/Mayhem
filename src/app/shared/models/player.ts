export interface Player {
        displayName: string | null;
        hp: number;
        deck: string;
        id?: string;
        shields: number;
        item?: string;
        isFirstTurn?: boolean;
 }