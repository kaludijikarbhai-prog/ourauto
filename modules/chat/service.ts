/**
 * Chat Service
 * 
 * Core functions for messaging and conversations
 */

import { supabase } from '@/lib/supabase';
import type { ChatMessage, Conversation } from './types';

export async function getConversations(userId: string): Promise<Conversation[]> {
  // Using supabase directly
  const { data, error } = await supabase
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
  // Using supabase directly
  const { data, error } = await supabase
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

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  attachments?: string[]
): Promise<ChatMessage | null> {
  // Using supabase directly
  const { data, error } = await supabase
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
  // Using supabase directly
  const { data, error } = await supabase
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
