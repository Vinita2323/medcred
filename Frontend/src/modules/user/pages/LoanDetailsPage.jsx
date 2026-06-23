import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/Navigation/BottomNavBar';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

const STATUS_MAP = {
  'under_review': { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800', icon: 'pending' },
  'approved': { label: 'Approved', color: 'bg-blue-100 text-blue-800', icon: 'check_circle' },
  'disbursed': { label: 'Disbursed', color: 'bg-green-100 text-green-800', icon: 'account_balance' },
  'rejected': { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: 'cancel' }
};

export default function LoanDetailsPage() {
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoan = async () => {
      try {
        const res = await api.get(ENDPOINTS.MY_LOAN);
        if (res.data.success) {
          setLoan(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch loan details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLoan();
  }, []);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-surface pb-24">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md relative pb-24 min-h-screen">
        <header className="flex items-center gap-3 px-4 h-16 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <h1 className="font-bold text-base text-primary">Loan Details</h1>
        </header>
        <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
          <span className="material-symbols-outlined text-outline text-6xl mb-4">description</span>
          <h2 className="text-xl font-bold text-on-surface mb-2">No Active Loan</h2>
          <p className="text-sm text-on-surface-variant">You don't have an active loan application.</p>
        </div>
        <BottomNavBar />
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md min-h-screen pb-20 animate-fade-in">
      <header className="flex items-center gap-3 px-4 h-16 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-primary">arrow_back</span>
        </button>
        <h1 className="font-bold text-base text-primary">Loan Details</h1>
      </header>

      <main className="p-4 space-y-6 max-w-md mx-auto w-full">
        <div className="bg-white border border-outline-variant/50 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Loan Amount</p>
              <p className="text-xl font-black text-primary">₹{loan.loanAmount.toLocaleString('en-IN')}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Status</p>
              <div className={`mt-0.5 px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${STATUS_MAP[loan.applicationStatus]?.color || 'bg-surface-container text-on-surface-variant'}`}>
                <span className="material-symbols-outlined text-sm">{STATUS_MAP[loan.applicationStatus]?.icon || 'info'}</span>
                {STATUS_MAP[loan.applicationStatus]?.label || loan.applicationStatus}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-outline-variant/30">
            <div>
              <p className="text-[10px] text-on-surface-variant">EMI Amount</p>
              <p className="font-bold text-sm text-on-surface mt-0.5">₹{loan.emiAmount.toLocaleString('en-IN')}/mo</p>
            </div>
            <div>
              <p className="text-[10px] text-on-surface-variant">Tenure</p>
              <p className="font-bold text-sm text-on-surface mt-0.5">{loan.tenure} Months</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-outline-variant/50 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Application Status</h3>
          <div className="relative pl-6 space-y-6">
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-surface-container"></div>
            
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-6 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold z-10 shadow-sm border-2 border-white">
                    <span className="material-symbols-outlined text-[12px]">check</span>
                  </div>
                  <p className="font-bold text-sm text-on-surface">Application Submitted</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{new Date(loan.appliedAt).toLocaleDateString()}</p>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 shadow-sm border-2 border-white ${['under_review', 'approved', 'disbursed'].includes(loan.applicationStatus) ? 'bg-primary text-white' : loan.applicationStatus === 'rejected' ? 'bg-error text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    {['under_review', 'approved', 'disbursed'].includes(loan.applicationStatus) ? <span className="material-symbols-outlined text-[12px]">check</span> : <div className="w-1.5 h-1.5 rounded-full bg-current"></div>}
                  </div>
                  <p className="font-bold text-sm text-on-surface">{loan.applicationStatus === 'rejected' ? 'Application Rejected' : 'Under Review'}</p>
                  {loan.applicationStatus === 'rejected' && <p className="text-xs text-error mt-0.5">{loan.rejectionReason}</p>}
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 shadow-sm border-2 border-white ${['approved', 'disbursed'].includes(loan.applicationStatus) ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    {['approved', 'disbursed'].includes(loan.applicationStatus) ? <span className="material-symbols-outlined text-[12px]">check</span> : <div className="w-1.5 h-1.5 rounded-full bg-current"></div>}
                  </div>
                  <p className="font-bold text-sm text-on-surface">Approved</p>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 shadow-sm border-2 border-white ${loan.applicationStatus === 'disbursed' ? 'bg-success text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    {loan.applicationStatus === 'disbursed' ? <span className="material-symbols-outlined text-[12px]">check</span> : <div className="w-1.5 h-1.5 rounded-full bg-current"></div>}
                  </div>
                  <p className="font-bold text-sm text-on-surface">Disbursed to Hospital</p>
                  {loan.applicationStatus === 'disbursed' && <p className="text-xs text-success mt-0.5">Paid on {new Date(loan.disbursedAt).toLocaleDateString()}</p>}
                </div>
              </div>
            </div>

            {/* Patients Info */}
            <div className="bg-white border border-outline-variant/50 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Patients Covered ({loan.patients?.length || 0})</h3>
              <div className="space-y-3">
                {loan.patients?.map((p, i) => (
                  <div key={i} className="flex justify-between items-center bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30">
                    <div>
                      <p className="font-bold text-sm text-on-surface">{p.patientName}</p>
                      <p className="text-[10px] text-on-surface-variant">{p.relationship} • {p.hospitalName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
      </main>
    </div>
  );
}
