import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, interval, merge } from 'rxjs';
import { delay, filter, map, scan, shareReplay, startWith, takeUntil } from 'rxjs/operators';
import { ChatMessage, MessageReaction } from '../models/collaboration.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  // Fonte de dados para mensagens do chat
  private chatMessages = new BehaviorSubject<ChatMessage[]>([]);
  
  // Emissor para novas mensagens
  private newMessage = new Subject<ChatMessage>();
  
  // Emissor para reações de mensagens
  private messageReaction = new Subject<{ messageId: string, reaction: MessageReaction }>();

  // Obter todas as mensagens como Observable
  public getMessages(): Observable<ChatMessage[]> {
    return this.chatMessages.asObservable();
  }

  // Obter stream de novas mensagens
  public getNewMessageStream(): Observable<ChatMessage> {
    return this.newMessage.asObservable();
  }
  
  // Obter mensagens não lidas
  public getUnreadMessages(lastReadTimestamp: Date): Observable<ChatMessage[]> {
    return this.chatMessages.pipe(
      map(messages => messages.filter(msg => 
        msg.timestamp > lastReadTimestamp
      ))
    );
  }

  // Enviar nova mensagem
  public sendMessage(message: ChatMessage): void {
    const currentMessages = this.chatMessages.getValue();
    this.chatMessages.next([...currentMessages, message]);
    this.newMessage.next(message);
  }
  
  // Adicionar reação a uma mensagem
  public addReaction(messageId: string, emoji: string, userId: string): void {
    const currentMessages = this.chatMessages.getValue();
    const messageIndex = currentMessages.findIndex(m => m.id === messageId);
    
    if (messageIndex >= 0) {
      const message = currentMessages[messageIndex];
      const reactions = message.reactions || [];
      
      // Verificar se já existe reação com este emoji
      const existingReactionIndex = reactions.findIndex(r => r.emoji === emoji);
      
      let updatedReactions: MessageReaction[];
      
      if (existingReactionIndex >= 0) {
        const existingReaction = reactions[existingReactionIndex];
        // Verificar se o usuário já reagiu
        if (existingReaction.users.includes(userId)) {
          // Remover reação do usuário
          const updatedUsers = existingReaction.users.filter(id => id !== userId);
          
          if (updatedUsers.length === 0) {
            // Se não houver mais usuários, remover a reação
            updatedReactions = reactions.filter((_, index) => index !== existingReactionIndex);
          } else {
            // Atualizar contagem e usuários
            const updatedReaction = {
              ...existingReaction,
              count: existingReaction.count - 1,
              users: updatedUsers
            };
            
            updatedReactions = [...reactions];
            updatedReactions[existingReactionIndex] = updatedReaction;
          }
        } else {
          // Adicionar usuário à reação existente
          const updatedReaction = {
            ...existingReaction,
            count: existingReaction.count + 1,
            users: [...existingReaction.users, userId]
          };
          
          updatedReactions = [...reactions];
          updatedReactions[existingReactionIndex] = updatedReaction;
        }
      } else {
        // Criar nova reação
        const newReaction: MessageReaction = {
          emoji,
          count: 1,
          users: [userId]
        };
        
        updatedReactions = [...reactions, newReaction];
      }
      
      const updatedMessage = {
        ...message,
        reactions: updatedReactions
      };
      
      const updatedMessages = [...currentMessages];
      updatedMessages[messageIndex] = updatedMessage;
      
      this.chatMessages.next(updatedMessages);
      
      if (updatedReactions.some(r => r.emoji === emoji && r.users.includes(userId))) {
        const reaction = updatedReactions.find(r => r.emoji === emoji)!;
        this.messageReaction.next({
          messageId,
          reaction
        });
      }
    }
  }
  
  // Obter stream de reações
  public getReactionStream(): Observable<{ messageId: string, reaction: MessageReaction }> {
    return this.messageReaction.asObservable();
  }

  // Simulação de mensagem do chat
  public simulateChatMessage(): void {
    const userIds = ['1', '2', '3', '4', '5'];
    const userNames = ['Alice Silva', 'Bruno Oliveira', 'Carolina Santos', 'Daniel Martins', 'Elena Costa'];
    const avatars = [
      'user-alice',
      'user-bruno',
      'user-carolina',
      'user-daniel',
      'user-elena'
    ];
    
    const messageContents = [
      'Acabei de enviar a primeira versão do relatório.',
      'Alguém pode revisar o PR #45?',
      'Bom dia! Como está o progresso da sprint?',
      'Encontrei um bug na funcionalidade de login.',
      'Vou iniciar a implementação dos testes agora.',
      'Reunião às 15h para discutir os próximos passos.',
      'Alguém pode me ajudar com a configuração do Docker?',
      'Acabei de atualizar a documentação da API.',
      'O cliente aprovou o último design que enviamos!',
      'Quem vai participar do hackathon no próximo mês?'
    ];
    
    const randomUserIndex = Math.floor(Math.random() * userIds.length);
    const randomMessageIndex = Math.floor(Math.random() * messageContents.length);
    
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: userIds[randomUserIndex],
      userName: userNames[randomUserIndex],
      userAvatar: avatars[randomUserIndex],
      content: messageContents[randomMessageIndex],
      timestamp: new Date(),
      reactions: []
    };
    
    this.sendMessage(newMessage);
  }
  
  // Simulação de reações a mensagens
  public simulateMessageReaction(): void {
    const currentMessages = this.chatMessages.getValue();
    if (currentMessages.length === 0) return;
    
    const randomMessageIndex = Math.floor(Math.random() * currentMessages.length);
    const randomMessage = currentMessages[randomMessageIndex];
    
    const emojis = ['👍', '👏', '❤️', '😂', '🎉', '🚀', '👀'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    const userIds = ['1', '2', '3', '4', '5'];
    const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
    
    this.addReaction(randomMessage.id, randomEmoji, randomUserId);
  }

  // Iniciar simulação automática de chat
  public startChatSimulation(stopSignal$: Observable<void>): void {
    // Simulação de mensagens
    interval(4000).pipe(
      takeUntil(stopSignal$),
      startWith(0) // Dispara imediatamente a primeira vez
    ).subscribe(() => {
      this.simulateChatMessage();
    });
    
    // Simulação de reações (com atraso inicial para ter mensagens)
    interval(7000).pipe(
      takeUntil(stopSignal$),
      delay(5000) // Atraso inicial
    ).subscribe(() => {
      this.simulateMessageReaction();
    });
  }
  
  // Stream agregada de status do chat
  public getChatStats(): Observable<{ 
    totalMessages: number; 
    messagesPerUser: Record<string, number>;
    topEmojis: Array<{ emoji: string, count: number }>;
  }> {
    return this.chatMessages.pipe(
      map(messages => {
        // Contagem total
        const totalMessages = messages.length;
        
        // Mensagens por usuário
        const messagesPerUser: Record<string, number> = {};
        messages.forEach(msg => {
          messagesPerUser[msg.userId] = (messagesPerUser[msg.userId] || 0) + 1;
        });
        
        // Emojis mais usados
        const emojiCounts: Record<string, number> = {};
        messages.forEach(msg => {
          (msg.reactions || []).forEach(reaction => {
            emojiCounts[reaction.emoji] = (emojiCounts[reaction.emoji] || 0) + reaction.count;
          });
        });
        
        const topEmojis = Object.entries(emojiCounts)
          .map(([emoji, count]) => ({ emoji, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        return {
          totalMessages,
          messagesPerUser,
          topEmojis
        };
      }),
      shareReplay(1)
    );
  }
}
