/**
 * Modelos para a colaboração em tempo real
 * Utilizando interfaces para garantir imutabilidade
 */

export interface User {
  readonly id: string;
  readonly name: string;
  readonly avatar?: string;
  readonly status: UserStatus;
  readonly lastActive?: Date;
}

export enum UserStatus {
  ONLINE = 'online',
  AWAY = 'away',
  BUSY = 'busy',
  OFFLINE = 'offline'
}

export interface ChatMessage {
  readonly id: string;
  readonly userId: string;
  readonly userName: string;
  readonly userAvatar?: string;
  readonly content: string;
  readonly timestamp: Date;
  readonly isSystemMessage?: boolean;
  readonly reactions?: MessageReaction[];
}

export interface MessageReaction {
  readonly emoji: string;
  readonly count: number;
  readonly users: string[]; // Array de userIds
}

export interface ProjectActivity {
  readonly id: string;
  readonly projectId: string;
  readonly userId: string;
  readonly userName: string;
  readonly actionType: ActivityType;
  readonly timestamp: Date;
  readonly resourceId?: string;
  readonly resourceType?: string;
  readonly description: string;
}

export enum ActivityType {
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  TASK_DELETED = 'task_deleted',
  TASK_MOVED = 'task_moved',
  TASK_ASSIGNED = 'task_assigned',
  TASK_COMPLETED = 'task_completed',
  COMMENT_ADDED = 'comment_added',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left'
}

export interface Notification {
  readonly id: string;
  readonly userId: string;
  readonly title: string;
  readonly message: string;
  readonly timestamp: Date;
  readonly read: boolean;
  readonly actionLink?: string;
  readonly type: NotificationType;
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  MENTION = 'mention',
  ASSIGNMENT = 'assignment'
}

export interface UserPresence {
  readonly userId: string;
  readonly userName: string;
  readonly userAvatar?: string;
  readonly projectId: string;
  readonly status: UserStatus;
  readonly currentView?: string;
  readonly lastActive: Date;
}

// Tipo para representar cursores em tempo real
export interface CursorPosition {
  readonly userId: string;
  readonly userName: string;
  readonly color: string;
  readonly x: number;
  readonly y: number;
  readonly taskId?: string;
  readonly timestamp: Date;
}
