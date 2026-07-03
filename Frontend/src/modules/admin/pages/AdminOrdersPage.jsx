import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [formData, setFormData] = useState({
    deliveryStatus: 'pending',
    trackingId: '',
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  // Auto-open modal if navigated from notifications
  useEffect(() => {
    if (orders.length > 0 && location.state?.openOrderId) {
      const targetOrder = orders.find(o => o._id === location.state.openOrderId);
      if (targetOrder) {
        openModal(targetOrder);
        // Clear state so it doesn't re-open on simple re-renders
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [orders, location.state, location.pathname, navigate]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(ENDPOINTS.ADMIN_ORDERS);
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    setFormData({
      deliveryStatus: order.deliveryStatus || 'pending',
      trackingId: order.trackingId || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(ENDPOINTS.ADMIN_ORDER_UPDATE(selectedOrder._id), formData);
      fetchOrders();
      closeModal();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    }
  };

  const handleQuickAction = async (status) => {
    try {
      await api.put(ENDPOINTS.ADMIN_ORDER_UPDATE(selectedOrder._id), { deliveryStatus: status, trackingId: formData.trackingId });
      fetchOrders();
      closeModal();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'accepted': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'returned': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#191b23]">Product Orders</h1>
      </div>

      <div className="bg-white rounded-2xl border border-[#c3c6d6]/30 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-[#516161]">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-[#516161]">
            <span className="material-symbols-outlined text-4xl mb-2 text-[#c3c6d6]">local_shipping</span>
            <p>No product orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#faf8ff] text-[#737685] border-b border-[#c3c6d6]/30">
                  <th className="px-6 py-4 font-bold">Order ID & Date</th>
                  <th className="px-6 py-4 font-bold">Customer</th>
                  <th className="px-6 py-4 font-bold">Product</th>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6d6]/20">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-[#f3f3fd]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#191b23]">{order.orderId}</div>
                      <div className="text-[10px] text-[#737685]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#191b23]">{order.userId?.fullName || 'Unknown'}</div>
                      <div className="text-[10px] text-[#737685]">{order.userId?.mobile || 'No mobile'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#191b23]">{order.productId?.name || order.productName}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#0c56d0]">
                      ₹{order.finalAmount}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.deliveryStatus)}`}>
                        {order.deliveryStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openModal(order)}
                        className="px-3 py-1.5 rounded-lg bg-[#f3f3fd] text-[#0052cc] font-semibold text-xs hover:bg-[#dae2ff] transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-6 py-4 border-b border-[#c3c6d6]/30 flex justify-between items-center bg-[#faf8ff]">
              <h2 className="text-lg font-bold text-[#191b23]">Manage Order: {selectedOrder.orderId}</h2>
              <button onClick={closeModal} className="material-symbols-outlined text-[#737685] hover:bg-[#f3f3fd] rounded-full p-1">close</button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 bg-[#f3f3fd] p-4 rounded-xl text-sm space-y-2 border border-[#003d9b]/10">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] text-[#737685] uppercase font-bold">Product</span>
                    <span className="font-semibold text-[#191b23]">{selectedOrder.productId?.name || selectedOrder.productName}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#737685] uppercase font-bold">Customer</span>
                    <span className="font-semibold text-[#191b23]">{selectedOrder.userId?.fullName}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[10px] text-[#737685] uppercase font-bold">Delivery Address</span>
                    <span className="text-[#516161]">{selectedOrder.deliveryAddress || 'No address provided'}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.deliveryStatus === 'pending' ? (
                <div className="space-y-4 mt-6">
                  <p className="text-sm text-center text-[#516161] mb-4">Please review the order details and choose to accept or reject it.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleQuickAction('rejected')}
                      className="flex-1 py-3 rounded-xl font-bold bg-[#fff0f0] text-[#cc0000] border border-[#ffcccc] hover:bg-[#ffe5e5] transition-colors"
                    >
                      Reject Order
                    </button>
                    <button
                      onClick={() => handleQuickAction('accepted')}
                      className="flex-1 py-3 rounded-xl font-bold bg-[#e6fcf5] text-[#0ca678] border border-[#b2f2bb] hover:bg-[#c3fae8] transition-colors"
                    >
                      Accept Order
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleStatusUpdate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#516161] uppercase tracking-wider mb-1">Delivery Status</label>
                    <select
                      value={formData.deliveryStatus}
                      onChange={(e) => setFormData({...formData, deliveryStatus: e.target.value})}
                      className="w-full px-4 py-2 border border-[#c3c6d6] rounded-xl focus:outline-none focus:border-[#0c56d0] text-sm"
                    >
                      <option value="accepted">Accepted</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="returned">Returned</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-[#516161] uppercase tracking-wider mb-1">Tracking ID</label>
                    <input
                      type="text"
                      value={formData.trackingId}
                      onChange={(e) => setFormData({...formData, trackingId: e.target.value})}
                      placeholder="e.g. AWB123456789"
                      className="w-full px-4 py-2 border border-[#c3c6d6] rounded-xl focus:outline-none focus:border-[#0c56d0] text-sm"
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-5 py-2 rounded-xl text-sm font-bold text-[#434654] hover:bg-[#f3f3fd] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-sm font-bold bg-[#0c56d0] text-white hover:bg-[#003d9b] shadow-sm transition-colors"
                    >
                      Update Order
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
