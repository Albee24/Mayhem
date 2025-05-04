export interface ActionLog {
    gameId: string;
    displayName: string;
    action: string;
    qty: number;
    targetDisplayName?: string;
    timestamp: Date;
  }