import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AgentDashboardPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState([]);
  const [quickActions, setQuickActions] = useState([]);

  useEffect(() => {
    // Get current logged-in agent session
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const userObj = JSON.parse(userJson);
      setCurrentUser(userObj);

      // Load agents list to aggregate dynamic stats
      const agentsJson = localStorage.getItem('medcred_agents');
      const allAgents = agentsJson ? JSON.parse(agentsJson) : [];
      setAgents(allAgents);

      // Customize stats and quick actions based on designation
      if (userObj.role === 'Admin') {
        const pendingCount = allAgents.filter(a => a.status === 'Pending Approval').length;
        const approvedCount = allAgents.filter(a => a.status === 'Approved').length;

        setStats([
          { label: 'Active Roster', value: approvedCount.toString(), icon: 'group', color: 'text-[#003d9b]', bg: 'bg-[#dae2ff]', route: '/agent/admin' },
          { label: 'Pending Approvals', value: pendingCount.toString(), icon: 'how_to_reg', color: 'text-[#7b2600]', bg: 'bg-[#ffdbcf]', route: '/agent/admin' },
          { label: 'Active Teams', value: allAgents.filter(a => a.role === 'Agent').length.toString(), icon: 'partner_exchange', color: 'text-[#0c56d0]', bg: 'bg-[#d4e6e5]', route: '/agent/admin' },
          { label: 'Dynamic Plans', value: '3 Active', icon: 'payments', color: 'text-green-700', bg: 'bg-green-100', route: '/agent/admin' },
        ]);

        setQuickActions([
          { label: 'Review Approvals', icon: 'how_to_reg', route: '/agent/admin' },
          { label: 'Commission Engine', icon: 'account_balance_wallet', route: '/agent/admin' },
          { label: 'Manage Roster', icon: 'badge', route: '/agent/admin' },
          { label: 'Admin Settings', icon: 'admin_panel_settings', route: '/agent/profile' },
        ]);
      } else if (userObj.role === 'Super Agent') {
        const tls = allAgents.filter(a => a.role === 'Agent' && a.reportingManager === userObj.fullName);
        const fas = allAgents.filter(a => a.role === 'Field Agent' && tls.map(t => t.fullName).includes(a.reportingManager));

        setStats([
          { label: 'Agents', value: tls.length.toString(), icon: 'partner_exchange', color: 'text-[#003d9b]', bg: 'bg-[#dae2ff]', route: '/agent/team' },
          { label: 'Field Agents', value: fas.length.toString(), icon: 'badge', color: 'text-[#0c56d0]', bg: 'bg-[#d4e6e5]', route: '/agent/team' },
          { label: 'Network Sales', value: '₹8.4L', icon: 'payments', color: 'text-[#7b2600]', bg: 'bg-[#ffdbcf]' },
          { label: 'Overriding Earnings', value: `₹${userObj.earnings.toLocaleString('en-IN')}`, icon: 'account_balance_wallet', color: 'text-green-700', bg: 'bg-green-100', route: '/agent/wallet' },
        ]);

        setQuickActions([
          { label: 'Manage Team', icon: 'group', route: '/agent/team' },
          { label: 'Network Performance', icon: 'insights', route: '/agent/team' },
          { label: 'Wallet Payouts', icon: 'account_balance', route: '/agent/wallet' },
          { label: 'Support Desk', icon: 'support_agent', route: '/agent/profile' },
        ]);
      } else if (userObj.role === 'Agent') {
        const fas = allAgents.filter(a => a.role === 'Field Agent' && a.reportingManager === userObj.fullName);

        setStats([
          { label: 'Field Agents Managed', value: fas.length.toString(), icon: 'badge', color: 'text-[#003d9b]', bg: 'bg-[#dae2ff]', route: '/agent/team' },
          { label: 'Active Leads', value: (fas.length * 8).toString(), icon: 'group', color: 'text-[#0c56d0]', bg: 'bg-[#d4e6e5]', route: '/agent/team' },
          { label: 'Team Revenue', value: '₹2.1L', icon: 'payments', color: 'text-[#7b2600]', bg: 'bg-[#ffdbcf]' },
          { label: 'My Override', value: `₹${userObj.earnings.toLocaleString('en-IN')}`, icon: 'account_balance_wallet', color: 'text-green-700', bg: 'bg-green-100', route: '/agent/wallet' },
        ]);

        setQuickActions([
          { label: 'My Agents', icon: 'group', route: '/agent/team' },
          { label: 'Commission Wallet', icon: 'account_balance_wallet', route: '/agent/wallet' },
          { label: 'Apply Loan', icon: 'payments', route: '/agent/apply-loan' },
          { label: 'Support Desk', icon: 'support_agent', route: '/agent/profile' },
        ]);
      } else {
        // Field Agent
        setStats([
          { label: 'Onboarded Clients', value: userObj.salesCount.toString(), icon: 'group', color: 'text-[#003d9b]', bg: 'bg-[#dae2ff]', route: '/agent/customers' },
          { label: 'Subscriptions Sold', value: userObj.salesCount.toString(), icon: 'verified_user', color: 'text-[#0c56d0]', bg: 'bg-[#d4e6e5]', route: '/agent/customers' },
          { label: 'Total Revenue', value: `₹${(userObj.salesCount * 50000).toLocaleString('en-IN')}`, icon: 'payments', color: 'text-[#7b2600]', bg: 'bg-[#ffdbcf]' },
          { label: 'Wallet Earnings', value: `₹${userObj.earnings.toLocaleString('en-IN')}`, icon: 'account_balance_wallet', color: 'text-green-700', bg: 'bg-green-100', route: '/agent/wallet' },
        ]);

        setQuickActions([
          { label: 'Onboard Customer', icon: 'person_add', route: '/agent/register-customer' },
          { label: 'Apply Loan', icon: 'payments', route: '/agent/apply-loan' },
          { label: 'Customer Directory', icon: 'group', route: '/agent/customers' },
          { label: 'My Wallet', icon: 'account_balance_wallet', route: '/agent/wallet' },
        ]);
      }
    }
  }, []);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-[#516161]">
        Loading your agent dashboard...
      </div>
    );
  }

  // Fetch pending registrations for Admin list
  const pendingRegistrations = agents.filter(a => a.status === 'Pending Approval');
  
  // Fetch team list for Super Agent / Agent
  const getSubordinateAgents = () => {
    if (currentUser.role === 'Super Agent') {
      const tls = agents.filter(a => a.role === 'Agent' && a.reportingManager === currentUser.fullName);
      return tls;
    }
    if (currentUser.role === 'Agent') {
      const fas = agents.filter(a => a.role === 'Field Agent' && a.reportingManager === currentUser.fullName);
      return fas;
    }
    return [];
  };

  const subordinateList = getSubordinateAgents();

  const mockActivities = [
    { title: 'New Customer Onboarded', desc: 'Amit Patel registered Priya Mehta successfully.', time: '10 mins ago', icon: 'person_add', bg: 'bg-[#dae2ff]', text: 'text-[#003d9b]' },
    { title: 'Commission Credited', desc: '₹4,500 override credited for Sanjay Dutt\'s sale.', time: '2 hours ago', icon: 'payments', bg: 'bg-green-100', text: 'text-green-700' },
    { title: 'Rank Promoted', desc: 'Amit Patel promoted to Silver Agent tier.', time: '1 day ago', icon: 'stars', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Banner */}
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="relative z-10 space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#ffdbcf] font-bold">
            {currentUser.role} Dashboard
          </span>
          <h2 className="text-xl md:text-2xl font-bold">Welcome back, {currentUser.fullName}</h2>
          <p className="text-sm opacity-90 max-w-xl">
            {currentUser.role === 'Admin' 
              ? 'Oversee the MedCred agent network, audit payouts, and configure plan commissions.' 
              : `Access your hierarchy controls, client registrations, and override logs.`}
          </p>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            onClick={() => stat.route && navigate(stat.route)}
            className={`bg-white p-5 rounded-xl border border-[#c3c6d6]/20 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow ${stat.route ? 'cursor-pointer hover:border-[#003d9b]/35' : ''}`}
          >
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

      {/* Actions and Dynamic Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions (1/3 width) */}
        <section className="space-y-4 lg:col-span-1">
          <h3 className="text-base md:text-lg font-bold text-[#191b23]">Quick Services</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((act, idx) => (
              <button 
                key={idx} 
                onClick={() => navigate(act.route)} 
                className="flex flex-col items-center gap-2.5 p-4 bg-white rounded-xl border border-[#c3c6d6]/20 active:scale-95 transition-all group hover:shadow-md shadow-sm cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#f3f3fd] text-[#003d9b] flex items-center justify-center group-hover:bg-[#003d9b] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[22px]">{act.icon}</span>
                </div>
                <span className="text-xs text-center font-bold text-[#434654]">{act.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Dynamic List Section based on role (2/3 width) */}
        <section className="space-y-4 lg:col-span-2">
          {currentUser.role === 'Admin' && (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-base md:text-lg font-bold text-[#191b23]">Pending Approvals</h3>
                <button onClick={() => navigate('/agent/admin')} className="text-xs font-bold text-[#0052cc] hover:underline cursor-pointer">View Queue</button>
              </div>
              <div className="space-y-3">
                {pendingRegistrations.length > 0 ? (
                  pendingRegistrations.slice(0, 3).map((agent, idx) => (
                    <div key={idx} className="bg-white border border-[#c3c6d6]/30 p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                      <div>
                        <h4 className="font-bold text-[#191b23]">{agent.fullName}</h4>
                        <p className="text-xs text-[#516161] mt-0.5">{agent.mobileNumber} • {agent.email}</p>
                      </div>
                      <button 
                        onClick={() => navigate('/agent/admin')}
                        className="bg-[#003d9b] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#0052cc] transition-colors cursor-pointer"
                      >
                        Review
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-[#c3c6d6]/30 p-6 rounded-xl text-center text-sm text-[#516161]">
                    <span className="material-symbols-outlined text-green-600 text-3xl mb-1">check_circle</span>
                    <p>No pending registrations to approve.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {(currentUser.role === 'Super Agent' || currentUser.role === 'Agent') && (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-base md:text-lg font-bold text-[#191b23]">
                  {currentUser.role === 'Super Agent' ? 'My Agents' : 'My Field Agents'}
                </h3>
                <button onClick={() => navigate('/agent/team')} className="text-xs font-bold text-[#0052cc] hover:underline cursor-pointer">View Network</button>
              </div>
              <div className="space-y-3">
                {subordinateList.length > 0 ? (
                  subordinateList.slice(0, 3).map((agent, idx) => (
                    <div key={idx} className="bg-white border border-[#c3c6d6]/30 p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#dae2ff] text-[#003d9b] font-bold flex items-center justify-center">
                          {agent.fullName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-[#191b23]">{agent.fullName}</h4>
                          <p className="text-xs text-[#516161] mt-0.5">Rank: {agent.rank} • Sales: {agent.salesCount || 10}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#003d9b]">{agent.commissionRate}% override</span>
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-[#c3c6d6]/30 p-6 rounded-xl text-center text-sm text-[#516161]">
                    <span className="material-symbols-outlined text-2xl mb-1">group_off</span>
                    <p>No subordinate partners registered yet.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {currentUser.role === 'Field Agent' && (
            <>
              <h3 className="text-base md:text-lg font-bold text-[#191b23]">Recent Team Activities</h3>
              <div className="bg-white border border-[#c3c6d6]/30 rounded-xl p-4 shadow-sm divide-y divide-[#c3c6d6]/10 space-y-4">
                {mockActivities.map((act, idx) => (
                  <div key={idx} className="flex gap-4 pt-4 first:pt-0">
                    <div className={`w-10 h-10 ${act.bg} ${act.text} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className="material-symbols-outlined text-[18px]">{act.icon}</span>
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between w-full">
                        <h4 className="font-bold text-xs text-[#191b23]">{act.title}</h4>
                        <span className="text-[10px] text-[#737685] font-semibold">{act.time}</span>
                      </div>
                      <p className="text-[11px] text-[#516161] leading-relaxed">{act.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
