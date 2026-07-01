import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { ENDPOINTS, SERVER_URL } from '../../../services/types';
import { compressImage } from '../../../utils/compressImage';

const RequirementSection = ({ title, showName, data, files, onDataChange, onFileChange }) => (
  <section className="bg-white border border-outline-variant/50 rounded-2xl p-5 shadow-sm space-y-4">
    <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{title}</h3>
    
    <div className="grid grid-cols-2 gap-3">
      {showName && (
        <div className="space-y-1 col-span-2">
          <label className="text-[10px] font-bold text-on-surface-variant">Full Name <span className="text-error">*</span></label>
          <input 
            type="text"
            value={data.name || ''}
            onChange={(e) => onDataChange('name', e.target.value)}
            placeholder="Enter full name"
            className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            required
          />
        </div>
      )}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-on-surface-variant">Aadhaar No. <span className="text-error">*</span></label>
        <input 
          type="text"
          value={data.aadhaarNumber || ''}
          onChange={(e) => onDataChange('aadhaarNumber', e.target.value)}
          placeholder="12-digit no."
          className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          maxLength={12}
          required
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-on-surface-variant">PAN No. <span className="text-error">*</span></label>
        <input 
          type="text"
          value={data.panNumber || ''}
          onChange={(e) => onDataChange('panNumber', e.target.value)}
          placeholder="10-char PAN"
          className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all uppercase"
          maxLength={10}
          required
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-on-surface-variant">Bank A/C No. <span className="text-error">*</span></label>
        <input 
          type="text"
          value={data.bankAccountNumber || ''}
          onChange={(e) => onDataChange('bankAccountNumber', e.target.value)}
          placeholder="Account Number"
          className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          required
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-on-surface-variant">IFSC Code <span className="text-error">*</span></label>
        <input 
          type="text"
          value={data.ifscCode || ''}
          onChange={(e) => onDataChange('ifscCode', e.target.value)}
          placeholder="IFSC Code"
          className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all uppercase"
          required
        />
      </div>
      <div className="space-y-1 col-span-2">
        <label className="text-[10px] font-bold text-on-surface-variant">CIBIL Score <span className="text-error">*</span></label>
        <input 
          type="number"
          value={data.cibilScore || ''}
          onChange={(e) => onDataChange('cibilScore', e.target.value)}
          placeholder="Enter CIBIL Score"
          className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          required
        />
      </div>
    </div>

    <div className="space-y-3 pt-2">
      <p className="text-[10px] font-bold text-on-surface-variant">Mandatory Documents <span className="text-error">*</span></p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '1. Aadhaar', field: 'aadhaarCardFile' },
          { label: '2. Photo', field: 'photoFile' },
          { label: '3. PAN Card', field: 'panCardFile' },
          { label: '4. 6M Bank Stmt', field: 'bankStatementFile' },
          { label: '5. Address Proof', field: 'addressProofFile' },
          { label: '8. Cheque', field: 'chequeFile' },
          { label: '9. CIBIL Report', field: 'cibilScoreFile' },
        ].map(({ label, field }) => (
          <label key={field} className="border border-dashed border-outline-variant rounded-xl p-2 flex flex-col items-center justify-center gap-1 bg-surface-container-lowest hover:bg-surface-container-low transition-colors cursor-pointer relative overflow-hidden text-center h-20">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => onFileChange(e, field)}
              required={!files[field]}
            />
            <span className={`material-symbols-outlined text-base ${files[field] ? 'text-primary' : 'text-on-surface-variant'}`}>
              {files[field] ? 'check_circle' : 'upload_file'}
            </span>
            <p className={`text-[8px] font-bold leading-tight ${files[field] ? 'text-primary line-clamp-2' : 'text-on-surface'}`}>
              {files[field] ? files[field].name : label}
            </p>
          </label>
        ))}
      </div>
    </div>
  </section>
);

