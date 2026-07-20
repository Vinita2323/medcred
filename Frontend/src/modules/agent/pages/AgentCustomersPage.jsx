import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { ENDPOINTS, SERVER_URL } from '../../../services/types';

export default function AgentCustomersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(ENDPOINTS.AGENT_CUSTOMERS);
      if (res.data?.success) {
        setCustomers(res.data.data.map(user => ({
          name: user.fullName,
          id: user.userId || 'Pending ID',
          relation: 'Self', // Backend currently doesn't store relation for primary
          age: user.mobile, // Fallback since age requires calculation
          status: user.kycStatus === 'verified' ? 'Approved' : 'Pending',
          limit: user.creditLimit != null ? `₹${user.creditLimit.toLocaleString('en-IN')}` : (user.planId ? 'Allocated' : '—'),
          commission: user.planId ? 'Earned' : 'Pending',
          photo: user.profilePhoto
            ? (user.profilePhoto.startsWith('http') || user.profilePhoto.startsWith('data:') 
                ? user.profilePhoto 
                : `${SERVER_URL}${user.profilePhoto.includes('/uploads') ? (user.profilePhoto.startsWith('/') ? user.profilePhoto : `/${user.profilePhoto}`) : `/uploads/${user.profilePhoto}`}`)
            : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' // Default user placeholder
        })));
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || c.status === activeTab;
    return matchesSearch && matchesTab;
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64 text-[#516161]">Loading customers...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sub Header / Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-[#516161] text-sm font-semibold">Manage and verify registered patient profiles</h3>
        </div>
        <button
          onClick={() => navigate('/agent/register-customer')}
          className="bg-[#003d9b] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#0052cc] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">person_add</span> Onboard User
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737685] group-focus-within:text-[#003d9b] transition-colors">search</span>
        <input
          className="w-full pl-12 pr-4 py-3 bg-[#ededf8] border border-[#c3c6d6]/40 rounded-xl focus:ring-2 focus:ring-[#003d9b] focus:border-transparent transition-all outline-none text-sm text-[#191b23]"
          placeholder="Search onboarded family members or ID..."
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tab Filters */}
      <div className="flex gap-2 border-b border-[#c3c6d6]/30 pb-2">
        {['All', 'Approved', 'Pending'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activeTab === tab
                ? 'bg-[#003d9b] text-white'
                : 'bg-white text-[#434654] border border-[#c3c6d6]/30 hover:bg-[#f3f3fd]'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Customer Directory List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer, idx) => (
            <div key={idx} className="bg-white border border-[#c3c6d6]/30 p-4 rounded-xl flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#dae2ff] p-0.5 flex-shrink-0">
                  <img 
                    alt={customer.name} 
                    className="w-full h-full object-cover rounded-full" 
                    src={customer.photo} 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'; }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#191b23]">{customer.name}</h4>
                    <span className="text-[10px] font-bold bg-[#dae2ff] text-[#003d9b] px-2 py-0.5 rounded-full">{customer.relation}</span>
                  </div>
                  <p className="text-xs text-[#516161] mt-0.5">ID: {customer.id} • {customer.age}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#c3c6d6]/20 pt-3">
                <div className="text-left">
                  <p className="text-[10px] text-[#737685] font-semibold uppercase">Credit Limit</p>
                  <p className="text-sm font-bold text-[#003d9b]">{customer.limit}</p>
                </div>
                <div className="text-left sm:text-center">
                  <p className="text-[10px] text-[#737685] font-semibold uppercase">Commission</p>
                  <p className={`text-sm font-bold ${customer.status === 'Approved' ? 'text-green-700' : 'text-orange-700'}`}>
                    {customer.commission}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${customer.status === 'Approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-orange-100 text-orange-800'
                  }`}>
                  {customer.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <span className="material-symbols-outlined text-4xl text-[#737685] mb-2">person_off</span>
            <p className="text-[#516161] text-sm font-semibold">No registered users match your search filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
