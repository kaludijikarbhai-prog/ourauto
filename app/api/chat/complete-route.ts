/**
 * Masked Chat API - Lead Protection System
 * GET /api/chat - Get user's chats
 * POST /api/chat - Create new chat
 * POST /api/chat/:id/message - Send message
 * POST /api/chat/:id/accept - Accept chat
 * POST /api/chat/:id/reject - Reject chat
 * GET /api/chat/:id/masked-numbers - Get masked phone numbers
 */

import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return 'XXXX';
  return cleaned.slice(0, 3) + ' XXXX XXX ' + cleaned.slice(-4);
}

/**
 * Generate unique virtual number (simulated)
 */
function generateVirtualNumber(): string {
  const base = '91'; // India code
  const random = Math.floor(Math.random() * 9000000000) + 1000000000;
  return base + random;
}

/**
 * GET /api/chat
 * Get all chats for current user (as buyer or seller)
 */
export async function GET(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // 'sent', 'received', 'all'

    let query = supabase
      .from('chat_requests')
      .select(`
        *,
        car:cars(*),
        buyer:profiles!chat_requests_buyer_id_fkey(*),
        seller:profiles!chat_requests_seller_id_fkey(*)
      `)
      .order('created_at', { ascending: false });

    if (type === 'sent') {
      query = query.eq('buyer_id', user.id);
    } else if (type === 'received') {
      query = query.eq('seller_id', user.id);
    } else {
      query = query.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
    }

    const { data: chats, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      count: chats?.length || 0,
      chats: chats || [],
    });
  } catch (error) {
    console.error('[Chat GET] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat
 * Create new chat request (buyer initiates)
 */
export async function POST(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { carId } = await request.json();

    if (!carId) {
      return NextResponse.json(
        { error: 'carId is required' },
        { status: 400 }
      );
    }

    // Get car and owner
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('*, owner:profiles!owner_id(*)')
      .eq('id', carId)
      .single();

    if (carError || !car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }

    // Get buyer profile
    const { data: buyer } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Check if chat already exists
    const { data: existingChat } = await supabase
      .from('chat_requests')
      .select('id')
      .eq('car_id', carId)
      .eq('buyer_id', user.id)
      .eq('seller_id', car.owner_id)
      .maybeSingle();

    if (existingChat) {
      return NextResponse.json(
        { error: 'Chat request already exists', chatId: existingChat.id },
        { status: 409 }
      );
    }

    // Create masked numbers
    const maskedBuyerPhone = buyer?.phone ? maskPhone(buyer.phone) : null;
    const maskedSellerPhone = car.owner?.phone ? maskPhone(car.owner.phone) : null;

    // Create chat request
    const { data: chatRequest, error: createError } = await supabase
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
      .select('*')
      .single();

    if (createError) {
      throw createError;
    }

    // Create virtual numbers for masked communication
    const { data: virtualNumbers } = await supabase
      .from('virtual_numbers')
      .insert([
        {
          chat_request_id: chatRequest.id,
          buyer_virtual_number: generateVirtualNumber(),
          seller_virtual_number: generateVirtualNumber(),
          buyer_real_phone: buyer?.phone || '',
          seller_real_phone: car.owner?.phone || '',
        },
      ])
      .select()
      .single();

    return NextResponse.json({
      success: true,
      chat: chatRequest,
      virtual_numbers: virtualNumbers,
      message: 'Chat request created. Seller will review.',
    });
  } catch (error) {
    console.error('[Chat POST] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create chat' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/chat/:id
 * Update chat status (accept/reject/close)
 */
export async function PATCH(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'id and status are required' },
        { status: 400 }
      );
    }

    if (!['accepted', 'rejected', 'closed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get chat and verify ownership
    const { data: chat } = await supabase
      .from('chat_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    // Only seller can accept/reject, either party can close
    if (['accepted', 'rejected'].includes(status) && chat.seller_id !== user.id) {
      return NextResponse.json(
        { error: 'Only seller can accept/reject' },
        { status: 403 }
      );
    }

    if (status === 'closed' && chat.buyer_id !== user.id && chat.seller_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update chat
    const { data: updated, error } = await supabase
      .from('chat_requests')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      chat: updated,
    });
  } catch (error) {
    console.error('[Chat PATCH] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update chat' },
      { status: 500 }
    );
  }
}
