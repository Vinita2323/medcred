import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/Navigation/BottomNavBar';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Create new endpoint in ENDPOINTS if not exists, but for now we can hardcode the route string or use api.get
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await api.patch(`/notifications/${notification._id}/read`);
        setNotifications(notifications.map(n => 
          n._id === notification._id ? { ...n, isRead: true } : n
        ));
      } catch (err) {
        console.error('Failed to mark as read', err);
      }
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getBadgeStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-tertiary/10 text-tertiary';
      case 'warning':
        return 'bg-error/10 text-error';
      case 'error':
        return 'bg-error/10 text-error';
      case 'info':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-surface-variant text-on-surface-variant';
    }
  };

  return (
    <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md relative pb-24">
      {/* TopAppBar */}
      <header className="flex justify-between items-center pl-2 pr-4 w-full h-20 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="material-symbols-outlined text-primary hover:opacity-80 transition-opacity active:scale-95 duration-150 cursor-pointer"
          >
            arrow_back
          </button>
          <h1 className="text-sm font-bold text-primary">Notifications</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-4 space-y-4 max-w-md mx-auto w-full animate-fade-in">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline">
              <span className="material-symbols-outlined text-3xl">notifications_off</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-on-surface">No new notifications</h3>
              <p className="text-xs text-on-surface-variant mt-1">We will notify you when something needs your attention.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div 
                key={n._id} 
                onClick={() => handleNotificationClick(n)}
                className={`p-4 rounded-2xl border transition-all relative flex gap-3 cursor-pointer ${
                  n.isRead 
                    ? 'bg-surface-container-lowest border-outline-variant/30 opacity-75' 
                    : 'bg-white border-primary/20 shadow-sm'
                }`}
              >
                {/* Unread indicator */}
                {!n.isRead && (
                  <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-primary rounded-full"></span>
                )}

                {/* Badge Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getBadgeStyles(n.type)}`}>
                  <span className="material-symbols-outlined text-lg">{n.icon || 'notifications'}</span>
                </div>

                {/* Content */}
                <div className="flex-grow pr-4 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs text-on-surface">{n.title}</h4>
                  </div>
                  <p className="text-[10px] text-on-surface-variant leading-relaxed">{n.message}</p>
                  <span className="text-[9px] text-outline font-semibold block pt-1">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}
