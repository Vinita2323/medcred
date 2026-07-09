import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';
import { compressImage } from '../../../utils/compressImage';
import { indianTerritories } from '../../../utils/indianTerritories';

// Searchable dropdown for single select
function SearchableSelect({ label, value, onChange, options, disabled, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-xs font-semibold text-[#516161] mb-1">{label}</label>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-white border border-[#c3c6d6] rounded-lg flex justify-between items-center cursor-pointer text-sm font-semibold ${disabled ? 'opacity-60 cursor-not-allowed bg-[#f3f3fd] text-[#516161]' : 'hover:border-[#003d9b] text-[#191b23]'}`}
      >
        <span className={value ? 'text-[#191b23]' : 'text-gray-400'}>
          {value || placeholder || `Select ${label}`}
        </span>
        <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#c3c6d6] rounded-lg shadow-lg max-h-60 overflow-y-auto p-2 space-y-1">
          <input
            type="text"
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#003d9b]"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="pt-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(opt);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`px-3 py-2 text-xs rounded cursor-pointer hover:bg-[#003d9b]/10 hover:text-[#003d9b] ${value === opt ? 'bg-[#003d9b]/5 text-[#003d9b] font-bold' : 'text-[#434654]'}`}
                >
                  {opt}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-gray-400 text-center">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Searchable dropdown for multi select with checkboxes
function SearchableMultiSelect({ label, selected, onChange, options, disabled, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const toggleOption = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(item => item !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-xs font-semibold text-[#516161] mb-1">{label}</label>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-white border border-[#c3c6d6] rounded-lg flex justify-between items-center cursor-pointer text-sm font-semibold ${disabled ? 'opacity-60 cursor-not-allowed bg-[#f3f3fd] text-[#516161]' : 'hover:border-[#003d9b] text-[#191b23]'}`}
      >
        <span className={selected.length > 0 ? 'text-[#191b23] truncate pr-4' : 'text-gray-400'}>
          {selected.length > 0 ? selected.join(', ') : placeholder || `Select ${label}`}
        </span>
        <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#c3c6d6] rounded-lg shadow-lg max-h-60 overflow-y-auto p-2 space-y-1">
          <input
            type="text"
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#003d9b]"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="pt-1 space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isChecked = selected.includes(opt);
                return (
                  <label
                    key={opt}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer hover:bg-gray-50 select-none text-xs text-[#434654]"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOption(opt)}
                      className="rounded border-gray-300 text-[#003d9b] focus:ring-[#003d9b]/20"
                    />
                    <span className={isChecked ? 'font-bold text-[#003d9b]' : ''}>{opt}</span>
                  </label>
                );
              })
            ) : (
              <div className="px-3 py-2 text-xs text-gray-400 text-center">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgentRegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STEP 1: Basic Info
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [managerJoinCode, setManagerJoinCode] = useState('');
  const [role, setRole] = useState('Field Agent'); // Super Agent, Agent, Field Agent

  // Verification & Manager info
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [managerInfo, setManagerInfo] = useState(null);
  const [verificationError, setVerificationError] = useState('');

  // STEP 2: Working Jurisdiction
  const [workingState, setWorkingState] = useState('');
  const [workingDistricts, setWorkingDistricts] = useState([]);
  const [workingDistrict, setWorkingDistrict] = useState('');
  const [workingCity, setWorkingCity] = useState('');

  // STEP 3: Addresses
  const [permHouseNo, setPermHouseNo] = useState('');
  const [permStreet, setPermStreet] = useState('');
  const [permArea, setPermArea] = useState('');
  const [permLandmark, setPermLandmark] = useState('');
  const [permState, setPermState] = useState('');
  const [permDistrict, setPermDistrict] = useState('');
  const [permCity, setPermCity] = useState('');
  const [permPincode, setPermPincode] = useState('');

  const [sameAddress, setSameAddress] = useState(true);

  const [currHouseNo, setCurrHouseNo] = useState('');
  const [currStreet, setCurrStreet] = useState('');
  const [currArea, setCurrArea] = useState('');
  const [currLandmark, setCurrLandmark] = useState('');
  const [currState, setCurrState] = useState('');
  const [currDistrict, setCurrDistrict] = useState('');
  const [currCity, setCurrCity] = useState('');
  const [currPincode, setCurrPincode] = useState('');

  // STEP 4: Documents & Bank Details
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [profilePreview, setProfilePreview] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);

  const [panNumber, setPanNumber] = useState('');
  const [panPreview, setPanPreview] = useState(null);
  const [panFile, setPanFile] = useState(null);

  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [chequePreview, setChequePreview] = useState(null);
  const [chequeFile, setChequeFile] = useState(null);

  // Auto-verify code with debounce when code changes
  useEffect(() => {
    if (!managerJoinCode.trim()) {
      setCodeVerified(false);
      setManagerInfo(null);
      setVerificationError('');
      return;
    }

    setIsValidatingCode(true);
    setVerificationError('');

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await api.get(`${ENDPOINTS.AGENT_VALIDATE_JOIN_CODE}/${managerJoinCode.trim()}`);
        if (res.data.success) {
          const info = res.data;
          setManagerInfo(info);
          setCodeVerified(true);
          
          // Auto territory fill logic
          if (info.type === 'super_agent') {
            setWorkingState(info.state);
          } else if (info.type === 'agent') {
            setWorkingState(info.state);
          }
        }
      } catch (error) {
        setCodeVerified(false);
        setManagerInfo(null);
        setVerificationError(error.response?.data?.message || 'Invalid or inactive manager join code.');
      } finally {
        setIsValidatingCode(false);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [managerJoinCode]);

  // Handle files
  const handleImageChange = async (e, setPreview, setFile) => {
    const file = e.target.files[0];
    if (file) {
      const compressed = await compressImage(file);
      setFile(compressed);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(compressed);
    }
  };

  // State selection helper lists
  const availableStates = Object.keys(indianTerritories);
  
  // Dynamic jurisdiction selections
  const getJurisdictionDistricts = () => {
    if (!workingState) return [];
    
    // Find the state key case-insensitively
    const matchedStateKey = Object.keys(indianTerritories).find(
      key => key.toLowerCase() === workingState.trim().toLowerCase()
    );
    
    if (!matchedStateKey || !indianTerritories[matchedStateKey]) return [];
    const allDists = Object.keys(indianTerritories[matchedStateKey].districts);
    
    // Lock logic: If Field Agent, restrict districts to the Agent's assigned districts
    if (role === 'Field Agent' && managerInfo?.type === 'agent') {
      return allDists.filter(d => managerInfo.districts.includes(d));
    }
    return allDists;
  };

  const getJurisdictionCities = () => {
    if (!workingState || !workingDistrict) return [];
    
    const matchedStateKey = Object.keys(indianTerritories).find(
      key => key.toLowerCase() === workingState.trim().toLowerCase()
    );
    
    if (!matchedStateKey || !indianTerritories[matchedStateKey]) return [];
    return indianTerritories[matchedStateKey].districts[workingDistrict] || [];
  };

  // Address helper selection lists
  const getPermDistricts = () => {
    if (!permState || !indianTerritories[permState]) return [];
    return Object.keys(indianTerritories[permState].districts);
  };

  const getPermCities = () => {
    if (!permState || !permDistrict || !indianTerritories[permState]) return [];
    return indianTerritories[permState].districts[permDistrict] || [];
  };

  const getCurrDistricts = () => {
    if (!currState || !indianTerritories[currState]) return [];
    return Object.keys(indianTerritories[currState].districts);
  };

  const getCurrCities = () => {
    if (!currState || !currDistrict || !indianTerritories[currState]) return [];
    return indianTerritories[currState].districts[currDistrict] || [];
  };

  const goToStep = (targetStep) => {
    if (targetStep > step) {
      if (step === 1) {
        if (!fullName || !mobileNumber || !email || !password) {
          alert('Please fill out all basic details.');
          return;
        }
        if (managerJoinCode && !codeVerified) {
          alert('Invalid or unverified manager join code.');
          return;
        }
        // Hierarchy validation based on code
        if (managerJoinCode && codeVerified) {
          if (role === 'Super Agent' && managerInfo.type !== 'admin') {
            alert('Super Agents can only register using a join code generated by Admin.');
            return;
          }
          if (role === 'Agent' && managerInfo.type !== 'super_agent') {
            alert('Agents can only register using a Super Agent\'s join code.');
            return;
          }
          if (role === 'Field Agent' && managerInfo.type !== 'agent') {
            alert('Field Agents can only register using an Agent\'s join code.');
            return;
          }
        }
      }
      if (step === 2) {
        if (role === 'Super Agent' && !workingState) {
          alert('Please select your Working State.');
          return;
        }
        if (role === 'Agent' && (!workingState || workingDistricts.length === 0)) {
          alert('Please select your Working State and Working Districts.');
          return;
        }
        if (role === 'Field Agent' && (!workingState || !workingDistrict || !workingCity)) {
          alert('Please complete all Working Jurisdiction fields.');
          return;
        }
      }
      if (step === 3) {
        if (!permHouseNo || !permStreet || !permArea || !permState || !permDistrict || !permCity || !permPincode) {
          alert('Please fill in all Permanent Address required fields.');
          return;
        }
        if (!sameAddress && (!currHouseNo || !currStreet || !currArea || !currState || !currDistrict || !currCity || !currPincode)) {
          alert('Please fill in all Current Address fields or check "Same as Permanent Address".');
          return;
        }
      }
    }
    setStep(targetStep);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profileFile || !frontFile || !backFile || !panFile) {
      alert('Please upload all required identity documents (Profile Photo, Aadhaar Front, Aadhaar Back, and PAN Card).');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('mobileNumber', mobileNumber);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('referralCodeUsed', managerJoinCode);
      formData.append('role', role);

      // STEP 2 Jurisdiction
      formData.append('workingState', workingState);
      formData.append('workingDistricts', JSON.stringify(workingDistricts));
      formData.append('workingDistrict', workingDistrict);
      formData.append('workingCity', workingCity);

      // STEP 3 Addresses
      const permanentAddress = {
        houseNo: permHouseNo,
        street: permStreet,
        area: permArea,
        state: permState,
        district: permDistrict,
        city: permCity,
        pincode: permPincode
      };
      formData.append('permanentAddress', JSON.stringify(permanentAddress));

      const currentAddress = sameAddress ? permanentAddress : {
        houseNo: currHouseNo,
        street: currStreet,
        area: currArea,
        state: currState,
        district: currDistrict,
        city: currCity,
        pincode: currPincode
      };
      formData.append('currentAddress', JSON.stringify(currentAddress));

      // STEP 4 Docs & Bank
      
      const bankDetails = {
        bankName,
        accountHolderName,
        accountNumber,
        ifscCode
      };
      formData.append('bankDetails', JSON.stringify(bankDetails));

      // Files
      formData.append('profilePic', profileFile);
      formData.append('aadhaarFront', frontFile);
      formData.append('aadhaarBack', backFile);
      formData.append('panCard', panFile);


      const res = await api.post(ENDPOINTS.AGENT_REGISTER, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        alert('Registration submitted successfully! Your status is currently "Pending Approval". The administrator will review and assign your Designation.');
        navigate('/agent/login');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#faf8ff] min-h-screen flex flex-col font-body-md relative overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        .input-group label {
          transition: all 0.2s ease-in-out;
          pointer-events: none;
        }
        .input-field:focus ~ label,
        .input-field:not(:placeholder-shown) ~ label {
          transform: translateY(-1.5rem) scale(0.85);
          color: #003d9b;
          background: white;
          padding: 0 4px;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 61, 155, 0.1);
        }
      ` }} />

      {/* Background Graphic */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-[#dae2ff]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-[#d4e6e5]/20 rounded-full blur-3xl"></div>
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-[#c3c6d6]/20 bg-white/50">
        <div className="flex items-center gap-2 cursor-pointer h-20 md:h-28" onClick={() => navigate('/agent')}>
          <img src="/Logo (5).png" alt="MedCred Logo" className="h-full w-auto object-contain" />
        </div>
        <Link to="/agent/login" className="text-xs font-bold text-[#003d9b] hover:underline">Sign In Portal</Link>
      </header>

      <main className="relative z-10 flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-[#003d9b]">Apply for MedCred Partnership</h2>
            <p className="text-xs text-[#516161]">Join our nationwide healthcare financing agent network.</p>
          </div>

          {/* Stepper Design */}
          <div className="relative max-w-md mx-auto py-2">
            <div className="flex justify-between items-center relative z-10">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => goToStep(s)}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-[#003d9b] text-white shadow-md' : 'bg-[#e1e2ec] text-[#434654]'}`}>{s}</div>
                  <span className="text-[10px] font-semibold text-[#516161]">
                    {s === 1 ? 'Personal' : s === 2 ? 'Jurisdiction' : s === 3 ? 'Address' : 'Documents'}
                  </span>
                </div>
              ))}
            </div>
            <div className="absolute top-6 left-0 w-full h-[2px] bg-[#e1e2ec] -z-0"></div>
            <div 
              className="absolute top-6 left-0 h-[2px] bg-[#003d9b] transition-all duration-300" 
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-lg border border-[#c3c6d6]/20">
            
            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-base font-bold text-[#191b23]">Step 1: Partner Account Setup</h3>
                
                <div className="space-y-4">
                  <div className="relative input-group">
                    <input 
                      className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                      id="full-name" 
                      placeholder=" " 
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                    <label className="absolute left-4 top-3 text-[#434654] text-xs" htmlFor="full-name">Full Name</label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative input-group">
                      <input 
                        className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                        id="mobile-number" 
                        placeholder=" " 
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                      />
                      <label className="absolute left-4 top-3 text-[#434654] text-xs" htmlFor="mobile-number">Mobile Number</label>
                    </div>

                    <div className="relative input-group">
                      <input 
                        className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                        id="email" 
                        placeholder=" " 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <label className="absolute left-4 top-3 text-[#434654] text-xs" htmlFor="email">Email Address</label>
                    </div>
                  </div>

                  <div className="relative input-group">
                    <input 
                      className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                      id="password" 
                      placeholder=" " 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <label className="absolute left-4 top-3 text-[#434654] text-xs" htmlFor="password">Login Password</label>
                  </div>

                  <div className="relative input-group">
                    <input 
                      className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                      id="manager-code" 
                      placeholder=" " 
                      type="text"
                      value={managerJoinCode}
                      onChange={(e) => setManagerJoinCode(e.target.value)}
                    />
                    <label className="absolute left-4 top-3 text-[#434654] text-xs" htmlFor="manager-code">Manager's Join Code (Optional)</label>
                    
                    {/* Inline Loading / Success Indicators */}
                    <div className="absolute right-3 top-3.5 flex items-center gap-1.5 pointer-events-none">
                      {isValidatingCode && (
                        <span className="material-symbols-outlined animate-spin text-[#003d9b] text-sm">progress_activity</span>
                      )}
                      {codeVerified && (
                        <span className="material-symbols-outlined text-green-600 text-sm font-bold">check_circle</span>
                      )}
                    </div>
                  </div>
                  {verificationError && (
                    <p className="text-red-500 text-xs font-semibold">{verificationError}</p>
                  )}

                  <div className="relative input-group">
                    <label className="block text-xs font-semibold text-[#516161] mb-1" htmlFor="role">Agent Type</label>
                    <select
                      className="block w-full px-4 py-3 bg-white border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm font-semibold text-[#434654]"
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                    >
                      <option value="Super Agent">Super Agent</option>
                      <option value="Agent">Agent</option>
                      <option value="Field Agent">Field Agent</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => goToStep(2)}
                    className="bg-[#003d9b] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0052cc] transition-all flex items-center gap-1 cursor-pointer"
                  >
                    Next Step <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Jurisdiction */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-base font-bold text-[#191b23]">Step 2: Working Jurisdiction ({role})</h3>
                
                <div className="space-y-4">
                  {role === 'Super Agent' && (
                    <div className="relative input-group">
                      <label className="block text-xs font-semibold text-[#516161] mb-1">Working State</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm font-semibold text-[#191b23]"
                        value={workingState}
                        onChange={(e) => setWorkingState(e.target.value)}
                        placeholder="Enter working state"
                        required
                      />
                    </div>
                  )}

                  {role === 'Agent' && (
                    <>
                      <div className="relative input-group">
                        <label className="block text-xs font-semibold text-[#516161] mb-1">Working State</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-white border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm font-semibold text-[#191b23] disabled:bg-[#f3f3fd] disabled:text-[#516161] disabled:cursor-not-allowed"
                          value={workingState}
                          onChange={(e) => {
                            setWorkingState(e.target.value);
                            setWorkingDistricts([]);
                          }}
                          disabled={codeVerified && managerInfo?.type === 'super_agent'}
                          placeholder="Enter working state"
                          required
                        />
                      </div>

                      <SearchableMultiSelect
                        label="Working Districts"
                        selected={workingDistricts}
                        onChange={(val) => setWorkingDistricts(val)}
                        options={getJurisdictionDistricts()}
                        placeholder="Search and select multiple districts"
                      />
                    </>
                  )}

                  {role === 'Field Agent' && (
                    <>
                      <div className="relative input-group">
                        <label className="block text-xs font-semibold text-[#516161] mb-1">Working State</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-white border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm font-semibold text-[#191b23] disabled:bg-[#f3f3fd] disabled:text-[#516161] disabled:cursor-not-allowed"
                          value={workingState}
                          onChange={(e) => {
                            setWorkingState(e.target.value);
                            setWorkingDistrict('');
                            setWorkingCity('');
                          }}
                          disabled={codeVerified && (managerInfo?.type === 'agent' || managerInfo?.type === 'super_agent')}
                          placeholder="Enter working state"
                          required
                        />
                      </div>

                      <SearchableSelect
                        label="Working District"
                        value={workingDistrict}
                        onChange={(val) => {
                          setWorkingDistrict(val);
                          setWorkingCity('');
                        }}
                        options={getJurisdictionDistricts()}
                        placeholder="Search and select district"
                      />

                      <SearchableSelect
                        label="Working City"
                        value={workingCity}
                        onChange={(val) => setWorkingCity(val)}
                        options={getJurisdictionCities()}
                        placeholder="Search and select city"
                      />
                    </>
                  )}
                </div>

                <div className="flex justify-between pt-2">
                  <button 
                    onClick={() => goToStep(1)}
                    className="text-[#003d9b] font-bold text-xs hover:bg-[#f3f3fd] px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => goToStep(3)}
                    className="bg-[#003d9b] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0052cc] transition-all flex items-center gap-1 cursor-pointer"
                  >
                    Next Step <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Addresses */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-base font-bold text-[#191b23]">Step 3: Address Information</h3>
                
                <div className="space-y-6">
                  {/* Permanent Address */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-[#003d9b] uppercase tracking-wider">Permanent Address</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative input-group">
                        <input 
                          className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                          placeholder=" " 
                          type="text"
                          value={permHouseNo}
                          onChange={(e) => setPermHouseNo(e.target.value)}
                        />
                        <label className="absolute left-4 top-3 text-[#434654] text-xs">House Number</label>
                      </div>

                      <div className="relative input-group">
                        <input 
                          className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                          placeholder=" " 
                          type="text"
                          value={permStreet}
                          onChange={(e) => setPermStreet(e.target.value)}
                        />
                        <label className="absolute left-4 top-3 text-[#434654] text-xs">Street / Road</label>
                      </div>
                    </div>

                    <div className="relative input-group">
                      <input 
                        className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                        placeholder=" " 
                        type="text"
                        value={permArea}
                        onChange={(e) => setPermArea(e.target.value)}
                      />
                      <label className="absolute left-4 top-3 text-[#434654] text-xs">Village / Locality</label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="relative input-group">
                        <input 
                          className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                          placeholder=" " 
                          type="text"
                          value={permState}
                          onChange={(e) => setPermState(e.target.value)}
                        />
                        <label className="absolute left-4 top-3 text-[#434654] text-xs">State</label>
                      </div>

                      <div className="relative input-group">
                        <input 
                          className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                          placeholder=" " 
                          type="text"
                          value={permDistrict}
                          onChange={(e) => setPermDistrict(e.target.value)}
                        />
                        <label className="absolute left-4 top-3 text-[#434654] text-xs">District</label>
                      </div>

                      <div className="relative input-group">
                        <input 
                          className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                          placeholder=" " 
                          type="text"
                          value={permCity}
                          onChange={(e) => setPermCity(e.target.value)}
                        />
                        <label className="absolute left-4 top-3 text-[#434654] text-xs">City</label>
                      </div>
                    </div>

                    <div className="relative input-group w-full md:w-1/3">
                      <input 
                        className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                        placeholder=" " 
                        type="text"
                        maxLength={6}
                        value={permPincode}
                        onChange={(e) => setPermPincode(e.target.value)}
                      />
                      <label className="absolute left-4 top-3 text-[#434654] text-xs">Pincode</label>
                    </div>
                  </div>

                  {/* Same Address Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer py-2">
                    <input 
                      type="checkbox"
                      checked={sameAddress}
                      onChange={(e) => setSameAddress(e.target.checked)}
                      className="rounded border-[#c3c6d6] text-[#003d9b] focus:ring-[#003d9b]/20"
                    />
                    <span className="text-xs font-semibold text-[#434654]">Current Address same as Permanent Address</span>
                  </label>

                  {/* Current Address */}
                  {!sameAddress && (
                    <div className="space-y-4 pt-4 border-t border-[#c3c6d6]/20">
                      <h4 className="text-xs font-extrabold text-[#003d9b] uppercase tracking-wider">Current Address</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative input-group">
                          <input 
                            className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                            placeholder=" " 
                            type="text"
                            value={currHouseNo}
                            onChange={(e) => setCurrHouseNo(e.target.value)}
                          />
                          <label className="absolute left-4 top-3 text-[#434654] text-xs">House Number</label>
                        </div>

                        <div className="relative input-group">
                          <input 
                            className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                            placeholder=" " 
                            type="text"
                            value={currStreet}
                            onChange={(e) => setCurrStreet(e.target.value)}
                          />
                          <label className="absolute left-4 top-3 text-[#434654] text-xs">Street / Road</label>
                        </div>
                      </div>

                      <div className="relative input-group">
                        <input 
                          className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                          placeholder=" " 
                          type="text"
                          value={currArea}
                          onChange={(e) => setCurrArea(e.target.value)}
                        />
                        <label className="absolute left-4 top-3 text-[#434654] text-xs">Village / Locality</label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative input-group">
                          <input 
                            className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                            placeholder=" " 
                            type="text"
                            value={currState}
                            onChange={(e) => setCurrState(e.target.value)}
                          />
                          <label className="absolute left-4 top-3 text-[#434654] text-xs">State</label>
                        </div>

                        <div className="relative input-group">
                          <input 
                            className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                            placeholder=" " 
                            type="text"
                            value={currDistrict}
                            onChange={(e) => setCurrDistrict(e.target.value)}
                          />
                          <label className="absolute left-4 top-3 text-[#434654] text-xs">District</label>
                        </div>

                        <div className="relative input-group">
                          <input 
                            className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                            placeholder=" " 
                            type="text"
                            value={currCity}
                            onChange={(e) => setCurrCity(e.target.value)}
                          />
                          <label className="absolute left-4 top-3 text-[#434654] text-xs">City</label>
                        </div>
                      </div>

                      <div className="relative input-group w-full md:w-1/3">
                        <input 
                          className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                          placeholder=" " 
                          type="text"
                          maxLength={6}
                          value={currPincode}
                          onChange={(e) => setCurrPincode(e.target.value)}
                        />
                        <label className="absolute left-4 top-3 text-[#434654] text-xs">Pincode</label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-2">
                  <button 
                    onClick={() => goToStep(2)}
                    className="text-[#003d9b] font-bold text-xs hover:bg-[#f3f3fd] px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => goToStep(4)}
                    className="bg-[#003d9b] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0052cc] transition-all flex items-center gap-1 cursor-pointer"
                  >
                    Next Step <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Documents & Bank */}
            {step === 4 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-base font-bold text-[#191b23]">Step 4: Identity Documents &amp; Bank Details</h3>
                
                <div className="space-y-6">


                  {/* Document upload previews */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Profile pic */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-[#516161]">Profile Photo</span>
                      <label className="w-full aspect-square border-2 border-dashed border-[#c3c6d6] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#003d9b] hover:bg-[#003d9b]/5 transition-all overflow-hidden relative group">
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setProfilePreview, setProfileFile)} required />
                        {!profilePreview ? (
                          <span className="material-symbols-outlined text-[#737685] text-xl">account_circle</span>
                        ) : (
                          <img src={profilePreview} className="w-full h-full object-cover" alt="Profile" />
                        )}
                      </label>
                    </div>

                    {/* Aadhaar front */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-[#516161]">Aadhaar Front</span>
                      <label className="w-full aspect-square border-2 border-dashed border-[#c3c6d6] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#003d9b] hover:bg-[#003d9b]/5 transition-all overflow-hidden relative group">
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setFrontPreview, setFrontFile)} required />
                        {!frontPreview ? (
                          <span className="material-symbols-outlined text-[#737685] text-xl">badge</span>
                        ) : (
                          <img src={frontPreview} className="w-full h-full object-cover" alt="Front" />
                        )}
                      </label>
                    </div>

                    {/* Aadhaar back */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-[#516161]">Aadhaar Back</span>
                      <label className="w-full aspect-square border-2 border-dashed border-[#c3c6d6] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#003d9b] hover:bg-[#003d9b]/5 transition-all overflow-hidden relative group">
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setBackPreview, setBackFile)} required />
                        {!backPreview ? (
                          <span className="material-symbols-outlined text-[#737685] text-xl">credit_card</span>
                        ) : (
                          <img src={backPreview} className="w-full h-full object-cover" alt="Back" />
                        )}
                      </label>
                    </div>

                    {/* PAN Card */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-[#516161]">PAN Card</span>
                      <label className="w-full aspect-square border-2 border-dashed border-[#c3c6d6] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#003d9b] hover:bg-[#003d9b]/5 transition-all overflow-hidden relative group">
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setPanPreview, setPanFile)} required />
                        {!panPreview ? (
                          <span className="material-symbols-outlined text-[#737685] text-xl">receipt_long</span>
                        ) : (
                          <img src={panPreview} className="w-full h-full object-cover" alt="PAN Card" />
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Optional Bank details */}
                  <div className="space-y-4 pt-4 border-t border-[#c3c6d6]/20">
                    <h4 className="text-xs font-extrabold text-[#003d9b] uppercase tracking-wider">Bank Details (Optional)</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative input-group">
                        <input 
                          className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                          placeholder=" " 
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                        />
                        <label className="absolute left-4 top-3 text-[#434654] text-xs">Bank Name</label>
                      </div>

                      <div className="relative input-group">
                        <input 
                          className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                          placeholder=" " 
                          type="text"
                          value={accountHolderName}
                          onChange={(e) => setAccountHolderName(e.target.value)}
                        />
                        <label className="absolute left-4 top-3 text-[#434654] text-xs">Account Holder Name</label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative input-group">
                        <input 
                          className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                          placeholder=" " 
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                        />
                        <label className="absolute left-4 top-3 text-[#434654] text-xs">Account Number</label>
                      </div>

                      <div className="relative input-group">
                        <input 
                          className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                          placeholder=" " 
                          type="text"
                          value={ifscCode}
                          onChange={(e) => setIfscCode(e.target.value)}
                        />
                        <label className="absolute left-4 top-3 text-[#434654] text-xs">IFSC Code</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button 
                    type="button"
                    onClick={() => goToStep(3)}
                    className="text-[#003d9b] font-bold text-xs hover:bg-[#f3f3fd] px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#003d9b] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0052cc] active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting Application...' : 'Submit Partnership Registration'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
