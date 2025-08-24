import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChatMessage, UserStatus, User, ProjectActivity } from '../../models/collaboration.model';
import { ActivityStreamService } from '../../services/activity-stream.service';
import { ChatService } from '../../services/chat.service';
import { UserPresenceService } from '../../services/user-presence.service';
import { ActivityFeedComponent } from './activity-feed.component';
import { ChatComponent } from './chat.component';
import { UserPresenceComponent } from './user-presence.component';

@Component({
  selector: 'app-realtime-collaboration',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    UserPresenceComponent, 
    ActivityFeedComponent, 
    ChatComponent
  ],
  template: `
    <div class="collaboration-container">
      <header class="collaboration-header">
        <h1>Colaboração em Tempo Real</h1>
        <p class="subtitle">Trabalhe em equipe com atualizações ao vivo</p>
      </header>

      <div class="collaboration-grid">
        <div class="presence-section">
          <app-user-presence></app-user-presence>
        </div>

        <div class="activity-section">
          <app-activity-feed></app-activity-feed>
        </div>

        <div class="chat-section">
          <app-chat></app-chat>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .collaboration-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 1.5rem;
      box-sizing: border-box;
      background-color: var(--surface-ground, #f8f9fa);
      color: var(--text-color, #495057);
    }

    .collaboration-header {
      margin-bottom: 2rem;
    }

    .collaboration-header h1 {
      font-size: 2rem;
      margin: 0 0 0.5rem;
      color: var(--primary-color, #3B82F6);
    }

    .subtitle {
      font-size: 1.1rem;
      margin: 0;
      color: var(--text-color-secondary, #6c757d);
    }

    .collaboration-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      grid-template-rows: auto 1fr;
      gap: 1.5rem;
      height: calc(100% - 6rem);
      grid-template-areas:
        "presence activity"
        "chat activity";
    }

    .presence-section {
      grid-area: presence;
      background: var(--surface-card, #ffffff);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      padding: 1.5rem;
    }

    .activity-section {
      grid-area: activity;
      background: var(--surface-card, #ffffff);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      padding: 1.5rem;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .chat-section {
      grid-area: chat;
      background: var(--surface-card, #ffffff);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      padding: 1.5rem;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    @media (max-width: 768px) {
      .collaboration-grid {
        grid-template-columns: 1fr;
        grid-template-areas:
          "presence"
          "activity"
          "chat";
      }
    }
  `]
})
export class RealtimeCollaborationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private userPresenceService: UserPresenceService,
    private activityStreamService: ActivityStreamService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    // Iniciar simulações de atividade em tempo real
    this.userPresenceService.startActivitySimulation(this.destroy$);
    this.activityStreamService.startActivitySimulation(this.destroy$);
    this.chatService.startChatSimulation(this.destroy$);
  }

  ngOnDestroy(): void {
    // Enviar sinal para parar todas as simulações
    this.destroy$.next();
    this.destroy$.complete();
  }
}
