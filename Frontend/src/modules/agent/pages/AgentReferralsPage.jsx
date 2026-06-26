import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { ENDPOINTS, STORAGE_KEYS } from '../../../services/types';

export default function AgentReferralsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (userJson) {
      setCurrentUser(JSON.parse(userJson));
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Fetch Plans
      const plansRes = await api.get(ENDPOINTS.PLANS);
      if (plansRes.data?.success) {
        setPlans(plansRes.data.data);
      }

      // Fetch Referrals
      const refRes = await api.get(ENDPOINTS.AGENT_REFERRALS);
      if (refRes.data?.success) {
        setReferrals(refRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching refer & earn data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-[#516161]">
        Loading Refer & Earn details...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-[#516161]">
        User session not found
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Page Header banner */}
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="relative z-10 space-y-1">
          <span className="text-xs uppercase tracking-widest text-[#ffdbcf] font-bold">Rewards</span>
          <h2 className="text-xl md:text-2xl font-bold">Refer &amp; Earn</h2>
          <p className="text-xs opacity-90 max-w-xl">
            Share your unique referral code <strong>{currentUser.referralCode}</strong> to earn commissions when customers purchase memberships.
          </p>
        </div>
      </section>

      {/* Card Commission Rates */}
      {plans.length > 0 && (
        <section className="bg-white border border-[#c3c6d6]/30 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-[#c3c6d6]/20 pb-3">
            <h3 className="font-bold text-[#191b23] flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-[#003d9b] text-[18px]">percent</span>
              <span>Card Selling Commissions</span>
            </h3>
            <p className="text-[11px] text-[#737685] mt-1 ml-6">
              You earn the following percentage of the card price when a customer uses your referral code.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {plans.map((plan) => {
              let rate = 0;
              if (currentUser.role === 'Field Agent') rate = plan.fieldAgentCommissionPct || 12;
              else if (currentUser.role === 'Agent') rate = plan.agentCommissionPct || 4;
              else if (currentUser.role === 'Super Agent') rate = plan.superAgentCommissionPct || 3;
              
              return (
                <div key={plan.planId} className="bg-[#f3f3fd] rounded-xl p-4 flex flex-col items-center justify-center text-center border border-[#003d9b]/10">
                  <p className="text-[#516161] font-semibold text-xs uppercase tracking-wider mb-1">{plan.name}</p>
                  <p className="text-2xl font-extrabold text-[#0c56d0]">{rate}%</p>
                  <p className="text-[10px] text-[#737685] mt-1">Per {plan.name} Card Sold</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Successful Referrals List */}
      <section className="bg-white border border-[#c3c6d6]/30 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#c3c6d6]/20 pb-4 mb-2">
          <h3 className="font-bold text-[#191b23] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003d9b]">groups</span>
            Successful Referrals
          </h3>
          <span className="bg-[#003d9b]/10 text-[#003d9b] px-3 py-1 rounded-full text-xs font-bold">
            Total: {referrals.length}
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#faf8ff] text-[#737685] text-xs font-bold border-b border-[#c3c6d6]/20">
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Plan Purchased</th>
                <th className="px-6 py-4">Card Price</th>
                <th className="px-6 py-4">Purchase Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6d6]/10">
              {referrals.length > 0 ? (
                referrals.map((card, idx) => (
                  <tr key={idx} className="hover:bg-[#faf8ff]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-[#003d9b]/10 bg-[#dae2ff] flex items-center justify-center text-[#003d9b] font-bold">
                          {card.userId?.fullName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div className="font-bold text-[#191b23]">{card.userId?.fullName || 'Unknown Customer'}</div>
                          <div className="text-[10px] text-[#737685] font-mono mt-0.5">{card.userId?.mobile || 'No mobile'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                        {card.planName}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#191b23]">
                      ₹{card.purchasePrice?.toLocaleString('en-IN') || '—'}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-[#516161]">
                      {card.purchasedAt ? new Date(card.purchasedAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-[#516161]">
                    <span className="material-symbols-outlined text-4xl mb-2 text-[#737685]">person_off</span>
                    <p className="text-sm">No customers have purchased a membership with your referral code yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
