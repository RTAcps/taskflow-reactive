import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { ChatMessage } from '../../models/collaboration.model';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="chat-container">
      <div class="chat-header">
        <h2 class="section-title">
          Chat em Tempo Real
          <span class="message-count" *ngIf="(messageCount$ | async)! > 0">
            {{ messageCount$ | async }}
          </span>
        </h2>
        <div class="chat-controls">
          <button class="chat-action" title="Mostrar/ocultar informações">
            <i class="pi pi-chart-line"></i>
          </button>
        </div>
      </div>

      <div class="chat-messages" #messageContainer>
        <div *ngIf="(messages$ | async)?.length === 0" class="empty-state">
          <p>Nenhuma mensagem ainda. Inicie uma conversa!</p>
        </div>

        <div 
          *ngFor="let message of messages$ | async" 
          class="message-item"
          [class.system-message]="message.isSystemMessage">
          
          <div class="message-avatar" *ngIf="!message.isSystemMessage">
            <i class="pi pi-user avatar-icon"></i>
          </div>

          <div class="message-content">
            <div class="message-header">
              <span class="message-author">{{ message.userName }}</span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
            
            <div class="message-text">{{ message.content }}</div>
            
            <div class="message-reactions" *ngIf="message.reactions && message.reactions.length > 0">
              <div 
                *ngFor="let reaction of message.reactions" 
                class="reaction-badge"
                (click)="addReaction(message.id, reaction.emoji)">
                <span class="reaction-emoji">{{ reaction.emoji }}</span>
                <span class="reaction-count">{{ reaction.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-stats" *ngIf="chatStats$ | async as stats">
        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-label">Total de Mensagens</span>
            <span class="stat-value">{{ stats.totalMessages }}</span>
          </div>
          
          <div class="stat-item">
            <span class="stat-label">Emojis Populares</span>
            <div class="emoji-list">
              <span *ngFor="let emoji of stats.topEmojis" class="emoji-item">
                {{ emoji.emoji }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form [formGroup]="messageForm" class="message-form" (ngSubmit)="sendMessage()">
        <input 
          type="text" 
          formControlName="content"
          class="message-input" 
          placeholder="Digite sua mensagem..."
          (keydown.enter)="$event.preventDefault(); sendMessage()">

        <div class="message-actions">
          <button 
            type="button" 
            class="emoji-button" 
            title="Adicionar emoji">
            <i class="pi pi-smile"></i>
          </button>
          <button 
            type="submit" 
            class="send-button" 
            [disabled]="messageForm.invalid">
            <i class="pi pi-send"></i>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
      color: var(--text-color);
      display: flex;
      align-items: center;
    }

    .message-count {
      background: var(--primary-color);
      color: white;
      border-radius: 12px;
      padding: 0.2rem 0.6rem;
      font-size: 0.8rem;
      font-weight: 700;
      margin-left: 0.5rem;
    }

    .chat-controls {
      display: flex;
      gap: 0.5rem;
    }

    .chat-action {
      background: var(--surface-hover);
      border: none;
      border-radius: 6px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-color-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .chat-action:hover {
      background: var(--primary-color);
      color: white;
    }

    .chat-messages {
      flex-grow: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 0.5rem;
      margin-bottom: 1rem;
      border-radius: 8px;
      background-color: var(--surface-section);
    }

    .empty-state {
      text-align: center;
      padding: 2rem 0;
      color: var(--text-color-secondary);
    }

    .message-item {
      display: flex;
      gap: 0.75rem;
      max-width: 90%;
    }

    .message-item.system-message {
      align-self: center;
      background-color: rgba(59, 130, 246, 0.08);
      padding: 0.5rem 1rem;
      border-radius: 16px;
      font-size: 0.9rem;
      color: var(--text-color-secondary);
    }

    .message-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      flex-shrink: 0;
      background-color: var(--primary-200);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar-icon {
      font-size: 1.2rem;
      color: var(--primary-700);
    }

    .message-content {
      flex-grow: 1;
      background-color: var(--surface-card);
      border-radius: 0 8px 8px 8px;
      padding: 0.75rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      position: relative;
    }

    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
    }

    .message-author {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--primary-color);
    }

    .message-time {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
    }

    .message-text {
      color: var(--text-color);
      line-height: 1.4;
      word-break: break-word;
    }

    .message-reactions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .reaction-badge {
      background-color: var(--surface-hover);
      border-radius: 12px;
      padding: 0.15rem 0.4rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.85rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .reaction-badge:hover {
      background-color: var(--surface-border);
    }

    .reaction-count {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
    }

    .chat-stats {
      background: var(--surface-hover);
      border-radius: 8px;
      padding: 0.75rem;
      margin-bottom: 1rem;
      animation: slideIn 0.3s ease;
    }

    .stats-row {
      display: flex;
      justify-content: space-between;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 0.8rem;
      color: var(--text-color-secondary);
    }

    .stat-value {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--primary-color);
    }

    .emoji-list {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }

    .emoji-item {
      font-size: 1.1rem;
    }

    .message-form {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background-color: var(--surface-section);
      border-radius: 8px;
    }

    .message-input {
      flex-grow: 1;
      padding: 0.75rem 1rem;
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      background-color: var(--surface-card);
      color: var(--text-color);
      font-size: 0.95rem;
      transition: all 0.2s ease;
    }

    .message-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    .message-actions {
      display: flex;
      gap: 0.5rem;
    }

    .emoji-button,
    .send-button {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .emoji-button {
      background-color: var(--surface-card);
      color: var(--text-color-secondary);
    }

    .emoji-button:hover {
      background-color: var(--surface-hover);
      color: var(--primary-color);
    }

    .send-button {
      background-color: var(--primary-color);
      color: white;
    }

    .send-button:hover {
      background-color: var(--primary-600);
    }

    .send-button:disabled {
      background-color: var(--surface-border);
      cursor: not-allowed;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  messages$!: Observable<ChatMessage[]>;
  messageCount$!: Observable<number>;
  chatStats$!: Observable<any>;
  
  messageForm: FormGroup;
  
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  
  private destroy$ = new Subject<void>();
  private userId: string = '1'; // Simulando um usuário logado
  private userName: string = 'Você';
  private userAvatar: string = 'user-default';

  constructor(
    private chatService: ChatService,
    private fb: FormBuilder
  ) {
    this.messageForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.messages$ = this.chatService.getMessages().pipe(
      tap(() => {
        // Scroll para o final das mensagens após o próximo ciclo de renderização
        setTimeout(() => this.scrollToBottom(), 0);
      })
    );
    
    this.messageCount$ = this.messages$.pipe(
      map(messages => messages.length)
    );
    
    this.chatStats$ = this.chatService.getChatStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  sendMessage(): void {
    if (this.messageForm.invalid) return;
    
    const content = this.messageForm.value.content;
    
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: this.userId,
      userName: this.userName,
      userAvatar: this.userAvatar,
      content,
      timestamp: new Date(),
      reactions: []
    };
    
    this.chatService.sendMessage(newMessage);
    this.messageForm.reset();
  }

  addReaction(messageId: string, emoji: string): void {
    this.chatService.addReaction(messageId, emoji, this.userId);
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = 
        this.messageContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
}
