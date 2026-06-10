import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AgentCustomersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const customers = [
    { name: 'Arjun Mehta', id: 'MC-88219', relation: 'Self', age: '32 Years', status: 'Approved', limit: '₹5,00,000', photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5hPVSJVnDBeM_NU087CySc1Nj5JvsQumfiId7OJct49Qa77heLrFpiB7mj1ju2IDHI7keh9EIMKh7escMxoAAIkpZgceUPIECby_M8SvJoj4B-oZDrF749Dr0ocU1cIiWWL-pi7TS0ERiElEdVsXIMC7J27_GSeOc8SJ6U_ia4fwifb1YgB2FuLP9annHcDHXsjwbFeOFx1_gHuJ2l8k8P-OUbE00BppwZf28afD52_WGG_Dr4W9N6zzNmZxQqu2cWBHERgwSCrVL' },
    { name: 'Priya Mehta', id: 'MC-88220', relation: 'Spouse', age: '30 Years', status: 'Approved', limit: '₹3,00,000', photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKzpUBEs6q65rb5FuihZ4BcbkUZxrlLKjtU70Den4RgiicBIoE8OFnuHFaq0OWKiRKFq_xqbJnsj4k1uaQAJl53r2wMglpc_8ORni3N0aiQoLmp0oJfzkwca8uCeJrn8_m8dtGutdpckbcD9sUnr8_w9XOLXIeXfm80XTfgQ8AHP4yrHTW_X_rwfEBxFjHrNRLaY_4595EJd5wv6MYYEr34LFvb0T4JF3g-fV4RtMOncytABGaiKpLSCQVhbPMDlcLfHw9kyBY2gqJ' },
    { name: 'Kabir Mehta', id: 'MC-Pending', relation: 'Son', age: '4 Years', status: 'Pending', limit: '—', photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhb0OIZiIExbXKGFMjW3BeHdb6QnL15jEuvmCkyecro3XwiW_ZaD3VjcS2a8epvQdSwOrtDHefPyxrBqTmy1PYtyjfiNYxQAgMtBhfc2U3ApBjrx61Jo3-6l8-xKmTnmMz4URqCTOELr8oSj1W9E7GuF5yzN2lndekjEKit6c4P-waj5ACZZPZNnkb7AU2-LjMUL0JLG9Shdhg9jUPsJBY64bZjJQN-ugOAttJXMbHblLiUb7qQtQ5rkvooQxKWzA0Fttt8ZLMsd_G' },
    { name: 'Amit Sharma', id: 'MC-88241', relation: 'Self', age: '45 Years', status: 'Approved', limit: '₹7,50,000', photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiKJW2DwicGwVFGEPOIuISr_9oRHJdfzm4rKhqJ8nVaIDcploG0BYyeMGoNAHUPKksq5Seq0DEyclaijLPj_Q3HmGahdT4enf-WDdO4GZWvYwIc5-8HlpiedNT1OOe6nZ9j94jfvnmgajZKVmIkX8VNrCa694IsyaoXn8aKfwd-HkrUIQgoZ_eXH6WqiZgPbehBVZcUpJYypFavSnrVrSQw0-oGzyPrjnKJCPAyoFymsQsHkiHUf3j-ARLfpoAsPMZMownl1vB0Nc9' },
    { name: 'Ritu Sharma', id: 'MC-Pending', relation: 'Spouse', age: '42 Years', status: 'Pending', limit: '—', photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfGafFkI5X5GjnTKk_KGP31CI1eYIoGqf_xX3fvKphsWFQCh273kJSmgrUddVGWwWRXRsgpqLlFfASJCEra9a_LpluOPdonlNEY8Cg_1NZTc-KG4kbm1RiB3PBNYTozG_lRVxPKeSTCnpA1rrDrrSwCvuMyUqJ4f0R5LcchZNEpgT5X7yjk5hMXkTECRVYdt52x0j7TLW1hrHv7IpsJXPfvbello8M9C7XCauV7i2QM9bYRNgDh-oB3bb0ksTa5dHpCwRlzI1ZvhSg' }
  ];

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || c.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="bg-[#faf8ff] text-[#191b23] font-body-md min-h-screen pb-24">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-white shadow-sm border-b border-[#c3c6d6]/20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/agent/dashboard')} className="material-symbols-outlined text-[#003d9b] p-1 rounded-full hover:bg-[#f3f3fd] transition-colors">
            arrow_back
          </button>
          <h1 className="text-xl font-bold text-[#003d9b]">Customer Directory</h1>
        </div>
        <button 
          onClick={() => navigate('/agent/register')}
          className="bg-[#003d9b] text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-[#0052cc] transition-colors flex items-center gap-1 shadow-sm"
        >
          <span className="material-symbols-outlined text-xs">add</span> Add
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-4 max-w-4xl mx-auto space-y-6">
        {/* Search Bar */}
        <div className="relative group mt-4">
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
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === tab 
                  ? 'bg-[#003d9b] text-white' 
                  : 'bg-white text-[#434654] border border-[#c3c6d6]/30 hover:bg-[#f3f3fd]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Customer Directory List */}
        <div className="space-y-4">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer, idx) => (
              <div key={idx} className="bg-white border border-[#c3c6d6]/30 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow relative">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#dae2ff] p-0.5 flex-shrink-0">
                    <img alt={customer.name} className="w-full h-full object-cover rounded-full" src={customer.photo} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-[#191b23]">{customer.name}</h4>
                      <span className="text-[10px] font-bold bg-[#dae2ff] text-[#003d9b] px-2 py-0.5 rounded-full">{customer.relation}</span>
                    </div>
                    <p className="text-xs text-[#516161] mt-0.5">ID: {customer.id} • {customer.age}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] text-[#737685] font-semibold uppercase">Credit Limit</p>
                    <p className="text-sm font-bold text-[#003d9b]">{customer.limit}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    customer.status === 'Approved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800 animate-pulse'
                  }`}>
                    {customer.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-[#737685] mb-2">person_off</span>
              <p className="text-[#516161] text-sm font-semibold">No registered users match your search filters.</p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-white shadow-[0_-4px_15px_rgba(0,0,0,0.06)] border-t border-[#c3c6d6]/20">
        <div className="flex flex-col items-center justify-center text-[#434654] px-4 py-1 cursor-pointer" onClick={() => navigate('/agent/dashboard')}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-semibold">Dashboard</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#434654] px-4 py-1 cursor-pointer" onClick={() => navigate('/agent/register')}>
          <span className="material-symbols-outlined">person_add</span>
          <span className="text-[10px] font-semibold">Register</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#003d9b] px-4 py-1 cursor-pointer">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
          <span className="text-[10px] font-semibold">Users</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#434654] px-4 py-1 cursor-pointer" onClick={() => navigate('/agent/profile')}>
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-[10px] font-semibold">Profile</span>
        </div>
      </nav>
    </div>
  );
}
