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

  // Support Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = React.useRef(null);

  // FAQ Modal States
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (isFaqOpen) {
      fetchFaqs();
    }
  }, [isFaqOpen]);

  const fetchFaqs = async () => {
    try {
      const res = await api.get(ENDPOINTS.SUPPORT_FAQS);
      if (res.data?.success) {
        setFaqs(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching FAQs:', err);
    }
  };

  // Poll chat history when chat is open
  useEffect(() => {
    let interval;
    if (isChatOpen) {
      fetchChatHistory();
      interval = setInterval(fetchChatHistory, 3000);
    }
    return () => clearInterval(interval);
  }, [isChatOpen]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [chatMessages, isChatOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      const res = await api.get(ENDPOINTS.SUPPORT_CHAT_HISTORY);
      if (res.data?.success) {
        setChatMessages(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msgText = chatInput.trim();
    setChatInput('');
    try {
      const res = await api.post(ENDPOINTS.SUPPORT_CHAT_SEND, { message: msgText });
      if (res.data?.success) {
        setChatMessages((prev) => [...prev, res.data.data]);
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

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
            className="col-span-2 relative overflow-hidden bg-primary p-4 rounded-2xl flex flex-col justify-between h-28 cursor-pointer hover:shadow-lg transition-all active:scale-[0.98]"
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
            onClick={() => setIsChatOpen(true)}
            className="bg-surface-container-low border border-outline-variant/50 p-4 rounded-2xl flex flex-col justify-between h-28 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
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
            onClick={() => setIsFaqOpen(true)}
            className="bg-surface-container-low border border-outline-variant/50 p-4 rounded-2xl flex flex-col justify-between h-28 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
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
            <span className="text-primary font-bold text-xs">9307441212</span>
          </a>

          {/* Consult with Doctor Row */}
          <a
            href="tel:1800633362"
            className="col-span-2 bg-surface-container-high border border-outline-variant/80 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-surface-container transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-xl">medical_services</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-on-surface">Consult with Doctor</h3>
                <p className="text-on-surface-variant text-[9px]">Tele-consultation with verified doctors</p>
              </div>
            </div>
            <span className="text-primary font-bold text-xs">9519793335</span>
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
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${ticket.status === 'open' ? 'bg-error/10 text-error' :
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
      {/* Support Chat Modal/Overlay */}
      {isChatOpen && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-xs flex justify-center items-end sm:items-center">
          <div className="bg-surface w-full max-w-sm h-[85vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-fade-in relative">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-outline-variant/50 bg-surface-container flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="material-symbols-outlined text-primary p-2 hover:bg-surface-container-high rounded-full cursor-pointer"
                >
                  arrow_back
                </button>
                <div>
                  <h3 className="font-bold text-xs text-on-surface">Live Chat Support</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-tertiary rounded-full animate-pulse"></span>
                    <span className="text-[8px] font-bold text-tertiary uppercase">Admin Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="material-symbols-outlined text-outline hover:text-on-surface p-1.5 rounded-full cursor-pointer"
              >
                close
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-grow p-4 overflow-y-auto bg-surface-container-lowest space-y-3 flex flex-col">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center my-auto text-center p-6 space-y-2 opacity-65">
                  <span className="material-symbols-outlined text-4xl text-primary">chat</span>
                  <p className="text-[11px] font-bold text-on-surface">Start a Chat with Admin</p>
                  <p className="text-[9px] text-on-surface-variant">Send a message below to connect directly with our support team.</p>
                </div>
              ) : (
                chatMessages.map((msg, index) => {
                  const isMe = !msg.isAdminMessage;
                  return (
                    <div
                      key={msg._id || index}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`p-3 rounded-2xl max-w-[80%] text-[11px] font-semibold leading-relaxed shadow-sm ${
                          isMe
                            ? 'bg-primary text-white rounded-tr-none'
                            : 'bg-surface-container border border-outline-variant text-on-surface rounded-tl-none'
                        }`}
                      >
                        {msg.message}
                      </div>
                      <span className="text-[8px] text-on-surface-variant/70 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChatMessage} className="p-3 bg-surface border-t border-outline-variant flex gap-2 items-center flex-shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type message to admin..."
                className="flex-grow bg-surface-container border border-outline-variant rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <button
                type="submit"
                className="bg-primary text-white w-9 h-9 rounded-xl flex items-center justify-center hover:bg-primary-container transition-colors cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {isFaqOpen && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-xs flex justify-center items-end sm:items-center animate-fade-in">
          <div className="bg-surface w-full max-w-sm h-[85vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-fade-in relative">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-4 border-b border-outline-variant/50 bg-surface-container flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-xl">help_outline</span>
                <div>
                  <h3 className="font-bold text-xs text-on-surface text-left">Help Center FAQs</h3>
                  <p className="text-[8px] text-on-surface-variant font-bold uppercase tracking-wider text-left">Instant Answers</p>
                </div>
              </div>
              <button
                onClick={() => setIsFaqOpen(false)}
                className="material-symbols-outlined text-outline hover:text-on-surface p-1.5 rounded-full cursor-pointer bg-surface-container-high"
              >
                close
              </button>
            </div>

            {/* Content (FAQs Accordion) */}
            <div className="flex-grow p-4 overflow-y-auto bg-surface-container-lowest space-y-3">
              {faqs.length === 0 ? (
                <div className="text-center p-6 text-on-surface-variant/60 font-semibold text-[10px]">
                  Loading FAQs...
                </div>
              ) : (
                faqs.map((faq, index) => {
                  const isExpanded = expandedFaq === index;
                  return (
                    <div
                      key={faq._id || index}
                      className="border border-outline-variant/50 rounded-2xl bg-surface overflow-hidden transition-all duration-200"
                    >
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : index)}
                        className="w-full p-4 flex justify-between items-center hover:bg-surface-container-low transition-colors text-left"
                      >
                        <span className="text-[11px] font-bold text-on-surface pr-3">{faq.question}</span>
                        <span className="material-symbols-outlined text-outline transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                          keyboard_arrow_down
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 text-[10px] text-on-surface-variant font-medium leading-relaxed border-t border-outline-variant/30 bg-surface-container-lowest">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNavBar />
    </div>
  );
}
