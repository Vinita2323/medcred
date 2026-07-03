import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

export default function AdminNotificationsPage() {
  const navigate = useNavigate();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(ENDPOINTS.ADMIN_ORDERS);
      if (res.data?.success) {
        setPendingOrders(res.data.data.filter(o => o.deliveryStatus === 'pending'));
      }
    } catch (err) {
      console.error('Failed to fetch orders for notifications');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner */}
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[11px] uppercase tracking-widest text-blue-200 font-bold">System Alerts</span>
          <h2 className="text-xl font-extrabold mt-1">Notification Center</h2>
          <p className="text-sm text-white/80 mt-1">Review and manage pending actions that require your attention.</p>
        </div>
      </section>

      <div className="space-y-5">
        {isLoading ? (
          <div className="p-8 text-center text-[#516161]">Checking for new alerts...</div>
        ) : pendingOrders.length > 0 ? (
          <div className="bg-[#fff4f4] border border-[#ffcccc] rounded-2xl p-5 shadow-sm max-w-4xl">
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
        ) : (
          <div className="p-12 text-center text-[#516161] bg-white rounded-2xl border border-[#c3c6d6]/30 shadow-sm max-w-4xl">
            <span className="material-symbols-outlined text-4xl mb-2 text-[#c3c6d6]">check_circle</span>
            <p>You're all caught up! No new notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
}
