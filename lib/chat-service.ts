/**
 * Chat request service (masked contact between buyer and seller)
 */

import { supabase } from './supabase';
import { getUser } from './auth';
import { ChatRequest, ChatRequestWithCar, ApiResponse } from './types';
import { generateMaskedPhone } from './utils';

/**
 * Send chat request to seller
 */
export async function sendChatRequest(carId: string): Promise<ApiResponse<ChatRequest>> {
  try {
    const user = await getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Get car and seller info
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('*, owner_id')
      .eq('id', carId)
      .single();

    if (carError || !car) {
      return { error: 'Car not found' };
    }

    // Get seller phone
    const { data: seller } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', car.owner_id)
      .single();

    // Get buyer phone
    const { data: buyer } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', user.id)
      .single();

    const maskedBuyerPhone = buyer?.phone ? generateMaskedPhone(buyer.phone) : null;
    const maskedSellerPhone = seller?.phone ? generateMaskedPhone(seller.phone) : null;

    const { data, error } = await supabase
      .from('chat_requests')
      .insert([
        {
          car_id: carId,
          buyer_id: user.id,
          seller_id: car.owner_id,
          status: 'pending',
          masked_buyer_phone: maskedBuyerPhone,
          masked_seller_phone: maskedSellerPhone,
        },
      ])
      .select()
      .single();

    if (error) {
      // Check if already exists
      if (error.code === '23505') {
        return { error: 'Chat request already sent' };
      }
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    console.error('Send chat request error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to send request' };
  }
}

/**
 * Accept chat request (seller accepts buyer)
 */
export async function acceptChatRequest(requestId: string): Promise<ApiResponse<ChatRequest>> {
  try {
    const user = await getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Verify user is the seller
    const { data: request } = await supabase
      .from('chat_requests')
      .select('seller_id')
      .eq('id', requestId)
      .single();

    if (request?.seller_id !== user.id) {
      return { error: 'Unauthorized' };
    }

    const { data, error } = await supabase
      .from('chat_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    console.error('Accept request error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to accept request' };
  }
}

/**
 * Reject chat request
 */
export async function rejectChatRequest(requestId: string): Promise<ApiResponse<ChatRequest>> {
  try {
    const user = await getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Verify user is the seller
    const { data: request } = await supabase
      .from('chat_requests')
      .select('seller_id')
      .eq('id', requestId)
      .single();

    if (request?.seller_id !== user.id) {
      return { error: 'Unauthorized' };
    }

    const { data, error } = await supabase
      .from('chat_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    console.error('Reject request error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to reject request' };
  }
}

/**
 * Get user's chat requests (as seller)
 */
export async function getReceivedChatRequests(): Promise<ChatRequestWithCar[]> {
  try {
    const user = await getUser();
    if (!user) {
      return [];
    }

    const { data: requests, error } = await supabase
      .from('chat_requests')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get requests error:', error);
      return [];
    }

    if (!requests || requests.length === 0) {
      return [];
    }

    // Get car and buyer details
    const carIds = requests.map((r: any) => r.car_id);
    const buyerIds = requests.map((r: any) => r.buyer_id);

    const [{ data: cars }, { data: buyers }] = await Promise.all([
      supabase.from('cars').select('*').in('id', carIds),
      supabase.from('profiles').select('*').in('id', buyerIds),
    ]);

    const carMap = new Map(cars?.map((c: any) => [c.id, c]) || []);
    const buyerMap = new Map(buyers?.map((b: any) => [b.id, b]) || []);

    return requests
      .map((r: any) => ({
        ...r,
        car: carMap.get(r.car_id),
        buyer: buyerMap.get(r.buyer_id),
      }))
      .filter((r: any) => r.car && r.buyer) as ChatRequestWithCar[];
  } catch (error) {
    console.error('Get requests error:', error);
    return [];
  }
}

/**
 * Get user's chat requests (as buyer)
 */
export async function getSentChatRequests(): Promise<ChatRequestWithCar[]> {
  try {
    const user = await getUser();
    if (!user) {
      return [];
    }

    const { data: requests, error } = await supabase
      .from('chat_requests')
      .select('*')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get requests error:', error);
      return [];
    }

    if (!requests || requests.length === 0) {
      return [];
    }

    // Get car and seller details
    const carIds = requests.map((r: any) => r.car_id);
    const sellerIds = requests.map((r: any) => r.seller_id);

    const [{ data: cars }, { data: sellers }] = await Promise.all([
      supabase.from('cars').select('*').in('id', carIds),
      supabase.from('profiles').select('*').in('id', sellerIds),
    ]);

    const carMap = new Map(cars?.map((c: any) => [c.id, c]) || []);
    const sellerMap = new Map(sellers?.map((s: any) => [s.id, s]) || []);

    return requests
      .map((r: any) => ({
        ...r,
        car: carMap.get(r.car_id),
        seller: sellerMap.get(r.seller_id),
      }))
      .filter((r: any) => r.car && r.seller) as ChatRequestWithCar[];
  } catch (error) {
    console.error('Get requests error:', error);
    return [];
  }
}

/**
 * Close chat request
 */
export async function closeChatRequest(requestId: string): Promise<ApiResponse<ChatRequest>> {
  try {
    const user = await getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Verify user is part of the conversation
    const { data: request } = await supabase
      .from('chat_requests')
      .select('buyer_id, seller_id')
      .eq('id', requestId)
      .single();

    if (request?.buyer_id !== user.id && request?.seller_id !== user.id) {
      return { error: 'Unauthorized' };
    }

    const { data, error } = await supabase
      .from('chat_requests')
      .update({ status: 'closed' })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    console.error('Close request error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to close request' };
  }
}
