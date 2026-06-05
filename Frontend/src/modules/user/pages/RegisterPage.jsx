import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUser, seedSelfMember, saveFamilyMembers, getAgeFromDob } from '../utils/storage';

// ── Aadhaar formatter helper ─────────────────────────────────────
function formatAadhaar(val) {
  let clean = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  let formatted = '';
  for (let i = 0; i < clean.length; i++) {
    if (i > 0 && i % 4 === 0) formatted += ' ';
    formatted += clean[i];
  }
  return formatted;
}

const EMPTY_MEMBER = { name: '', relationship: '', dob: '', aadhaar: '' };

export default function RegisterPage() {
  const navigate = useNavigate();

  // ── Personal form ────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: '', mobile: '', email: '', dob: '',
    gender: '', aadhaar: '', address: '', consent: false
  });
  const [profilePic, setProfilePic] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // ── Family members ───────────────────────────────────────────────
  const [familyMembers, setFamilyMembers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ ...EMPTY_MEMBER });

  // ── Handlers: personal form ──────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAadhaarChange = (e) => {
    setFormData(prev => ({ ...prev, aadhaar: formatAadhaar(e.target.value) }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfilePic(ev.target.result);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // ── Handlers: family member ──────────────────────────────────────
  const handleMemberChange = (e) => {
    const { name, value } = e.target;
    setNewMember(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberAadhaar = (e) => {
    setNewMember(prev => ({ ...prev, aadhaar: formatAadhaar(e.target.value) }));
  };

  const handleAddMember = () => {
    if (!newMember.name || !newMember.relationship || !newMember.dob) {
      alert('Please fill Name, Relationship, and Date of Birth for the family member.');
      return;
    }
    const id = `MC-${Math.floor(80000 + Math.random() * 19999)}`;
    setFamilyMembers(prev => [
      ...prev,
      {
        ...newMember,
        id,
        age: getAgeFromDob(newMember.dob),
        verified: false,
        bloodGroup: '',
        gender: '',
        image: null,
      }
    ]);
    setNewMember({ ...EMPTY_MEMBER });
    setShowAddMember(false);
  };

  const handleRemoveMember = (id) => {
    setFamilyMembers(prev => prev.filter(m => m.id !== id));
  };

  // ── Submit ───────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.consent) {
      alert('Please agree to the verification terms to continue.');
      return;
    }
    const userData = {
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      dob: formData.dob,
      gender: formData.gender,
      aadhaar: formData.aadhaar,
      address: formData.address,
      profilePic,
      bloodGroup: '',
      occupation: '',
    };
    saveUser(userData);

    // Build Self member + all added family members
    const selfMember = {
      id: 'MC-SELF',
      name: userData.name,
      relationship: 'Self',
      age: getAgeFromDob(userData.dob),
      dob: userData.dob,
      bloodGroup: '',
      gender: userData.gender,
      verified: true,
      image: profilePic || null,
    };
    saveFamilyMembers([selfMember, ...familyMembers]);

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/verify-otp');
    }, 2500);
  };

  const relationshipOptions = ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Other'];

  return (
    <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md relative animate-fade-in">
      {/* TopAppBar */}
      <header className="flex justify-between items-center px-4 w-full h-16 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="material-symbols-outlined text-primary hover:opacity-80 transition-opacity cursor-pointer"
          >
            arrow_back
          </button>
          <img src="/FinalLogo.png" alt="MedCred Logo" className="h-10 w-auto object-contain" />
        </div>
        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary cursor-pointer">
          <span className="material-symbols-outlined">help_outline</span>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto px-4 py-5 pb-8">
        <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">

          {/* ── Section 1: Personal Information ─────────────────── */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            {/* Section Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border-b border-outline-variant/30">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-black">1</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-on-surface">Personal Information</h2>
                <p className="text-[10px] text-on-surface-variant">As per your Aadhaar card</p>
              </div>
              {/* Profile Photo */}
              <div className="ml-auto relative">
                <label className="w-14 h-14 rounded-full border-2 border-dashed border-outline-variant bg-surface-container flex flex-col items-center justify-center text-on-surface-variant cursor-pointer hover:border-primary transition-all overflow-hidden">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-xl">add_a_photo</span>
                      <span className="text-[8px] font-bold mt-0.5">PHOTO</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center shadow pointer-events-none">
                  <span className="material-symbols-outlined text-[10px]">add</span>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-0.5">Full Name *</label>
                <input
                  className="w-full h-11 px-3 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. Rahul Sharma"
                  type="text" name="name" value={formData.name}
                  onChange={handleInputChange} required
                />
              </div>

              {/* Mobile */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-0.5">Mobile Number *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant border-r border-outline-variant pr-2">+91</span>
                  <input
                    className="w-full h-11 pl-14 pr-3 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="98765 43210"
                    type="tel" name="mobile" value={formData.mobile}
                    onChange={handleInputChange} required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-0.5">Email Address *</label>
                <input
                  className="w-full h-11 px-3 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="rahul@example.com"
                  type="email" name="email" value={formData.email}
                  onChange={handleInputChange} required
                />
              </div>

              {/* DOB + Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-0.5">Date of Birth *</label>
                  <input
                    className="w-full h-11 px-2 bg-surface border border-outline-variant rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    type="date" name="dob" value={formData.dob}
                    onChange={handleInputChange} required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-0.5">Gender *</label>
                  <div className="relative">
                    <select
                      className="w-full h-11 pl-3 pr-8 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                      name="gender" value={formData.gender}
                      onChange={handleInputChange} required
                    >
                      <option value="" disabled>Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Aadhaar */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-0.5">Aadhaar Number *</label>
                <input
                  className="w-full h-11 px-3 bg-surface border border-outline-variant rounded-lg text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="0000 0000 0000" maxLength={14}
                  type="text" name="aadhaar" value={formData.aadhaar}
                  onChange={handleAadhaarChange} required
                />
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-0.5">Permanent Address *</label>
                <textarea
                  className="w-full p-3 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  placeholder="Street name, Building, Area, City, PIN"
                  rows={2} name="address" value={formData.address}
                  onChange={handleInputChange} required
                />
              </div>
            </div>
          </div>

          {/* ── Section 2: Family Members ────────────────────────── */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            {/* Section Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-secondary/5 border-b border-outline-variant/30">
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-black">2</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-on-surface">Family Members</h2>
                <p className="text-[10px] text-on-surface-variant">Optional — add dependents to your plan</p>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* Added members list */}
              {familyMembers.length === 0 && !showAddMember && (
                <div className="text-center py-4">
                  <span className="material-symbols-outlined text-4xl text-outline/40 block mb-2">group_add</span>
                  <p className="text-xs text-on-surface-variant">No family members added yet.</p>
                  <p className="text-[10px] text-outline mt-0.5">You can also add them later from the Family page.</p>
                </div>
              )}

              {familyMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between bg-surface-container-low rounded-xl px-3 py-2.5 border border-outline-variant/40">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-secondary text-lg">person</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">{member.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">{member.relationship}</span>
                        <span className="text-[10px] text-on-surface-variant">{member.age}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id)}
                    className="material-symbols-outlined text-error text-lg cursor-pointer hover:bg-error/10 rounded-full p-1 transition-colors"
                  >
                    close
                  </button>
                </div>
              ))}

              {/* Add member inline form */}
              {showAddMember && (
                <div className="border border-primary/30 rounded-xl p-3.5 bg-primary/5 space-y-3 animate-fade-in">
                  <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">person_add</span>
                    Add Family Member
                  </p>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant">Full Name *</label>
                    <input
                      className="w-full h-10 px-3 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="As per Aadhaar"
                      type="text" name="name" value={newMember.name}
                      onChange={handleMemberChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant">Relationship *</label>
                      <div className="relative">
                        <select
                          className="w-full h-10 pl-3 pr-7 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                          name="relationship" value={newMember.relationship}
                          onChange={handleMemberChange}
                        >
                          <option value="" disabled>Select</option>
                          {relationshipOptions.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-base">expand_more</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant">Date of Birth *</label>
                      <input
                        className="w-full h-10 px-2 bg-white border border-outline-variant rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        type="date" name="dob" value={newMember.dob}
                        onChange={handleMemberChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant">Aadhaar Number (optional)</label>
                    <input
                      className="w-full h-10 px-3 bg-white border border-outline-variant rounded-lg text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="0000 0000 0000" maxLength={14}
                      type="text" name="aadhaar" value={newMember.aadhaar}
                      onChange={handleMemberAadhaar}
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setShowAddMember(false); setNewMember({ ...EMPTY_MEMBER }); }}
                      className="flex-1 border border-outline text-on-surface-variant text-xs font-bold py-2 rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow"
                    >
                      Add Member
                    </button>
                  </div>
                </div>
              )}

              {/* Add button */}
              {!showAddMember && (
                <button
                  type="button"
                  onClick={() => setShowAddMember(true)}
                  className="w-full border-2 border-dashed border-primary/40 rounded-xl py-3 flex items-center justify-center gap-2 text-primary text-xs font-bold hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  Add Family Member
                </button>
              )}
            </div>
          </div>

          {/* ── Consent ─────────────────────────────────────────── */}
          <div className="flex gap-3 p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/30">
            <input
              className="w-4 h-4 text-primary border-outline rounded focus:ring-primary cursor-pointer mt-0.5 shrink-0"
              id="consent" type="checkbox"
              name="consent" checked={formData.consent}
              onChange={handleInputChange} required
            />
            <label className="text-[11px] text-on-surface-variant leading-relaxed cursor-pointer" htmlFor="consent">
              I give consent to MedCred India to verify my Aadhaar and credit details and those of my family members for creating a health credit profile.
            </label>
          </div>

          {/* ── Submit ─────────────────────────────────────────── */}
          <div className="space-y-3 pb-4">
            <button
              className="w-full h-12 bg-primary hover:opacity-90 text-white text-sm font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              type="submit"
            >
              <span>Verify &amp; Continue</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
            <p className="text-center text-xs text-on-surface-variant">
              Already have an account?{' '}
              <span onClick={() => navigate('/login')} className="text-primary font-bold hover:underline cursor-pointer">
                Login here
              </span>
            </p>
          </div>
        </form>
      </main>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center animate-fade-in">
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-2xl border border-outline-variant flex flex-col items-center text-center max-w-[320px] mx-4 animate-scale-up">
            <div className="w-16 h-16 bg-tertiary-fixed rounded-full flex items-center justify-center text-on-tertiary-fixed mb-4">
              <span className="material-symbols-outlined text-4xl animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Verification Initiated</h3>
            <p className="text-xs text-on-surface-variant mb-6">
              {familyMembers.length > 0
                ? `You & ${familyMembers.length} family member${familyMembers.length > 1 ? 's' : ''} added. Verifying identity...`
                : 'We are securely verifying your identity through government channels.'}
            </p>
            <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary progress-bar-fill"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
