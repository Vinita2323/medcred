import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STORAGE_KEYS, ENDPOINTS } from '../../../services/types';
import api from '../../../services/api';

export default function AgentProfilePage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetchAgentProfile();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get(ENDPOINTS.PLANS);
      if (response.data?.success) {
        setPlans(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchAgentProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(ENDPOINTS.AGENT_PROFILE);
      if (response.data.success) {
        setCurrentUser(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching agent profile:', error);
      const userJson = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (userJson) {
        setCurrentUser(JSON.parse(userJson));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post(ENDPOINTS.AUTH_LOGOUT);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      navigate('/agent/login');
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-[#516161]">
        Loading profile...
      </div>
    );
  }

  // Determine ranking badge details
  const getRankBadgeInfo = (rank) => {
    switch (rank) {
      case 'Platinum':
        return { label: 'Platinum Partner', style: 'bg-purple-100 text-purple-800 border-purple-300', desc: 'Top Tier override of 4.5% network sales.' };
      case 'Gold':
        return { label: 'Gold Partner', style: 'bg-yellow-100 text-yellow-800 border-yellow-300', desc: 'Overriding commissions of 3.0% network sales.' };
      case 'Silver':
        return { label: 'Silver Partner', style: 'bg-gray-100 text-gray-800 border-gray-300', desc: 'Standard 2.5% commission override.' };
      default:
        return { label: 'Bronze Partner', style: 'bg-amber-100 text-amber-800 border-amber-300', desc: 'Entry rank. Upgrade by generating sales & referrals.' };
    }
  };

  const badge = getRankBadgeInfo(currentUser.rank);

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      {/* Profile summary card */}
      <section className="bg-white border border-[#c3c6d6]/30 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#dae2ff] p-0.5 shadow-md flex-shrink-0 bg-[#003d9b]/10 flex items-center justify-center text-3xl font-bold text-[#003d9b]">
          {currentUser.fullName.charAt(0)}
        </div>
        <div className="flex-grow text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
            <h2 className="text-xl font-bold text-[#191b23]">{currentUser.fullName}</h2>
            <span className={`text-xs font-semibold px-3 py-0.5 rounded-full border ${badge.style} inline-block w-max mx-auto sm:mx-0`}>
              {badge.label}
            </span>
          </div>
          <p className="text-xs text-[#516161]">
            Designation: <strong className="text-[#003d9b]">{currentUser.role}</strong> • 
            Status: <strong className="text-green-700">{currentUser.status}</strong>
          </p>
          <p className="text-[11px] text-[#737685]">{badge.desc}</p>
        </div>
      </section>

      {/* Network & Hierarchy Details */}
      <section className="bg-white border border-[#c3c6d6]/30 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-[#191b23] border-b border-[#c3c6d6]/20 pb-2 flex items-center gap-2 text-sm">
          <span className="material-symbols-outlined text-[#003d9b] text-[18px]">partner_exchange</span>
          <span>Hierarchy &amp; Referral Details</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between border-b border-[#faf8ff] pb-2 md:border-none">
            <span className="text-[#516161]">Agent ID</span>
            <span className="font-mono font-bold text-[#003d9b]">{currentUser.agentId || 'PENDING'}</span>
          </div>
          <div className="flex justify-between border-b border-[#faf8ff] pb-2 md:border-none">
            <span className="text-[#516161]">Reporting Manager</span>
            <span className="font-semibold">{currentUser.reportingManagerName || 'System Administrator'}</span>
          </div>
          <div className="flex justify-between border-b border-[#faf8ff] pb-2 md:border-none">
            <span className="text-[#516161]">Referral Code</span>
            <span className="font-mono font-bold text-[#0c56d0]">{currentUser.referralCode || '—'}</span>
          </div>
          <div className="flex justify-between border-b border-[#faf8ff] pb-2 md:border-none">
            <span className="text-[#516161]">Base Commission Percentage</span>
            <span className="font-semibold text-green-700">{currentUser.commissionRate}%</span>
          </div>
          <div className="flex justify-between border-b border-[#faf8ff] pb-2 md:border-none col-span-1 md:col-span-2">
            <span className="text-[#516161]">Onboarding Network Level</span>
            <span className="font-semibold text-xs text-[#003d9b] bg-[#dae2ff] px-2.5 py-0.5 rounded-full">
              {currentUser.role === 'Super Agent' ? 'Level 1 Network Coordinator' : currentUser.role === 'Agent' ? 'Level 2 Squad Lead' : 'Level 3 Field Representative'}
            </span>
          </div>
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
              Earned when customers apply your Referral Code during membership purchase.
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

      {/* Account Details */}
      <section className="bg-white border border-[#c3c6d6]/30 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-[#191b23] border-b border-[#c3c6d6]/20 pb-2 flex items-center gap-2 text-sm">
          <span className="material-symbols-outlined text-[#003d9b] text-[18px]">domain</span>
          <span>General Info</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between border-b border-[#faf8ff] pb-2 md:border-none">
            <span className="text-[#516161]">Mobile Registered</span>
            <span className="font-semibold">{currentUser.mobileNumber}</span>
          </div>
          <div className="flex justify-between border-b border-[#faf8ff] pb-2 md:border-none">
            <span className="text-[#516161]">Email Address</span>
            <span className="font-semibold">{currentUser.email}</span>
          </div>
          <div className="flex justify-between border-b border-[#faf8ff] pb-2 md:border-none">
            <span className="text-[#516161]">Joined Date</span>
            <span className="font-semibold">{currentUser.joiningDate || 'June 11, 2026'}</span>
          </div>
          <div className="flex justify-between border-b border-[#faf8ff] pb-2 md:border-none">
            <span className="text-[#516161]">Aadhaar Number</span>
            <span className="font-mono text-xs">{currentUser.aadhaarNumber || 'XXXXXXXX9921'}</span>
          </div>
        </div>
      </section>

      {/* Account Settings Menu */}
      <section className="bg-white border border-[#c3c6d6]/30 rounded-2xl p-4 shadow-sm space-y-1">
        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#f3f3fd] transition-colors text-left text-sm group cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#516161] group-hover:text-[#003d9b]">security</span>
            <span className="font-semibold">Vault Security Settings</span>
          </div>
          <span className="material-symbols-outlined text-[#737685]">chevron_right</span>
        </button>
        
        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#f3f3fd] transition-colors text-left text-sm group cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#516161] group-hover:text-[#003d9b]">payments</span>
            <span className="font-semibold">Payout Account Info</span>
          </div>
          <span className="material-symbols-outlined text-[#737685]">chevron_right</span>
        </button>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 text-left text-sm group cursor-pointer"
        >
          <div className="flex items-center gap-3 text-red-600">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-semibold">Sign Out Portal</span>
          </div>
          <span className="material-symbols-outlined text-[#737685]">chevron_right</span>
        </button>
      </section>
    </div>
  );
}
