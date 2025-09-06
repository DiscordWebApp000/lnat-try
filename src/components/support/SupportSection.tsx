'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Plus, Send, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchUserTickets, 
  fetchTicketMessages, 
  createSupportTicket, 
  sendSupportMessage,
  setSelectedTicket 
} from '@/store/slices/supportSlice';
import { SupportTicket, SupportMessage } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';

interface SupportSectionProps {
  className?: string;
}

export default function SupportSection({ className = '' }: SupportSectionProps) {
  const { currentUser } = useAuth();
  const dispatch = useAppDispatch();
  const { tickets, messages, loading, selectedTicket } = useAppSelector((state: any) => state.support);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  // Form state for new ticket
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [newTicketPriority, setNewTicketPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const loadTickets = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLocalLoading(true);
      await dispatch(fetchUserTickets(currentUser.uid));
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLocalLoading(false);
    }
  }, [currentUser, dispatch]);

  useEffect(() => {
    if (currentUser) {
      loadTickets();
    }
  }, [currentUser, loadTickets]);

  const loadMessages = async (ticketId: string) => {
    try {
      await dispatch(fetchTicketMessages(ticketId));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const openChat = async (ticket: SupportTicket) => {
    dispatch(setSelectedTicket(ticket));
    await loadMessages(ticket.id);
    setIsChatModalOpen(true);
    
    // Mark as read by user
    // await supportService.markTicketAsRead(ticket.id, false); // This line is removed as per the new_code
    
    // Update local state
    // setTickets(prev => prev.map(t => 
    //   t.id === ticket.id ? { ...t, isReadByUser: true } : t
    // )); // This line is removed as per the new_code
  };

  const createTicket = async () => {
    if (!currentUser || !newTicketSubject.trim() || !newTicketMessage.trim()) return;

    try {
      setLocalLoading(true);
      
      const ticketData = {
        userId: currentUser.uid,
        userEmail: currentUser.email || '',
        userName: `${currentUser.firstName} ${currentUser.lastName}`,
        subject: newTicketSubject.trim(),
        status: 'open' as const,
        priority: newTicketPriority,
        isReadByAdmin: false,
        isReadByUser: true
      };

      const result = await dispatch(createSupportTicket(ticketData)).unwrap();
      
      // Create first message
      const messageData = {
        ticketId: result.id,
        senderId: currentUser.uid,
        senderName: `${currentUser.firstName} ${currentUser.lastName}`,
        senderType: 'user' as const,
        message: newTicketMessage.trim(),
        isRead: false
      };

      await dispatch(sendSupportMessage(messageData));
      
      // Reset form and close modal
      setNewTicketSubject('');
      setNewTicketMessage('');
      setNewTicketPriority('medium');
      setIsCreateModalOpen(false);
      
      // Reload tickets
      await loadTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedTicket || !currentUser || !newMessage.trim()) return;

    try {
      const messageData = {
        ticketId: selectedTicket.id,
        senderId: currentUser.uid,
        senderName: `${currentUser.firstName} ${currentUser.lastName}`,
        senderType: 'user' as const,
        message: newMessage.trim(),
        isRead: false
      };

      await dispatch(sendSupportMessage(messageData));
      setNewMessage('');
      await loadMessages(selectedTicket.id);
      await loadTickets(); // Refresh ticket list
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getStatusIcon = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return <div className="w-3 h-3 bg-orange-500 rounded-full"></div>;
      case 'in-progress':
        return <div className="w-3 h-3 bg-blue-500 rounded-full"></div>;
      case 'closed':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>;
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>;
    }
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-orange-600 bg-orange-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Support Center</h3>
            <p className="text-sm text-gray-600">Get help and submit suggestions</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Ticket</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No support tickets yet</p>
            <p className="text-sm">Create your first ticket to get help</p>
          </div>
        ) : (
          tickets.map((ticket: SupportTicket) => (
            <div
              key={ticket.id}
              onClick={() => openChat(ticket)}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                !ticket.isReadByUser ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(ticket.status)}
                    <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                    {!ticket.isReadByUser && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className={getPriorityColor(ticket.priority) + ' px-2 py-1 rounded-full text-xs font-medium'}>
                      {ticket.priority}
                    </span>
                    <span>{formatDate(ticket.lastMessageAt)}</span>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div className="capitalize">{ticket.status}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Create Support Ticket</h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Brief description of your issue or suggestion"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={newTicketPriority}
                  onChange={(e) => setNewTicketPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={newTicketMessage}
                  onChange={(e) => setNewTicketMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Describe your issue or suggestion in detail..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createTicket}
                  disabled={localLoading || !newTicketSubject.trim() || !newTicketMessage.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {localLoading ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {isChatModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedTicket.subject}</h3>
                  <p className="text-blue-100 text-sm">
                    {selectedTicket.status} • {selectedTicket.priority} priority
                  </p>
                </div>
                <button
                  onClick={() => setIsChatModalOpen(false)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message: SupportMessage) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderType === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {message.senderName}
                    </div>
                    <div className="text-sm">{message.message}</div>
                    <div className={`text-xs mt-2 ${
                      message.senderType === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatDate(message.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Message Input */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Type your message..."
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
