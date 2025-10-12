'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { activityApi } from '@/lib/api';

interface Message {
  message_type: string;
  message_content: string;
  sandbox_url?: string;
  created_at: string;
}

interface ActivityChatProps {
  activityId: string;
  tutorId: string;
  studentId: string;
  onCodeUpdate?: (newCode: string, sandboxUrl: string) => void;
}

export function ActivityChat({ activityId, tutorId, studentId, onCodeUpdate }: ActivityChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await activityApi.getChatHistory(activityId);
        if (response.success) {
          setMessages(response.chat_history);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };
    loadHistory();
  }, [activityId]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setLoading(true);

    const newUserMessage: Message = {
      message_type: 'tutor_request',
      message_content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      const response = await activityApi.chat({
        activity_id: activityId,
        tutor_id: tutorId,
        student_id: studentId,
        message: userMessage,
      });

      if (response.success) {
        const agentMessage: Message = {
          message_type: 'agent_response',
          message_content: response.explanation,
          sandbox_url: response.sandbox_url,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, agentMessage]);

        if (onCodeUpdate && response.new_code) {
          onCodeUpdate(response.new_code, response.sandbox_url);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        message_type: 'agent_response',
        message_content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Activity Chat - Conversational Editing
        </h3>
        <p className="text-sm text-blue-100 mt-1">
          Chat with the AI to modify your activity
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Bot className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-semibold">Start a conversation</p>
            <p className="text-sm mt-2">Try: &quot;Make it more challenging&quot; or &quot;Add a timer&quot;</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.message_type === 'tutor_request' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.message_type !== 'tutor_request' && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              </div>
            )}

            <div
              className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                message.message_type === 'tutor_request'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-100'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.message_content}</p>
              {message.sandbox_url && (
                <a
                  href={message.sandbox_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 text-xs font-medium transition-colors"
                >
                  View Updated Sandbox →
                </a>
              )}
            </div>

            {message.message_type === 'tutor_request' && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-sm">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your request... (e.g., 'Make it harder' or 'Add sound effects')"
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !inputMessage.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-semibold transition-colors"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
