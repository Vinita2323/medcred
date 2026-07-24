import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/Navigation/BottomNavBar';
import { getUser, updateUser, getFamilyMembers, clearUser, formatDobDisplay, getAgeFromDob, isLoggedIn } from '../utils/storage';
import api from '../../../services/api';
import { ENDPOINTS, SERVER_URL, getImageUrl } from '../../../services/types';
import { compressImage } from '../../../utils/compressImage';

const DEFAULT_AVATAR = null;

const calculateBMI = (height, weight) => {
  if (!height || !weight) return "Not Set";
  let hInCm = parseFloat(height);
  if (height.includes("'")) {
    const parts = height.split("'");
    const feet = parseFloat(parts[0]) || 0;
    const inches = parseFloat(parts[1]?.replace('"', '')) || 0;
    hInCm = (feet * 12 + inches) * 2.54;
  }
  const wInKg = parseFloat(weight);
  if (isNaN(hInCm) || isNaN(wInKg) || hInCm <= 0 || wInKg <= 0) return "Not Set";
  const hInM = hInCm / 100;
  return (wInKg / (hInM * hInM)).toFixed(1);
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Live data from localStorage and API
  const [user, setUser] = useState(null);
  const [card, setCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [imageErrors, setImageErrors] = useState({ front: false, back: false, profile: false });

  // Temp edit fields
  const [tempName, setTempName] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [tempPhone, setTempPhone] = useState('');
  const [tempAddress, setTempAddress] = useState('');
  const [tempOccupation, setTempOccupation] = useState('');
  const [tempIncome, setTempIncome] = useState('');
  const [tempBloodGroup, setTempBloodGroup] = useState('');

  // File upload ref
  const fileInputRef = React.useRef(null);

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
      fetchProfile();
    } else {
      setIsLoading(false);
      navigate('/login');
    }
  }, []);

  const [photoViewerData, setPhotoViewerData] = useState(null);

  // Prevent background scroll when modals are open
  useEffect(() => {
    if (isEditing || isHealthEditing || isDeleteModalOpen || photoViewerData) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isEditing, isHealthEditing, isDeleteModalOpen, photoViewerData]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const [profileRes, cardRes, familyRes] = await Promise.all([
        api.get(ENDPOINTS.USER_PROFILE),
        api.get(ENDPOINTS.MY_CARD).catch(() => ({ data: { success: false } })),
        api.get(ENDPOINTS.FAMILY_MEMBERS).catch(() => ({ data: { success: false, data: [] } }))
      ]);

      if (profileRes.data.success) {
        const userData = profileRes.data.data;
        const mappedUser = {
          ...userData,
          name: userData.fullName,
          profilePic: userData.profilePhoto
        };
        setUser(mappedUser);
        updateUser(mappedUser);
      }

      if (cardRes.data?.success) {
        setCard(cardRes.data.data);
      }

      if (familyRes.data?.success) {
        setFamilyMembers(familyRes.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUser(getUser());
    } finally {
      setIsLoading(false);
    }
  };

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

  const getImageUrl = (url, cacheBust) => {
    if (!url) return null;
    let finalUrl = url.startsWith('http') ? url : `${SERVER_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    if (cacheBust) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + `t=${cacheBust}`;
    }
    return finalUrl;
  };

  // Derived display values (fallback to demo if no user registered)
  const profileName = user?.name || 'User Profile';
  const profileEmail = user?.email || 'No email provided';
  const profilePhone = user?.mobile ? `+91 ${user.mobile}` : 'No phone provided';
  const profileDob = user?.dob ? formatDobDisplay(user.dob) : 'Not provided';
  const profileGender = user?.gender || 'Not provided';
  const profileAddress = user?.address || 'Not provided';
  const profilePic = getImageUrl(user?.profilePic);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleEditClick = () => {
    setTempName(profileName);
    setTempEmail(profileEmail);
    setTempPhone(user?.mobile || '');
    setTempAddress(user?.address || '');
    setTempOccupation(user?.occupation || '');
    setTempIncome(user?.annualIncome || user?.income || '');
    setTempBloodGroup(user?.bloodGroup || '');
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!tempName || !tempEmail || !tempPhone) {
      alert('Name, Email and Phone are required.');
      return;
    }
    if (tempName.trim().length < 3) {
      alert('Name must be at least 3 characters long.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(tempPhone)) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    if (tempIncome && Number(tempIncome) < 0) {
      alert('Income cannot be negative.');
      return;
    }

    try {
      const data = {
        name: tempName,
        email: tempEmail,
        mobile: tempPhone,
        address: tempAddress,
        occupation: tempOccupation,
        income: tempIncome,
        bloodGroup: tempBloodGroup,
      };
      const response = await api.patch(ENDPOINTS.USER_PROFILE, data);
      if (response.data.success) {
        const updatedUser = {
          ...user,
          name: response.data.data.fullName,
          email: response.data.data.email,
          mobile: response.data.data.mobile,
          address: response.data.data.address,
          occupation: response.data.data.occupation,
          annualIncome: response.data.data.annualIncome,
          income: response.data.data.annualIncome,
          bloodGroup: response.data.data.bloodGroup
        };
        setUser(updatedUser);
        updateUser(updatedUser);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  const [profilePicCacheBust, setProfilePicCacheBust] = useState(Date.now());

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append('profilePhoto', compressed);

      // Do NOT set manual 'Content-Type': 'multipart/form-data' so Axios attached boundary automatically
      const response = await api.patch(ENDPOINTS.USER_PROFILE, formData);

      if (response.data.success) {
        const updatedUser = {
          ...user,
          profilePic: response.data.data.profilePhoto
        };
        setUser(updatedUser);
        updateUser(updatedUser);
        setProfilePicCacheBust(Date.now());
        setImageErrors(prev => ({ ...prev, profile: false }));
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please check your image format and try again.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleEditHealthClick = (e) => {
    e.stopPropagation(); // Prevent toggling the accordion
    setTempHealth({
      height: user?.health?.height || "",
      weight: user?.health?.weight || "",
      bloodGroup: user?.bloodGroup || user?.health?.bloodGroup || "",
      allergies: user?.health?.allergies || "",
      chronic: user?.health?.chronic || "",
      medications: user?.health?.medications || ""
    });
    setIsHealthEditing(true);
  };

  const handleSaveHealth = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch(ENDPOINTS.USER_PROFILE, {
        health: tempHealth,
        bloodGroup: tempHealth.bloodGroup
      });
      if (response.data.success) {
        const updatedUser = {
          ...user,
          health: response.data.data.health
        };
        setUser(updatedUser);
        updateUser(updatedUser);
        setIsHealthEditing(false);
      }
    } catch (error) {
      console.error('Error updating health info:', error);
      alert('Failed to update health info.');
    }
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
    <div className="flex-grow flex flex-col bg-surface lg:bg-[#F4F7FD] text-on-surface font-body-md relative pb-24 lg:pb-0 min-h-screen">
      {/* Decorative desktop backgrounds */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxjaXJjbGUgY3g9IjMiIGN5PSIzIiByPSIxIiBmaWxsPSIjZDVkOWU0Ij48L2NpcmNsZT4KPC9zdmc+')] [mask-image:radial-gradient(ellipse_at_top_left,black_20%,transparent_70%)]"></div>

      {/* Profile Header */}
      <header className="flex items-center px-4 lg:px-8 w-full h-16 lg:h-20 sticky top-0 z-40 bg-surface lg:bg-white shadow-sm border-b border-outline-variant/30">
        <button onClick={() => navigate(-1)} className="material-symbols-outlined text-on-surface hover:bg-surface-variant p-2 rounded-full lg:bg-gray-50 -ml-2 lg:ml-0 transition-colors cursor-pointer">
          arrow_back
        </button>
        <h1 className="flex-1 text-center text-lg lg:text-xl font-bold text-on-surface mr-8 lg:mr-10">My Profile</h1>
      </header>

      {/* Main Content */}
      <main className={`flex-grow ${isEditing || isHealthEditing || isDeleteModalOpen ? 'overflow-hidden' : 'overflow-y-auto'} p-4 lg:p-8 space-y-5 lg:space-y-0 max-w-md lg:max-w-6xl mx-auto w-full animate-fade-in relative z-10 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start`}>

        {/* Left Column (Desktop) / Top (Mobile) */}
        <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-5">
        {/* Hero Profile Section */}
        <section className="flex flex-col items-center text-center mt-2 lg:mt-0 lg:bg-white lg:p-8 lg:rounded-[32px] lg:shadow-xl lg:border lg:border-blue-100">
          <div className="relative inline-block">
            <div 
              className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary to-secondary shadow-lg relative cursor-pointer group" 
              onClick={() => setPhotoViewerData({
                url: profilePic && !imageErrors.profile ? getImageUrl(profilePic, profilePicCacheBust) : null,
                title: profileName,
                subtitle: 'Profile Photo',
                canEdit: true,
                isProfile: true
              })}
              title="Click to view profile picture"
            >
              {profilePic && !imageErrors.profile ? (
                <img 
                  alt={profileName} 
                  className="w-full h-full rounded-full border-4 border-surface object-cover transition-transform group-hover:scale-105" 
                  src={getImageUrl(profilePic, profilePicCacheBust)} 
                  onError={() => setImageErrors(prev => ({...prev, profile: true}))}
                />
              ) : (
                <div className="w-full h-full rounded-full border-4 border-surface bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-primary/50">person</span>
                </div>
              )}
              {/* View Icon Overlay */}
              <div className="absolute inset-1 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-2xl">visibility</span>
              </div>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="absolute bottom-1 right-1 bg-white rounded-full p-1.5 shadow-md flex items-center justify-center z-10 border border-outline-variant/30 hover:bg-gray-100 cursor-pointer active:scale-90 transition-transform"
                title="Change Photo"
              >
                <span className="material-symbols-outlined text-primary text-[14px] font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>edit</span>
              </button>
            </div>
            {/* Hidden file input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,image/*" 
              onChange={handlePhotoUpload} 
            />
            <div className="absolute bottom-1 right-1 bg-white rounded-full p-0.5 shadow-md flex items-center justify-center pointer-events-none">
              <span className="material-symbols-outlined text-tertiary text-lg font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
          </div>

          <div className="mt-3">
            <h2 className="text-xl font-bold text-on-surface">{profileName}</h2>
            {user?.kycStatus === 'verified' && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-tertiary font-bold text-[10px] uppercase tracking-wider">Aadhaar Verified</span>
                <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
            )}
          </div>

        </section>

        {/* Account Actions (Desktop only) */}
        <div className="hidden lg:block space-y-4 pt-2">
          <button
            onClick={() => {
              clearUser();
              navigate('/login');
            }}
            className="w-full border border-outline text-on-surface-variant text-xs font-bold py-3.5 rounded-xl hover:bg-surface-container-low active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm bg-white"
          >
            Logout
            <span className="material-symbols-outlined text-base">logout</span>
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full text-xs text-error font-bold py-3.5 rounded-xl border border-error/30 hover:bg-error/5 transition-all cursor-pointer flex items-center justify-center gap-2 bg-white"
          >
            <span className="material-symbols-outlined text-base">delete_forever</span>
            Delete Account
          </button>
        </div>

        </div>

        {/* Right Column (Desktop) / Bottom (Mobile) */}
        <div className="lg:col-span-8 lg:bg-white lg:p-8 lg:rounded-[32px] lg:shadow-xl lg:border lg:border-blue-100 space-y-5">
        {/* Expandable Sections */}
        <section className="space-y-3 lg:space-y-4">

          {/* Personal Information */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <SectionHeader icon="person" title="Personal Information" section="personal" />
            {openSection === 'personal' && (
              <div className="p-3 pt-2 border-t border-outline-variant/30">
                <div className="flex justify-end mb-2">
                  <button onClick={handleEditClick} className="text-xs text-primary font-bold flex items-center gap-1 hover:underline cursor-pointer bg-primary/5 px-2 py-1 rounded-lg">
                    <span className="material-symbols-outlined text-[14px]">edit</span> Edit Details
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-xs">
                  <InfoRow label="Full Name" value={profileName} />
                  <InfoRow label="Email Address" value={profileEmail} />
                  <InfoRow label="Phone Number" value={profilePhone} />
                  <InfoRow label="Date of Birth" value={profileDob} />
                  <InfoRow label="Gender" value={profileGender} />
                  <InfoRow label="Blood Group" value={user?.bloodGroup || '—'} />
                  <InfoRow label="Occupation" value={user?.occupation || '—'} />
                  <InfoRow label="Annual Income" value={user?.annualIncome ? `₹${user.annualIncome}` : user?.income ? `₹${user.income}` : '—'} />
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
                <span className={`material-symbols-outlined text-outline transition-transform duration-300 ${openSection === 'health' ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </div>
            </button>
            {openSection === 'health' && (
              <div className="p-4 pt-2 border-t border-outline-variant/30">
                <div className="flex justify-end mb-2">
                  <button onClick={handleEditHealthClick} className="text-xs text-primary font-bold flex items-center gap-1 hover:underline cursor-pointer bg-primary/5 px-2 py-1 rounded-lg">
                    <span className="material-symbols-outlined text-[14px]">edit</span> Edit Health Profile
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {[
                    { label: 'Height', value: user?.health?.height || "Not Set", icon: 'height', color: 'text-primary' },
                    { label: 'Weight', value: user?.health?.weight ? `${user.health.weight} kg` : "Not Set", icon: 'monitor_weight', color: 'text-secondary' },
                    { label: 'Blood Group', value: user?.bloodGroup || user?.health?.bloodGroup || "Not Set", icon: 'bloodtype', color: 'text-error' },
                    { label: 'BMI', value: calculateBMI(user?.health?.height, user?.health?.weight), icon: 'bar_chart', color: 'text-tertiary' },
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
                    <span className="text-on-surface font-bold text-right">{user?.health?.allergies || "Not Set"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/20">
                    <span className="text-on-surface-variant font-semibold">Chronic Conditions</span>
                    <span className="text-on-surface font-bold">{user?.health?.chronic || "Not Set"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/20">
                    <span className="text-on-surface-variant font-semibold">Current Medications</span>
                    <span className="text-on-surface font-bold">{user?.health?.medications || "Not Set"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-on-surface-variant font-semibold">Last Checkup</span>
                    <span className="text-on-surface font-bold">Not Set</span>
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
                      key={member._id || member.id}
                      className="bg-surface-container-low rounded-xl p-3 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
                      onClick={() => navigate('/family')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden bg-surface-container-high flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-xl text-primary/50">person</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-on-surface font-bold text-xs">{member.name}</p>
                            {member.verificationStatus === 'verified' || member.verified ? (
                              <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            ) : (
                              <span className="text-[9px] bg-surface-container-highest text-on-surface-variant px-1.5 py-0.5 rounded-full font-bold capitalize">{member.verificationStatus || 'Pending'}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{member.relationship}</span>
                            <span className="text-[10px] text-on-surface-variant">{member.dob ? getAgeFromDob(member.dob) : member.age}</span>
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



          {/* Card Details */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <SectionHeader icon="credit_card" title="MedCred Card" section="card" />
            {openSection === 'card' && (
              <div className="p-4 pt-2 border-t border-outline-variant/30">
                {!card ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="material-symbols-outlined text-3xl text-on-surface-variant">credit_card_off</span>
                    </div>
                    <h3 className="font-bold text-on-surface text-sm mb-1">No Active Plan</h3>
                    <p className="text-xs text-on-surface-variant mb-4 max-w-[250px] mx-auto">Purchase a MedCred health plan to get your digital card.</p>
                    <button 
                      onClick={() => navigate('/membership-plans')}
                      className="bg-primary text-white text-xs font-bold py-2.5 px-6 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm"
                    >
                      View Plans
                    </button>
                  </div>
                ) : (
                <>
                <div
                  onClick={() => navigate('/card')}
                  className="relative w-full md:max-w-[420px] md:mx-auto aspect-[1.58/1] rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-primary to-secondary p-5 text-white cursor-pointer hover:scale-[1.01] transition-transform"
                >
                  <div className="flex justify-between items-start">
                    <div className="font-bold tracking-widest text-xs opacity-90 uppercase">{card?.planName || 'MEDCRED ELITE'}</div>
                    <span className="material-symbols-outlined text-2xl">medical_services</span>
                  </div>
                  <div className="mt-8">
                    <p className="text-[9px] opacity-70 uppercase tracking-wider">Card Number</p>
                    <p className="text-base font-mono tracking-[4px] font-bold">{card?.cardNumber || '•••• •••• •••• 4892'}</p>
                  </div>
                  <div className="mt-6 flex justify-between items-end">
                    <div>
                      <p className="text-[8px] opacity-70 uppercase">Card Holder</p>
                      <p className="text-xs font-bold uppercase">{profileName}</p>
                    </div>
                    <div>
                      <p className="text-[8px] opacity-70 uppercase">Valid Thru</p>
                      <p className="text-xs font-bold">{card ? new Date(card.validTill).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }).replace('/', '/') : '08/28'}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs md:max-w-[420px] md:mx-auto">
                  <div className="bg-surface-container-low rounded-lg p-2 text-center">
                    <p className="text-[9px] text-on-surface-variant uppercase font-bold">Type</p>
                    <p className="font-bold text-on-surface mt-0.5 capitalize">{card?.cardType || 'Platinum'}</p>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-2 text-center">
                    <p className="text-[9px] text-on-surface-variant uppercase font-bold">Status</p>
                    <p className="font-bold text-tertiary mt-0.5">Active</p>
                  </div>
                </div>
                </>
                )}
              </div>
            )}
          </div>

          {/* Aadhaar Verification */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <SectionHeader icon="fingerprint" title="Aadhaar Verification" section="aadhaar" />
            {openSection === 'aadhaar' && (
              <div className="p-4 pt-2 border-t border-outline-variant/30 text-xs">
                {user?.kycStatus === 'verified' ? (
                  <div className="flex items-center gap-3 bg-tertiary/10 p-3.5 rounded-xl mt-2 mb-3">
                    <div className="bg-tertiary/20 p-1.5 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-tertiary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-on-surface font-bold text-xs">Status: Fully Verified</p>
                      <p className="text-on-surface-variant text-[10px] mt-0.5">Your identity was verified via e-KYC.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-error/10 p-3.5 rounded-xl mt-2 mb-3">
                    <div className="bg-error/20 p-1.5 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-error text-base">error</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-on-surface font-bold text-xs capitalize">Status: {user?.kycStatus || 'Not Submitted'}</p>
                      <p className="text-on-surface-variant text-[10px] mt-0.5">Please complete your KYC verification.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                    <span className="text-on-surface-variant">Aadhaar Number</span>
                    <span className="text-on-surface font-bold font-mono">
                      {user?.aadhaarNumber ? `XXXX-XXXX-${user.aadhaarNumber.slice(-4)}` : 'Not provided'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                    <span className="text-on-surface-variant">PAN Number</span>
                    <span className="text-on-surface font-bold font-mono">{user?.panNumber || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-on-surface-variant">Verification Level</span>
                    <span className="text-on-surface font-bold">Tier 1 (Basic)</span>
                  </div>

                  {/* Aadhaar Images */}
                  <div className="pt-3 border-t border-outline-variant/30">
                    <p className="text-on-surface-variant font-semibold uppercase tracking-wider text-[10px] mb-2">Aadhaar Documents</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-on-surface-variant text-center">Front</span>
                        <div 
                          className="w-full aspect-[1.58/1] bg-surface-container rounded-xl overflow-hidden border border-outline-variant/50 flex items-center justify-center cursor-pointer relative group"
                          onClick={() => {
                            const url = user?.kycRef?.aadhaarFrontUrl || user?.aadhaarFrontUrl;
                            if (url && !imageErrors.front) {
                              setPhotoViewerData({
                                url: getImageUrl(url),
                                title: profileName,
                                subtitle: 'Aadhaar Front',
                                canEdit: false,
                                isProfile: false
                              });
                            }
                          }}
                        >
                          {(user?.kycRef?.aadhaarFrontUrl || user?.aadhaarFrontUrl) && !imageErrors.front ? (
                            <>
                              <img 
                                src={getImageUrl(user?.kycRef?.aadhaarFrontUrl || user?.aadhaarFrontUrl)} 
                                alt="Aadhaar Front" 
                                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                                onError={() => setImageErrors(prev => ({ ...prev, front: true }))}
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-white text-2xl">visibility</span>
                              </div>
                            </>
                          ) : (
                            <span className="material-symbols-outlined text-outline text-2xl">badge</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-on-surface-variant text-center">Back</span>
                        <div 
                          className="w-full aspect-[1.58/1] bg-surface-container rounded-xl overflow-hidden border border-outline-variant/50 flex items-center justify-center cursor-pointer relative group"
                          onClick={() => {
                            const url = user?.kycRef?.aadhaarBackUrl || user?.aadhaarBackUrl;
                            if (url && !imageErrors.back) {
                              setPhotoViewerData({
                                url: getImageUrl(url),
                                title: profileName,
                                subtitle: 'Aadhaar Back',
                                canEdit: false,
                                isProfile: false
                              });
                            }
                          }}
                        >
                          {(user?.kycRef?.aadhaarBackUrl || user?.aadhaarBackUrl) && !imageErrors.back ? (
                            <>
                              <img 
                                src={getImageUrl(user?.kycRef?.aadhaarBackUrl || user?.aadhaarBackUrl)} 
                                alt="Aadhaar Back" 
                                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                                onError={() => setImageErrors(prev => ({ ...prev, back: true }))}
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-white text-2xl">visibility</span>
                              </div>
                            </>
                          ) : (
                            <span className="material-symbols-outlined text-outline text-2xl">credit_card</span>
                          )}
                        </div>
                      </div>
                    </div>
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
                  { icon: 'badge', label: 'KYC Verification', value: user?.kycStatus === 'verified' ? 'Verified' : user?.kycStatus === 'pending' ? 'Under Review' : 'Pending', action: () => navigate('/kyc') },
                  { icon: 'notifications', label: 'Push Notifications', value: 'Enabled', action: () => alert('Push notifications are managed in your device settings.') },
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

        {/* Account Actions (Mobile Only) */}
        <div className="space-y-4 pt-2 lg:hidden">
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
        </div>

      </main>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center animate-fade-in p-4">
          <div className="bg-white border border-outline-variant/50 w-full max-w-[340px] rounded-2xl p-5 shadow-2xl flex flex-col space-y-4 animate-scale-up h-auto max-h-[80vh] overflow-y-auto hide-scrollbar">
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
                  minLength={3}
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
                  type="tel"
                  value={tempPhone}
                  onChange={(e) => setTempPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  required
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  title="Please enter a valid 10-digit Indian phone number starting with 6-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant">Residential Address</label>
                <input
                  type="text"
                  value={tempAddress}
                  onChange={(e) => setTempAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant">Occupation</label>
                <input
                  type="text"
                  value={tempOccupation}
                  onChange={(e) => setTempOccupation(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant">Annual Income (₹)</label>
                <input
                  type="number"
                  value={tempIncome}
                  onChange={(e) => setTempIncome(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  min={0}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant">Blood Group</label>
                <select
                  value={tempBloodGroup}
                  onChange={(e) => setTempBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="">Select Blood Group</option>
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
              {/* Add spacing at the bottom so native select dropdowns don't get cut off by overflow-hidden */}
              <div className="h-40"></div>
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
                    placeholder="e.g. 5'9&quot; or 175cm"
                    className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
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
                  />
                </div>
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

      {/* WhatsApp Style Full-Screen Photo Viewer Modal */}
      {photoViewerData && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between animate-fade-in text-white"
          onClick={() => setPhotoViewerData(null)}
        >
          {/* Top Bar */}
          <div 
            className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setPhotoViewerData(null)} 
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">arrow_back</span>
              </button>
              <div>
                <h3 className="font-bold text-base leading-tight">{photoViewerData.title}</h3>
                <p className="text-[11px] text-gray-400">{photoViewerData.subtitle}</p>
              </div>
            </div>

            {photoViewerData.canEdit && (
              <button 
                type="button"
                onClick={() => {
                  setPhotoViewerData(null);
                  fileInputRef.current?.click();
                }}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold px-4 py-2 rounded-full transition-all cursor-pointer shadow-lg active:scale-95"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                <span>Change Photo</span>
              </button>
            )}
          </div>

          {/* Main Photo Content */}
          <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
            {photoViewerData.url ? (
              <img 
                src={photoViewerData.url} 
                alt={photoViewerData.subtitle}
                className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-2xl shadow-2xl transition-transform duration-300 scale-100"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="w-64 h-64 rounded-full bg-white/10 border-4 border-white/20 flex flex-col items-center justify-center gap-3">
                <span className="material-symbols-outlined text-7xl text-gray-400">{photoViewerData.isProfile ? 'person' : 'image'}</span>
                <p className="text-xs text-gray-300 font-semibold">No Photo Uploaded</p>
                {photoViewerData.canEdit && (
                  <button 
                    type="button"
                    onClick={() => {
                      setPhotoViewerData(null);
                      fileInputRef.current?.click();
                    }}
                    className="mt-2 text-xs font-bold bg-primary text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
                  >
                    Upload Photo
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bottom Bar / Caption */}
          <div 
            className="p-4 bg-gradient-to-t from-black/80 to-transparent text-center text-xs text-gray-400 font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            Tap anywhere outside to close
          </div>
        </div>
      )}

      {!(isEditing || isHealthEditing || isDeleteModalOpen || photoViewerData) && <BottomNavBar />}
    </div>
  );
}
