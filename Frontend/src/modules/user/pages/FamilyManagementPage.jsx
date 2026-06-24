import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/Navigation/BottomNavBar';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';
import { SERVER_URL } from '../../../services/types'; // To load images if needed, or use relative paths

const DEFAULT_AVATAR = null; // no avatar fallback needed — we use icon

export default function FamilyManagementPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Load from API on mount
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get(ENDPOINTS.FAMILY_MEMBERS);
      if (res.data.success) {
        setMembers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch family members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(ENDPOINTS.FAMILY_REMOVE(id));
      if (res.data.success) {
        setMembers(members.filter(m => m._id !== id));
      }
    } catch (err) {
      console.error('Failed to remove member:', err);
      alert(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md relative pb-24">
      <header className="flex justify-between items-center pl-2 pr-4 w-full h-20 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <img
            alt="MedCred Logo"
            className="h-16 w-auto object-contain"
            src="/FinalLogo.png"
          />
        </div>
        <button
          onClick={() => navigate('/notifications')}
          className="material-symbols-outlined text-primary p-2 hover:bg-surface-variant rounded-full cursor-pointer"
        >
          notifications
        </button>
      </header>

      <main className="flex-grow overflow-y-auto p-4 space-y-4 animate-fade-in">
        {/* Header Section */}
        <section className="space-y-3">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Family Management</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {members.length} member{members.length !== 1 ? 's' : ''} registered under your plan.
            </p>
          </div>
          {/* Search Bar */}
          <div className="relative w-full group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-xl">search</span>
            <input
              className="w-full pl-11 pr-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-xs"
              placeholder="Search family members..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </section>

        {/* Family List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary mb-2">sync</span>
              <p className="text-sm text-on-surface-variant">Loading members...</p>
            </div>
          ) : filteredMembers.length === 0 && members.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-outline/50 mb-3 block">group</span>
              <p className="text-sm font-bold text-on-surface-variant">No family members yet</p>
              <p className="text-xs text-outline mt-1">Add your spouse, children, or parents to cover them under your plan.</p>
            </div>
          ) : (
            filteredMembers.map((member) => (
            <div
              key={member._id}
              className="glass-card border border-outline-variant rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                {member.isVerified ? (
                  <span className="flex items-center gap-0.5 bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded-full text-[10px] font-bold">
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 bg-surface-container-highest text-on-surface-variant px-2 py-0.5 rounded-full text-[10px] font-bold">
                    <span className="material-symbols-outlined text-xs">pending</span>
                    Pending
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 pr-20">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full border-2 border-primary-container overflow-hidden bg-surface-container-high flex items-center justify-center shrink-0">
                  {member.profilePhoto ? (
                    <img alt={member.name} src={member.profilePhoto.startsWith('http') ? member.profilePhoto : `${SERVER_URL}${member.profilePhoto}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-2xl text-primary/50">person</span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface">{member.name}</h3>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded mt-1 inline-block">
                    {member.relationship}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs">
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-semibold">Age</p>
                  <p className="font-bold text-on-surface mt-0.5">{member.age || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-semibold">Member ID</p>
                  <p className="font-mono text-on-surface mt-0.5 text-[10px]">{member.memberId}</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-semibold">Blood</p>
                  <p className="font-bold text-on-surface mt-0.5">{member.bloodGroup || '—'}</p>
                </div>
              </div>

              {/* Actions Row — only show delete for non-self members */}
              {member.relationship !== 'Self' && (
                <div className="flex gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => navigate('/card')}
                    className="flex-1 text-[11px] font-bold text-primary flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">credit_card</span>
                    View Card
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(member._id)}
                    className="flex-1 text-[11px] font-bold text-error flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-error/5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">person_remove</span>
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))
          )}

          {filteredMembers.length === 0 && members.length > 0 && (
            <p className="text-center text-xs text-on-surface-variant py-8">No family members match your search.</p>
          )}

          {/* Add member box */}
          <div
            onClick={() => navigate('/family/add')}
            className="border border-dashed border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center bg-surface-container-low/50 cursor-pointer hover:border-primary transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <span className="material-symbols-outlined text-xl">group_add</span>
            </div>
            <h4 className="text-xs font-bold text-on-surface">Expand your circle</h4>
            <p className="text-[11px] text-on-surface-variant px-4 mt-1">Add more family members to grant them instant credit limits.</p>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/family/add')}
        className="fixed bottom-20 right-4 bg-primary text-on-primary flex items-center gap-2 px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all z-40 cursor-pointer"
      >
        <span className="material-symbols-outlined font-bold text-lg">add</span>
        <span className="text-xs font-bold">Add Member</span>
      </button>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-5 w-full max-w-[300px] shadow-2xl space-y-4 animate-scale-up">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-2xl">person_remove</span>
              </div>
              <h3 className="text-sm font-bold text-on-surface">Remove Member?</h3>
              <p className="text-xs text-on-surface-variant">This person will be removed from your MedCred family plan. This cannot be undone.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-outline text-on-surface-variant text-xs font-bold py-2.5 rounded-xl hover:bg-surface-container-low cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-error text-white text-xs font-bold py-2.5 rounded-xl hover:opacity-90 cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavBar />
    </div>
  );
}
