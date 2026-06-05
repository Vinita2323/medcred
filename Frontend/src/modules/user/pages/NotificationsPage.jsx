import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/Navigation/BottomNavBar';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Claim Approved & Settled',
      description: "Your claim of ₹45,000 for Priya Mehta's dental surgery has been successfully approved and settled with the hospital.",
      time: '2 hours ago',
      type: 'success',
      read: false,
      icon: 'check_circle'
    },
    {
      id: 2,
      title: 'Monthly EMI Due',
      description: 'Your monthly interest-free repayment of ₹4,200 is due in 3 days. Autopay will execute on the due date.',
      time: '1 day ago',
      type: 'warning',
      read: false,
      icon: 'calendar_month'
    },
    {
      id: 3,
      title: 'New Member Added',
      description: 'Rohan Mehta (Son) has been successfully verified via Aadhaar e-KYC and added to your Family Health Passport.',
      time: '2 days ago',
      type: 'info',
      read: true,
      icon: 'person_add'
    },
    {
      id: 4,
      title: 'KYC Verification Complete',
      description: 'Aadhaar e-KYC verification for Arjun Mehta was completed successfully. Your medical limit is active.',
      time: '5 days ago',
      type: 'success',
      read: true,
      icon: 'verified'
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getBadgeStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-tertiary/10 text-tertiary';
      case 'warning':
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
        {notifications.some(n => !n.read) && (
          <button 
            onClick={markAllAsRead}
            className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-4 space-y-4 max-w-md mx-auto w-full animate-fade-in">
        {notifications.length === 0 ? (
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
                key={n.id} 
                className={`p-4 rounded-2xl border transition-all relative flex gap-3 ${
                  n.read 
                    ? 'bg-surface-container-lowest border-outline-variant/30 opacity-75' 
                    : 'bg-white border-primary/20 shadow-sm'
                }`}
              >
                {/* Unread indicator */}
                {!n.read && (
                  <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-primary rounded-full"></span>
                )}

                {/* Badge Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getBadgeStyles(n.type)}`}>
                  <span className="material-symbols-outlined text-lg">{n.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-grow pr-4 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs text-on-surface">{n.title}</h4>
                  </div>
                  <p className="text-[10px] text-on-surface-variant leading-relaxed">{n.description}</p>
                  <span className="text-[9px] text-outline font-semibold block pt-1">{n.time}</span>
                </div>

                {/* Delete button */}
                <button 
                  onClick={() => deleteNotification(n.id)}
                  className="absolute bottom-4 right-4 text-outline hover:text-error transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}
