import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';
import { compressImage } from '../../../utils/compressImage';

export default function AddFamilyMemberPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    dob: '',
    aadhaar: '',
    consent: false
  });
  const [profilePic, setProfilePic] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState(null);
  const [aadhaarBackFile, setAadhaarBackFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAadhaarChange = (e) => {
    let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formatted = '';
    for (let i = 0; i < val.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += val[i];
    }
    setFormData(prev => ({ ...prev, aadhaar: formatted }));
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const compressed = await compressImage(e.target.files[0]);
      setProfileFile(compressed);
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePic(event.target.result);
      };
      reader.readAsDataURL(compressed);
    }
  };

  const handleAadhaarFrontChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      setAadhaarFrontFile(await compressImage(e.target.files[0]));
    }
  };

  const handleAadhaarBackChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      setAadhaarBackFile(await compressImage(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.consent) {
      alert("Please check the authorization box to verify Aadhaar details.");
      return;
    }
    
    setLoading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('relationship', formData.relationship);
    data.append('dob', formData.dob);
    data.append('aadhaarNumber', formData.aadhaar);
    data.append('consent', formData.consent);
    if (profileFile) {
      data.append('profilePhoto', profileFile);
    }
    if (aadhaarFrontFile) {
      data.append('aadhaarFront', aadhaarFrontFile);
    }
    if (aadhaarBackFile) {
      data.append('aadhaarBack', aadhaarBackFile);
    }

    try {
      const res = await api.post(ENDPOINTS.FAMILY_ADD, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        alert(`${formData.name} has been added successfully! Verification is in progress.`);
        navigate('/family');
      }
    } catch (err) {
      console.error('Failed to add member:', err);
      alert(err.response?.data?.message || 'Failed to add family member. Ensure you have an active Family or Premium plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md relative animate-fade-in pb-20">
      {/* TopAppBar */}
      <header className="flex justify-between items-center px-4 w-full h-16 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-low rounded-full transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <h1 className="text-sm font-bold text-primary">Add Family Member</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow overflow-y-auto px-4 py-4 max-w-md mx-auto w-full">
        {/* Progress Indicator */}
        <div className="w-full flex justify-center gap-2 mb-6">
          <div className="h-1.5 w-12 rounded-full bg-primary"></div>
          <div className="h-1.5 w-12 rounded-full bg-surface-container-highest"></div>
        </div>

        {/* Header Section */}
        <section className="text-center mb-6">
          <h2 className="text-lg font-bold text-on-surface mb-1">Basic Information</h2>
          <p className="text-xs text-on-surface-variant">Enter details to verify your family member for credit benefits.</p>
        </section>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Photo Upload */}
          <div className="flex flex-col items-center gap-2">
            <label className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-surface-container-high border-2 border-dashed border-outline-variant flex items-center justify-center overflow-hidden group-hover:border-primary transition-all relative">
                  {profilePic ? (
                    <img src={profilePic} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-outline text-4xl">person_add</span>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>
                <div className="absolute bottom-0 right-0 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md pointer-events-none">
                  <span className="material-symbols-outlined text-sm">photo_camera</span>
                </div>
              </div>
              <span className="text-xs font-bold text-primary group-hover:underline">Upload Profile Photo</span>
            </label>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant px-1">Full Name</label>
              <input 
                className="w-full h-11 bg-white border border-outline-variant rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" 
                placeholder="As per Aadhaar" 
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Relationship */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant px-1">Relationship</label>
              <div className="relative">
                <select 
                  className="w-full h-11 bg-white border border-outline-variant rounded-lg px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>Select Relationship</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl">expand_more</span>
              </div>
            </div>

            {/* DOB & Aadhaar Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant px-1">Date of Birth</label>
                <input 
                  className="w-full h-11 bg-white border border-outline-variant rounded-lg pl-2 pr-1 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs" 
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant px-1">Aadhaar Number</label>
                <input 
                  className="w-full h-11 bg-white border border-outline-variant rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm tracking-wider" 
                  maxLength={14} 
                  placeholder="0000 0000 0000" 
                  type="text"
                  name="aadhaar"
                  value={formData.aadhaar}
                  onChange={handleAadhaarChange}
                  required
                />
              </div>
            </div>

            {/* Aadhaar Document Uploads */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant px-1">Aadhaar Front</label>
                <div className="relative w-full h-12 bg-white border border-outline-variant border-dashed rounded-lg flex items-center justify-center overflow-hidden hover:bg-surface-container-low transition-colors">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleAadhaarFrontChange}
                    required
                  />
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    <span className="material-symbols-outlined text-primary text-xl leading-none">front_hand</span>
                    <span className="text-[9px] font-bold text-primary max-w-full truncate px-1">{aadhaarFrontFile ? aadhaarFrontFile.name : 'Upload Front'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant px-1">Aadhaar Back</label>
                <div className="relative w-full h-12 bg-white border border-outline-variant border-dashed rounded-lg flex items-center justify-center overflow-hidden hover:bg-surface-container-low transition-colors">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleAadhaarBackChange}
                    required
                  />
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    <span className="material-symbols-outlined text-primary text-xl leading-none">flip_to_back</span>
                    <span className="text-[9px] font-bold text-primary max-w-full truncate px-1">{aadhaarBackFile ? aadhaarBackFile.name : 'Upload Back'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Aadhaar Consent */}
            <div className="flex gap-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 mt-2">
              <input 
                className="mt-0.5 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer" 
                id="consent" 
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleInputChange}
                required
              />
              <label className="text-[11px] text-on-surface-variant leading-normal cursor-pointer" htmlFor="consent">
                I authorize MedCred India to verify the provided Aadhaar details for insurance and credit assessment purposes.
              </label>
            </div>
          </div>

          {/* Footer Action Button */}
          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading}
              className={`w-full h-12 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all ${loading ? 'bg-outline-variant cursor-not-allowed' : 'bg-primary hover:opacity-90 active:scale-[0.98] cursor-pointer'}`}
            >
              {loading ? (
                 <span className="material-symbols-outlined animate-spin text-lg">sync</span>
              ) : (
                 <span className="material-symbols-outlined text-lg">verified_user</span>
              )}
              {loading ? 'Verifying...' : 'Verify Member'}
            </button>
            <p className="text-center mt-3 text-[10px] text-outline font-semibold tracking-wide">Securely encrypted by MedCred Vault</p>
          </div>
        </form>
      </main>
    </div>
  );
}
