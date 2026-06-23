import React, { useState, useEffect } from 'react';
import { ENDPOINTS } from '../../../services/types';
import api from '../../../services/api';

export default function AdminSettingsPage() {
  const [limits, setLimits] = useState({
    hospitalClaimLimit: 200000,
    homeClaimLimit: 80000,
    loanWaitDays: 30
  });

  const [plans, setPlans] = useState({});
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: '', price: '', validity: '1 Year', maxMembers: 1, coverageAmount: '' });

  const [adminProfile, setAdminProfile] = useState({ name: '', email: '' });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    fetchAdminProfile();
    fetchPlatformSettings();
  }, []);

  const fetchPlatformSettings = async () => {
    try {
      const res = await api.get(ENDPOINTS.PLANS);
      if (res.data?.success) {
        const fetchedPlans = res.data.data;
        if (fetchedPlans.length > 0) {
          // Assume global limits are same across plans for now, so we just take the first one
          setLimits({
            hospitalClaimLimit: fetchedPlans[0].hospitalClaimLimit || 200000,
            homeClaimLimit: fetchedPlans[0].homeTreatmentClaimLimit || 80000,
            loanWaitDays: fetchedPlans[0].loanEligibilityAfterDays || 30
          });

          // Map the prices and validities
          const newPlansState = {};
          fetchedPlans.forEach(p => {
            newPlansState[p.planId] = {
              _id: p._id,
              name: p.name,
              price: p.price,
              validity: p.validity,
              maxMembers: p.maxMembers,
              coverageAmount: p.coverageAmount,
              isActive: p.isActive
            };
          });
          setPlans(newPlansState);
        }
      }
    } catch (err) {
      console.error('Error fetching platform settings:', err);
    }
  };

  const fetchAdminProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await api.get(ENDPOINTS.ADMIN_PROFILE);
      if (response.data.success) {
        setAdminProfile({
          name: response.data.data.name || '',
          email: response.data.data.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch(ENDPOINTS.ADMIN_PROFILE, adminProfile);
      if (response.data.success) {
        alert('Admin profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating admin profile:', error);
      alert('Failed to update admin profile.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const payload = {
        limits: {
          hospitalClaimLimit: limits.hospitalClaimLimit,
          homeClaimLimit: limits.homeClaimLimit,
          loanWaitDays: limits.loanWaitDays
        },
        plans
      };
      const res = await api.patch(ENDPOINTS.ADMIN_UPDATE_SETTINGS, payload);
      if (res.data?.success) {
        alert('Platform settings saved successfully! Global limits and pricing updated.');
      }
    } catch (error) {
      console.error('Error saving platform settings:', error);
      alert('Failed to save platform settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(ENDPOINTS.ADMIN_PLAN_CREATE, newPlan);
      if (res.data?.success) {
        alert('Plan created successfully!');
        setIsCreatingPlan(false);
        setNewPlan({ name: '', price: '', validity: '1 Year', maxMembers: 1, coverageAmount: '' });
        fetchPlatformSettings();
      }
    } catch (err) {
      console.error('Error creating plan:', err);
      alert('Failed to create plan.');
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      const res = await api.delete(ENDPOINTS.ADMIN_PLAN_DELETE(planId));
      if (res.data?.success) {
        alert('Plan deleted successfully!');
        fetchPlatformSettings();
      }
    } catch (err) {
      console.error('Error deleting plan:', err);
      alert('Failed to delete plan.');
    }
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

      {/* Admin Profile Details */}
      <form onSubmit={handleProfileSave} className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-[#191b23] text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[#003d9b]">person</span>
          Admin Profile
        </h3>
        <p className="text-xs text-[#516161] mb-4">Update your admin account details.</p>
        
        {isLoadingProfile ? (
          <p className="text-sm text-[#516161]">Loading profile...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#516161] uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={adminProfile.name}
                onChange={e => setAdminProfile({ ...adminProfile, name: e.target.value })}
                className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] font-bold text-[#191b23]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#516161] uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={adminProfile.email}
                onChange={e => setAdminProfile({ ...adminProfile, email: e.target.value })}
                className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] font-bold text-[#191b23]"
              />
            </div>
          </div>
        )}
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={isLoadingProfile} className="bg-[#003d9b] hover:bg-[#0052cc] text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">save</span>
            Update Profile
          </button>
        </div>
      </form>

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
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-[#191b23] text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[#003d9b]">card_membership</span>
                Membership Plan Pricing
              </h3>
              <p className="text-xs text-[#516161] mt-1">Configure the cost and validity of healthcare cards sold to users.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreatingPlan(true)}
              className="bg-[#003d9b] hover:bg-[#0052cc] text-white px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add New Plan
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {Object.keys(plans).map((planId) => (
              <div key={planId} className="border border-[#c3c6d6]/30 p-5 rounded-xl space-y-4 bg-[#faf8ff] relative shadow-sm">
                
                <div className="flex justify-between items-start">
                  <h4 className="font-extrabold text-[#003d9b] text-base capitalize">{plans[planId].name}</h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPlans({ ...plans, [planId]: { ...plans[planId], isActive: !plans[planId].isActive } })}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${plans[planId].isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
                    >
                      {plans[planId].isActive ? 'Visible' : 'Hidden'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePlan(planId)}
                      className="text-[#737685] hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete Plan"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#737685] uppercase">Price (₹)</label>
                    <input
                      type="number"
                      value={plans[planId].price}
                      onChange={e => setPlans({ ...plans, [planId]: { ...plans[planId], price: Number(e.target.value) } })}
                      className="w-full bg-white border border-[#c3c6d6]/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#003d9b] font-bold"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#737685] uppercase">Validity</label>
                      <input
                        type="text"
                        value={plans[planId].validity}
                        onChange={e => setPlans({ ...plans, [planId]: { ...plans[planId], validity: e.target.value } })}
                        className="w-full bg-white border border-[#c3c6d6]/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#003d9b]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#737685] uppercase">Members</label>
                      <input
                        type="number"
                        value={plans[planId].maxMembers}
                        onChange={e => setPlans({ ...plans, [planId]: { ...plans[planId], maxMembers: Number(e.target.value) } })}
                        className="w-full bg-white border border-[#c3c6d6]/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#003d9b]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#737685] uppercase">Coverage</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737685] text-sm">₹</span>
                      <input
                        type="number"
                        value={plans[planId].coverageAmount}
                        onChange={e => setPlans({ ...plans, [planId]: { ...plans[planId], coverageAmount: Number(e.target.value) } })}
                        className="w-full bg-white border border-[#c3c6d6]/40 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-[#003d9b]"
                      />
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isSavingSettings} className="bg-[#003d9b] hover:bg-[#0052cc] text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg shadow-[#003d9b]/20 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              {isSavingSettings ? 'hourglass_empty' : 'save'}
            </span>
            {isSavingSettings ? 'Saving...' : 'Save Platform Settings'}
          </button>
        </div>

      </form>

      {/* Create Plan Modal */}
      {isCreatingPlan && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreatePlan} className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-extrabold text-[#003d9b] text-lg border-b border-[#c3c6d6]/20 pb-3">
              Create New Plan
            </h3>

            <div className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#516161]">Plan Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Student Plan"
                  value={newPlan.name} 
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} 
                  className="w-full bg-[#f3f3fd] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#516161]">Price (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={newPlan.price} 
                    onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })} 
                    className="w-full bg-[#f3f3fd] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#516161]">Validity</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 1 Year"
                    value={newPlan.validity} 
                    onChange={(e) => setNewPlan({ ...newPlan, validity: e.target.value })} 
                    className="w-full bg-[#f3f3fd] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#516161]">Max Members</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={newPlan.maxMembers} 
                    onChange={(e) => setNewPlan({ ...newPlan, maxMembers: e.target.value })} 
                    className="w-full bg-[#f3f3fd] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#516161]">Coverage (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={newPlan.coverageAmount} 
                    onChange={(e) => setNewPlan({ ...newPlan, coverageAmount: e.target.value })} 
                    className="w-full bg-[#f3f3fd] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-3">
              <button
                type="button"
                onClick={() => setIsCreatingPlan(false)}
                className="text-[#003d9b] font-bold text-xs hover:bg-[#f3f3fd] px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#003d9b] text-white font-bold text-xs hover:bg-[#0052cc] px-6 py-2.5 rounded-xl cursor-pointer transition-colors shadow-md"
              >
                Create Plan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
