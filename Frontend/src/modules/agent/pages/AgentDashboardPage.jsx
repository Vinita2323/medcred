import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AgentDashboardPage() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Active Users', value: '142', icon: 'group', color: 'text-[#003d9b]', bg: 'bg-[#dae2ff]' },
    { label: 'Pending Approvals', value: '05', icon: 'pending_actions', color: 'text-[#7b2600]', bg: 'bg-[#ffdbcf]' },
    { label: 'Credit Disbursed', value: '₹28.5L', icon: 'payments', color: 'text-[#0c56d0]', bg: 'bg-[#d4e6e5]' },
    { label: 'My Commission', value: '₹18,450', icon: 'account_balance_wallet', color: 'text-green-700', bg: 'bg-green-100' },
  ];

  const quickActions = [
    { label: 'Onboard User', icon: 'person_add', route: '/agent/register' },
    { label: 'Apply Loan', icon: 'payments', route: '/agent/apply-loan' },
    { label: 'Submit Claim', icon: 'post_add', route: '/agent/customers' },
    { label: 'Support Desk', icon: 'support_agent', route: '/agent/profile' },
  ];

  const customerList = [
    { name: 'Arjun Mehta', id: 'MC-88219', relation: 'Self', age: '32 Years', status: 'Approved', limit: '₹5,00,000', photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5hPVSJVnDBeM_NU087CySc1Nj5JvsQumfiId7OJct49Qa77heLrFpiB7mj1ju2IDHI7keh9EIMKh7escMxoAAIkpZgceUPIECby_M8SvJoj4B-oZDrF749Dr0ocU1cIiWWL-pi7TS0ERiElEdVsXIMC7J27_GSeOc8SJ6U_ia4fwifb1YgB2FuLP9annHcDHXsjwbFeOFx1_gHuJ2l8k8P-OUbE00BppwZf28afD52_WGG_Dr4W9N6zzNmZxQqu2cWBHERgwSCrVL' },
    { name: 'Priya Mehta', id: 'MC-88220', relation: 'Spouse', age: '30 Years', status: 'Approved', limit: '₹3,00,000', photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKzpUBEs6q65rb5FuihZ4BcbkUZxrlLKjtU70Den4RgiicBIoE8OFnuHFaq0OWKiRKFq_xqbJnsj4k1uaQAJl53r2wMglpc_8ORni3N0aiQoLmp0oJfzkwca8uCeJrn8_m8dtGutdpckbcD9sUnr8_w9XOLXIeXfm80XTfgQ8AHP4yrHTW_X_rwfEBxFjHrNRLaY_4595EJd5wv6MYYEr34LFvb0T4JF3g-fV4RtMOncytABGaiKpLSCQVhbPMDlcLfHw9kyBY2gqJ' },
    { name: 'Kabir Mehta', id: 'MC-Pending', relation: 'Son', age: '4 Years', status: 'Pending Verification', limit: '—', photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhb0OIZiIExbXKGFMjW3BeHdb6QnL15jEuvmCkyecro3XwiW_ZaD3VjcS2a8epvQdSwOrtDHefPyxrBqTmy1PYtyjfiNYxQAgMtBhfc2U3ApBjrx61Jo3-6l8-xKmTnmMz4URqCTOELr8oSj1W9E7GuF5yzN2lndekjEKit6c4P-waj5ACZZPZNnkb7AU2-LjMUL0JLG9Shdhg9jUPsJBY64bZjJQN-ugOAttJXMbHblLiUb7qQtQ5rkvooQxKWzA0Fttt8ZLMsd_G' },
  ];

  return (
    <div className="bg-[#faf8ff] text-[#191b23] font-body-md min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-white shadow-sm border-b border-[#c3c6d6]/20">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#003d9b] text-2xl font-bold">medical_services</span>
          <h1 className="text-xl font-bold text-[#003d9b]">MedCred India</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-[#f3f3fd] transition-colors duration-200">
            <span className="material-symbols-outlined text-[#434654]">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-[#0052cc] flex items-center justify-center text-white font-bold overflow-hidden border border-primary/20">
            <img 
              alt="Agent Profile" 
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDd9ThGrfGVzkidmRPTIDI9rqsV9Mu7No1auYCUdjrLGKvR0chE5rKk5qXivEhGft-ssJ52oNhXZKIqadr7z0uPvL4E27WhBMSnOMELffRrGsIpt2535LoA_D7pCM0N0F1uPv0n9EfIIQdfHgf-yTt7AC-2qpI6HPwzyDq-eXE2q72CG0qs8fdSgGQw0F-BPWWbKOYbuU-mBlamu_eTKw6z_So_NHd-C0dhjwvgRDdxW3n1ETevc-mcG8Xn9dGFYWLfwK7gljabIChN"
            />
          </div>
        </div>
      </header>

      {/* Main Panel */}
      <main className="pt-24 px-4 max-w-4xl mx-auto space-y-8">
        {/* Banner Section */}
        <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="relative z-10 space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#ffdbcf]">Agent Workspace</span>
            <h2 className="text-xl md:text-2xl font-bold">Welcome back, Agent MC-9921</h2>
            <p className="text-sm opacity-90">Facilitate healthcare registrations, checkups, and claim verification in real-time.</p>
          </div>
        </section>

        {/* Stats Bento Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-[#c3c6d6]/20 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-full flex items-center justify-center mb-3`}>
                <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
              </div>
              <div>
                <p className="text-xs text-[#516161] font-semibold">{stat.label}</p>
                <p className="text-xl font-bold text-[#003d9b] mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Quick Actions Grid */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-[#191b23]">Quick Services</h3>
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            {quickActions.map((act, idx) => (
              <button 
                key={idx} 
                onClick={() => navigate(act.route)} 
                className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-[#c3c6d6]/20 active:scale-95 transition-all group hover:shadow-md shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-[#f3f3fd] text-[#003d9b] flex items-center justify-center group-hover:bg-[#003d9b] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[22px]">{act.icon}</span>
                </div>
                <span className="text-[11px] md:text-xs text-center font-bold text-[#434654]">{act.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Active Customer Leads */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-[#191b23]">Active Registrations</h3>
            <button onClick={() => navigate('/agent/customers')} className="text-sm font-bold text-[#0052cc] hover:underline">View All</button>
          </div>

          <div className="space-y-3">
            {customerList.map((customer, idx) => (
              <div key={idx} className="bg-white border border-[#c3c6d6]/30 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
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
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-white shadow-[0_-4px_15px_rgba(0,0,0,0.06)] border-t border-[#c3c6d6]/20">
        <div className="flex flex-col items-center justify-center text-[#003d9b] px-4 py-1 cursor-pointer">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          <span className="text-[10px] font-semibold">Dashboard</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#434654] px-4 py-1 cursor-pointer" onClick={() => navigate('/agent/register')}>
          <span className="material-symbols-outlined">person_add</span>
          <span className="text-[10px] font-semibold">Register</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#434654] px-4 py-1 cursor-pointer" onClick={() => navigate('/agent/customers')}>
          <span className="material-symbols-outlined">group</span>
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
