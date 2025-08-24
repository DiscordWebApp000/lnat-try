'use client';

import { Users, MessageCircle, Circle, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAllTickets } from '@/store/slices/supportSlice';

interface AdminSidebarProps {
  activeTab: 'users' | 'support' | 'subscription';
  onTabChange: (tab: 'users' | 'support' | 'subscription') => void;
}

export default function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const dispatch = useAppDispatch();
  const { tickets } = useAppSelector((state: any) => state.support);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        await dispatch(fetchAllTickets());
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();
    
    // Her 30 saniyede bir güncelle
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Unread count'u tickets'dan hesapla
  useEffect(() => {
    if (tickets.length > 0) {
      const unread = tickets.filter((ticket: any) => !ticket.isReadByAdmin).length;
      setUnreadCount(unread);
    }
  }, [tickets]);

  const menuItems = [
    {
      id: 'users' as const,
      label: 'Users',
      icon: Users
    },
    {
      id: 'support' as const,
      label: 'Support',
      icon: MessageCircle,
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    {
      id: 'subscription' as const,
      label: 'Subscription',
      icon: CreditCard
    }
  ];

  return (
    <div className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-100/50 h-full flex flex-col relative">
      {/* Header */}
      <div className="px-6 py-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <div className="w-6 h-6 bg-white rounded-full"></div>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Admin</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Control Center</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-4 flex-1">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-2xl shadow-purple-600/25'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                )}
                <Icon className={`w-5 h-5 transition-all duration-300 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                }`} />
                <div className="flex items-center justify-between flex-1">
                  <span className={`font-medium transition-all duration-300 ${
                    isActive ? 'text-white' : 'text-slate-700 group-hover:text-slate-900'
                  }`}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100/50">
          <div className="flex items-center gap-2 mb-1">
            <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
            <span className="text-sm font-medium text-slate-700">System</span>
          </div>
          <p className="text-xs text-slate-500">All systems operational</p>
        </div>
      </div>
    </div>
  );
}
