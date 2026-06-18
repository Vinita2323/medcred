import React, { useState, useEffect } from 'react';
import { getPlatformPlans, savePlatformPlans } from '../../user/utils/storage';

export default function AdminSettingsPage() {
  const [limits, setLimits] = useState({
    hospitalClaimLimit: 200000,
    homeClaimLimit: 80000,
    loanWaitDays: 30
  });

  const [plans, setPlans] = useState({});
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    price: '',
    validity: '1 Year',
    members: 1,
    coverage: '₹1,00,000',
    features: ''
  });

  useEffect(() => {
    setPlans(getPlatformPlans());
  }, []);

  const handleSave = (e) => {
    if (e) e.preventDefault();
    savePlatformPlans(plans);
    alert('Platform settings saved successfully! Global limits and pricing updated.');
  };

  const handlePlanChange = (planId, field, value) => {
    setPlans({
      ...plans,
      [planId]: { ...plans[planId], [field]: value }
    });
  };

  const toggleHidePlan = (planId) => {
    setPlans({
      ...plans,
      [planId]: { ...plans[planId], isHidden: !plans[planId].isHidden }
    });
  };

  const deletePlan = (planId) => {
    if (window.confirm(`Are you sure you want to delete the ${plans[planId].name}?`)) {
      const newPlans = { ...plans };
      delete newPlans[planId];
      setPlans(newPlans);
    }
  };

  const handleAddPlan = (e) => {
    e.preventDefault();
    const id = newPlan.name.toLowerCase().replace(/\s+/g, '-');
    const planToAdd = {
      id,
      name: newPlan.name,
      price: Number(newPlan.price),
      validity: newPlan.validity,
      members: Number(newPlan.members),
      coverage: newPlan.coverage,
      features: newPlan.features.split(',').map(f => f.trim()).filter(f => f),
      color: 'plan-custom',
      isHidden: false
    };
    
    setPlans({
      ...plans,
      [id]: planToAdd
    });
    
    setNewPlan({
      name: '', price: '', validity: '1 Year', members: 1, coverage: '₹1,00,000', features: ''
    });
    setIsAddingPlan(false);
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
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-extrabold text-[#191b23] text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[#003d9b]">card_membership</span>
                Membership Plan Pricing
              </h3>
              <p className="text-xs text-[#516161] mt-1">Configure the cost and validity of healthcare cards sold to users.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingPlan(true)}
              className="bg-[#003d9b] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-[#0052cc] transition-colors"
            >
              <span className="material-symbols-outlined text-sm">add</span> Add New Plan
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(plans).map(([pId, plan]) => (
              <div key={pId} className={`border ${plan.isHidden ? 'border-dashed border-red-300 bg-red-50/30' : 'border-[#c3c6d6]/30 bg-[#faf8ff]'} p-4 rounded-xl space-y-3 relative transition-all`}>
                <div className="flex justify-between items-start">
                  <h4 className="font-extrabold text-[#003d9b]">{plan.name}</h4>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleHidePlan(pId)}
                      className={`text-[10px] px-2 py-1 rounded font-bold cursor-pointer transition-colors ${plan.isHidden ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                      title={plan.isHidden ? "Show Plan" : "Hide Plan"}
                    >
                      {plan.isHidden ? 'Hidden' : 'Visible'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePlan(pId)}
                      className="text-[#737685] hover:text-red-600 transition-colors cursor-pointer p-1"
                      title="Delete Plan"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#737685] uppercase">Price (₹)</label>
                  <input
                    type="number"
                    value={plan.price}
                    onChange={e => handlePlanChange(pId, 'price', Number(e.target.value))}
                    className={`w-full bg-white border border-[#c3c6d6]/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#003d9b] font-bold ${plan.isHidden ? 'opacity-70' : ''}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#737685] uppercase">Validity</label>
                    <input
                      type="text"
                      value={plan.validity}
                      onChange={e => handlePlanChange(pId, 'validity', e.target.value)}
                      className={`w-full bg-white border border-[#c3c6d6]/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#003d9b] ${plan.isHidden ? 'opacity-70' : ''}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#737685] uppercase">Members</label>
                    <input
                      type="number"
                      value={plan.members}
                      onChange={e => handlePlanChange(pId, 'members', Number(e.target.value))}
                      className={`w-full bg-white border border-[#c3c6d6]/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#003d9b] ${plan.isHidden ? 'opacity-70' : ''}`}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#737685] uppercase">Coverage</label>
                  <input
                    type="text"
                    value={plan.coverage}
                    onChange={e => handlePlanChange(pId, 'coverage', e.target.value)}
                    className={`w-full bg-white border border-[#c3c6d6]/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#003d9b] ${plan.isHidden ? 'opacity-70' : ''}`}
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

      {/* Add Plan Modal */}
      {isAddingPlan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsAddingPlan(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-[#c3c6d6]/20 pb-3">
              <h3 className="font-extrabold text-[#191b23] text-lg">Add New Plan</h3>
              <button type="button" onClick={() => setIsAddingPlan(false)} className="text-[#737685] hover:text-black">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddPlan} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#516161]">Plan Name</label>
                <input required type="text" value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} placeholder="e.g. Senior Citizen Plan" className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#003d9b]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#516161]">Price (₹)</label>
                  <input required type="number" value={newPlan.price} onChange={e => setNewPlan({...newPlan, price: e.target.value})} placeholder="e.g. 1999" className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#003d9b]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#516161]">Validity</label>
                  <input required type="text" value={newPlan.validity} onChange={e => setNewPlan({...newPlan, validity: e.target.value})} placeholder="e.g. 1 Year" className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#003d9b]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#516161]">Max Members</label>
                  <input required type="number" value={newPlan.members} onChange={e => setNewPlan({...newPlan, members: e.target.value})} placeholder="e.g. 2" className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#003d9b]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#516161]">Coverage Limit</label>
                  <input required type="text" value={newPlan.coverage} onChange={e => setNewPlan({...newPlan, coverage: e.target.value})} placeholder="e.g. ₹2,00,000" className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#003d9b]" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#516161]">Features (comma separated)</label>
                <textarea required rows="2" value={newPlan.features} onChange={e => setNewPlan({...newPlan, features: e.target.value})} placeholder="Feature 1, Feature 2, Feature 3" className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#003d9b]" />
              </div>
              
              <button type="submit" className="w-full bg-[#003d9b] text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-[#0052cc] transition-colors">
                Create Plan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
