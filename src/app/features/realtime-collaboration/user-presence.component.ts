import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User, UserStatus } from '../../models/collaboration.model';
import { UserPresenceService } from '../../services/user-presence.service';

@Component({
  selector: 'app-user-presence',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-presence-container">
      <h2 class="section-title">Usuários Online <span class="user-count">{{ activeCount$ | async }}</span></h2>

      <div class="users-list">
        <div *ngFor="let user of activeUsers$ | async" class="user-item" [class]="user.status.toLowerCase()">
          <div class="user-avatar">
            <i class="pi pi-user avatar-icon"></i>
            <span class="status-indicator" [class]="user.status.toLowerCase()"></span>
          </div>
          <div class="user-info">
            <span class="user-name">{{ user.name }}</span>
            <span class="user-status">{{ getStatusLabel(user.status) }}</span>
          </div>
        </div>

        <div *ngIf="(activeUsers$ | async)?.length === 0" class="empty-state">
          <p>Nenhum usuário online no momento</p>
        </div>
      </div>

      <div class="user-activity" *ngIf="latestActivity$ | async as activity">
        <div class="activity-indicator"></div>
        <div class="activity-content">
          {{ activity.description }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-presence-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 1rem;
      color: var(--text-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .user-count {
      background: var(--primary-color);
      color: white;
      border-radius: 12px;
      padding: 0.2rem 0.6rem;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .users-list {
      flex-grow: 1;
      overflow-y: auto;
      margin-bottom: 1rem;
    }

    .user-item {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      background-color: var(--surface-section);
      transition: all 0.2s ease;
    }

    .user-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
    }

    .user-item.online {
      border-left: 3px solid #22c55e;
    }

    .user-item.away {
      border-left: 3px solid #eab308;
    }

    .user-item.busy {
      border-left: 3px solid #ef4444;
    }

    .user-item.offline {
      border-left: 3px solid #9ca3af;
      opacity: 0.7;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      position: relative;
      margin-right: 0.75rem;
      background-color: var(--primary-200);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .avatar-icon {
      font-size: 1.2rem;
      color: var(--primary-700);
    }

    .status-indicator {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
    }

    .status-indicator.online {
      background-color: #22c55e;
    }

    .status-indicator.away {
      background-color: #eab308;
    }

    .status-indicator.busy {
      background-color: #ef4444;
    }

    .status-indicator.offline {
      background-color: #9ca3af;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 500;
      color: var(--text-color);
    }

    .user-status {
      font-size: 0.8rem;
      color: var(--text-color-secondary);
    }

    .empty-state {
      text-align: center;
      padding: 2rem 0;
      color: var(--text-color-secondary);
    }

    .user-activity {
      padding: 0.75rem;
      border-radius: 8px;
      background-color: var(--surface-hover);
      display: flex;
      align-items: center;
      animation: fadeIn 0.3s ease-in;
    }

    .activity-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: var(--primary-color);
      margin-right: 0.75rem;
      position: relative;
    }

    .activity-indicator::after {
      content: '';
      position: absolute;
      top: -5px;
      left: -5px;
      right: -5px;
      bottom: -5px;
      border-radius: 50%;
      background-color: var(--primary-color);
      opacity: 0.3;
      animation: pulse 2s infinite;
    }

    .activity-content {
      font-size: 0.9rem;
      color: var(--text-color);
    }

    @keyframes pulse {
      0% {
        transform: scale(0.8);
        opacity: 0.7;
      }
      70% {
        transform: scale(1.5);
        opacity: 0;
      }
      100% {
        transform: scale(0.8);
        opacity: 0;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class UserPresenceComponent implements OnInit, OnDestroy {
  activeUsers$!: Observable<User[]>;
  activeCount$!: Observable<number>;
  latestActivity$!: Observable<any>;
  private destroy$ = new Subject<void>();

  constructor(private userPresenceService: UserPresenceService) { }

  ngOnInit(): void {
    this.activeUsers$ = this.userPresenceService.getActiveUsers();
    this.activeCount$ = this.userPresenceService.getActiveUsersCount();
    this.latestActivity$ = this.userPresenceService.getUserActivity();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getStatusLabel(status: UserStatus): string {
    switch (status) {
      case UserStatus.ONLINE:
        return 'Online';
      case UserStatus.AWAY:
        return 'Ausente';
      case UserStatus.BUSY:
        return 'Ocupado';
      case UserStatus.OFFLINE:
        return 'Offline';
      default:
        return 'Desconhecido';
    }
  }
}
