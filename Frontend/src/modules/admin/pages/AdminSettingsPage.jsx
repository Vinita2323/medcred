import React, { useState } from 'react';

export default function AdminSettingsPage() {
  const [limits, setLimits] = useState({
    hospitalClaimLimit: 200000,
    homeClaimLimit: 80000,
    loanWaitDays: 30
  });

  const [plans, setPlans] = useState({
    basic: { price: 499, validity: '1 Year' },
    premium: { price: 999, validity: '2 Years' },
    elite: { price: 1499, validity: '5 Years' }
  });

  const handleSave = (e) => {
    e.preventDefault();
    alert('Platform settings saved successfully! Global limits and pricing updated.');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[11px] uppercase tracking-widest text-blue-200 font-bold">System Configuration</span>
          <h2 className="text-xl font-extrabold mt-1">Platform Settings</h2>
          <p className="text-sm text-white/80 mt-1">Manage global system limits, pricing models, and core platform parameters.</p>
        </div>
      </section>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Claim & Loan Limits */}
        <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-[#191b23] text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003d9b]">gavel</span>
            Global Claim & Loan Limits
          </h3>
          <p className="text-xs text-[#516161] mb-4">These limits are enforced globally across all users when they submit claims or apply for loans.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#516161] uppercase tracking-wider">Hospital Claim Limit (₹)</label>
              <input
                type="number"
                value={limits.hospitalClaimLimit}
                onChange={e => setLimits({ ...limits, hospitalClaimLimit: Number(e.target.value) })}
                className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] font-bold text-[#191b23]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#516161] uppercase tracking-wider">Home Treatment Limit (₹)</label>
              <input
                type="number"
                value={limits.homeClaimLimit}
                onChange={e => setLimits({ ...limits, homeClaimLimit: Number(e.target.value) })}
                className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] font-bold text-[#191b23]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#516161] uppercase tracking-wider">Loan Waiting Period (Days)</label>
              <input
                type="number"
                value={limits.loanWaitDays}
                onChange={e => setLimits({ ...limits, loanWaitDays: Number(e.target.value) })}
                className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] font-bold text-[#191b23]"
              />
            </div>
          </div>
        </div>

        {/* Membership Plan Pricing */}
        <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-[#191b23] text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003d9b]">card_membership</span>
            Membership Plan Pricing
          </h3>
          <p className="text-xs text-[#516161] mb-4">Configure the cost and validity of healthcare cards sold to users.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['basic', 'premium', 'elite'].map((p) => (
              <div key={p} className="border border-[#c3c6d6]/30 p-4 rounded-xl space-y-3 bg-[#faf8ff]">
                <h4 className="font-extrabold text-[#003d9b] capitalize">{p} Plan</h4>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#737685] uppercase">Price (₹)</label>
                  <input
                    type="number"
                    value={plans[p].price}
                    onChange={e => setPlans({ ...plans, [p]: { ...plans[p], price: Number(e.target.value) } })}
                    className="w-full bg-white border border-[#c3c6d6]/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#003d9b] font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#737685] uppercase">Validity</label>
                  <input
                    type="text"
                    value={plans[p].validity}
                    onChange={e => setPlans({ ...plans, [p]: { ...plans[p], validity: e.target.value } })}
                    className="w-full bg-white border border-[#c3c6d6]/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#003d9b]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end pt-4">
          <button type="submit" className="bg-[#003d9b] hover:bg-[#0052cc] text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg shadow-[#003d9b]/20 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save Platform Settings
          </button>
        </div>

      </form>
    </div>
  );
}
