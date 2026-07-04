import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../../services/api';
import { ENDPOINTS, SERVER_URL } from '../../../services/types';

const ELIGIBILITY_COLORS = {

  eligible:     'bg-green-100 text-green-700',
  not_eligible: 'bg-red-100 text-red-700',
  waiting:       'bg-yellow-100 text-yellow-700',
};
const APPLICATION_COLORS = {
  applied:       'bg-blue-100 text-blue-700',
  under_review:  'bg-yellow-100 text-yellow-700',
  approved:      'bg-green-100 text-green-700',
  disbursed:     'bg-green-200 text-green-800',
  rejected:      'bg-red-100 text-red-700',
  closed:        'bg-gray-100 text-gray-700',
};

export default function AdminLoansPage() {
  const [loans, setLoans]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterElig, setFilter] = useState('All');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [imageDocs, setImageDocs] = useState([]);
  const [currentImgIndex, setCurrentImgIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [expandedSections, setExpandedSections] = useState({
    applicant: true,
    loan: true,
    guarantor1: false,
    guarantor2: false,
    documents: true,
    patients: true,
  });

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoanId, setRejectLoanId] = useState(null);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  useEffect(() => {
    if (selected || previewDoc || rejectModalOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [selected, previewDoc, rejectModalOpen]);

  const getDocumentList = (loan) => {
    if (!loan) return [];
    const docs = [];
    const addDoc = (name, url, category) => {
      if (url) {
        const fullUrl = url.startsWith('http') ? url : `${SERVER_URL}${url}`;
        docs.push({ name, url: fullUrl, category, fileType: url.match(/\.pdf$/i) ? 'PDF' : 'Image' });
      }
    };

    // Applicant
    addDoc('Applicant Aadhaar Card', loan.applicant_aadhaarCardUrl, 'Applicant');
    addDoc('Applicant Photo', loan.applicant_photoUrl, 'Applicant');
    addDoc('Applicant PAN Card', loan.applicant_panCardUrl, 'Applicant');
    addDoc('Applicant Bank Statement', loan.applicant_bankStatementUrl, 'Applicant');
    addDoc('Applicant Address Proof', loan.applicant_addressProofUrl, 'Applicant');
    addDoc('Applicant Cheque Leaf', loan.applicant_chequeUrl, 'Applicant');
    addDoc('Applicant CIBIL Report', loan.applicant_cibilScoreUrl, 'Applicant');

    // Guarantor 1
    addDoc('Guarantor 1 Aadhaar Card', loan.guarantor1_aadhaarCardUrl, 'Guarantor 1');
    addDoc('Guarantor 1 Photo', loan.guarantor1_photoUrl, 'Guarantor 1');
    addDoc('Guarantor 1 PAN Card', loan.guarantor1_panCardUrl, 'Guarantor 1');
    addDoc('Guarantor 1 Bank Statement', loan.guarantor1_bankStatementUrl, 'Guarantor 1');
    addDoc('Guarantor 1 Address Proof', loan.guarantor1_addressProofUrl, 'Guarantor 1');
    addDoc('Guarantor 1 Cheque Leaf', loan.guarantor1_chequeUrl, 'Guarantor 1');
    addDoc('Guarantor 1 CIBIL Report', loan.guarantor1_cibilScoreUrl, 'Guarantor 1');

    // Guarantor 2
    addDoc('Guarantor 2 Aadhaar Card', loan.guarantor2_aadhaarCardUrl, 'Guarantor 2');
    addDoc('Guarantor 2 Photo', loan.guarantor2_photoUrl, 'Guarantor 2');
    addDoc('Guarantor 2 PAN Card', loan.guarantor2_panCardUrl, 'Guarantor 2');
    addDoc('Guarantor 2 Bank Statement', loan.guarantor2_bankStatementUrl, 'Guarantor 2');
    addDoc('Guarantor 2 Address Proof', loan.guarantor2_addressProofUrl, 'Guarantor 2');
    addDoc('Guarantor 2 Cheque Leaf', loan.guarantor2_chequeUrl, 'Guarantor 2');
    addDoc('Guarantor 2 CIBIL Report', loan.guarantor2_cibilScoreUrl, 'Guarantor 2');

    // Patients
    if (loan.patients) {
      loan.patients.forEach((p, idx) => {
        addDoc(`Patient ${idx + 1} Prescription (${p.patientName})`, p.prescriptionFileUrl, 'Treatment');
        addDoc(`Patient ${idx + 1} Estimated Bill (${p.patientName})`, p.estimatedBillUrl, 'Treatment');
      });
    }

    return docs;
  };

  const handlePreviewDoc = (doc, allDocsList) => {
    const images = allDocsList.filter(d => d.fileType === 'Image');
    setImageDocs(images);
    
    if (doc.fileType === 'Image') {
      const idx = images.findIndex(img => img.url === doc.url);
      setCurrentImgIndex(idx);
    } else {
      setCurrentImgIndex(-1);
    }
    
    setPreviewDoc({ url: doc.url, filename: doc.name });
    setZoom(1);
  };

  const fetchLoans = async () => {
    try {
      const res = await api.get(ENDPOINTS.ADMIN_LOANS);
      if (res.data.success) {
        setLoans(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch loans:', err);
    }
  };

  const updateApp = async (id, appStatus) => {
    try {
      const payload = { status: appStatus };
      if (appStatus === 'rejected') {
        setRejectLoanId(id);
        setRejectReason('');
        setRejectModalOpen(true);
        return; // Halt and wait for modal submission
      }
      const res = await api.patch(ENDPOINTS.ADMIN_LOAN_UPDATE(id), payload);
      if (res.data.success) {
        setLoans(loans.map(l => l._id === id ? res.data.data : l));
        if (selected?._id === id) setSelected(res.data.data);
      }
    } catch (err) {
      alert('Failed to update loan status');
    }
  };

  const submitRejection = async () => {
    if (!rejectReason.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }
    try {
      const payload = { status: 'rejected', rejectionReason: rejectReason };
      const res = await api.patch(ENDPOINTS.ADMIN_LOAN_UPDATE(rejectLoanId), payload);
      if (res.data.success) {
        setLoans(loans.map(l => l._id === rejectLoanId ? res.data.data : l));
        if (selected?._id === rejectLoanId) setSelected(res.data.data);
        setRejectModalOpen(false);
        setRejectLoanId(null);
        setRejectReason('');
      }
    } catch (err) {
      alert('Failed to reject application');
    }
  };

  const blockDuplicate = async (id) => {
    await updateApp(id, 'rejected');
  };

  const handleNextImg = () => {
    if (currentImgIndex < imageDocs.length - 1) {
      const nextIdx = currentImgIndex + 1;
      setCurrentImgIndex(nextIdx);
      setPreviewDoc({ url: imageDocs[nextIdx].url, filename: imageDocs[nextIdx].name });
      setZoom(1);
    }
  };

  const handlePrevImg = () => {
    if (currentImgIndex > 0) {
      const prevIdx = currentImgIndex - 1;
      setCurrentImgIndex(prevIdx);
      setPreviewDoc({ url: imageDocs[prevIdx].url, filename: imageDocs[prevIdx].name });
      setZoom(1);
    }
  };

  const filtered = loans.filter(l => {
    const q = search.toLowerCase();
    const matchQ = !q || l.userName.toLowerCase().includes(q) || l.loanId.toLowerCase().includes(q);
    const matchF  = filterElig === 'All' || l.eligibilityStatus === filterElig;
    return matchQ && matchF;
  });

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Banner */}
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[11px] uppercase tracking-widest text-blue-200 font-bold">Financial Control</span>
          <h2 className="text-xl font-extrabold mt-1">Loan Eligibility Monitor</h2>
          <p className="text-sm text-white/80 mt-1">
            Track loan eligibility (30-day waiting period), view applications, approve/reject, and block duplicates.
          </p>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', value: loans.length,                                   color:'text-[#003d9b]',  bg:'bg-[#dae2ff]',  icon:'payments' },
          { label: 'Eligible',           value: loans.filter(l=>l.eligibilityStatus==='eligible').length,  color:'text-green-700',  bg:'bg-green-100',  icon:'check_circle' },
          { label: 'Waiting Period',     value: loans.filter(l=>l.eligibilityStatus==='waiting').length,   color:'text-yellow-700', bg:'bg-yellow-100', icon:'hourglass_empty' },
          { label: 'Applied',            value: loans.filter(l=>l.applicationStatus==='applied').length, color:'text-blue-700', bg:'bg-blue-100', icon:'description' },
        ].map((s,i)=>(
          <div key={i} className="bg-white rounded-xl border border-[#c3c6d6]/20 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings:"'FILL' 1" }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xs text-[#516161] font-semibold">{s.label}</p>
              <p className="text-xl font-extrabold text-[#191b23]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-[#f0f4ff] border border-[#dae2ff] rounded-xl p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-[#003d9b] text-[22px] shrink-0">info</span>
        <div>
          <p className="text-sm font-bold text-[#003d9b]">Loan Eligibility Rules (FRD §9)</p>
          <ul className="text-xs text-[#516161] mt-1 space-y-1">
            <li>• Users can apply only <strong>30 days after card purchase</strong>.</li>
            <li>• <strong>Only one active loan</strong> is allowed per user — duplicates are automatically flagged.</li>
            <li>• Admin must manually approve or reject pending applications.</li>
          </ul>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737685] text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search by user name or loan ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl text-sm focus:outline-none focus:border-[#003d9b]"
          />
        </div>
        <select
          value={filterElig}
          onChange={e => setFilter(e.target.value)}
          className="bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
        >
          {['All','eligible','not_eligible','waiting'].map(v=><option key={v}>{v}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#c3c6d6]/20">
          <h3 className="font-extrabold text-[#191b23]">Loan Applications <span className="text-sm font-semibold text-[#516161]">({filtered.length})</span></h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#faf8ff] text-[#737685] text-xs font-bold border-b border-[#c3c6d6]/20">
                <th className="px-5 py-3">Loan ID</th>
                <th className="px-5 py-3">User Name</th>
                <th className="px-5 py-3">Card Purchase</th>
                <th className="px-5 py-3">Eligibility</th>
                <th className="px-5 py-3">Application</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6d6]/10">
              {filtered.map(l => (
                <tr key={l._id} className={`hover:bg-[#faf8ff]/60 transition-colors ${l.isDuplicate ? 'bg-red-50/30' : ''}`}>
                  <td className="px-5 py-3.5 font-mono font-bold text-xs text-[#003d9b]">{l.loanId}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-[#191b23]">{l.userName}</p>
                    {l.isEmergency && (
                      <span className="text-[10px] text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-md font-bold inline-flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span> Urgent / Emergency
                      </span>
                    )}
                    {l.isDuplicate && (
                      <span className="text-[10px] text-red-600 font-bold flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[12px]">warning</span> Blocked as Duplicate
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#516161] font-semibold">{new Date(l.cardPurchaseDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ELIGIBILITY_COLORS[l.eligibilityStatus] || 'bg-gray-100'}`}>
                        {l.eligibilityStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${APPLICATION_COLORS[l.applicationStatus] || 'bg-gray-100'}`}>
                      {l.applicationStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex gap-1.5 justify-center">
                      <button onClick={() => setSelected(l)} className="bg-[#f0f4ff] hover:bg-[#dae2ff] text-[#003d9b] px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">View</button>
                      {l.applicationStatus === 'applied' && (
                        <>
                          <button onClick={() => updateApp(l._id, 'approved')} className="bg-green-50 hover:bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">Approve</button>
                          <button onClick={() => updateApp(l._id, 'rejected')} className="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">Reject</button>
                          <button onClick={() => blockDuplicate(l._id)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">Block Dup.</button>
                        </>
                      )}
                      {l.applicationStatus === 'approved' && (
                        <button onClick={() => updateApp(l._id, 'disbursed')} className="bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">Disburse</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-[#516161] text-sm">
                  <span className="material-symbols-outlined text-3xl block mb-2 text-[#c3c6d6]">payments</span>
                  No loan records found.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Detail Modal */}
      {selected && createPortal(
        <div className="fixed inset-0 bg-[#0D1B3E]/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in animate-scale-up" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-[#c3c6d6]/20 px-6 py-4 bg-[#f8f9fd] shrink-0">
              <div>
                <h3 className="font-extrabold text-[#191b23] text-sm md:text-base">Loan Application Details</h3>
                <p className="text-[11px] text-gray-500 font-mono mt-0.5">{selected.loanId} · {selected.userId?.fullName || selected.userName}</p>
              </div>
              <button onClick={() => setSelected(null)} className="material-symbols-outlined text-[#737685] hover:text-[#191b23] cursor-pointer">close</button>
            </div>
            
            {/* Modal Body (Scrollable container for collapsible sections) */}
            <div className="p-6 overflow-y-auto space-y-4 flex-grow bg-slate-50/50">
              
              {/* Applicant Details */}
              {(() => {
                const content = (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Full Name</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{selected.userId?.fullName || selected.userName || 'No data available.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Email Address</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{selected.userId?.email || 'No data available.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Mobile Number</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{selected.userId?.mobile || 'No data available.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Aadhaar No.</p>
                      <p className="font-mono font-bold text-gray-700 mt-0.5">
                        {selected.aadhaarNumber ? `XXXX-XXXX-${selected.aadhaarNumber.slice(-4)}` : 'No data available.'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">PAN Card No.</p>
                      <p className="font-mono font-bold text-gray-700 mt-0.5">
                        {selected.panNumber ? `XXXXX${selected.panNumber.slice(-5)}` : 'No data available.'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Bank Account No.</p>
                      <p className="font-mono font-bold text-gray-700 mt-0.5">{selected.applicant_bankAccountNumber || 'No data available.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">IFSC Code</p>
                      <p className="font-mono font-bold text-gray-700 mt-0.5">{selected.applicant_ifscCode || 'No data available.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">CIBIL Score</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{selected.applicant_cibilScore || 'No data available.'}</p>
                    </div>
                  </div>
                );
                const isOpen = expandedSections.applicant;
                return (
                  <div className="bg-white border border-[#c3c6d6]/25 rounded-2xl overflow-hidden shadow-sm transition-all duration-200">
                    <button
                      type="button"
                      onClick={() => toggleSection('applicant')}
                      className="w-full px-5 py-4 flex justify-between items-center bg-[#faf8ff] text-left hover:bg-[#f3f0ff] transition-colors cursor-pointer"
                    >
                      <span className="font-extrabold text-[#191b23] text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#003d9b]">person</span> Applicant Details
                      </span>
                      <span className="material-symbols-outlined text-[#737685] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                        expand_more
                      </span>
                    </button>
                    {isOpen && <div className="p-5 border-t border-[#c3c6d6]/10">{content}</div>}
                  </div>
                );
              })()}

              {/* Loan Details */}
              {(() => {
                const content = (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Loan ID</p>
                      <p className="font-mono font-bold text-[#003d9b] mt-0.5">{selected.loanId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Card Purchase Date</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{new Date(selected.cardPurchaseDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Eligibility Status</p>
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1 ${ELIGIBILITY_COLORS[selected.eligibilityStatus] || 'bg-gray-100'}`}>
                          {selected.eligibilityStatus}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Application Status</p>
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1 ${APPLICATION_COLORS[selected.applicationStatus] || 'bg-gray-100'}`}>
                          {selected.applicationStatus}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Loan Amount</p>
                      <p className="font-black text-primary text-sm mt-0.5">₹{selected.loanAmount?.toLocaleString('en-IN') || '0'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Repayment Tenure</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{selected.tenure || '0'} Months</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Monthly EMI</p>
                      <p className="font-extrabold text-gray-800 mt-0.5">₹{selected.emiAmount?.toLocaleString('en-IN') || '0'} / month</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Repayable</p>
                      <p className="font-extrabold text-gray-800 mt-0.5">₹{selected.totalRepayable?.toLocaleString('en-IN') || '0'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Priority Level</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{selected.isEmergency ? 'Urgent / Emergency Access' : 'Standard Access (30-day)'}</p>
                    </div>
                  </div>
                );
                const isOpen = expandedSections.loan;
                return (
                  <div className="bg-white border border-[#c3c6d6]/25 rounded-2xl overflow-hidden shadow-sm transition-all duration-200">
                    <button
                      type="button"
                      onClick={() => toggleSection('loan')}
                      className="w-full px-5 py-4 flex justify-between items-center bg-[#faf8ff] text-left hover:bg-[#f3f0ff] transition-colors cursor-pointer"
                    >
                      <span className="font-extrabold text-[#191b23] text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#003d9b]">payments</span> Loan Details
                      </span>
                      <span className="material-symbols-outlined text-[#737685] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                        expand_more
                      </span>
                    </button>
                    {isOpen && <div className="p-5 border-t border-[#c3c6d6]/10">{content}</div>}
                  </div>
                );
              })()}

              {/* Guarantor 1 */}
              {(() => {
                const hasData = !!selected.guarantor1_name;
                const content = hasData ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Full Name</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{selected.guarantor1_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Mobile Number</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{selected.guarantor1_mobile || 'No data available.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Email Address</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{selected.guarantor1_email || 'No data available.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Date of Birth</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">
                        {selected.guarantor1_dob ? new Date(selected.guarantor1_dob).toLocaleDateString() : 'No data available.'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Gender</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{selected.guarantor1_gender || 'No data available.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Relationship</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{selected.guarantor1_relationship || 'No data available.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Occupation</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{selected.guarantor1_occupation || 'No data available.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Company Name</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{selected.guarantor1_companyName || 'No data available.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Monthly Income</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">
                        {selected.guarantor1_monthlyIncome ? `₹${selected.guarantor1_monthlyIncome.toLocaleString('en-IN')}` : 'No data available.'}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Address</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">
                        {[selected.guarantor1_address, selected.guarantor1_city, selected.guarantor1_state, selected.guarantor1_pincode].filter(Boolean).join(', ') || 'No data available.'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Aadhaar No.</p>
                      <p className="font-mono font-bold text-gray-700 mt-0.5">
                        {selected.guarantor1_aadhaarNumber ? `XXXX-XXXX-${selected.guarantor1_aadhaarNumber.slice(-4)}` : 'No data available.'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">PAN Card No.</p>
                      <p className="font-mono font-bold text-gray-700 mt-0.5">
                        {selected.guarantor1_panNumber ? `XXXXX${selected.guarantor1_panNumber.slice(-5)}` : 'No data available.'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Bank Account No.</p>
                      <p className="font-mono font-bold text-gray-700 mt-0.5">{selected.guarantor1_bankAccountNumber || 'No data available.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">IFSC Code</p>
                      <p className="font-mono font-bold text-gray-700 mt-0.5">{selected.guarantor1_ifscCode || 'No data available.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">CIBIL Score</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{selected.guarantor1_cibilScore || 'No data available.'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No data available.</p>
                );
                const isOpen = expandedSections.guarantor1;
                return (
                  <div className="bg-white border border-[#c3c6d6]/25 rounded-2xl overflow-hidden shadow-sm transition-all duration-200">
                    <button
                      type="button"
                      onClick={() => toggleSection('guarantor1')}
                      className="w-full px-5 py-4 flex justify-between items-center bg-[#faf8ff] text-left hover:bg-[#f3f0ff] transition-colors cursor-pointer"
                    >
                      <span className="font-extrabold text-[#191b23] text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#003d9b]">shield</span> Guarantor 1 Details
                      </span>
                      <span className="material-symbols-outlined text-[#737685] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                        expand_more
                      </span>
                    </button>
                    {isOpen && <div className="p-5 border-t border-[#c3c6d6]/10">{content}</div>}
                  </div>
                );
              })()}

              {/* Guarantor 2 */}
              {(() => {
                const hasData = !!selected.guarantor2_name;
                const content = hasData ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Full Name</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{selected.guarantor2_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Mobile Number</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{selected.guarantor2_mobile || 'No data available.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Email Address</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{selected.guarantor2_email || 'No data available.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Date of Birth</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">
                        {selected.guarantor2_dob ? new Date(selected.guarantor2_dob).toLocaleDateString() : 'No data available.'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Gender</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{selected.guarantor2_gender || 'No data available.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Relationship</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{selected.guarantor2_relationship || 'No data available.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Occupation</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{selected.guarantor2_occupation || 'No data available.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Company Name</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{selected.guarantor2_companyName || 'No data available.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Monthly Income</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">
                        {selected.guarantor2_monthlyIncome ? `₹${selected.guarantor2_monthlyIncome.toLocaleString('en-IN')}` : 'No data available.'}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Address</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">
                        {[selected.guarantor2_address, selected.guarantor2_city, selected.guarantor2_state, selected.guarantor2_pincode].filter(Boolean).join(', ') || 'No data available.'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Aadhaar No.</p>
                      <p className="font-mono font-bold text-gray-700 mt-0.5">
                        {selected.guarantor2_aadhaarNumber ? `XXXX-XXXX-${selected.guarantor2_aadhaarNumber.slice(-4)}` : 'No data available.'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">PAN Card No.</p>
                      <p className="font-mono font-bold text-gray-700 mt-0.5">
                        {selected.guarantor2_panNumber ? `XXXXX${selected.guarantor2_panNumber.slice(-5)}` : 'No data available.'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Bank Account No.</p>
                      <p className="font-mono font-bold text-gray-700 mt-0.5">{selected.guarantor2_bankAccountNumber || 'No data available.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">IFSC Code</p>
                      <p className="font-mono font-bold text-gray-700 mt-0.5">{selected.guarantor2_ifscCode || 'No data available.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">CIBIL Score</p>
                      <p className="font-extrabold text-[#191b23] mt-0.5">{selected.guarantor2_cibilScore || 'No data available.'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No data available.</p>
                );
                const isOpen = expandedSections.guarantor2;
                return (
                  <div className="bg-white border border-[#c3c6d6]/25 rounded-2xl overflow-hidden shadow-sm transition-all duration-200">
                    <button
                      type="button"
                      onClick={() => toggleSection('guarantor2')}
                      className="w-full px-5 py-4 flex justify-between items-center bg-[#faf8ff] text-left hover:bg-[#f3f0ff] transition-colors cursor-pointer"
                    >
                      <span className="font-extrabold text-[#191b23] text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#003d9b]">shield</span> Guarantor 2 Details
                      </span>
                      <span className="material-symbols-outlined text-[#737685] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                        expand_more
                      </span>
                    </button>
                    {isOpen && <div className="p-5 border-t border-[#c3c6d6]/10">{content}</div>}
                  </div>
                );
              })()}

              {/* Uploaded Documents */}
              {(() => {
                const docs = getDocumentList(selected);
                const hasData = docs.length > 0;
                const content = hasData ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {docs.map((doc, idx) => (
                      <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col justify-between space-y-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-primary">
                              {doc.fileType === 'PDF' ? 'picture_as_pdf' : 'image'}
                            </span>
                            <p className="font-bold text-[#191b23] text-xs truncate" title={doc.name}>
                              {doc.name}
                            </p>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1 font-semibold">
                            Type: {doc.fileType} · Category: {doc.category}
                          </p>
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-gray-200/50">
                          <button
                            type="button"
                            onClick={() => handlePreviewDoc(doc, docs)}
                            className="flex-1 text-[11px] font-bold text-[#003d9b] bg-[#dae2ff]/50 hover:bg-[#dae2ff] px-2.5 py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <span className="material-symbols-outlined text-[13px]">visibility</span> View
                          </button>
                          <a
                            href={doc.url}
                            download={doc.name}
                            className="flex-1 text-[11px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors text-center"
                          >
                            <span className="material-symbols-outlined text-[13px]">download</span> Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No data available.</p>
                );
                const isOpen = expandedSections.documents;
                return (
                  <div className="bg-white border border-[#c3c6d6]/25 rounded-2xl overflow-hidden shadow-sm transition-all duration-200">
                    <button
                      type="button"
                      onClick={() => toggleSection('documents')}
                      className="w-full px-5 py-4 flex justify-between items-center bg-[#faf8ff] text-left hover:bg-[#f3f0ff] transition-colors cursor-pointer"
                    >
                      <span className="font-extrabold text-[#191b23] text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#003d9b]">folder</span> Uploaded Documents
                      </span>
                      <span className="material-symbols-outlined text-[#737685] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                        expand_more
                      </span>
                    </button>
                    {isOpen && <div className="p-5 border-t border-[#c3c6d6]/10">{content}</div>}
                  </div>
                );
              })()}

              {/* Bills & Prescription (Legacy patients structure) */}
              {(() => {
                const hasData = selected.patients && selected.patients.length > 0;
                const content = hasData ? (
                  <div className="space-y-3">
                    {selected.patients.map((p, idx) => {
                      const patientDocs = [];
                      if (p.prescriptionFileUrl) {
                        patientDocs.push({ name: 'Prescription', url: p.prescriptionFileUrl, fileType: p.prescriptionFileUrl.match(/\.pdf$/i) ? 'PDF' : 'Image' });
                      }
                      if (p.estimatedBillUrl) {
                        patientDocs.push({ name: 'Estimated Bill', url: p.estimatedBillUrl, fileType: p.estimatedBillUrl.match(/\.pdf$/i) ? 'PDF' : 'Image' });
                      }
                      return (
                        <div key={idx} className="bg-gray-50 rounded-xl p-4 text-xs border border-gray-200/50">
                          <div>
                            <p className="font-bold text-[#191b23] text-sm">{p.patientName} <span className="text-gray-500 font-normal text-xs">({p.relationship})</span></p>
                            <p className="text-gray-600 mt-1">Hospital Name: {p.hospitalName}</p>
                            <p className="text-gray-500 text-[10px] mt-0.5">Admission Date: {p.admissionDate ? new Date(p.admissionDate).toLocaleDateString() : 'N/A'}</p>
                            {p.treatmentReason && <p className="text-gray-500 text-[10px] mt-0.5">Reason: {p.treatmentReason}</p>}
                          </div>
                          {patientDocs.length > 0 && (
                            <div className="flex gap-3 mt-3 pt-2 border-t border-gray-200/40">
                              {patientDocs.map((doc, dIdx) => (
                                <button
                                  key={dIdx}
                                  type="button"
                                  onClick={() => handlePreviewDoc({ name: `${p.patientName}'s ${doc.name}`, url: doc.url, fileType: doc.fileType }, getDocumentList(selected))}
                                  className="text-[#003d9b] hover:underline font-bold bg-transparent border-none p-0 cursor-pointer text-xs flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[13px]">
                                    {doc.fileType === 'PDF' ? 'picture_as_pdf' : 'image'}
                                  </span>
                                  View {doc.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No data available.</p>
                );
                const isOpen = expandedSections.patients;
                return (
                  <div className="bg-white border border-[#c3c6d6]/25 rounded-2xl overflow-hidden shadow-sm transition-all duration-200">
                    <button
                      type="button"
                      onClick={() => toggleSection('patients')}
                      className="w-full px-5 py-4 flex justify-between items-center bg-[#faf8ff] text-left hover:bg-[#f3f0ff] transition-colors cursor-pointer"
                    >
                      <span className="font-extrabold text-[#191b23] text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#003d9b]">medical_services</span> Patients & Hospital Details
                      </span>
                      <span className="material-symbols-outlined text-[#737685] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                        expand_more
                      </span>
                    </button>
                    {isOpen && <div className="p-5 border-t border-[#c3c6d6]/10">{content}</div>}
                  </div>
                );
              })()}

            </div>

            {/* Modal Footer (Disbursement Actions) */}
            <div className="p-4 border-t border-[#c3c6d6]/20 bg-white flex gap-3 shrink-0">
              {selected.applicationStatus === 'applied' && (
                <>
                  <button onClick={() => { updateApp(selected._id, 'approved'); }} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm">
                    Approve Application
                  </button>
                  <button onClick={() => { updateApp(selected._id, 'rejected'); }} className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                    Reject Application
                  </button>
                </>
              )}
              {selected.applicationStatus === 'approved' && (
                <button onClick={() => { updateApp(selected._id, 'disbursed'); }} className="w-full bg-[#003d9b] hover:bg-[#002f7a] text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm">
                  Mark as Disbursed
                </button>
              )}
              <button onClick={() => setSelected(null)} className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Document Preview Modal */}
      {previewDoc && createPortal(
        <div 
          className="fixed inset-0 bg-black/60 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewDoc(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#c3c6d6]/20 px-6 py-4 shrink-0 bg-[#f8f9fd]">
              <h3 className="font-extrabold text-[#191b23] truncate max-w-[70%] text-xs md:text-sm">
                Document Preview — {previewDoc.filename || 'Document'}
              </h3>
              <div className="flex items-center gap-4">
                <a 
                  href={previewDoc.url}
                  download={previewDoc.filename || 'download'}
                  className="material-symbols-outlined text-[#737685] hover:text-[#191b23] cursor-pointer text-lg flex items-center justify-center"
                  title="Download File"
                >
                  download
                </a>
                <button 
                  onClick={() => setPreviewDoc(null)} 
                  className="material-symbols-outlined text-[#737685] hover:text-[#191b23] cursor-pointer text-lg flex items-center justify-center"
                >
                  close
                </button>
              </div>
            </div>
            
            <div className="p-6 flex flex-col items-center justify-center bg-slate-50 min-h-[350px] max-h-[75vh] overflow-hidden relative flex-grow">
              {previewDoc.filename?.match(/\.(jpg|jpeg|png|webp)$/i) || previewDoc.url.match(/\.(jpg|jpeg|png|webp)$/i) || previewDoc.filename === 'blob' || currentImgIndex !== -1 ? (
                <div className="w-full flex-grow flex items-center justify-center relative overflow-auto">
                  <div 
                    style={{ transform: `scale(${zoom})`, transition: 'transform 0.15s ease-out' }}
                    className="max-w-full max-h-[55vh] flex items-center justify-center"
                  >
                    <img 
                      src={previewDoc.url} 
                      alt={previewDoc.filename} 
                      className="max-w-full max-h-[50vh] object-contain rounded-lg shadow-md"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  </div>

                  {/* Previous / Next buttons overlay */}
                  {currentImgIndex > 0 && (
                    <button 
                      onClick={handlePrevImg}
                      className="absolute left-2 bg-white/80 hover:bg-white text-gray-800 w-9 h-9 rounded-full shadow-md flex items-center justify-center cursor-pointer transition-colors z-10"
                      title="Previous Image"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                  )}
                  {currentImgIndex !== -1 && currentImgIndex < imageDocs.length - 1 && (
                    <button 
                      onClick={handleNextImg}
                      className="absolute right-2 bg-white/80 hover:bg-white text-gray-800 w-9 h-9 rounded-full shadow-md flex items-center justify-center cursor-pointer transition-colors z-10"
                      title="Next Image"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                  )}
                </div>
              ) : previewDoc.filename?.match(/\.pdf$/i) || previewDoc.url.match(/\.pdf$/i) ? (
                <iframe 
                  src={previewDoc.url} 
                  title="PDF Preview"
                  className="w-full h-[60vh] border-0 rounded-lg shadow-inner"
                />
              ) : (
                <div className="text-center p-8 space-y-4">
                  <span className="material-symbols-outlined text-5xl text-[#737685]">draft</span>
                  <p className="text-sm font-semibold text-[#516161]">Preview not supported for this file format.</p>
                  <a 
                    href={previewDoc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#003d9b] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-[#0052cc] transition-colors cursor-pointer"
                  >
                    Open in New Tab
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>
              )}

              {/* Zoom controls for Images */}
              {currentImgIndex !== -1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 border border-gray-200 rounded-full px-4 py-1.5 shadow-md flex items-center gap-3 z-20">
                  <button 
                    onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
                    className="material-symbols-outlined text-gray-600 hover:text-gray-900 cursor-pointer text-[18px]"
                    title="Zoom Out"
                  >
                    zoom_out
                  </button>
                  <span className="text-[11px] font-bold text-gray-700 select-none">{Math.round(zoom * 100)}%</span>
                  <button 
                    onClick={() => setZoom(prev => Math.min(3, prev + 0.25))}
                    className="material-symbols-outlined text-gray-600 hover:text-gray-900 cursor-pointer text-[18px]"
                    title="Zoom In"
                  >
                    zoom_in
                  </button>
                  <button 
                    onClick={() => setZoom(1)}
                    className="material-symbols-outlined text-gray-600 hover:text-gray-900 cursor-pointer text-[18px] border-l border-gray-200 pl-2"
                    title="Reset"
                  >
                    restart_alt
                  </button>
                </div>
              )}
              <div style={{ display: 'none' }} className="text-center p-8">
                <p className="text-sm font-semibold text-[#516161]">Failed to load preview.</p>
                <a href={previewDoc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#003d9b] underline font-bold mt-2 block">
                  Open link directly
                </a>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Reject Modal */}
      {rejectModalOpen && createPortal(
        <div className="fixed inset-0 bg-[#0D1B3E]/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4" onClick={() => setRejectModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-[#c3c6d6]/20 px-6 py-4 bg-red-50">
              <h3 className="font-extrabold text-red-700 text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">cancel</span> Reject Loan Application
              </h3>
              <button onClick={() => setRejectModalOpen(false)} className="material-symbols-outlined text-red-400 hover:text-red-700 cursor-pointer">close</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#191b23] mb-1">Reason for Rejection <span className="text-red-600">*</span></label>
                <textarea 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter a clear reason for rejecting this loan application..."
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 min-h-[100px] resize-y"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitRejection}
                  className="px-4 py-2 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 text-sm transition-colors cursor-pointer shadow-md"
                >
                  Reject Application
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
