import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

export default function AdminMembershipOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('All');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(ENDPOINTS.ADMIN_MEMBERSHIP_ORDERS);
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching membership orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanColor = (planName) => {
    const name = planName?.toLowerCase() || '';
    if (name.includes('silver')) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (name.includes('gold')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (name.includes('platinum') || name.includes('premium')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const filteredOrders = orders.filter((order) => {
    const q = search.toLowerCase();
    const matchesSearch = 
      !q || 
      order.orderId.toLowerCase().includes(q) ||
      (order.userId?.fullName || '').toLowerCase().includes(q) ||
      (order.userId?.mobile || '').toLowerCase().includes(q) ||
      (order.referralCode || '').toLowerCase().includes(q) ||
      (order.agentId?.fullName || '').toLowerCase().includes(q);

    const matchesPlan = filterPlan === 'All' || (order.planName || '').toLowerCase() === filterPlan.toLowerCase();
    return matchesSearch && matchesPlan;
  });

  const uniquePlans = ['All', ...new Set(orders.map((o) => o.planName).filter(Boolean))];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner */}
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[11px] uppercase tracking-widest text-blue-200 font-bold">Sales &amp; Cards</span>
          <h2 className="text-xl font-extrabold mt-1">Membership Card</h2>
          <p className="text-sm text-white/80 mt-1">Monitor all digital card sales, plan subscriptions, and referral agent track records.</p>
        </div>
      </section>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 border border-[#c3c6d6]/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent bg-white shadow-sm"
            placeholder="Search orders, customers, code, agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-xs text-[#737685]">search</span>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            className="w-full sm:w-auto px-4 py-2 bg-white border border-[#c3c6d6]/60 rounded-xl text-sm font-semibold text-[#434654] focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
          >
            {uniquePlans.map((plan) => (
              <option key={plan} value={plan}>{plan}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders list table */}
      <div className="bg-white rounded-2xl border border-[#c3c6d6]/30 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-[#516161]">Loading membership orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-[#516161]">
            <span className="material-symbols-outlined text-4xl mb-2 text-[#c3c6d6]">credit_card</span>
            <p>No membership card purchases found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#faf8ff] text-[#737685] border-b border-[#c3c6d6]/30">
                  <th className="px-6 py-4 font-bold">Order ID &amp; Date</th>
                  <th className="px-6 py-4 font-bold">Customer Details</th>
                  <th className="px-6 py-4 font-bold">Membership Plan</th>
                  <th className="px-6 py-4 font-bold">Amount Paid</th>
                  <th className="px-6 py-4 font-bold">Referral Agent</th>
                  <th className="px-6 py-4 font-bold">Payment</th>
                  <th className="px-6 py-4 font-bold">Card Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6d6]/20">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-[#f3f3fd]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#191b23]">{order.orderId}</div>
                      <div className="text-[10px] text-[#737685]">
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#191b23]">{order.userId?.fullName || 'Unknown'}</div>
                      <div className="text-[10px] text-[#737685]">{order.userId?.mobile || 'No mobile'}</div>
                      <div className="text-[10px] text-[#737685]">{order.userId?.email || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPlanColor(order.planName)}`}>
                        {order.planName || 'Membership'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-[#0c56d0]">
                      ₹{order.finalAmount?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td className="px-6 py-4">
                      {order.referralCode ? (
                        <div>
                          <div className="font-semibold text-[#191b23]">{order.agentId?.fullName || 'Referred Agent'}</div>
                          <div className="text-[10px] text-[#737685]">Code: <strong className="text-[#003d9b]">{order.referralCode.toUpperCase()}</strong></div>
                          {order.agentId?.agentId && (
                            <div className="text-[9px] text-[#737685]">ID: {order.agentId.agentId}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Direct Purchase</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className={`inline-block text-center w-fit px-2 py-0.5 rounded text-[9px] font-bold uppercase ${order.paymentStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {order.paymentStatus || 'pending'}
                        </span>
                        {order.paymentMethod && (
                          <span className="text-[9px] font-medium text-[#737685] uppercase">
                            via {order.paymentMethod}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block text-center w-fit px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${order.cardStatus === 'active' ? 'bg-green-50 text-green-700 border-green-200' : order.cardStatus === 'expired' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                        {order.cardStatus || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
