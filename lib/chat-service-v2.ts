/**
 * Masked Chat Service - Lead control without exposing phone numbers
 * Buyers/Sellers communicate through platform
 * Phone numbers masked with temporary call numbers
 */

import { supabase } from './supabase';

export interface MaskedPhoneConfig {
  buyerNumber: string;
  sellerNumber: string;
  expiresAt: string;
  chatId: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  message: string;
  attachment_url?: string;
  created_at: string;
  is_read: boolean;
}

export interface Chat {
  id: string;
  car_id: string;
  buyer_id: string;
  seller_id: string;
  masked_buyer_phone: string;
  masked_seller_phone: string;
  status: 'active' | 'closed' | 'blocked';
  created_at: string;
  updated_at: string;
}

/**
 * Create masked chat between buyer and seller
 * Prevents direct contact until agreement
 */
export async function createMaskedChat(
  carId: string,
  buyerId: string,
  sellerId: string
): Promise<Chat> {
  try {
    // Generate temporary masked phone numbers
    const maskedBuyerPhone = generateMaskedPhone();
    const maskedSellerPhone = generateMaskedPhone();

    const { data, error } = await supabase
      .from('chats')
      .insert({
        car_id: carId,
        buyer_id: buyerId,
        seller_id: sellerId,
        masked_buyer_phone: maskedBuyerPhone,
        masked_seller_phone: maskedSellerPhone,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return data as Chat;
  } catch (error) {
    console.error('Failed to create masked chat:', error);
    throw error;
  }
}

/**
 * Send chat message through platform
 */
export async function sendChatMessage(
  chatId: string,
  senderId: string,
  message: string,
  attachmentUrl?: string
): Promise<ChatMessage> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        message,
        attachment_url: attachmentUrl,
        is_read: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ChatMessage;
  } catch (error) {
    console.error('Failed to send chat message:', error);
    throw error;
  }
}

/**
 * Get all messages in a chat
 */
export async function getChatMessages(
  chatId: string,
  limit: number = 50
): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as ChatMessage[];
  } catch (error) {
    console.error('Failed to fetch chat messages:', error);
    throw error;
  }
}

/**
 * Get all chats for a user
 */
export async function getUserChats(userId: string): Promise<Chat[]> {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .or(
        `buyer_id.eq.${userId},seller_id.eq.${userId}`
      )
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data as Chat[];
  } catch (error) {
    console.error('Failed to fetch user chats:', error);
    throw error;
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  chatId: string,
  userId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('chat_id', chatId)
      .not('sender_id', 'eq', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to mark messages as read:', error);
    throw error;
  }
}

/**
 * Close chat (buyer/seller agreed or no interest)
 */
export async function closeChat(chatId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('chats')
      .update({
        status: 'closed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', chatId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to close chat:', error);
    throw error;
  }
}

/**
 * Block chat (abuse/fraud detected)
 */
export async function blockChat(chatId: string, reason: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('chats')
      .update({
        status: 'blocked',
        block_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', chatId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to block chat:', error);
    throw error;
  }
}

/**
 * Generate masked phone number format
 * Example: +91 XXXX XXXX 1234
 */
export function generateMaskedPhone(): string {
  const lastFourDigits = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `+91 XXXX XXXX ${lastFourDigits}`;
}

/**
 * Get actual phone number (dealer only, when lead accepted)
 * This would require verification and lead locking
 */
export async function revealPhoneNumber(
  chatId: string,
  requestingUserId: string
): Promise<string | null> {
  try {
    // Check if chat exists and user is participant
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();

    if (chatError) throw chatError;

    // Check if requesting user is valid participant
    if (
      requestingUserId !== chat.buyer_id &&
      requestingUserId !== chat.seller_id
    ) {
      throw new Error('Unauthorized to view phone');
    }

    // Get actual phone from profile (masked in display)
    const targetUserId =
      requestingUserId === chat.buyer_id
        ? chat.seller_id
        : chat.buyer_id;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', targetUserId)
      .single();

    if (error) throw error;
    return profile?.phone || null;
  } catch (error) {
    console.error('Failed to reveal phone number:', error);
    throw error;
  }
}
