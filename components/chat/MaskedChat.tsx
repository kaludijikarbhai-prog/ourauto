/**
 * Masked Chat Component
 * Buyer/Seller communication without exposing phone numbers
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { sendChatMessage, getChatMessages, markMessagesAsRead } from '@/lib/chat-service-v2';
import type { ChatMessage } from '@/lib/chat-service-v2';

interface MaskedChatProps {
  chatId: string;
  currentUserId: string;
  otherUserName: string;
  maskedPhoneNumber: string;
}

export default function MaskedChat({
  chatId,
  currentUserId,
  otherUserName,
  maskedPhoneNumber,
}: MaskedChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages on load
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const msgs = await getChatMessages(chatId, 50);
        setMessages(msgs.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ));
        
        // Mark as read
        await markMessagesAsRead(chatId, currentUserId);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [chatId, currentUserId]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const msg = await sendChatMessage(chatId, currentUserId, newMessage.trim());
      setMessages([...messages, msg]);
      setNewMessage('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-96 rounded-lg border border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3">
        <h3 className="font-semibold text-gray-900">{otherUserName}</h3>
        <p className="text-xs text-gray-600">
          📞 {maskedPhoneNumber} (masked for privacy)
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 ${
                    msg.sender_id === currentUserId
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender_id === currentUserId
                        ? 'text-blue-100'
                        : 'text-gray-400'
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 bg-white p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending || loading}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={sending || loading || !newMessage.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
