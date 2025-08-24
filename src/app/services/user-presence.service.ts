import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, interval, merge } from 'rxjs';
import { map, shareReplay, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { User, UserStatus } from '../models/collaboration.model';

@Injectable({
  providedIn: 'root'
})
export class UserPresenceService {
  // Fonte de dados para os usuários online no projeto atual
  private readonly activeUsers = new BehaviorSubject<User[]>([
    { id: '1', name: 'Alice Silva', status: UserStatus.ONLINE, avatar: 'user-alice' },
    { id: '2', name: 'Bruno Oliveira', status: UserStatus.BUSY, avatar: 'user-bruno' },
    { id: '3', name: 'Carolina Santos', status: UserStatus.AWAY, avatar: 'user-carolina' }
  ]);

  // Emissor para quando usuários entrarem no projeto
  private readonly userJoined = new Subject<User>();
  
  // Emissor para quando usuários saírem do projeto
  private readonly userLeft = new Subject<User>();
  
  // Emissor para atualizações de status
  private readonly statusChanged = new Subject<{ userId: string, status: UserStatus }>();

  // Stream combinando todos os eventos
  private readonly userActivityStream$ = merge(
    this.userJoined.pipe(map(user => ({ type: 'joined', user }))),
    this.userLeft.pipe(map(user => ({ type: 'left', user }))),
    this.statusChanged.pipe(map(update => ({ type: 'status', update })))
  );

  // Obter usuários ativos como Observable
  public getActiveUsers(): Observable<User[]> {
    return this.activeUsers.asObservable();
  }

  // Obter contagem de usuários ativos com estado compartilhado
  public getActiveUsersCount(): Observable<number> {
    return this.activeUsers.pipe(
      map(users => users.filter(u => u.status === UserStatus.ONLINE).length),
      shareReplay(1)
    );
  }

  // Obter stream de atividades de usuário
  public getUserActivity(): Observable<any> {
    return this.userActivityStream$;
  }

  // Simular entrada de usuário
  public simulateUserJoining(): void {
    const newUser: User = {
      id: Math.floor(Math.random() * 1000).toString(),
      name: `Usuário ${Math.floor(Math.random() * 100)}`,
      status: UserStatus.ONLINE,
      avatar: 'user-default'
    };
    
    const currentUsers = this.activeUsers.getValue();
    this.activeUsers.next([...currentUsers, newUser]);
    this.userJoined.next(newUser);
  }

  // Simular saída de usuário
  public simulateUserLeaving(): void {
    const currentUsers = this.activeUsers.getValue();
    if (currentUsers.length > 0) {
      const indexToRemove = Math.floor(Math.random() * currentUsers.length);
      const userLeaving = currentUsers[indexToRemove];
      
      this.activeUsers.next(
        currentUsers.filter((_, index) => index !== indexToRemove)
      );
      
      this.userLeft.next(userLeaving);
    }
  }

  // Atualizar status do usuário
  public updateUserStatus(userId: string, status: UserStatus): void {
    const currentUsers = this.activeUsers.getValue();
    const updatedUsers = currentUsers.map(user => 
      user.id === userId ? { ...user, status } : user
    );
    
    this.activeUsers.next(updatedUsers);
    this.statusChanged.next({ userId, status });
  }

  // Obter stream de status do usuário
  public getUserStatusUpdates(userId: string): Observable<UserStatus> {
    return this.activeUsers.pipe(
      map(users => {
        const user = users.find(u => u.id === userId);
        return user ? user.status : UserStatus.OFFLINE;
      })
    );
  }

  // Iniciar simulação automática de atividade dos usuários
  public startActivitySimulation(stopSignal$: Observable<void>): void {
    interval(5000).pipe(
      takeUntil(stopSignal$),
      startWith(0) // Dispara imediatamente a primeira vez
    ).subscribe(() => {
      const randomAction = Math.floor(Math.random() * 3);
      switch (randomAction) {
        case 0:
          this.simulateUserJoining();
          break;
        case 1:
          this.simulateUserLeaving();
          break;
        case 2:
          const users = this.activeUsers.getValue();
          if (users.length > 0) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const statuses = [UserStatus.ONLINE, UserStatus.AWAY, UserStatus.BUSY];
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            this.updateUserStatus(randomUser.id, newStatus);
          }
          break;
      }
    });
  }
}
