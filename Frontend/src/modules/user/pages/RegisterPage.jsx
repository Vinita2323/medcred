import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveUser, seedSelfMember, saveFamilyMembers, getAgeFromDob } from '../utils/storage';
import api from '../../../services/api';
import { ENDPOINTS, STORAGE_KEYS } from '../../../services/types';
import { compressImage } from '../../../utils/compressImage';
import { useFormValidation } from '../../../hooks/useFormValidation';

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
  const location = useLocation();

  // ── Personal form ────────────────────────────────────────────────
  const { values: formData, errors, touched, handleChange, handleBlur, validateForm, setValues: setFormData } = useFormValidation(
    {
      name: '', mobile: location.state?.mobile || '', email: '', dob: '',
      gender: '', aadhaar: '', address: '', password: '', consent: false
    },
    {
      name: { required: true, pattern: /^[a-zA-Z\s]{2,50}$/, message: 'Enter a valid name (alphabets and spaces only)' },
      mobile: { required: true, pattern: /^[6-9]\d{9}$/, message: 'Invalid mobile number (10 digits starting with 6-9)' },
      email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email (e.g., name@example.com)' },
      dob: { required: true },
      gender: { required: true },
      aadhaar: { pattern: /^(\d\s*){12}$/, message: 'Enter a valid 12-digit Aadhaar number' },
      address: { required: true },
      password: { required: true, pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, message: 'Password must be 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char' }
    }
  );
  const [profilePic, setProfilePic] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [aadhaarFrontPic, setAadhaarFrontPic] = useState(null);
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState(null);
  const [aadhaarBackPic, setAadhaarBackPic] = useState(null);
  const [aadhaarBackFile, setAadhaarBackFile] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const isSubmitting = useRef(false);

  // Mobile Verification states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState(30);
  const [successMsg, setSuccessMsg] = useState('');
  const inputRefs = useRef([]);


  useEffect(() => {
    let timer;
    if (showOtpModal && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer, showOtpModal]);

  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    // Focus next input
    if (val && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResendOtp = async () => {
    if (isSubmitting.current) return;
    try {
      isSubmitting.current = true;
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      await api.post('/auth/resend-otp', { mobile: formData.mobile, purpose: 'register' });
      setResendTimer(30);
      setOtp(new Array(6).fill(''));
      setSuccessMsg('OTP resent successfully.');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  // ── Family members ───────────────────────────────────────────────
  const [familyMembers, setFamilyMembers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ ...EMPTY_MEMBER });
  const [showPassword, setShowPassword] = useState(false);

  // Initialize from sessionStorage if available
  useEffect(() => {
    const savedData = sessionStorage.getItem('medcred_user_reg');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.familyMembers) setFamilyMembers(parsed.familyMembers);
      } catch (e) {
        console.error('Error parsing saved registration data', e);
      }
    }
  }, [setFormData]);

  // Save to sessionStorage when changed
  useEffect(() => {
    const dataToSave = { formData, familyMembers };
    sessionStorage.setItem('medcred_user_reg', JSON.stringify(dataToSave));
  }, [formData, familyMembers]);

  // Note: handleChange from useFormValidation is used instead of handleInputChange

  const handleImageChange = async (e, setPreview, setFile) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const compressed = await compressImage(file);
      setFile(compressed);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(compressed);
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    setErrorMsg('');
    setSuccessMsg('');

    // Form validations
    if (!validateForm()) {
      setErrorMsg('Please fix the validation errors in the form.');
      return;
    }
    
    if (!formData.consent) {
      alert('Please agree to the verification terms to continue.');
      return;
    }

    try {
      isSubmitting.current = true;
      setLoading(true);
      // Trigger Send OTP
      const res = await api.post('/auth/send-otp', { mobile: formData.mobile, purpose: 'register' });
      if (res.data.success) {
        setShowOtpModal(true);
        setResendTimer(30);
        setOtp(new Array(6).fill(''));
        setSuccessMsg('OTP sent successfully to your mobile number.');
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const handleVerifyAndRegister = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setErrorMsg('Please enter the complete 6-digit OTP.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      
      // Step 1: Verify OTP
      const verifyRes = await api.post('/auth/verify-otp', { mobile: formData.mobile, otp: otpCode, purpose: 'register' });
      if (!verifyRes.data.success) {
        throw new Error('OTP verification failed.');
      }

      // Step 2: Register user immediately
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('mobile', formData.mobile);
      payload.append('email', formData.email);
      payload.append('dob', formData.dob);
      payload.append('gender', formData.gender);
      payload.append('aadhaar', formData.aadhaar);
      payload.append('address', formData.address);
      payload.append('password', formData.password);
      payload.append('consent', formData.consent);
      payload.append('familyMembers', JSON.stringify(familyMembers));
      
      if (profileFile) {
        payload.append('profilePic', profileFile);
      }
      if (aadhaarFrontFile) {
        payload.append('aadhaarFront', aadhaarFrontFile);
      }
      if (aadhaarBackFile) {
        payload.append('aadhaarBack', aadhaarBackFile);
      }

      const res = await api.post(ENDPOINTS.USER_REGISTER, payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        // Build Self member + all added family members
        const selfMember = {
          id: 'MC-SELF',
          name: formData.name,
          relationship: 'Self',
          age: getAgeFromDob(formData.dob),
          dob: formData.dob,
          bloodGroup: '',
          gender: formData.gender,
          verified: true,
          image: profilePic || null,
        };
        saveFamilyMembers([selfMember, ...familyMembers]);

        // Save tokens and user data
        if (res.data.data && res.data.data.accessToken) {
          const { accessToken, refreshToken, user } = res.data.data;
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        }

        setShowOtpModal(false);
        setShowSuccess(true);
        sessionStorage.removeItem('medcred_user_reg');
        setTimeout(() => {
          setShowSuccess(false);
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || error.message || 'Verification or registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const relationshipOptions = ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Other'];

  return (
    <div className="flex-grow flex flex-col bg-surface lg:bg-[#F4F7FD] text-on-surface font-body-md relative animate-fade-in h-screen overflow-hidden">
      {/* Decorative desktop backgrounds */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxjaXJjbGUgY3g9IjMiIGN5PSIzIiByPSIxIiBmaWxsPSIjZDVkOWU0Ij48L2NpcmNsZT4KPC9zdmc+')] [mask-image:radial-gradient(ellipse_at_top_left,black_20%,transparent_70%)]"></div>
      
      {/* TopAppBar */}
      <header className="flex justify-between items-center px-4 lg:px-8 w-full h-16 lg:h-20 shrink-0 z-40 bg-surface lg:bg-white shadow-sm border-b border-outline-variant/30">
        <div className="flex items-center gap-3 lg:gap-5">
          <button
            onClick={() => navigate(-1)}
            className="material-symbols-outlined text-primary hover:opacity-80 transition-opacity cursor-pointer lg:bg-gray-50 lg:p-2 lg:rounded-full"
          >
            arrow_back
          </button>
          <img src="/FinalLogo.png" alt="MedCred Logo" className="h-10 lg:h-12 w-auto object-contain" />
        </div>
        <div 
          onClick={() => navigate('/support')}
          className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-surface-container-high lg:bg-blue-50 flex items-center justify-center text-primary cursor-pointer hover:bg-blue-100 transition-colors"
        >
          <span className="material-symbols-outlined lg:text-xl">help_outline</span>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto px-4 py-5 pb-8 lg:py-10 relative z-10 flex justify-center">
        <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-8 max-w-md lg:max-w-4xl w-full mx-auto lg:bg-white lg:shadow-xl lg:rounded-3xl lg:p-8 lg:border lg:border-blue-100">
          {/* ── Section 1: Personal Information ─────────────────── */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            {/* Section Header */}
            <div className="flex items-center gap-3 px-4 lg:px-6 py-3 lg:py-4 bg-primary/5 border-b border-outline-variant/30">
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-white text-xs lg:text-sm font-black">1</span>
              </div>
              <div>
                <h2 className="text-sm lg:text-base font-bold text-on-surface">Personal Information</h2>
                <p className="text-[10px] lg:text-xs text-on-surface-variant">As per your Aadhaar card</p>
              </div>
            </div>

            <div className="p-4 lg:p-6 space-y-3.5 lg:space-y-5">
              <div className="lg:grid lg:grid-cols-2 lg:gap-5 space-y-3.5 lg:space-y-0">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-0.5">Full Name *</label>
                <input
                  className={`w-full h-11 px-3 bg-surface border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${touched.name && errors.name ? 'border-red-500' : 'border-outline-variant'}`}
                  placeholder="e.g. Rahul Sharma"
                  type="text" name="name" value={formData.name}
                  onChange={handleChange} onBlur={handleBlur} required
                />
                {touched.name && errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name}</p>}
              </div>

              {/* Mobile */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-0.5">Mobile Number *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant border-r border-outline-variant pr-2">+91</span>
                  <input
                    className={`w-full h-11 pl-14 pr-3 bg-surface border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${touched.mobile && errors.mobile ? 'border-red-500' : 'border-outline-variant'}`}
                    placeholder="98765 43210"
                    type="tel" name="mobile" value={formData.mobile}
                    maxLength={10}
                    onChange={handleChange} onBlur={handleBlur} required
                  />
                </div>
                {touched.mobile && errors.mobile && <p className="text-red-500 text-[10px] mt-1">{errors.mobile}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-0.5">Email Address *</label>
                <input
                  className={`w-full h-11 px-3 bg-surface border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${touched.email && errors.email ? 'border-red-500' : 'border-outline-variant'}`}
                  placeholder="rahul@example.com"
                  type="email" name="email" value={formData.email}
                  onChange={handleChange} onBlur={handleBlur} required
                />
                {touched.email && errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] lg:text-xs font-bold text-on-surface-variant uppercase tracking-wider px-0.5">Create Password *</label>
                <div className="relative">
                  <input
                    className={`w-full h-11 lg:h-12 px-3 pr-10 bg-surface border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${touched.password && errors.password ? 'border-red-500' : 'border-outline-variant'}`}
                    placeholder="At least 8 characters"
                    type={showPassword ? "text" : "password"} name="password" value={formData.password}
                    onChange={handleChange} onBlur={handleBlur} required minLength={8}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {touched.password && errors.password && <p className="text-red-500 text-[10px] mt-1">{errors.password}</p>}
              </div>
              </div>

              {/* DOB + Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-0.5">Date of Birth *</label>
                  <input
                    className={`w-full h-11 px-2 bg-surface border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${touched.dob && errors.dob ? 'border-red-500' : 'border-outline-variant'}`}
                    type="date" name="dob" value={formData.dob} max={new Date().toISOString().split('T')[0]}
                    onChange={handleChange} onBlur={handleBlur} required
                  />
                  {touched.dob && errors.dob && <p className="text-red-500 text-[10px] mt-1">{errors.dob}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-0.5">Gender *</label>
                  <div className="relative">
                    <select
                      className={`w-full h-11 pl-3 pr-8 bg-surface border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none ${touched.gender && errors.gender ? 'border-red-500' : 'border-outline-variant'}`}
                      name="gender" value={formData.gender}
                      onChange={handleChange} onBlur={handleBlur} required
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

              {/* Document Uploads */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-0.5">Identity Documents (Optional)</label>
                <div className="grid grid-cols-3 gap-3">
                  {/* User Photo */}
                  <div className="flex flex-col items-center gap-1.5">
                    <label className="w-full aspect-square border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all overflow-hidden relative group">
                      <input type="file" className="hidden" accept="image/*" capture="user" onChange={(e) => handleImageChange(e, setProfilePic, setProfileFile)} />
                      {!profilePic ? (
                        <span className="material-symbols-outlined text-on-surface-variant text-2xl group-hover:scale-110 transition-transform">account_circle</span>
                      ) : (
                        <img src={profilePic} className="w-full h-full object-contain bg-surface-container" alt="Profile" />
                      )}
                    </label>
                    <span className="text-[9px] font-bold text-on-surface-variant text-center leading-tight">User Photo</span>
                  </div>

                  {/* Aadhaar Front */}
                  <div className="flex flex-col items-center gap-1.5">
                    <label className="w-full aspect-square border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all overflow-hidden relative group">
                      <input type="file" className="hidden" accept="image/*" capture="environment" onChange={(e) => handleImageChange(e, setAadhaarFrontPic, setAadhaarFrontFile)} />
                      {!aadhaarFrontPic ? (
                        <span className="material-symbols-outlined text-on-surface-variant text-2xl group-hover:scale-110 transition-transform">badge</span>
                      ) : (
                        <img src={aadhaarFrontPic} className="w-full h-full object-contain bg-surface-container" alt="Aadhaar Front" />
                      )}
                    </label>
                    <span className="text-[9px] font-bold text-on-surface-variant text-center leading-tight">Aadhaar Front</span>
                  </div>

                  {/* Aadhaar Back */}
                  <div className="flex flex-col items-center gap-1.5">
                    <label className="w-full aspect-square border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all overflow-hidden relative group">
                      <input type="file" className="hidden" accept="image/*" capture="environment" onChange={(e) => handleImageChange(e, setAadhaarBackPic, setAadhaarBackFile)} />
                      {!aadhaarBackPic ? (
                        <span className="material-symbols-outlined text-on-surface-variant text-2xl group-hover:scale-110 transition-transform">credit_card</span>
                      ) : (
                        <img src={aadhaarBackPic} className="w-full h-full object-contain bg-surface-container" alt="Aadhaar Back" />
                      )}
                    </label>
                    <span className="text-[9px] font-bold text-on-surface-variant text-center leading-tight">Aadhaar Back</span>
                  </div>
                </div>
              </div>

              {/* Aadhaar Number */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-0.5">Aadhaar Card Number (Optional)</label>
                <input
                  className={`w-full h-11 px-3 bg-surface border rounded-lg text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono ${touched.aadhaar && errors.aadhaar ? 'border-red-500' : 'border-outline-variant'}`}
                  placeholder="0000 0000 0000"
                  type="text" name="aadhaar" value={formatAadhaar(formData.aadhaar)}
                  onChange={handleChange} onBlur={handleBlur} maxLength={14}
                />
                {touched.aadhaar && errors.aadhaar && <p className="text-red-500 text-[10px] mt-1">{errors.aadhaar}</p>}
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-[10px] lg:text-xs font-bold text-on-surface-variant uppercase tracking-wider px-0.5">Permanent Address *</label>
                <textarea
                  className={`w-full p-3 bg-surface border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none ${touched.address && errors.address ? 'border-red-500' : 'border-outline-variant'}`}
                  placeholder="Street name, Building, Area, City, PIN"
                  rows={2} name="address" value={formData.address}
                  onChange={handleChange} onBlur={handleBlur} required
                />
                {touched.address && errors.address && <p className="text-red-500 text-[10px] mt-1">{errors.address}</p>}
              </div>
            </div>
          </div>

          {/* ── Section 2: Family Members ────────────────────────── */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden lg:shadow-md">
            {/* Section Header */}
            <div className="flex items-center gap-3 px-4 lg:px-6 py-3 lg:py-4 bg-secondary/5 border-b border-outline-variant/30">
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <span className="text-white text-xs lg:text-sm font-black">2</span>
              </div>
              <div>
                <h2 className="text-sm lg:text-base font-bold text-on-surface">Family Members</h2>
                <p className="text-[10px] lg:text-xs text-on-surface-variant">Optional — add dependents to your plan</p>
              </div>
            </div>

            <div className="p-4 lg:p-6 space-y-3 lg:space-y-4">
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
                        type="date" name="dob" value={newMember.dob} max={new Date().toISOString().split('T')[0]}
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
              onChange={handleChange} onBlur={handleBlur} required
            />
            <label className="text-[11px] text-on-surface-variant leading-relaxed cursor-pointer" htmlFor="consent">
              I give consent to MedCred India to verify my Aadhaar and credit details and those of my family members for creating a health credit profile.
            </label>
          </div>

          {/* ── Submit ─────────────────────────────────────────── */}
          <div className="space-y-3 pb-4">
            {errorMsg && (
              <div className="bg-error/10 border border-error/20 text-error text-xs font-bold p-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                {errorMsg}
              </div>
            )}
            <button
              className="w-full h-12 bg-primary hover:opacity-90 text-white text-sm font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              <span>{loading ? 'Processing...' : 'Register'}</span>
              {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
            </button>
            <p className="text-center text-xs text-on-surface-variant">
              Already have an account?{' '}
              <span onClick={() => navigate('/login')} className="text-primary font-bold hover:underline cursor-pointer">
                Login here
              </span>
            </p>

            <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-on-surface-variant/80 font-medium">
              <button type="button" onClick={() => navigate('/terms')} className="hover:text-primary hover:underline cursor-pointer">Terms</button>
              <span>•</span>
              <button type="button" onClick={() => navigate('/privacy')} className="hover:text-primary hover:underline cursor-pointer">Privacy</button>
              <span>•</span>
              <button type="button" onClick={() => navigate('/support')} className="hover:text-primary hover:underline cursor-pointer">Support</button>
            </div>
          </div>
        </form>

        {/* OTP Verification Modal Overlay */}
        {showOtpModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center animate-fade-in p-4">
            <div className="w-full max-w-[400px] max-h-[90vh] overflow-y-auto bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-2xl space-y-6 animate-scale-up">
              <div className="text-center">
                <h2 className="text-lg font-bold text-on-surface mb-2">Verify Mobile Number</h2>
                <p className="text-xs text-on-surface-variant max-w-[280px] mx-auto leading-relaxed">
                  Enter the 6-digit OTP sent to your number <strong>+91 {formData.mobile}</strong>.
                </p>
              </div>

              {errorMsg && (
                <div className="bg-error/10 border border-error/20 text-error text-xs font-bold p-3 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold p-3 rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  {successMsg}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant">Enter 6-Digit OTP *</label>
                  <div className="flex justify-between gap-1.5">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        className="w-10 h-12 text-center text-lg font-extrabold rounded-xl border border-outline-variant bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        required
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] px-0.5">
                  <span className="text-on-surface-variant font-medium">Didn't receive code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || loading}
                    className={`font-bold underline underline-offset-2 ${
                      resendTimer > 0 ? 'text-slate-400 no-underline' : 'text-primary hover:text-primary-container'
                    }`}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOtpModal(false)}
                    className="flex-1 h-11 border border-outline text-on-surface-variant text-xs font-bold rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyAndRegister}
                    disabled={loading}
                    className="flex-1 h-11 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Register</span>
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
