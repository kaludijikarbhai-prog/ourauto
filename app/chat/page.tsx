'use client';

import { useEffect, useState } from 'react';
import { getReceivedChatRequests, getSentChatRequests, acceptChatRequest, rejectChatRequest } from '@/lib/chat-service';
import { ChatRequestWithCar } from '@/lib/types';

export default function ChatPage() {
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [received, setReceived] = useState<ChatRequestWithCar[]>([]);
  const [sent, setSent] = useState<ChatRequestWithCar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    setLoading(true);
    const [receivedData, sentData] = await Promise.all([
      getReceivedChatRequests(),
      getSentChatRequests(),
    ]);
    setReceived(receivedData);
    setSent(sentData);
    setLoading(false);
  };

  const handleAccept = async (chatId: string) => {
    await acceptChatRequest(chatId);
    await loadChats();
  };

  const handleReject = async (chatId: string) => {
    await rejectChatRequest(chatId);
    await loadChats();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Chat Requests</h1>
          <p className="text-gray-600 mt-2">Manage your car inquiries</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setTab('received')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              tab === 'received'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Received ({received.length})
          </button>
          <button
            onClick={() => setTab('sent')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              tab === 'sent'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Sent ({sent.length})
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading chats...</div>
        ) : tab === 'received' ? (
          /* Received Tab */
          <div className="space-y-4">
            {received.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
                No chat requests yet. Your listings will appear here when buyers request contact.
              </div>
            ) : (
              received.map((chat) => (
                <div key={chat.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{chat.car?.title || 'Car'}</h3>
                      <p className="text-gray-600">
                        from{' '}
                        <span className="font-semibold">
                          Buyer {chat.buyer_id?.substring(0, 8)}...
                        </span>
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        chat.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : chat.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {chat.status}
                    </span>
                  </div>

                  {/* Masked Phone */}
                  {chat.status === 'accepted' && chat.masked_buyer_phone && (
                    <div className="bg-blue-50 p-4 rounded mb-4 border border-blue-200">
                      <p className="text-sm text-gray-600">Contact this buyer at:</p>
                      <p className="text-2xl font-bold text-blue-600">{chat.masked_buyer_phone}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {chat.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAccept(chat.id)}
                        className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 font-semibold"
                      >
                        Accept Request
                      </button>
                      <button
                        onClick={() => handleReject(chat.id)}
                        className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 font-semibold"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {chat.status === 'accepted' && (
                    <p className="text-sm text-green-600 font-semibold">
                      ✓ You've shared your phone number with this buyer
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          /* Sent Tab */
          <div className="space-y-4">
            {sent.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
                You haven't sent any chat requests yet. Browse cars and request contact with sellers.
              </div>
            ) : (
              sent.map((chat) => (
                <div key={chat.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{chat.car?.title || 'Car'}</h3>
                      <p className="text-gray-600">
                        from{' '}
                        <span className="font-semibold">
                          Seller {chat.seller_id?.substring(0, 8)}...
                        </span>
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        chat.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : chat.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {chat.status}
                    </span>
                  </div>

                  {/* Seller Phone */}
                  {chat.status === 'accepted' && chat.masked_seller_phone && (
                    <div className="bg-green-50 p-4 rounded mb-4 border border-green-200">
                      <p className="text-sm text-gray-600">Seller's contact:</p>
                      <p className="text-2xl font-bold text-green-600">{chat.masked_seller_phone}</p>
                    </div>
                  )}

                  {/* Status */}
                  {chat.status === 'pending' && (
                    <p className="text-sm text-yellow-600 font-semibold">
                      ⏳ Waiting for seller to accept your request...
                    </p>
                  )}

                  {chat.status === 'rejected' && (
                    <p className="text-sm text-red-600 font-semibold">
                      ✗ Seller declined your request
                    </p>
                  )}

                  {chat.status === 'accepted' && (
                    <p className="text-sm text-green-600 font-semibold">
                      ✓ Seller accepted! Contact them now.
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