export default function LoanApplicationFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || { type: 'Individual', limit: 200000 };

  const [familyMembers, setFamilyMembers] = useState([]);

  useEffect(() => {
    fetchFamily();
  }, []);

  const fetchFamily = async () => {
    try {
      const res = await api.get(ENDPOINTS.FAMILY_MEMBERS);
      if (res.data.success) {
        // Map backend format to frontend format
        const mapped = res.data.data.map(m => ({
          id: m._id,
          name: m.name,
          relationship: m.relationship,
          image: m.profilePhoto ? `${SERVER_URL}${m.profilePhoto}` : null,
        }));
        setFamilyMembers(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch family members', err);
    }
  };

  // Multi-select state
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [patientsData, setPatientsData] = useState({
    'manual': {
      patientName: '',
      relationship: '',
      hospitalName: '',
      admissionDate: '',
      reason: '',
      prescriptionFile: null,
      billFile: null,
    }
  });

  const [applicantData, setApplicantData] = useState({
    aadhaarNumber: '',
    panNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
    cibilScore: '',
  });

  const [applicantFiles, setApplicantFiles] = useState({
    aadhaarCardFile: null,
    photoFile: null,
    panCardFile: null,
    bankStatementFile: null,
    addressProofFile: null,
    chequeFile: null,
    cibilScoreFile: null,
  });

  const handleApplicantFileChange = async (e, field) => {
    if (e.target.files && e.target.files[0]) {
      const compressed = await compressImage(e.target.files[0]);
      setApplicantFiles(prev => ({
        ...prev,
        [field]: compressed
      }));
    }
  };

  const initialGuarantorData = { name: '', aadhaarNumber: '', panNumber: '', bankAccountNumber: '', ifscCode: '', cibilScore: '' };
  const initialGuarantorFiles = { aadhaarCardFile: null, photoFile: null, panCardFile: null, bankStatementFile: null, addressProofFile: null, chequeFile: null, cibilScoreFile: null };

  const [guarantorsData, setGuarantorsData] = useState([ { ...initialGuarantorData }, { ...initialGuarantorData } ]);
  const [guarantorsFiles, setGuarantorsFiles] = useState([ { ...initialGuarantorFiles }, { ...initialGuarantorFiles } ]);

  const handleGuarantorDataChange = (index, field, value) => {
    setGuarantorsData(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleGuarantorFileChange = async (index, e, field) => {
    if (e.target.files && e.target.files[0]) {
      const compressed = await compressImage(e.target.files[0]);
      setGuarantorsFiles(prev => {
        const copy = [...prev];
        copy[index] = { ...copy[index], [field]: compressed };
        return copy;
      });
    }
  };

  const [loanAmount, setLoanAmount] = useState(state.limit);
  const [tenure, setTenure] = useState(12);
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const [isCustomAmountModalOpen, setIsCustomAmountModalOpen] = useState(false);
  const [customAmountInput, setCustomAmountInput] = useState('');

  const minAmount = 10000;
  const maxLimit = state.limit;

  const handleMemberSelect = (member) => {
    setSelectedMemberIds(prev => {
      const isSelected = prev.includes(member.id);
      if (isSelected) {
        return prev.filter(id => id !== member.id);
      } else {
        return [...prev, member.id];
      }
    });

    setPatientsData(prev => {
      if (!prev[member.id]) {
        return {
          ...prev,
          [member.id]: {
            patientName: member.name || '',
            relationship: member.relationship || '',
            hospitalName: '',
            admissionDate: '',
            reason: '',
            prescriptionFile: null,
            billFile: null,
          }
        };
      }
      return prev;
    });
  };

  const activePatientIds = selectedMemberIds.length > 0 ? selectedMemberIds : ['manual'];

  const handlePatientChange = (memberId, field, value) => {
    setPatientsData(prev => ({
      ...prev,
      [memberId]: { ...prev[memberId], [field]: value }
    }));
  };

  const handlePatientFileChange = (e, memberId, field) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPatientsData(prev => ({
        ...prev,
        [memberId]: { ...prev[memberId], [field]: file }
      }));
    }
  };

  const handleApplicantChange = (e) => {
    setApplicantData({ ...applicantData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (isCustomAmountModalOpen) {
      document.body.classList.add('overflow-hidden');
      document.documentElement.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
      document.documentElement.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
      document.documentElement.classList.remove('overflow-hidden');
    };
  }, [isCustomAmountModalOpen]);

  const handleSliderChange = (e) => {
    setLoanAmount(Number(e.target.value));
  };

  const handleCustomAmountSubmit = (e) => {
    e.preventDefault();
    const amount = Number(customAmountInput);
    if (amount > 0 && amount <= maxLimit) {
      setLoanAmount(amount);
      setIsCustomAmountModalOpen(false);
      setCustomAmountInput('');
    } else {
      alert(`Please enter a valid amount up to ₹${maxLimit.toLocaleString('en-IN')}`);
    }
  };

  const calculateEMI = () => {
    return Math.round(loanAmount / tenure);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!applicantData.aadhaarNumber || !applicantData.panNumber || !applicantData.bankAccountNumber || !applicantData.ifscCode || !applicantData.cibilScore) {
      alert('Please fill out all applicant identity and bank details.');
      return;
    }

    if (!applicantFiles.aadhaarCardFile || !applicantFiles.photoFile || !applicantFiles.panCardFile || !applicantFiles.bankStatementFile || !applicantFiles.addressProofFile || !applicantFiles.chequeFile || !applicantFiles.cibilScoreFile) {
      alert('Please upload all required applicant loan papers.');
      return;
    }

    for (let i = 0; i < 2; i++) {
      const g = guarantorsData[i];
      if (!g.name || !g.aadhaarNumber || !g.panNumber || !g.bankAccountNumber || !g.ifscCode || !g.cibilScore) {
        alert(`Please fill out all identity and bank details for Guarantor ${i + 1}.`);
        return;
      }
      const gf = guarantorsFiles[i];
      if (!gf.aadhaarCardFile || !gf.photoFile || !gf.panCardFile || !gf.bankStatementFile || !gf.addressProofFile || !gf.chequeFile || !gf.cibilScoreFile) {
        alert(`Please upload all required loan papers for Guarantor ${i + 1}.`);
        return;
      }
    }
    
    for (let id of activePatientIds) {
      const data = patientsData[id];
      if (!data || !data.patientName || !data.relationship || !data.hospitalName || !data.admissionDate) {
        alert(`Please fill out all required details (including relationship) for ${data?.patientName || 'the patient'}.`);
        return;
      }
      if (!data.prescriptionFile) {
        alert(`Please upload the Doctor's Prescription for ${data?.patientName || 'the patient'}.`);
        return;
      }
    }
    
    setIsApplying(true);
    try {
      const formData = new FormData();
      formData.append('aadhaarNumber', applicantData.aadhaarNumber);
      formData.append('panNumber', applicantData.panNumber);
      formData.append('bankAccountNumber', applicantData.bankAccountNumber);
      formData.append('ifscCode', applicantData.ifscCode);
      formData.append('cibilScore', applicantData.cibilScore);
      formData.append('loanAmount', loanAmount);
      formData.append('tenure', tenure);

      Object.keys(applicantFiles).forEach(key => {
        if (applicantFiles[key]) {
          formData.append(`applicant_${key}`, applicantFiles[key]);
        }
      });

      guarantorsData.forEach((g, i) => {
        formData.append(`guarantor${i+1}_name`, g.name);
        formData.append(`guarantor${i+1}_aadhaarNumber`, g.aadhaarNumber);
        formData.append(`guarantor${i+1}_panNumber`, g.panNumber);
        formData.append(`guarantor${i+1}_bankAccountNumber`, g.bankAccountNumber);
        formData.append(`guarantor${i+1}_ifscCode`, g.ifscCode);
        formData.append(`guarantor${i+1}_cibilScore`, g.cibilScore);
      });

      guarantorsFiles.forEach((gf, i) => {
        Object.keys(gf).forEach(key => {
          if (gf[key]) {
            formData.append(`guarantor${i+1}_${key}`, gf[key]);
          }
        });
      });

      // We need to pass patients as a JSON string, and files mapped to them
      const patientsPayload = activePatientIds.map(id => ({
        patientName: patientsData[id].patientName,
        relationship: patientsData[id].relationship,
        hospitalName: patientsData[id].hospitalName,
        admissionDate: patientsData[id].admissionDate,
        treatmentReason: patientsData[id].reason,
        familyMemberId: id !== 'manual' ? id : undefined,
      }));
      formData.append('patients', JSON.stringify(patientsPayload));

      // Append files
      activePatientIds.forEach((id, index) => {
        if (patientsData[id].prescriptionFile) {
          formData.append(`prescriptionFile_${index}`, patientsData[id].prescriptionFile);
        }
        if (patientsData[id].billFile) {
          formData.append(`billFile_${index}`, patientsData[id].billFile);
        }
      });

      const res = await api.post(ENDPOINTS.LOAN_APPLY, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setApplied(true);
      }
    } catch (err) {
      console.error('Loan apply error:', err);
      alert(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md min-h-screen pb-20 animate-fade-in relative">
      <header className="flex items-center gap-3 px-4 h-16 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        {!applied && (
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
        )}
        <h1 className="font-bold text-base text-primary">
          {applied ? 'Application Status' : `${state.type} Loan Form`}
        </h1>
      </header>

      <main className="p-4 space-y-6 max-w-md mx-auto w-full">
        {applied ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-on-surface">Application Submitted</h3>
              <p className="text-xs text-on-surface-variant max-w-[280px] mx-auto leading-relaxed">
                Your medical loan of <span className="font-bold text-primary">₹{loanAmount.toLocaleString('en-IN')}</span> for a tenure of <span className="font-bold text-primary">{tenure} Months</span> for {activePatientIds.length} patient(s) is under pre-approval. Payout will be processed directly to the respective hospital billing desks.
              </p>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-primary text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md cursor-pointer hover:opacity-90 active:scale-95 transition-all mt-4"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Family Member Selection */}
            {familyMembers.length > 0 && (
              <section className="bg-white border border-outline-variant/50 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Who is this loan for?</h3>
                  <button type="button" onClick={() => navigate('/family')} className="text-xs font-bold text-primary cursor-pointer hover:underline">Manage</button>
                </div>
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                  {familyMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleMemberSelect(member)}
                      className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer min-w-[80px] ${
                        selectedMemberIds.includes(member.id) 
                          ? 'bg-primary-fixed border-primary' 
                          : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container-high'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden relative">
                        {member.image ? (
                          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-primary text-2xl">person</span>
                        )}
                        {selectedMemberIds.includes(member.id) && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary shadow-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-on-surface truncate w-16">{member.name.split(' ')[0]}</p>
                        <p className="text-[9px] text-on-surface-variant">{member.relationship}</p>
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => navigate('/family/add')}
                    className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer min-w-[80px] justify-center"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">add</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary">Add New</span>
                  </button>
                </div>
              </section>
            )}

            {/* Render Multiple Patient & Document Sections */}
            {activePatientIds.map((id, index) => {
              const data = patientsData[id];
              return (
                <div key={id} className="space-y-6">
                  {/* Patient Details */}
                  <section className="bg-white border border-outline-variant/50 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      {activePatientIds.length > 1 ? `Patient ${index + 1} Details` : 'Patient Details'}
                    </h3>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant">Patient Full Name <span className="text-error">*</span></label>
                      <input 
                        type="text"
                        value={data.patientName}
                        onChange={(e) => handlePatientChange(id, 'patientName', e.target.value)}
                        placeholder="Enter patient's name"
                        className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant">Relationship <span className="text-error">*</span></label>
                      <div className="relative">
                        <select 
                          value={data.relationship || ''}
                          onChange={(e) => handlePatientChange(id, 'relationship', e.target.value)}
                          className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                          required
                        >
                          <option value="" disabled>Select Relationship</option>
                          <option value="Self">Self</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Child">Child</option>
                          <option value="Parent">Parent / In-law</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Other">Other</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl">expand_more</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant">Hospital Name <span className="text-error">*</span></label>
                      <input 
                        type="text"
                        value={data.hospitalName}
                        onChange={(e) => handlePatientChange(id, 'hospitalName', e.target.value)}
                        placeholder="Enter hospital name"
                        className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-on-surface-variant">Admission Date <span className="text-error">*</span></label>
                        <input 
                          type="date"
                          value={data.admissionDate}
                          onChange={(e) => handlePatientChange(id, 'admissionDate', e.target.value)}
                          className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-on-surface-variant">Reason / Treatment</label>
                        <input 
                          type="text"
                          value={data.reason}
                          onChange={(e) => handlePatientChange(id, 'reason', e.target.value)}
                          placeholder="E.g., Surgery"
                          className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Medical Documents */}
                  <section className="bg-white border border-outline-variant/50 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      {activePatientIds.length > 1 ? `Medical Documents (${data.patientName || `Patient ${index + 1}`})` : 'Medical Documents'}
                    </h3>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant">Doctor's Prescription / Admission Advice <span className="text-error">*</span></label>
                      <label className="w-full border-2 border-dashed border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center gap-2 bg-surface-container-lowest hover:bg-surface-container-low transition-colors cursor-pointer relative overflow-hidden">
                        <input 
                          type="file" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => handlePatientFileChange(e, id, 'prescriptionFile')}
                          required
                        />
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary">{data.prescriptionFile ? 'check_circle' : 'upload_file'}</span>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-primary">
                            {data.prescriptionFile ? data.prescriptionFile.name : 'Click to upload or take a picture'}
                          </p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">
                            {data.prescriptionFile ? `${(data.prescriptionFile.size / 1024 / 1024).toFixed(2)} MB` : 'JPG, PNG or PDF (Max 5MB)'}
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant">Estimated Hospital Bill</label>
                      <label className="w-full border-2 border-dashed border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center gap-2 bg-surface-container-lowest hover:bg-surface-container-low transition-colors cursor-pointer relative overflow-hidden">
                        <input 
                          type="file" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => handlePatientFileChange(e, id, 'billFile')}
                        />
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-secondary">{data.billFile ? 'check_circle' : 'receipt_long'}</span>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-secondary">
                            {data.billFile ? data.billFile.name : 'Upload Estimated Bill'}
                          </p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">
                            {data.billFile ? `${(data.billFile.size / 1024 / 1024).toFixed(2)} MB` : 'Optional for pre-approval'}
                          </p>
                        </div>
                      </label>
                    </div>
                  </section>
                </div>
              );
            })}

            {/* Identity Details of Primary Borrower */}
            <RequirementSection
              title="Loan Papers Requirement (Applicant)"
              showName={false}
              data={applicantData}
              files={applicantFiles}
              onDataChange={(field, val) => setApplicantData({ ...applicantData, [field]: val })}
              onFileChange={handleApplicantFileChange}
            />

            {/* Guarantor 1 Details */}
            <RequirementSection
              title="Guarantor 1 Details & Papers"
              showName={true}
              data={guarantorsData[0]}
              files={guarantorsFiles[0]}
              onDataChange={(field, val) => handleGuarantorDataChange(0, field, val)}
              onFileChange={(e, field) => handleGuarantorFileChange(0, e, field)}
            />

            {/* Guarantor 2 Details */}
            <RequirementSection
              title="Guarantor 2 Details & Papers"
              showName={true}
              data={guarantorsData[1]}
              files={guarantorsFiles[1]}
              onDataChange={(field, val) => handleGuarantorDataChange(1, field, val)}
              onFileChange={(e, field) => handleGuarantorFileChange(1, e, field)}
            />


            {/* Loan Configuration */}
            <section className="bg-white border border-outline-variant/50 rounded-2xl p-5 shadow-sm space-y-5">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Configure Loan</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-xs text-on-surface-variant">Total Required Amount</span>
                  <span className="text-lg font-extrabold text-primary">₹{loanAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[10000, 20000, 30000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setLoanAmount(amt)}
                      className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        loanAmount === amt 
                          ? 'bg-primary text-white shadow-sm' 
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {amt / 1000}k
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsCustomAmountModalOpen(true)}
                    className="py-2 text-xs font-bold rounded-xl transition-all cursor-pointer bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                  >
                    More
                  </button>
                </div>
                <div className="flex justify-end text-[9px] text-outline font-semibold">
                  <span>Max: ₹{maxLimit.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-on-surface-variant">Repayment Tenure</span>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 6, 12, 18].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTenure(m)}
                      className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        tenure === m 
                          ? 'bg-primary text-white shadow-sm' 
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {m} Months
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-low p-4 rounded-xl space-y-2 border border-outline-variant/30 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Monthly EMI (Principal)</span>
                  <span className="font-extrabold text-on-surface text-sm">₹{calculateEMI().toLocaleString('en-IN')} / mo</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-outline">
                  <span>Interest Charges (0%)</span>
                  <span className="font-bold text-tertiary">₹0</span>
                </div>
                <div className="border-t border-outline-variant/30 pt-2 flex justify-between items-center font-bold text-on-surface">
                  <span>Total Repayable</span>
                  <span className="text-primary text-sm">₹{loanAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={isApplying}
              className={`w-full ${isApplying ? 'bg-primary/80 cursor-wait' : 'bg-primary hover:opacity-90 cursor-pointer'} text-white py-4 rounded-xl font-bold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2`}
            >
              {isApplying ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">send</span>
                  Submit Application
                </>
              )}
            </button>
          </form>
        )}
      </main>

      {/* Custom Amount Modal */}
      {isCustomAmountModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface w-full max-w-xs rounded-3xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsCustomAmountModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-lg font-black text-on-surface mb-2">Enter Amount</h3>
            <p className="text-xs text-on-surface-variant mb-6">Max limit: ₹{maxLimit.toLocaleString('en-IN')}</p>
            <form onSubmit={handleCustomAmountSubmit} className="space-y-4">
              <input
                type="number"
                value={customAmountInput}
                onChange={(e) => setCustomAmountInput(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-lg font-bold text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer text-sm"
              >
                Confirm
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
