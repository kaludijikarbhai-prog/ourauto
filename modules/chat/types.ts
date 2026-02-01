/**
 * Chat System Module
 *
 * Real-time messaging between buyers, dealers, and inspectors
 * - Direct messaging
 * - Group chats
 * - Message history
 * - Notifications
 */

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachments?: string[];
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: string[];
  type: 'direct' | 'group';
  relatedListingId?: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface UnreadCount {
  conversationId: string;
  unreadCount: number;
}
