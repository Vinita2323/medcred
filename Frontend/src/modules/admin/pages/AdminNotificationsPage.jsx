import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

export default function AdminNotificationsPage() {
  const navigate = useNavigate();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Pending Orders
      const orderRes = await api.get(ENDPOINTS.ADMIN_ORDERS);
      if (orderRes.data?.success) {
        setPendingOrders(orderRes.data.data.filter(o => o.deliveryStatus === 'pending'));
      }

      // Fetch System Notifications
      const notifRes = await api.get('/admin/notifications');
      if (notifRes.data?.success) {
        setNotifications(notifRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await api.patch(`/admin/notifications/${id}/read`);
      if (res.data?.success) {
        setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      }
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Banner */}
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[11px] uppercase tracking-widest text-blue-200 font-bold">System Alerts</span>
          <h2 className="text-xl font-extrabold mt-1">Notification Center</h2>
          <p className="text-sm text-white/80 mt-1">Review and manage pending actions and platform alerts.</p>
        </div>
      </section>

      <div className="space-y-5">
        {isLoading ? (
          <div className="p-8 text-center text-[#516161]">Loading notifications...</div>
        ) : (
          <>
            {/* Pending Orders Section */}
            {pendingOrders.length > 0 && (
              <div className="bg-[#fff4f4] border border-[#ffcccc] rounded-2xl p-5 shadow-sm">
                <h3 className="font-extrabold text-[#cc0000] mb-3 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                  Action Required: {pendingOrders.length} Pending Order{pendingOrders.length > 1 ? 's' : ''}
                </h3>
                <div className="space-y-2">
                  {pendingOrders.map(order => (
                    <div
                      key={order._id}
                      onClick={() => navigate('/admin/orders', { state: { openOrderId: order._id } })}
                      className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#ffcccc] hover:bg-[#ffe5e5] cursor-pointer transition-colors shadow-sm"
                    >
                      <div>
                        <p className="text-xs font-bold text-[#191b23]">New Order: {order.orderId}</p>
                        <p className="text-[10px] text-[#516161]">From: {order.userId?.fullName || 'Customer'}</p>
                      </div>
                      <span className="material-symbols-outlined text-[#cc0000] text-sm">chevron_right</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* General System Notifications Section */}
            <div className="bg-white border border-[#c3c6d6]/30 rounded-2xl p-5 shadow-sm">
              <h3 className="font-extrabold text-[#191b23] mb-4 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#0052cc]">notifications</span>
                System Notifications
              </h3>
              
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map(notification => (
                    <div
                      key={notification._id}
                      onClick={() => !notification.isRead && markAsRead(notification._id)}
                      className={`flex gap-3 p-4 rounded-xl border transition-colors shadow-sm cursor-pointer ${
                        notification.isRead
                          ? 'bg-gray-50/50 border-gray-100'
                          : 'bg-white border-blue-100 hover:bg-blue-50/30'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        notification.isRead ? 'bg-gray-200 text-gray-500' : 
                        notification.type === 'success' ? 'bg-green-100 text-green-600' :
                        notification.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                        notification.type === 'error' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <span className="material-symbols-outlined text-[20px]">{notification.icon || 'notifications'}</span>
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <h4 className={`text-sm font-bold truncate ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                            {notification.title}
                          </h4>
                          <span className="text-[10px] text-gray-500 shrink-0 mt-0.5 whitespace-nowrap">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className={`text-xs ${notification.isRead ? 'text-gray-500' : 'text-gray-700 font-medium'} leading-relaxed`}>
                          {notification.message}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-[#516161]">
                  <p>No recent notifications.</p>
                </div>
              )}
            </div>
            
            {pendingOrders.length === 0 && notifications.length === 0 && (
              <div className="p-12 text-center text-[#516161] bg-white rounded-2xl border border-[#c3c6d6]/30 shadow-sm">
                <span className="material-symbols-outlined text-4xl mb-2 text-[#c3c6d6]">check_circle</span>
                <p>You're all caught up! No new notifications.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
