import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ProjectActivity } from '../../models/collaboration.model';
import { ActivityStreamService } from '../../services/activity-stream.service';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="activity-feed-container">
      <h2 class="section-title">
        Feed de Atividades
        <span class="activity-count" *ngIf="(activities$ | async)?.length">
          {{ (activities$ | async)?.length || 0 }}
        </span>
      </h2>

      <div class="activity-list">
        <div 
          *ngFor="let activity of activities$ | async; let i = index" 
          class="activity-item" 
          [class.new]="i === 0"
          [class.task-created]="activity.actionType === 'task_created'"
          [class.task-completed]="activity.actionType === 'task_completed'"
          [class.task-moved]="activity.actionType === 'task_moved'"
          [class.comment-added]="activity.actionType === 'comment_added'"
          [class.user-joined]="activity.actionType === 'user_joined'"
          [class.user-left]="activity.actionType === 'user_left'">
          
          <div class="activity-icon">
            <i [class]="getActivityIcon(activity.actionType)"></i>
          </div>

          <div class="activity-content">
            <p class="activity-text">{{ activity.description }}</p>
            <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
          </div>
        </div>

        <div *ngIf="(activities$ | async)?.length === 0" class="empty-state">
          <p>Nenhuma atividade registrada</p>
        </div>
      </div>
      
      <div class="activity-summary" *ngIf="activityStats$ | async as stats">
        <h3>Resumo de Atividades</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Tarefas Criadas</span>
            <span class="stat-value">{{ stats.taskCreated }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Tarefas Concluídas</span>
            <span class="stat-value">{{ stats.taskCompleted }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Comentários</span>
            <span class="stat-value">{{ stats.comments }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Usuários Ativos</span>
            <span class="stat-value">{{ stats.userActivity }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .activity-feed-container {
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

    .activity-count {
      background: var(--primary-color);
      color: white;
      border-radius: 12px;
      padding: 0.2rem 0.6rem;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .activity-list {
      flex-grow: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
      padding-right: 0.5rem;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      padding: 0.75rem;
      border-radius: 8px;
      background-color: var(--surface-section);
      border-left: 3px solid var(--primary-color);
      transition: all 0.2s ease;
    }

    .activity-item.new {
      animation: highlightNew 1s ease;
    }

    .activity-item:hover {
      transform: translateX(3px);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
    }

    .activity-item.task-created {
      border-left-color: #3B82F6;
    }

    .activity-item.task-completed {
      border-left-color: #10B981;
    }

    .activity-item.task-moved {
      border-left-color: #8B5CF6;
    }

    .activity-item.comment-added {
      border-left-color: #F59E0B;
    }

    .activity-item.user-joined {
      border-left-color: #06B6D4;
    }

    .activity-item.user-left {
      border-left-color: #EC4899;
    }

    .activity-icon {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: rgba(59, 130, 246, 0.1);
      color: var(--primary-color);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.75rem;
    }

    .task-created .activity-icon {
      background-color: rgba(59, 130, 246, 0.1);
      color: #3B82F6;
    }

    .task-completed .activity-icon {
      background-color: rgba(16, 185, 129, 0.1);
      color: #10B981;
    }

    .task-moved .activity-icon {
      background-color: rgba(139, 92, 246, 0.1);
      color: #8B5CF6;
    }

    .comment-added .activity-icon {
      background-color: rgba(245, 158, 11, 0.1);
      color: #F59E0B;
    }

    .user-joined .activity-icon {
      background-color: rgba(6, 182, 212, 0.1);
      color: #06B6D4;
    }

    .user-left .activity-icon {
      background-color: rgba(236, 72, 153, 0.1);
      color: #EC4899;
    }

    .activity-content {
      flex: 1;
    }

    .activity-text {
      margin: 0;
      color: var(--text-color);
      line-height: 1.4;
      font-size: 0.95rem;
    }

    .activity-time {
      display: block;
      font-size: 0.8rem;
      color: var(--text-color-secondary);
      margin-top: 0.25rem;
    }

    .empty-state {
      text-align: center;
      padding: 2rem 0;
      color: var(--text-color-secondary);
    }

    .activity-summary {
      padding: 1rem;
      background-color: var(--surface-hover);
      border-radius: 8px;
    }

    .activity-summary h3 {
      font-size: 1rem;
      margin: 0 0 0.75rem;
      color: var(--text-color);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .stat-item {
      padding: 0.75rem;
      background: var(--surface-card);
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-label {
      font-size: 0.8rem;
      color: var(--text-color-secondary);
      margin-bottom: 0.25rem;
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--primary-color);
    }

    @keyframes highlightNew {
      0% {
        background-color: var(--primary-50);
      }
      100% {
        background-color: var(--surface-section);
      }
    }
  `]
})
export class ActivityFeedComponent implements OnInit, OnDestroy {
  activities$!: Observable<ProjectActivity[]>;
  activityStats$!: Observable<{
    taskCreated: number;
    taskCompleted: number;
    comments: number;
    userActivity: number;
  }>;
  
  private destroy$ = new Subject<void>();

  constructor(private activityStreamService: ActivityStreamService) { }

  ngOnInit(): void {
    this.activities$ = this.activityStreamService.getProjectActivities();
    
    this.activityStats$ = this.activityStreamService.getActivityCounts().pipe(
      takeUntil(this.destroy$),
      map((counts: any) => ({
        taskCreated: counts.task_created || 0,
        taskCompleted: counts.task_completed || 0,
        comments: counts.comment_added || 0,
        userActivity: (counts.user_joined || 0) + (counts.user_left || 0)
      }))
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getActivityIcon(actionType: string): string {
    switch (actionType) {
      case 'task_created':
        return 'pi pi-plus-circle';
      case 'task_updated':
        return 'pi pi-pencil';
      case 'task_deleted':
        return 'pi pi-trash';
      case 'task_moved':
        return 'pi pi-arrows-h';
      case 'task_assigned':
        return 'pi pi-user-plus';
      case 'task_completed':
        return 'pi pi-check-circle';
      case 'comment_added':
        return 'pi pi-comment';
      case 'user_joined':
        return 'pi pi-sign-in';
      case 'user_left':
        return 'pi pi-sign-out';
      default:
        return 'pi pi-info-circle';
    }
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}
