import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/Navigation/BottomNavBar';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

export default function SupportPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [tickets, setTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'medium' });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get(ENDPOINTS.SUPPORT_TICKETS);
      if (res.data.success) {
        setTickets(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(ENDPOINTS.SUPPORT_TICKETS, newTicket);
      if (res.data.success) {
        setTickets([res.data.data, ...tickets]);
        setIsModalOpen(false);
        setNewTicket({ subject: '', description: '', priority: 'medium' });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit ticket');
    }
  };

  return (
    <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md relative pb-24">
      {/* TopAppBar */}
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

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-4 space-y-6 max-w-md mx-auto w-full animate-fade-in">
        {/* Hero Search Section */}
        <section className="text-center py-4">
          <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">How can we help you?</h2>
          <p className="text-xs text-on-surface-variant mt-2 max-w-[280px] mx-auto leading-relaxed">
            Search articles, track active claims, or contact our 24/7 medical support team.
          </p>
          <div className="relative mt-5 w-full group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-xl">search</span>
            <input 
              className="w-full pl-11 pr-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-xs" 
              placeholder="Search 'Claim status', 'Repayment'..." 
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </section>

        {/* Action Cards - Bento Layout */}
        <section className="grid grid-cols-2 gap-3">
          {/* Raise Ticket */}
          <div 
            onClick={() => setIsModalOpen(true)} 
            className="col-span-2 relative overflow-hidden bg-primary p-4 rounded-2xl flex flex-col justify-between h-36 cursor-pointer hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <span className="material-symbols-outlined text-white text-3xl p-2 bg-white/10 rounded-xl self-start">confirmation_number</span>
            <div>
              <h3 className="text-sm font-bold text-white">Raise Ticket</h3>
              <p className="text-white/80 text-[10px] mt-0.5">Directly report issues with claims or payouts.</p>
            </div>
          </div>

          {/* Chat Support */}
          <div 
            onClick={() => alert("Connecting to live chat agent...")}
            className="bg-surface-container-low border border-outline-variant/50 p-4 rounded-2xl flex flex-col justify-between h-36 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-primary text-2xl">chat</span>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-tertiary/10 rounded-full">
                <span className="w-1.5 h-1.5 bg-tertiary rounded-full animate-pulse"></span>
                <span className="text-tertiary font-bold text-[8px] uppercase">Online</span>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-on-surface">Chat Support</h3>
              <p className="text-on-surface-variant text-[9px] mt-0.5">Response: 2 mins</p>
            </div>
          </div>

          {/* FAQ */}
          <div 
            onClick={() => alert("Opening Help Center FAQs...")}
            className="bg-surface-container-low border border-outline-variant/50 p-4 rounded-2xl flex flex-col justify-between h-36 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-secondary text-2xl">help_outline</span>
            <div>
              <h3 className="text-xs font-bold text-on-surface">FAQ</h3>
              <p className="text-on-surface-variant text-[9px] mt-0.5">Get instant answers to basic queries.</p>
            </div>
          </div>

          {/* Call Support Row */}
          <a 
            href="tel:18005552733"
            className="col-span-2 bg-surface-container-high border border-outline-variant/80 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-surface-container transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-xl">call</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-on-surface">Call Support</h3>
                <p className="text-on-surface-variant text-[9px]">Priority line for medical credit</p>
              </div>
            </div>
            <span className="text-primary font-bold text-xs">1800-MED-CRED</span>
          </a>
        </section>

        {/* My Tickets */}
        {tickets.length > 0 && (
          <section className="space-y-3 mt-4">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-base">receipt_long</span>
              My Recent Tickets
            </h3>
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs text-on-surface">{ticket.subject}</h4>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      ticket.status === 'open' ? 'bg-error/10 text-error' : 
                      ticket.status === 'resolved' ? 'bg-secondary/10 text-secondary' : 
                      'bg-outline-variant/30 text-on-surface-variant'
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant line-clamp-2">{ticket.description}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[9px] font-mono opacity-60">{ticket.ticketId}</span>
                    <span className="text-[9px] opacity-60">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Commonly Searched Topics */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-base">auto_stories</span>
            Commonly Searched Topics
          </h3>
          <div className="space-y-2">
            <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50 hover:border-primary transition-colors cursor-pointer flex gap-3 items-start">
              <span className="material-symbols-outlined text-outline text-lg">description</span>
              <div>
                <p className="font-bold text-xs text-on-surface">Claim Documentation</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Which documents are required for pre-approval?</p>
              </div>
            </div>
            <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50 hover:border-primary transition-colors cursor-pointer flex gap-3 items-start">
              <span className="material-symbols-outlined text-outline text-lg">payments</span>
              <div>
                <p className="font-bold text-xs text-on-surface">Loan Repayment</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">How to set up auto-debit for monthly EMIs?</p>
              </div>
            </div>
            <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50 hover:border-primary transition-colors cursor-pointer flex gap-3 items-start">
              <span className="material-symbols-outlined text-outline text-lg">security</span>
              <div>
                <p className="font-bold text-xs text-on-surface">Account Security</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Resetting your 2FA and secure login tips.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Banner Promo */}
        <section className="relative rounded-2xl overflow-hidden h-44 shadow-md bg-slate-900">
          <img 
            alt="Consultation Support Background" 
            className="w-full h-full object-cover opacity-20 absolute inset-0"
            src="/FinalLogo.png"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-transparent flex flex-col justify-center p-5 text-white">
            <h4 className="font-bold text-sm">Need a Specialist?</h4>
            <p className="text-[10px] opacity-80 mt-1 max-w-[200px] leading-relaxed">
              Our financial advisors can help you navigate complex medical loan structures.
            </p>
            <button className="bg-white text-primary text-[10px] font-bold px-4 py-1.5 rounded-lg w-fit mt-3 hover:bg-surface-container-high transition-colors cursor-pointer">
              Book Consultation
            </button>
          </div>
        </section>
      </main>

      {/* New Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
            
            <h3 className="text-lg font-black text-on-surface mb-1">Raise a Ticket</h3>
            <p className="text-xs text-on-surface-variant mb-4">Our support team will respond within 24 hours.</p>

            <form onSubmit={handleSubmitTicket} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant">Subject</label>
                <input
                  type="text"
                  required
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="e.g. Card not activating"
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant">Description</label>
                <textarea
                  required
                  rows={4}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Please describe your issue in detail..."
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant">Priority</label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Urgent)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-container transition-all cursor-pointer mt-2"
              >
                Submit Ticket
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNavBar />
    </div>
  );
}
