'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Send, X, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchAllTickets, 
  fetchTicketMessages, 
  sendSupportMessage, 
  updateTicketStatus,
  setSelectedTicket 
} from '@/store/slices/supportSlice';
import { SupportTicket, SupportMessage } from '@/types/user';

interface AdminSupportPanelProps {
  className?: string;
}

export default function AdminSupportPanel({ className = '' }: AdminSupportPanelProps) {
  const dispatch = useAppDispatch();
  const { tickets, messages, loading, selectedTicket } = useAppSelector((state: any) => state.support);
  
  const [newMessage, setNewMessage] = useState('');
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<SupportTicket['status'] | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<SupportTicket['priority'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadTickets = useCallback(async () => {
    try {
      setLocalLoading(true);
      await dispatch(fetchAllTickets()).unwrap();
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLocalLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const loadMessages = async (ticketId: string) => {
    try {
      await dispatch(fetchTicketMessages(ticketId)).unwrap();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const openChat = async (ticket: SupportTicket) => {
    dispatch(setSelectedTicket(ticket));
    await loadMessages(ticket.id);
    setIsChatModalOpen(true);
    
    // Mark as read by admin
    // The original code had this line commented out, so I'm keeping it commented.
    // await supportService.markTicketAsRead(ticket.id, true); 
    
    // Update local state
    // The original code had this line commented out, so I'm keeping it commented.
    // setTickets(prev => prev.map(t => 
    //   t.id === ticket.id ? { ...t, isReadByAdmin: true } : t
    // ));
  };

  const sendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      const messageData = {
        ticketId: selectedTicket.id,
        senderId: 'admin', // Admin ID
        senderName: 'Admin',
        senderType: 'admin' as const,
        message: newMessage.trim(),
        isRead: false
      };

      await dispatch(sendSupportMessage(messageData)).unwrap();
      setNewMessage('');
      
      // Refresh messages and tickets
      await loadMessages(selectedTicket.id);
      await loadTickets(); // Refresh ticket list
      
      // Update selected ticket to show new message
      // The original code had this line commented out, so I'm keeping it commented.
      // const updatedTickets = await supportService.getAllTickets();
      // const updatedTicket = updatedTickets.find(t => t.id === selectedTicket.id);
      // if (updatedTicket) {
      //   setSelectedTicket(updatedTicket);
      // }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: SupportTicket['status']) => {
    try {
      await dispatch(updateTicketStatus({ ticketId, status: newStatus })).unwrap();
      await loadTickets(); // Refresh tickets
    } catch (error) {
      console.error('Error updating ticket status:', error);
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

  // Filter tickets based on current filters
  const filteredTickets = tickets.filter((ticket: SupportTicket) => {
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesSearch = searchTerm === '' || 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const getUnreadCount = () => {
    return tickets.filter((ticket: SupportTicket) => !ticket.isReadByAdmin).length;
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
            <h3 className="text-lg font-semibold text-gray-900">Support Tickets</h3>
            <p className="text-sm text-gray-600">Manage user support requests</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getUnreadCount() > 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
              {getUnreadCount()} unread
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SupportTicket['status'] | 'all')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as SupportTicket['priority'] | 'all')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by subject, user name, or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
            />
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {loading || localLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No tickets found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          filteredTickets.map((ticket: SupportTicket) => (
            <div
              key={ticket.id}
              onClick={() => openChat(ticket)}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                !ticket.isReadByAdmin ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                                     <div className="flex items-center gap-2 mb-2">
                     {getStatusIcon(ticket.status)}
                     <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                     {!ticket.isReadByAdmin && (
                       <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                     )}
                   </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">{ticket.userName}</span>
                      <span>({ticket.userEmail})</span>
                    </span>
                    <span className={getPriorityColor(ticket.priority) + ' px-2 py-1 rounded-full text-xs font-medium'}>
                      {ticket.priority}
                    </span>
                    <span>{formatDate(ticket.lastMessageAt)}</span>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div className="capitalize mb-1">{ticket.status}</div>
                  <select
                    value={ticket.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleUpdateTicketStatus(ticket.id, e.target.value as SupportTicket['status']);
                    }}
                    className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
                    {selectedTicket.userName} ({selectedTicket.userEmail}) • {selectedTicket.status} • {selectedTicket.priority} priority
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
                  className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderType === 'admin'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {message.senderName}
                    </div>
                    <div className="text-sm">{message.message}</div>
                    <div className={`text-xs mt-2 ${
                      message.senderType === 'admin' ? 'text-blue-100' : 'text-gray-500'
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black "
                  placeholder="Type your response..."
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
