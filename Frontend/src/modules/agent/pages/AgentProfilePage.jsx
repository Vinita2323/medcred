import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AgentProfilePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    alert('Logged out from Agent Portal.');
    navigate('/agent/login');
  };

  return (
    <div className="bg-[#faf8ff] text-[#191b23] font-body-md min-h-screen pb-24">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-white shadow-sm border-b border-[#c3c6d6]/20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/agent/dashboard')} className="material-symbols-outlined text-[#003d9b] p-1 rounded-full hover:bg-[#f3f3fd] transition-colors">
            arrow_back
          </button>
          <h1 className="text-xl font-bold text-[#003d9b]">Agent Profile</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-4 max-w-2xl mx-auto space-y-6">
        
        {/* Profile Card */}
        <section className="bg-white border border-[#c3c6d6]/30 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#dae2ff] p-0.5 shadow-md">
            <img 
              alt="Agent Avatar" 
              className="w-full h-full object-cover rounded-full"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDd9ThGrfGVzkidmRPTIDI9rqsV9Mu7No1auYCUdjrLGKvR0chE5rKk5qXivEhGft-ssJ52oNhXZKIqadr7z0uPvL4E27WhBMSnOMELffRrGsIpt2535LoA_D7pCM0N0F1uPv0n9EfIIQdfHgf-yTt7AC-2qpI6HPwzyDq-eXE2q72CG0qs8fdSgGQw0F-BPWWbKOYbuU-mBlamu_eTKw6z_So_NHd-C0dhjwvgRDdxW3n1ETevc-mcG8Xn9dGFYWLfwK7gljabIChN"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#191b23]">Agent MC-9921</h2>
            <p className="text-xs font-semibold text-[#0052cc] bg-[#dae2ff] px-3 py-1 rounded-full mt-1.5 inline-block">Authorized Partner</p>
          </div>
          <div className="w-full border-t border-[#c3c6d6]/20 pt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-[#737685] font-semibold">Tier Status</p>
              <p className="font-bold text-[#003d9b]">Platinum Partner</p>
            </div>
            <div>
              <p className="text-xs text-[#737685] font-semibold">Commission Rate</p>
              <p className="font-bold text-[#003d9b]">1.8% / Lead</p>
            </div>
          </div>
        </section>

        {/* Agency Information */}
        <section className="bg-white border border-[#c3c6d6]/30 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-[#191b23] border-b border-[#c3c6d6]/20 pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003d9b]">domain</span>
            <span>Agency Details</span>
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#516161]">Agency Name</span>
              <span className="font-semibold">Apex Health Solutions</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#516161]">Partner ID</span>
              <span className="font-semibold font-mono text-[#003d9b]">MC-9921-2023</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#516161]">Location</span>
              <span className="font-semibold">Delhi NCR, India</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#516161]">Joined Date</span>
              <span className="font-semibold">March 14, 2023</span>
            </div>
          </div>
        </section>

        {/* Account Settings Menu */}
        <section className="bg-white border border-[#c3c6d6]/30 rounded-2xl p-4 shadow-sm space-y-1">
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#f3f3fd] transition-colors text-left text-sm group">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#516161] group-hover:text-[#003d9b]">security</span>
              <span className="font-semibold">Vault Security Settings</span>
            </div>
            <span className="material-symbols-outlined text-[#737685]">chevron_right</span>
          </button>
          
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#f3f3fd] transition-colors text-left text-sm group">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#516161] group-hover:text-[#003d9b]">payments</span>
              <span className="font-semibold">Payout Account Info</span>
            </div>
            <span className="material-symbols-outlined text-[#737685]">chevron_right</span>
          </button>

          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#f3f3fd] transition-colors text-left text-sm group">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#516161] group-hover:text-[#003d9b]">contact_support</span>
              <span className="font-semibold">Contact Partner Support</span>
            </div>
            <span className="material-symbols-outlined text-[#737685]">chevron_right</span>
          </button>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 text-left text-sm group"
          >
            <div className="flex items-center gap-3 text-red-600">
              <span className="material-symbols-outlined">logout</span>
              <span className="font-semibold">Sign Out Portal</span>
            </div>
            <span className="material-symbols-outlined text-[#737685]">chevron_right</span>
          </button>
        </section>

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
        <div className="flex flex-col items-center justify-center text-[#434654] px-4 py-1 cursor-pointer" onClick={() => navigate('/agent/customers')}>
          <span className="material-symbols-outlined">group</span>
          <span className="text-[10px] font-semibold">Users</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#003d9b] px-4 py-1 cursor-pointer">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
          <span className="text-[10px] font-semibold">Profile</span>
        </div>
      </nav>
    </div>
  );
}
