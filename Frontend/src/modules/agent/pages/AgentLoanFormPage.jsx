import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AgentLoanFormPage() {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');
  const [loanAmount, setLoanAmount] = useState('50000');
  const [tenure, setTenure] = useState(12);
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPrescriptionFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerId || !patientName || !hospitalName || !admissionDate || !prescriptionFile) {
      alert('Please fill out all required fields and upload the Doctor\'s Prescription.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="bg-[#faf8ff] text-[#191b23] font-body-md min-h-screen pb-24">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-white shadow-sm border-b border-[#c3c6d6]/20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/agent/dashboard')} className="material-symbols-outlined text-[#003d9b] p-1 rounded-full hover:bg-[#f3f3fd] transition-colors">
            arrow_back
          </button>
          <h1 className="text-xl font-bold text-[#003d9b]">Apply for Medical Loan</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-4 max-w-lg mx-auto">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-700 border-2 border-green-500">
              <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-[#191b23]">Application Filed Successfully</h3>
              <p className="text-xs text-[#516161] max-w-[320px] mx-auto leading-relaxed">
                The loan application for <span className="font-bold text-[#003d9b]">{patientName}</span> (ID: <span className="font-bold">{customerId}</span>) of amount <span className="font-bold text-[#003d9b]">₹{Number(loanAmount).toLocaleString('en-IN')}</span> has been submitted to the underwriters.
              </p>
            </div>
            <button 
              onClick={() => navigate('/agent/dashboard')}
              className="bg-[#003d9b] text-white text-sm font-bold px-6 py-3 rounded-xl shadow-md hover:bg-[#0052cc] active:scale-95 transition-all mt-4"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            
            {/* Customer Lookup */}
            <section className="bg-white border border-[#c3c6d6]/30 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-[#434654] uppercase tracking-wider">Customer Information</h3>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#516161]">Customer ID / Mobile <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={customerId} 
                  onChange={(e) => setCustomerId(e.target.value)} 
                  placeholder="e.g. MC-88219" 
                  className="w-full bg-[#f3f3fd] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] transition-all"
                  required
                />
              </div>
            </section>

            {/* Patient Info */}
            <section className="bg-white border border-[#c3c6d6]/30 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-[#434654] uppercase tracking-wider">Patient &amp; Hospital Details</h3>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#516161]">Patient Full Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={patientName} 
                  onChange={(e) => setPatientName(e.target.value)} 
                  placeholder="Enter patient's name" 
                  className="w-full bg-[#f3f3fd] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#516161]">Relationship <span className="text-red-500">*</span></label>
                  <select 
                    value={relationship} 
                    onChange={(e) => setRelationship(e.target.value)} 
                    className="w-full bg-[#f3f3fd] border border-[#c3c6d6]/40 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-[#003d9b] transition-all"
                    required
                  >
                    <option value="" disabled>Select</option>
                    <option>Self</option>
                    <option>Spouse</option>
                    <option>Child</option>
                    <option>Parent</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#516161]">Admission Date <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    value={admissionDate} 
                    onChange={(e) => setAdmissionDate(e.target.value)} 
                    className="w-full bg-[#f3f3fd] border border-[#c3c6d6]/40 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-[#003d9b] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#516161]">Hospital Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={hospitalName} 
                  onChange={(e) => setHospitalName(e.target.value)} 
                  placeholder="Enter hospital name" 
                  className="w-full bg-[#f3f3fd] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] transition-all"
                  required
                />
              </div>
            </section>

            {/* Document Upload */}
            <section className="bg-white border border-[#c3c6d6]/30 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-[#434654] uppercase tracking-wider">Medical Documentation</h3>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#516161]">Prescription / Admission Advice <span className="text-red-500">*</span></label>
                <label className="w-full border-2 border-dashed border-[#c3c6d6] rounded-xl p-4 flex flex-col items-center justify-center gap-2 bg-[#faf8ff] hover:bg-[#f3f3fd] transition-colors cursor-pointer relative overflow-hidden">
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    required
                  />
                  <div className="w-10 h-10 rounded-full bg-[#dae2ff] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#003d9b]">{prescriptionFile ? 'check_circle' : 'upload_file'}</span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-[#003d9b]">
                      {prescriptionFile ? prescriptionFile.name : 'Upload admission advice'}
                    </p>
                    <p className="text-[10px] text-[#737685] mt-0.5">JPG, PNG or PDF (Max 5MB)</p>
                  </div>
                </label>
              </div>
            </section>

            {/* Amount Configuration */}
            <section className="bg-white border border-[#c3c6d6]/30 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-[#434654] uppercase tracking-wider">Loan Details</h3>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#516161]">Loan Amount (₹) <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  value={loanAmount} 
                  onChange={(e) => setLoanAmount(e.target.value)} 
                  className="w-full bg-[#f3f3fd] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] transition-all font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#516161]">Tenure (Months)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[6, 12, 18, 24].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTenure(m)}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        tenure === m 
                          ? 'bg-[#003d9b] text-white shadow-sm' 
                          : 'bg-[#f3f3fd] text-[#434654] hover:bg-[#ededf8]'
                      }`}
                    >
                      {m} Mo
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-[#003d9b] text-white py-3 rounded-xl font-bold shadow-lg hover:bg-[#0052cc] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Filing Application...' : 'Submit Application'}
            </button>
          </form>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-white shadow-[0_-4px_15px_rgba(0,0,0,0.06)] border-t border-[#c3c6d6]/20">
        <div className="flex flex-col items-center justify-center text-[#434654] px-4 py-1 cursor-pointer" onClick={() => navigate('/agent/dashboard')}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-semibold">Dashboard</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#434654] px-4 py-1 cursor-pointer" onClick={() => navigate('/agent/register')}>
          <span className="material-symbols-outlined">person_add</span>
          <span className="text-[10px] font-semibold">Register</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#434654] px-4 py-1 cursor-pointer" onClick={() => navigate('/agent/customers')}>
          <span className="material-symbols-outlined">group</span>
          <span className="text-[10px] font-semibold">Users</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#434654] px-4 py-1 cursor-pointer" onClick={() => navigate('/agent/profile')}>
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-[10px] font-semibold">Profile</span>
        </div>
      </nav>
    </div>
  );
}
