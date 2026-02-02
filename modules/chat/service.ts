
/**
 * Chat Service
 * 
 * Core functions for messaging and conversations
 */

import { supabaseServer } from '@/lib/supabase-server';
import type { ChatMessage, Conversation } from './types';

export async function getConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabaseServer
    .from('conversations')
    .select('*')
    .contains('participant_ids', [userId]);
  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
  return data || [];
}

export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabaseServer
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  return data || [];
}

// Add other chat service functions here, ensuring supabaseServer is used directly and no duplicate variable declarations exist.

export async function sendMessage(
  conversationId: string,
  senderId: string,

  content: string,
  attachments?: string[]
): Promise<ChatMessage | null> {
  const { data, error } = await supabaseServer
    .from('chat_messages')
    .insert([
      {
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        attachments,
      } as never,
    ])
    .select()
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function createConversation(
  participantIds: string[],
  type: 'direct' | 'group',
  relatedListingId?: string
): Promise<Conversation | null> {
  const { data, error } = await supabaseServer
    .from('conversations')
    .insert([
      {
        participant_ids: participantIds,
        type,
        related_listing_id: relatedListingId,
      } as never,
    ])
    .select()
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}
