import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/compat/firestore';
import { from, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ActionLog } from '../models/action-log';
import { AuthService } from './auth.service';
import { CARD_TYPES } from '../utils/constants';

@Injectable({
  providedIn: 'root',
})
export class ActionLogService {
  private actionLogCollection;
  public currentGameActionLogs: ActionLog[] = [];

  constructor(private afs: AngularFirestore) {
     this.actionLogCollection = this.afs.collection<ActionLog>('action-logs');
  }

  getAllActionLogs(): Observable<ActionLog[]> {
    return this.actionLogCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as ActionLog;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  getActionLogsByGame(gameId: string): Observable<ActionLog[]> {
    return this.afs.collection<ActionLog>('action-logs', ref =>
      ref.where('gameId', '==', gameId).orderBy('timestamp')
    ).snapshotChanges().pipe(
      tap((actions: DocumentChangeAction<ActionLog>[]) => {
        console.log('Action logs for game:', gameId, actions);
      }),
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as ActionLog;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  createActionLog(actionLog: ActionLog): Promise<void> {
    return this.actionLogCollection.add(actionLog)
      .then(() => {
        this.currentGameActionLogs.push(actionLog);
        console.log('Action log created:', actionLog);
      })
      .catch((error) => {
        console.error('Error creating action log:', error);
      });
  }

  getGameStats(gameId: string): Observable<{ mostDamage: string; mostHealing: string; mostShields: string }> {
    return this.getActionLogsByGame(gameId).pipe(
      map((logs: ActionLog[]) => {
        const damageMap: { [key: string]: number } = {};
        const healingMap: { [key: string]: number } = {};
        const shieldMap: { [key: string]: number } = {};
  
        logs.forEach((log) => {
          if (log.action === CARD_TYPES.Attack) {
            damageMap[log.displayName] = (damageMap[log.displayName] || 0) + log.qty;
          } else if (log.action === CARD_TYPES.Heal) {
            healingMap[log.displayName] = (healingMap[log.displayName] || 0) + log.qty;
          } else if (log.action === CARD_TYPES.Shield) {
            shieldMap[log.displayName] = (shieldMap[log.displayName] || 0) + log.qty;
          }
        });
  
        const mostDamage = Object.keys(damageMap).reduce((a, b) => (damageMap[a] > damageMap[b] ? a : b), '');
        const mostHealing = Object.keys(healingMap).reduce((a, b) => (healingMap[a] > healingMap[b] ? a : b), '');
        const mostShields = Object.keys(shieldMap).reduce((a, b) => (shieldMap[a] > shieldMap[b] ? a : b), '');
  
        return {
          mostDamage,
          mostHealing,
          mostShields,
        };
      })
    );
  }
}