import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { STORAGE_KEYS, ENDPOINTS, getImageUrl } from '../../../services/types';
import api from '../../../services/api';

export default function AgentProfilePage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showPayout, setShowPayout] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState([]);

  // Edit Profile state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editProfilePicFile, setEditProfilePicFile] = useState(null);
  const [editProfilePicPreview, setEditProfilePicPreview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const openEditModal = () => {
    setEditProfilePicFile(null);
    setEditProfilePicPreview(currentUser.profilePhotoUrl ? getImageUrl(currentUser.profilePhotoUrl) : null);
    setShowEditProfile(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const formData = new FormData();
      if (editProfilePicFile) {
        formData.append('profilePic', editProfilePicFile);
      }
      
      const res = await api.patch(ENDPOINTS.AGENT_PROFILE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data?.success) {
        setCurrentUser(res.data.data);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(res.data.data));
        setShowEditProfile(false);
      }
    } catch (err) {
      console.error('Update profile error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditProfilePicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setEditProfilePicPreview(reader.result);
      reader.readAsDataURL(file);
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
        return { label: 'Platinum Partner', style: 'bg-purple-100 text-purple-800 border-purple-300', desc: 'Top Tier override of network sales.' };
      case 'Gold':
        return { label: 'Gold Partner', style: 'bg-yellow-100 text-yellow-800 border-yellow-300', desc: 'Eligible for overriding commissions on network sales.' };
      case 'Silver':
        return { label: 'Silver Partner', style: 'bg-gray-100 text-gray-800 border-gray-300', desc: 'Standard commission override on team sales.' };
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
          {currentUser.profilePhotoUrl ? (
            <img src={getImageUrl(currentUser.profilePhotoUrl)} alt="Profile" className="w-full h-full object-cover rounded-full" />
          ) : (
            <span className="material-symbols-outlined text-5xl">person</span>
          )}
        </div>
        <div className="flex-grow text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-xl font-bold text-[#191b23]">{currentUser.fullName}</h2>
              <span className={`text-xs font-semibold px-3 py-0.5 rounded-full border ${badge.style} inline-block w-max mx-auto sm:mx-0`}>
                {badge.label}
              </span>
            </div>
            <button onClick={openEditModal} className="flex items-center justify-center gap-1 text-xs font-bold bg-[#f3f3fd] text-[#003d9b] px-4 py-1.5 rounded-xl hover:bg-[#e6e8fa] transition-colors w-max mx-auto sm:mx-0">
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Edit Profile
            </button>
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
            <span className="font-semibold text-xs text-[#003d9b] bg-[#dae2ff] px-2.5 py-0.5 rounded-full text-center">
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
              <span>Commissions & Earnings Model</span>
            </h3>
            <p className="text-[11px] text-[#737685] mt-1 ml-6">
              Shows your direct sale commissions and overriding team commissions (if applicable).
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {plans.map((plan) => {
              const directRate = plan.fieldAgentCommissionPct || 12;
              let overrideRate = null;
              if (currentUser.role === 'Agent') overrideRate = plan.agentCommissionPct || 4;
              else if (currentUser.role === 'Super Agent') overrideRate = plan.superAgentCommissionPct || 3;
              
              return (
                <div key={plan.planId} className="bg-[#f3f3fd] rounded-xl p-4 flex flex-col items-center justify-center text-center border border-[#003d9b]/10">
                  <p className="text-[#516161] font-semibold text-xs uppercase tracking-wider mb-2">{plan.name}</p>
                  
                  <div className="flex flex-col items-center">
                    <p className="text-2xl font-extrabold text-[#0c56d0] leading-none">{directRate}%</p>
                    <p className="text-[10px] text-[#737685] font-semibold uppercase mt-1">Direct Sale</p>
                  </div>
                  
                  {overrideRate && (
                    <>
                      <div className="w-2/3 h-px bg-[#c3c6d6]/40 my-3"></div>
                      <div className="flex flex-col items-center">
                        <p className="text-xl font-bold text-green-700 leading-none">{overrideRate}%</p>
                        <p className="text-[10px] text-[#737685] font-semibold uppercase mt-1">Team Override</p>
                      </div>
                    </>
                  )}
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
            <span className="font-semibold break-all text-right max-w-[50%]">{currentUser.email}</span>
          </div>
          <div className="flex justify-between border-b border-[#faf8ff] pb-2 md:border-none">
            <span className="text-[#516161]">Joined Date</span>
            <span className="font-semibold">
              {currentUser.joiningDate 
                ? new Date(currentUser.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
                : 'June 11, 2026'}
            </span>
          </div>
          <div className="flex justify-between border-b border-[#faf8ff] pb-2 md:border-none">
            <span className="text-[#516161]">Aadhaar Number</span>
            <span className="font-mono text-xs">{currentUser.aadhaarNumber || 'XXXXXXXX9921'}</span>
          </div>
        </div>
      </section>

      {/* Account Settings Menu */}
      <section className="bg-white border border-[#c3c6d6]/30 rounded-2xl p-4 shadow-sm space-y-1">
        <button onClick={() => setShowSecurity(true)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#f3f3fd] transition-colors text-left text-sm group cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#516161] group-hover:text-[#003d9b]">security</span>
            <span className="font-semibold">Vault Security Settings</span>
          </div>
          <span className="material-symbols-outlined text-[#737685]">chevron_right</span>
        </button>
        
        <button onClick={() => setShowPayout(true)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#f3f3fd] transition-colors text-left text-sm group cursor-pointer">
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

      {/* Security Modal */}
      {showSecurity && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowSecurity(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-[#191b23]">Vault Security Settings</h3>
              <button onClick={() => setShowSecurity(false)} className="material-symbols-outlined text-[#737685]">close</button>
            </div>
            <p className="text-sm text-[#516161] mb-6">For security reasons, password resets and security updates must be requested through your admin or via the Forgot Password link on the login screen.</p>
            <button onClick={() => setShowSecurity(false)} className="w-full bg-[#003d9b] text-white py-3 rounded-xl font-bold">Understood</button>
          </div>
        </div>,
        document.body
      )}

      {/* Payout Modal */}
      {showPayout && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowPayout(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="font-bold text-lg text-[#191b23]">Payout Account Info</h3>
              <button onClick={() => setShowPayout(false)} className="material-symbols-outlined text-[#737685]">close</button>
            </div>
            {currentUser.bankDetails ? (
              <div className="space-y-4 text-sm mt-2">
                <div>
                  <p className="text-[#737685] text-xs font-semibold">Bank Name</p>
                  <p className="font-bold">{currentUser.bankDetails.bankName}</p>
                </div>
                <div>
                  <p className="text-[#737685] text-xs font-semibold">Account Holder Name</p>
                  <p className="font-bold">{currentUser.bankDetails.accountHolderName}</p>
                </div>
                <div>
                  <p className="text-[#737685] text-xs font-semibold">Account Number</p>
                  <p className="font-bold font-mono tracking-widest">{currentUser.bankDetails.accountNumber}</p>
                </div>
                <div>
                  <p className="text-[#737685] text-xs font-semibold">IFSC Code</p>
                  <p className="font-bold font-mono uppercase">{currentUser.bankDetails.ifscCode}</p>
                </div>
                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs mt-4 border border-blue-100 flex gap-2">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  <p>All your earnings will be transferred to this account. Contact your admin to modify these details.</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#516161]">No banking details found on your profile.</p>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowEditProfile(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-[#c3c6d6]/30 pb-3">
              <h3 className="font-bold text-lg text-[#191b23]">Edit Profile</h3>
              <button onClick={() => setShowEditProfile(false)} className="material-symbols-outlined text-[#737685] hover:text-[#191b23]">close</button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="flex flex-col items-center gap-3 mb-6">
                <label className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#dae2ff] p-0.5 shadow-md flex-shrink-0 bg-[#003d9b]/10 flex items-center justify-center text-3xl font-bold text-[#003d9b] cursor-pointer group relative">
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  {editProfilePicPreview ? (
                    <img src={editProfilePicPreview} alt="Preview" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="material-symbols-outlined text-5xl">person</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                  </div>
                </label>
                <span className="text-xs text-[#516161] font-semibold">Tap to change photo</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#516161] mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={currentUser.fullName}
                  className="w-full px-4 py-2.5 bg-gray-100 border border-[#c3c6d6] rounded-xl text-sm text-[#516161] cursor-not-allowed opacity-70"
                  disabled
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#516161] mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={currentUser.email}
                  className="w-full px-4 py-2.5 bg-gray-100 border border-[#c3c6d6] rounded-xl text-sm text-[#516161] cursor-not-allowed opacity-70"
                  disabled
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#516161] mb-1">Mobile Number</label>
                <input 
                  type="tel" 
                  value={currentUser.mobileNumber}
                  className="w-full px-4 py-2.5 bg-gray-100 border border-[#c3c6d6] rounded-xl text-sm text-[#516161] cursor-not-allowed opacity-70"
                  disabled
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEditProfile(false)} className="flex-1 bg-white border border-[#c3c6d6] text-[#516161] py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isUpdating} className="flex-1 bg-[#003d9b] text-white py-2.5 rounded-xl font-bold hover:bg-[#003d9b]/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
