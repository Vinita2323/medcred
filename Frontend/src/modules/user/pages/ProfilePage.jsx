import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/Navigation/BottomNavBar';
import { getUser, updateUser, getFamilyMembers, clearUser, formatDobDisplay, getAgeFromDob, isLoggedIn } from '../utils/storage';

const DEFAULT_AVATAR = null;

export default function ProfilePage() {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Live data from localStorage
  const [user, setUser] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);

  // Temp edit fields
  const [tempName, setTempName] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [tempPhone, setTempPhone] = useState('');

  // Health edit fields
  const [isHealthEditing, setIsHealthEditing] = useState(false);
  const [tempHealth, setTempHealth] = useState({
    height: '',
    weight: '',
    bloodGroup: '',
    allergies: '',
    chronic: '',
    medications: ''
  });

  useEffect(() => {
    if (isLoggedIn()) {
      const stored = getUser();
      setUser(stored);
      setFamilyMembers(getFamilyMembers());
    }
  }, []);

  if (!isLoggedIn()) {
    return (
      <div className="flex-grow flex flex-col bg-surface min-h-screen font-body-md pb-20 items-center justify-center p-6 text-center space-y-4">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-primary text-5xl">account_circle</span>
        </div>
        <h2 className="text-xl font-black text-on-surface">Login Required</h2>
        <p className="text-sm text-on-surface-variant max-w-xs">
          Please log in to view your profile, manage orders, and access your health information.
        </p>
        <button 
          onClick={() => navigate('/login')}
          className="w-full max-w-xs py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all mt-4 cursor-pointer"
        >
          Login to Continue
        </button>
        <BottomNavBar />
      </div>
    );
  }

  // Derived display values (fallback to demo if no user registered)
  const profileName = user?.name || 'User Profile';
  const profileEmail = user?.email || 'No email provided';
  const profilePhone = user?.mobile ? `+91 ${user.mobile}` : 'No phone provided';
  const profileDob = user?.dob ? formatDobDisplay(user.dob) : 'Not provided';
  const profileGender = user?.gender || 'Not provided';
  const profileAddress = user?.address || 'Not provided';
  const profilePic = user?.profilePic || null;

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleEditClick = () => {
    setTempName(profileName);
    setTempEmail(profileEmail);
    setTempPhone(user?.mobile || '');
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!tempName || !tempEmail || !tempPhone) {
      alert('All fields are required.');
      return;
    }
    updateUser({ name: tempName, email: tempEmail, mobile: tempPhone });
    setUser(getUser());
    setIsEditing(false);
  };

  const handleEditHealthClick = (e) => {
    e.stopPropagation(); // Prevent toggling the accordion
    setTempHealth({
      height: user?.health?.height || "5'9\"",
      weight: user?.health?.weight || "72",
      bloodGroup: user?.health?.bloodGroup || "B+",
      allergies: user?.health?.allergies || "Penicillin, Dust",
      chronic: user?.health?.chronic || "None",
      medications: user?.health?.medications || "None"
    });
    setIsHealthEditing(true);
  };

  const handleSaveHealth = (e) => {
    e.preventDefault();
    updateUser({ health: tempHealth });
    setUser(getUser());
    setIsHealthEditing(false);
  };

  const SectionHeader = ({ icon, title, section }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-surface-container-low transition-colors outline-none text-left"
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">{icon}</span>
        </div>
        <h3 className="text-sm font-bold text-on-surface">{title}</h3>
      </div>
      <span className={`material-symbols-outlined text-outline transition-transform duration-300 ${openSection === section ? 'rotate-180' : ''}`}>
        expand_more
      </span>
    </button>
  );

  const InfoRow = ({ label, value }) => (
    <div className="space-y-0.5 min-w-0">
      <p className="text-on-surface-variant font-semibold uppercase tracking-wider text-[8px] truncate">{label}</p>
      <p className="text-on-surface font-semibold text-[11px] truncate" title={value}>{value}</p>
    </div>
  );

  return (
    <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md relative pb-24">
      {/* Profile Header */}
      <header className="flex items-center px-4 w-full h-16 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        <button onClick={() => navigate(-1)} className="material-symbols-outlined text-on-surface hover:bg-surface-variant p-2 rounded-full -ml-2 transition-colors cursor-pointer">
          arrow_back
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-on-surface">My Profile</h1>
        <button onClick={handleEditClick} className="material-symbols-outlined text-primary hover:bg-surface-variant p-2 rounded-full -mr-2 transition-colors cursor-pointer">
          edit
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-4 space-y-5 max-w-md mx-auto w-full animate-fade-in">

        {/* Hero Profile Section */}
        <section className="flex flex-col items-center text-center mt-2">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary to-secondary shadow-lg">
              {profilePic ? (
                <img alt={profileName} className="w-full h-full rounded-full border-4 border-surface object-cover" src={profilePic} />
              ) : (
                <div className="w-full h-full rounded-full border-4 border-surface bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-primary/50">person</span>
                </div>
              )}
            </div>
            <div className="absolute bottom-1 right-1 bg-white rounded-full p-0.5 shadow-md flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary text-lg font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
          </div>

          <div className="mt-3">
            <h2 className="text-xl font-bold text-on-surface">{profileName}</h2>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="text-tertiary font-bold text-[10px] uppercase tracking-wider">Aadhaar Verified</span>
              <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
          </div>

          {/* Health Score Banner */}
          <div className="mt-4 w-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-3 flex items-center justify-between">
            <div className="text-left">
              <p className="text-[9px] text-on-surface-variant uppercase font-bold tracking-wider">MedCred Health Score</p>
              <p className="text-2xl font-black text-primary mt-0.5">782</p>
              <p className="text-[10px] text-tertiary font-bold">Excellent</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant font-semibold">
                <span className="w-2 h-2 rounded-full bg-tertiary inline-block"></span>
                +12 this month
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant font-semibold">
                <span className="w-2 h-2 rounded-full bg-secondary inline-block"></span>
                4 Members Covered
              </div>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1">Platinum Tier</span>
            </div>
          </div>


        </section>

        {/* Expandable Sections */}
        <section className="space-y-3">

          {/* Personal Information */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <SectionHeader icon="person" title="Personal Information" section="personal" />
            {openSection === 'personal' && (
              <div className="p-3 pt-2 border-t border-outline-variant/30">
                <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-xs">
                  <InfoRow label="Full Name" value={profileName} />
                  <InfoRow label="Email Address" value={profileEmail} />
                  <InfoRow label="Phone Number" value={profilePhone} />
                  <InfoRow label="Date of Birth" value={profileDob} />
                  <InfoRow label="Gender" value={profileGender} />
                  <InfoRow label="Blood Group" value={user?.bloodGroup || '—'} />
                  <InfoRow label="Occupation" value={user?.occupation || '—'} />
                  <InfoRow label="Annual Income" value={user?.income || '—'} />
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-outline-variant/20">
                  <p className="text-on-surface-variant font-semibold uppercase tracking-wider text-[8px] mb-0.5">Residential Address</p>
                  <p className="text-on-surface font-semibold text-[11px] leading-snug">{profileAddress}</p>
                </div>
              </div>
            )}
          </div>

          {/* My Orders */}
          <div 
            onClick={() => navigate('/orders')}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-surface-container-low transition-colors shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">local_shipping</span>
              </div>
              <h3 className="text-sm font-bold text-on-surface">My Orders</h3>
            </div>
            <span className="material-symbols-outlined text-outline text-lg">chevron_right</span>
          </div>

          {/* Health Information */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection('health')}
              className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-surface-container-low transition-colors outline-none text-left"
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">favorite</span>
                </div>
                <h3 className="text-sm font-bold text-on-surface">Health Information</h3>
              </div>
              <div className="flex items-center gap-2">
                {openSection === 'health' && (
                  <span 
                    onClick={handleEditHealthClick}
                    className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-full hover:bg-primary/20 transition-colors text-sm"
                  >
                    edit
                  </span>
                )}
                <span className={`material-symbols-outlined text-outline transition-transform duration-300 ${openSection === 'health' ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </div>
            </button>
            {openSection === 'health' && (
              <div className="p-4 pt-2 border-t border-outline-variant/30">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {[
                    { label: 'Height', value: user?.health?.height || "5'9\"", icon: 'height', color: 'text-primary' },
                    { label: 'Weight', value: (user?.health?.weight || "72") + " kg", icon: 'monitor_weight', color: 'text-secondary' },
                    { label: 'Blood Group', value: user?.health?.bloodGroup || "B+", icon: 'bloodtype', color: 'text-error' },
                    { label: 'BMI', value: '23.4', icon: 'bar_chart', color: 'text-tertiary' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-surface-container-low rounded-xl p-3 flex items-center gap-3">
                      <span className={`material-symbols-outlined text-xl ${stat.color}`}>{stat.icon}</span>
                      <div>
                        <p className="text-[9px] text-on-surface-variant uppercase font-bold">{stat.label}</p>
                        <p className="text-sm font-black text-on-surface">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/20">
                    <span className="text-on-surface-variant font-semibold">Allergies</span>
                    <span className="text-on-surface font-bold text-right">{user?.health?.allergies || "Penicillin, Dust"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/20">
                    <span className="text-on-surface-variant font-semibold">Chronic Conditions</span>
                    <span className="text-on-surface font-bold">{user?.health?.chronic || "None"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/20">
                    <span className="text-on-surface-variant font-semibold">Current Medications</span>
                    <span className="text-on-surface font-bold">{user?.health?.medications || "None"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-on-surface-variant font-semibold">Last Checkup</span>
                    <span className="text-on-surface font-bold">March 2024</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Family Information */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <SectionHeader icon="family_restroom" title="Family Members" section="family" />
            {openSection === 'family' && (
              <div className="p-4 pt-2 space-y-3 border-t border-outline-variant/30">
                {familyMembers.length === 0 ? (
                  <div className="text-center py-6">
                    <span className="material-symbols-outlined text-4xl text-outline/40 block mb-2">group</span>
                    <p className="text-xs text-on-surface-variant">No family members added.</p>
                    <button
                      onClick={() => navigate('/family/add')}
                      className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      + Add Family Member
                    </button>
                  </div>
                ) : (
                  familyMembers.map(member => (
                    <div
                      key={member.id}
                      className="bg-surface-container-low rounded-xl p-3 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
                      onClick={() => navigate('/family')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden bg-surface-container-high flex items-center justify-center shrink-0">
                          {member.image ? (
                            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-xl text-primary/50">person</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-on-surface font-bold text-xs">{member.name}</p>
                            {member.verified ? (
                              <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            ) : (
                              <span className="text-[9px] bg-surface-container-highest text-on-surface-variant px-1.5 py-0.5 rounded-full font-bold">Pending</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{member.relationship}</span>
                            <span className="text-[10px] text-on-surface-variant">{member.age}</span>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-outline text-base">chevron_right</span>
                      </div>
                    </div>
                  ))
                )}

                <button
                  onClick={() => navigate('/family/add')}
                  className="w-full border border-dashed border-primary/40 rounded-xl py-3 flex items-center justify-center gap-2 text-primary text-xs font-bold hover:bg-primary/5 transition-all cursor-pointer mt-1"
                >
                  <span className="material-symbols-outlined text-base">group_add</span>
                  Add Family Member
                </button>
                <button
                  onClick={() => navigate('/family')}
                  className="w-full text-center text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  Manage All Members →
                </button>
              </div>
            )}
          </div>

          {/* Insurance & Card Details */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <SectionHeader icon="health_and_safety" title="Insurance & Coverage" section="insurance" />
            {openSection === 'insurance' && (
              <div className="p-4 pt-2 border-t border-outline-variant/30 space-y-3">
                <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-4 text-white">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[9px] opacity-70 uppercase font-semibold tracking-wider">Policy Type</p>
                      <p className="text-sm font-bold">Family Floater Plan</p>
                    </div>
                    <span className="material-symbols-outlined text-2xl opacity-80">health_and_safety</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="opacity-70 text-[9px] uppercase">Sum Insured</p>
                      <p className="font-bold">₹10,00,000</p>
                    </div>
                    <div>
                      <p className="opacity-70 text-[9px] uppercase">Premium</p>
                      <p className="font-bold">₹18,000 / yr</p>
                    </div>
                    <div>
                      <p className="opacity-70 text-[9px] uppercase">Policy No.</p>
                      <p className="font-mono font-bold">MC-2024-881923</p>
                    </div>
                    <div>
                      <p className="opacity-70 text-[9px] uppercase">Valid Till</p>
                      <p className="font-bold">31 Mar 2025</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/insurance')}
                  className="w-full text-xs font-bold text-primary flex items-center justify-center gap-1 py-2 hover:underline cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  View Full Insurance Details
                </button>
              </div>
            )}
          </div>

          {/* Card Details */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <SectionHeader icon="credit_card" title="MedCred Card" section="card" />
            {openSection === 'card' && (
              <div className="p-4 pt-2 border-t border-outline-variant/30">
                <div
                  onClick={() => navigate('/card')}
                  className="relative w-full aspect-[1.58/1] rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-primary to-secondary p-5 text-white cursor-pointer hover:scale-[1.01] transition-transform"
                >
                  <div className="flex justify-between items-start">
                    <div className="font-bold tracking-widest text-xs opacity-90">MEDCRED ELITE</div>
                    <span className="material-symbols-outlined text-2xl">medical_services</span>
                  </div>
                  <div className="mt-8">
                    <p className="text-[9px] opacity-70 uppercase tracking-wider">Card Number</p>
                    <p className="text-base font-mono tracking-[4px] font-bold">•••• •••• •••• 4892</p>
                  </div>
                  <div className="mt-6 flex justify-between items-end">
                    <div>
                      <p className="text-[8px] opacity-70 uppercase">Card Holder</p>
                      <p className="text-xs font-bold uppercase">{profileName}</p>
                    </div>
                    <div>
                      <p className="text-[8px] opacity-70 uppercase">Valid Thru</p>
                      <p className="text-xs font-bold">08/28</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-surface-container-low rounded-lg p-2 text-center">
                    <p className="text-[9px] text-on-surface-variant uppercase font-bold">Type</p>
                    <p className="font-bold text-on-surface mt-0.5">Platinum</p>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-2 text-center">
                    <p className="text-[9px] text-on-surface-variant uppercase font-bold">Credit Limit</p>
                    <p className="font-bold text-primary mt-0.5">₹50,000</p>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-2 text-center">
                    <p className="text-[9px] text-on-surface-variant uppercase font-bold">Status</p>
                    <p className="font-bold text-tertiary mt-0.5">Active</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Aadhaar Verification */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <SectionHeader icon="fingerprint" title="Aadhaar Verification" section="aadhaar" />
            {openSection === 'aadhaar' && (
              <div className="p-4 pt-2 border-t border-outline-variant/30 text-xs">
                <div className="flex items-center gap-3 bg-tertiary/10 p-3.5 rounded-xl mt-2 mb-3">
                  <div className="bg-tertiary/20 p-1.5 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-on-surface font-bold text-xs">Status: Fully Verified</p>
                    <p className="text-on-surface-variant text-[10px] mt-0.5">Your identity was verified on Oct 12, 2023 via e-KYC.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                    <span className="text-on-surface-variant">Aadhaar Number</span>
                    <span className="text-on-surface font-bold">XXXX XXXX 5678</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                    <span className="text-on-surface-variant">e-KYC Reference</span>
                    <span className="text-on-surface font-bold">MC-AD-90123-IN</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-on-surface-variant">PAN Linked</span>
                    <span className="text-tertiary font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Yes
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings & Preferences */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <SectionHeader icon="settings" title="Settings & Preferences" section="settings" />
            {openSection === 'settings' && (
              <div className="p-4 pt-2 border-t border-outline-variant/30 space-y-1 text-xs">
                {[
                  { icon: 'notifications', label: 'Push Notifications', value: 'Enabled' },
                  { icon: 'privacy_tip', label: 'Privacy Policy', value: '', action: () => navigate('/privacy') },
                  { icon: 'gavel', label: 'Terms & Conditions', value: '', action: () => navigate('/terms') },
                ].map(item => (
                  <div key={item.label} onClick={item.action} className="flex items-center justify-between py-2.5 border-b border-outline-variant/20 last:border-0 cursor-pointer hover:bg-surface-container-low rounded-lg px-1 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-on-surface-variant text-base">{item.icon}</span>
                      <span className="text-on-surface font-semibold">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1 text-on-surface-variant">
                      {item.value && <span className="font-bold">{item.value}</span>}
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

        {/* Account Actions */}
        <div className="space-y-4 pt-2">
          <button
            onClick={() => {
              clearUser();
              navigate('/login');
            }}
            className="w-full border border-outline text-on-surface-variant text-xs font-bold py-3.5 rounded-xl hover:bg-surface-container-low active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            Logout
            <span className="material-symbols-outlined text-base">logout</span>
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full text-xs text-error font-bold py-3.5 rounded-xl border border-error/30 hover:bg-error/5 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">delete_forever</span>
            Delete Account
          </button>
        </div>

      </main>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center animate-fade-in p-4">
          <div className="bg-white border border-outline-variant/50 w-full max-w-[340px] rounded-2xl p-5 shadow-2xl flex flex-col space-y-4 animate-scale-up">
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
              <h3 className="font-bold text-sm text-primary">Edit Profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="material-symbols-outlined text-outline hover:text-on-surface cursor-pointer text-lg"
              >
                close
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant">Full Name</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant">Email Address</label>
                <input
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant">Phone Number</label>
                <input
                  type="text"
                  value={tempPhone}
                  onChange={(e) => setTempPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 border border-outline text-on-surface-variant text-xs font-bold py-2 rounded-xl hover:bg-surface-container-low cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Health Modal */}
      {isHealthEditing && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center animate-fade-in p-4">
          <div className="bg-white border border-outline-variant/50 w-full max-w-[340px] rounded-2xl p-5 shadow-2xl flex flex-col space-y-4 animate-scale-up h-auto max-h-[80vh] overflow-y-auto hide-scrollbar">
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-sm text-primary">Edit Health Info</h3>
              <button
                onClick={() => setIsHealthEditing(false)}
                className="material-symbols-outlined text-outline hover:text-on-surface cursor-pointer text-lg"
              >
                close
              </button>
            </div>

            <form onSubmit={handleSaveHealth} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant">Height</label>
                  <input
                    type="text"
                    value={tempHealth.height}
                    onChange={(e) => setTempHealth({ ...tempHealth, height: e.target.value })}
                    placeholder="e.g. 5'9&quot;"
                    className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant">Weight (kg)</label>
                  <input
                    type="number"
                    value={tempHealth.weight}
                    onChange={(e) => setTempHealth({ ...tempHealth, weight: e.target.value })}
                    placeholder="e.g. 72"
                    className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant">Blood Group</label>
                <select
                  value={tempHealth.bloodGroup}
                  onChange={(e) => setTempHealth({ ...tempHealth, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant">Allergies</label>
                <input
                  type="text"
                  value={tempHealth.allergies}
                  onChange={(e) => setTempHealth({ ...tempHealth, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Dust (or None)"
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant">Chronic Conditions</label>
                <input
                  type="text"
                  value={tempHealth.chronic}
                  onChange={(e) => setTempHealth({ ...tempHealth, chronic: e.target.value })}
                  placeholder="e.g. Asthma, Diabetes (or None)"
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant">Current Medications</label>
                <input
                  type="text"
                  value={tempHealth.medications}
                  onChange={(e) => setTempHealth({ ...tempHealth, medications: e.target.value })}
                  placeholder="e.g. Inhaler (or None)"
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2 pb-1">
                <button
                  type="button"
                  onClick={() => setIsHealthEditing(false)}
                  className="flex-1 border border-outline text-on-surface-variant text-xs font-bold py-2 rounded-xl hover:bg-surface-container-low cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center animate-fade-in p-4">
          <div className="bg-white border border-outline-variant/50 w-full max-w-[320px] rounded-2xl p-6 shadow-2xl flex flex-col space-y-4 animate-scale-up text-center relative">
            <div className="w-14 h-14 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-1">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>
            <div>
              <h3 className="font-black text-xl text-on-surface">Delete Account?</h3>
              <p className="text-xs text-on-surface-variant mt-2">This action cannot be undone. All your personal data, health records, and family details will be permanently removed.</p>
            </div>
            
            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 border border-outline text-on-surface-variant text-sm font-bold py-3 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearUser();
                  navigate('/');
                }}
                className="flex-1 bg-error text-white text-sm font-bold py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
