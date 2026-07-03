import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);

  // Admin Chat Support States
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' or 'chats'
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [adminChatInput, setAdminChatInput] = useState('');
  const adminChatEndRef = React.useRef(null);

  // Admin FAQ States
  const [faqs, setFaqs] = useState([]);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqOrder, setFaqOrder] = useState(0);

  const fetchTickets = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.ADMIN_SUPPORT_TICKETS);
      if (res.data?.success) {
        // Map backend to frontend schema
        const mapped = res.data.data.map(t => ({
          id: t.ticketId,
          _id: t._id,
          user: t.userId?.fullName || 'Unknown User',
          type: t.userId?.role === 'agent' ? 'Agent' : t.userId?.role === 'admin' ? 'Admin' : 'User', // Dynamically map user, agent or admin creator types
          subject: t.subject,
          description: t.description,
          status: t.status.charAt(0).toUpperCase() + t.status.slice(1),
          date: new Date(t.createdAt).toLocaleDateString('en-IN'),
          adminNotes: t.adminNotes,
          resolvedAt: t.resolvedAt ? new Date(t.resolvedAt).toLocaleDateString('en-IN') : null,
        }));
        setTickets(mapped);
      }
    } catch (err) {
      console.error('Error fetching tickets', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatUsers = async () => {
    try {
      const res = await api.get(ENDPOINTS.ADMIN_SUPPORT_CHAT_USERS);
      if (res.data?.success) {
        setChatUsers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching chat users:', err);
    }
  };

  const fetchChatHistory = async (userId) => {
    try {
      const res = await api.get(ENDPOINTS.ADMIN_SUPPORT_CHAT_HISTORY(userId));
      if (res.data?.success) {
        setChatHistory(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };

  const handleAdminSendChatMessage = async (e) => {
    e.preventDefault();
    if (!adminChatInput.trim() || !selectedChatUser) return;
    const msgText = adminChatInput.trim();
    setAdminChatInput('');
    try {
      const res = await api.post(ENDPOINTS.ADMIN_SUPPORT_CHAT_SEND, {
        userId: selectedChatUser.user._id,
        message: msgText,
      });
      if (res.data?.success) {
        setChatHistory((prev) => [...prev, res.data.data]);
        setTimeout(() => adminChatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    } catch (err) {
      console.error('Error sending admin message:', err);
    }
  };

  // Poll for users list when tab is 'chats'
  useEffect(() => {
    let interval;
    if (activeTab === 'chats') {
      fetchChatUsers();
      interval = setInterval(fetchChatUsers, 5000);
    }
    return () => clearInterval(interval);
  }, [activeTab]);

  // Poll chat history when activeTab is chats and a user is selected
  useEffect(() => {
    let interval;
    if (activeTab === 'chats' && selectedChatUser) {
      fetchChatHistory(selectedChatUser.user._id);
      interval = setInterval(() => fetchChatHistory(selectedChatUser.user._id), 3000);
    }
    return () => clearInterval(interval);
  }, [activeTab, selectedChatUser]);

  useEffect(() => {
    if (activeTab === 'chats' && selectedChatUser) {
      adminChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  // Poll for tickets list when tab is 'tickets'
  useEffect(() => {
    let interval;
    if (activeTab === 'tickets') {
      fetchTickets(tickets.length === 0);
      interval = setInterval(() => fetchTickets(false), 3000);
    }
    return () => clearInterval(interval);
  }, [activeTab]);

  // Keep selected ticket in sync with backend updates
  useEffect(() => {
    if (selected) {
      const found = tickets.find(t => t._id === selected._id);
      if (found && JSON.stringify(found) !== JSON.stringify(selected)) {
        setSelected(found);
      }
    }
  }, [tickets, selected]);

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

  const handleAddFaq = async (e) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;
    try {
      const res = await api.post(ENDPOINTS.ADMIN_SUPPORT_FAQS, {
        question: faqQuestion.trim(),
        answer: faqAnswer.trim(),
        order: faqOrder || 0,
      });
      if (res.data?.success) {
        alert('FAQ created successfully!');
        setFaqQuestion('');
        setFaqAnswer('');
        setFaqOrder(0);
        setIsAddingFaq(false);
        fetchFaqs();
      }
    } catch (err) {
      console.error('Error adding FAQ:', err);
      alert('Failed to add FAQ');
    }
  };

  const handleUpdateFaq = async (e) => {
    e.preventDefault();
    if (!selectedFaq || !faqQuestion.trim() || !faqAnswer.trim()) return;
    try {
      const res = await api.patch(ENDPOINTS.ADMIN_SUPPORT_FAQ_BY_ID(selectedFaq._id), {
        question: faqQuestion.trim(),
        answer: faqAnswer.trim(),
        order: faqOrder || 0,
      });
      if (res.data?.success) {
        alert('FAQ updated successfully!');
        fetchFaqs();
      }
    } catch (err) {
      console.error('Error updating FAQ:', err);
      alert('Failed to update FAQ');
    }
  };

  const handleDeleteFaq = async (faqId) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      const res = await api.delete(ENDPOINTS.ADMIN_SUPPORT_FAQ_BY_ID(faqId));
      if (res.data?.success) {
        alert('FAQ deleted successfully!');
        setSelectedFaq(null);
        fetchFaqs();
      }
    } catch (err) {
      console.error('Error deleting FAQ:', err);
      alert('Failed to delete FAQ');
    }
  };

  const selectFaq = (faq) => {
    setSelectedFaq(faq);
    setIsAddingFaq(false);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqOrder(faq.order);
  };

  const clickAddFaq = () => {
    setSelectedFaq(null);
    setIsAddingFaq(true);
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqOrder(0);
  };

  useEffect(() => {
    if (activeTab === 'faqs') {
      fetchFaqs();
    }
  }, [activeTab]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;

    try {
      const res = await api.patch(ENDPOINTS.ADMIN_SUPPORT_TICKET_UPDATE(selected._id), {
        status: 'resolved',
        adminNotes: reply
      });

      if (res.data?.success) {
        alert('Reply sent and ticket resolved!');
        setReply('');
        setSelected(null);
        fetchTickets();
      }
    } catch (err) {
      console.error('Error replying to ticket', err);
      alert('Failed to resolve ticket');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-120px)] flex flex-col">
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md shrink-0">
        <h2 className="text-xl font-extrabold">Support Helpdesk</h2>
        <p className="text-sm text-white/80 mt-1">Manage user and agent queries or chat in real-time with users.</p>
      </section>

      <div className="flex-grow flex gap-6 overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 bg-white border border-[#c3c6d6]/20 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[#c3c6d6]/20 bg-[#faf8ff] flex-shrink-0">
            <button
              onClick={() => {
                setActiveTab('tickets');
                setSelectedChatUser(null);
                setSelectedFaq(null);
              }}
              className={`flex-1 py-3 text-xs font-extrabold border-b-2 transition-all ${
                activeTab === 'tickets'
                  ? 'border-[#003d9b] text-[#003d9b]'
                  : 'border-transparent text-[#737685] hover:text-[#191b23]'
              }`}
            >
              Tickets ({tickets.filter(t => t.status === 'Open').length})
            </button>
            <button
              onClick={() => {
                setActiveTab('chats');
                setSelected(null);
                setSelectedFaq(null);
              }}
              className={`flex-1 py-3 text-xs font-extrabold border-b-2 transition-all ${
                activeTab === 'chats'
                  ? 'border-[#003d9b] text-[#003d9b]'
                  : 'border-transparent text-[#737685] hover:text-[#191b23]'
              }`}
            >
              Live Chats ({chatUsers.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('faqs');
                setSelected(null);
                setSelectedChatUser(null);
              }}
              className={`flex-1 py-3 text-xs font-extrabold border-b-2 transition-all ${
                activeTab === 'faqs'
                  ? 'border-[#003d9b] text-[#003d9b]'
                  : 'border-transparent text-[#737685] hover:text-[#191b23]'
              }`}
            >
              FAQs ({faqs.length})
            </button>
          </div>

          {/* List Content */}
          {activeTab === 'tickets' ? (
            <div className="overflow-y-auto flex-grow divide-y divide-[#c3c6d6]/10">
              {tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center text-[#737685] opacity-60 h-40">
                  <span className="material-symbols-outlined text-3xl mb-1">confirmation_number</span>
                  <p className="text-xs font-bold">No tickets found</p>
                </div>
              ) : (
                tickets.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setSelected(t)}
                    className={`p-4 cursor-pointer transition-colors ${selected?.id === t.id ? 'bg-[#f0f4ff] border-l-4 border-[#003d9b]' : 'hover:bg-[#faf8ff] border-l-4 border-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${t.type === 'Agent' ? 'bg-purple-100 text-purple-700' : t.type === 'Admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{t.type}</span>
                      <span className="text-[10px] text-[#737685]">{t.date}</span>
                    </div>
                    <p className="font-bold text-[#191b23] text-sm truncate">{t.subject}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-[#516161]">{t.user}</p>
                      <span className={`text-[10px] font-bold ${t.status==='Resolved'?'text-green-600':t.status==='Open'?'text-orange-600':'text-[#003d9b]'}`}>{t.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'chats' ? (
            <div className="overflow-y-auto flex-grow divide-y divide-[#c3c6d6]/10">
              {chatUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center text-[#737685] opacity-60 h-40">
                  <span className="material-symbols-outlined text-3xl mb-1">chat</span>
                  <p className="text-xs font-bold">No active chats</p>
                </div>
              ) : (
                chatUsers.map(c => (
                  <div
                    key={c.user._id}
                    onClick={() => setSelectedChatUser(c)}
                    className={`p-4 cursor-pointer transition-colors ${selectedChatUser?.user._id === c.user._id ? 'bg-[#f0f4ff] border-l-4 border-[#003d9b]' : 'hover:bg-[#faf8ff] border-l-4 border-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-[#191b23] text-sm truncate max-w-[70%]">{c.user.fullName}</p>
                      <span className="text-[9px] text-[#737685]">
                        {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-[#516161] truncate mt-1">{c.lastMessage}</p>
                    <p className="text-[9px] text-[#737685] mt-1">{c.user.mobile}</p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-3 bg-[#faf8ff] border-b border-[#c3c6d6]/20 flex justify-between items-center flex-shrink-0">
                <h4 className="text-xs font-extrabold text-[#191b23]">FAQ List</h4>
                <button
                  onClick={clickAddFaq}
                  className="bg-[#003d9b] hover:bg-[#0052cc] text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <span className="material-symbols-outlined text-xs">add</span> Add FAQ
                </button>
              </div>
              <div className="overflow-y-auto flex-grow divide-y divide-[#c3c6d6]/10">
                {faqs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-[#737685] opacity-60 h-40">
                    <span className="material-symbols-outlined text-3xl mb-1">help_outline</span>
                    <p className="text-xs font-bold">No FAQs found</p>
                  </div>
                ) : (
                  faqs.map(f => (
                    <div
                      key={f._id}
                      onClick={() => selectFaq(f)}
                      className={`p-4 cursor-pointer transition-colors ${selectedFaq?._id === f._id ? 'bg-[#f0f4ff] border-l-4 border-[#003d9b]' : 'hover:bg-[#faf8ff] border-l-4 border-transparent'}`}
                    >
                      <p className="font-bold text-[#191b23] text-xs truncate">{f.question}</p>
                      <p className="text-[10px] text-[#737685] truncate mt-1">{f.answer}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[8px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono font-bold">Order: {f.order}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFaq(f._id);
                          }}
                          className="text-[10px] font-bold text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chat / View Area */}
        <div className="w-2/3 bg-white border border-[#c3c6d6]/20 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          {activeTab === 'tickets' ? (
            selected ? (
              <>
                <div className="p-5 border-b border-[#c3c6d6]/20 bg-[#faf8ff] flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-[#191b23] text-lg">{selected.subject}</h3>
                    <p className="text-xs text-[#516161] mt-1">Ticket {selected.id} · From: {selected.user} ({selected.type})</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${selected.status==='Resolved'?'bg-green-100 text-green-700':selected.status==='Open'?'bg-orange-100 text-orange-700':'bg-[#dae2ff] text-[#003d9b]'}`}>
                    {selected.status}
                  </span>
                </div>
                
                <div className="flex-grow p-6 overflow-y-auto bg-gray-50 space-y-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-[#c3c6d6]/20 max-w-md">
                    <p className="text-xs text-[#516161] mb-2 font-bold">{selected.user}</p>
                    <p className="text-sm font-bold text-[#191b23] mb-1">{selected.subject}</p>
                    <p className="text-sm text-[#191b23]">{selected.description}</p>
                    <p className="text-[10px] text-[#737685] mt-3 text-right">Sent {selected.date}</p>
                  </div>
                  
                  {selected.adminNotes && (
                    <div className="bg-[#dae2ff] p-4 rounded-xl shadow-sm border border-[#003d9b]/20 max-w-md ml-auto">
                      <p className="text-xs text-[#003d9b] mb-2 font-bold">Admin Support</p>
                      <p className="text-sm text-[#191b23]">{selected.adminNotes}</p>
                      <p className="text-[10px] text-[#003d9b]/70 mt-3 text-right">Resolved {selected.resolvedAt}</p>
                    </div>
                  )}
                </div>

                {selected.status !== 'Resolved' && (
                  <form onSubmit={handleReply} className="p-4 border-t border-[#c3c6d6]/20 bg-white flex gap-3">
                    <textarea
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      placeholder="Type your reply here..."
                      className="flex-grow bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] resize-none h-12"
                    />
                    <button type="submit" className="bg-[#003d9b] hover:bg-[#0052cc] text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer shrink-0">
                      Reply & Resolve
                    </button>
                  </form>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[#737685]">
                <span className="material-symbols-outlined text-5xl mb-3 text-[#c3c6d6]">forum</span>
                <p className="font-semibold">Select a ticket to view details</p>
              </div>
            )
          ) : activeTab === 'chats' ? (
            selectedChatUser ? (
              <>
                <div className="p-5 border-b border-[#c3c6d6]/20 bg-[#faf8ff] flex justify-between items-center flex-shrink-0">
                  <div>
                    <h3 className="font-extrabold text-[#191b23] text-lg">Chat with {selectedChatUser.user.fullName}</h3>
                    <p className="text-xs text-[#516161] mt-1">Email: {selectedChatUser.user.email} · Mobile: {selectedChatUser.user.mobile}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#dae2ff] text-[#003d9b] uppercase">Live Chat</span>
                </div>
                
                <div className="flex-grow p-6 overflow-y-auto bg-gray-50 space-y-4 flex flex-col">
                  {chatHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#737685] opacity-60">
                      <span className="material-symbols-outlined text-4xl mb-2">forum</span>
                      <p className="text-sm font-semibold">No messages yet. Send a message to start.</p>
                    </div>
                  ) : (
                    chatHistory.map((msg, index) => {
                      const isMe = msg.isAdminMessage;
                      return (
                        <div
                          key={msg._id || index}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`p-3 rounded-2xl max-w-[70%] text-sm shadow-xs ${
                              isMe
                                ? 'bg-[#003d9b] text-white rounded-tr-none'
                                : 'bg-white text-[#191b23] border border-[#c3c6d6]/20 rounded-tl-none'
                            }`}
                          >
                            {msg.message}
                          </div>
                          <span className="text-[9px] text-[#737685] mt-1 px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={adminChatEndRef} />
                </div>

                <form onSubmit={handleAdminSendChatMessage} className="p-4 border-t border-[#c3c6d6]/20 bg-white flex gap-3 flex-shrink-0">
                  <input
                    type="text"
                    value={adminChatInput}
                    onChange={e => setAdminChatInput(e.target.value)}
                    placeholder="Type message to user..."
                    className="flex-grow bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b]"
                  />
                  <button type="submit" className="bg-[#003d9b] hover:bg-[#0052cc] text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer shrink-0">
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[#737685]">
                <span className="material-symbols-outlined text-5xl mb-3 text-[#c3c6d6]">chat</span>
                <p className="font-semibold">Select a chat to view message history</p>
              </div>
            )
          ) : (
            selectedFaq ? (
              <>
                <div className="p-5 border-b border-[#c3c6d6]/20 bg-[#faf8ff] flex justify-between items-center flex-shrink-0">
                  <div>
                    <h3 className="font-extrabold text-[#191b23] text-lg">Edit FAQ</h3>
                    <p className="text-xs text-[#516161] mt-1">Update this question and answer dynamically on the user support page.</p>
                  </div>
                  <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-[10px] font-bold uppercase tracking-wider">Editing</span>
                </div>
                <form onSubmit={handleUpdateFaq} className="flex-grow p-6 overflow-y-auto bg-gray-50 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#191b23]">Question</label>
                    <input
                      type="text"
                      value={faqQuestion}
                      onChange={(e) => setFaqQuestion(e.target.value)}
                      required
                      className="w-full bg-white border border-[#c3c6d6]/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#003d9b] font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#191b23]">Answer</label>
                    <textarea
                      value={faqAnswer}
                      onChange={(e) => setFaqAnswer(e.target.value)}
                      required
                      rows={6}
                      className="w-full bg-white border border-[#c3c6d6]/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#003d9b] resize-none font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#191b23]">Display Order (Lower values show first)</label>
                    <input
                      type="number"
                      value={faqOrder}
                      onChange={(e) => setFaqOrder(Number(e.target.value))}
                      className="w-32 bg-white border border-[#c3c6d6]/40 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#003d9b] font-mono"
                    />
                  </div>
                  <div className="pt-2 flex gap-3">
                    <button
                      type="submit"
                      className="bg-[#003d9b] hover:bg-[#0052cc] text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(selectedFaq._id)}
                      className="bg-red-50 text-red-600 hover:bg-red-100 px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer border border-red-200"
                    >
                      Delete FAQ
                    </button>
                  </div>
                </form>
              </>
            ) : isAddingFaq ? (
              <>
                <div className="p-5 border-b border-[#c3c6d6]/20 bg-[#faf8ff] flex justify-between items-center flex-shrink-0">
                  <div>
                    <h3 className="font-extrabold text-[#191b23] text-lg">Add New FAQ</h3>
                    <p className="text-xs text-[#516161] mt-1">Create a new FAQ to be displayed on the support help center page.</p>
                  </div>
                  <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-[10px] font-bold uppercase tracking-wider">New</span>
                </div>
                <form onSubmit={handleAddFaq} className="flex-grow p-6 overflow-y-auto bg-gray-50 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#191b23]">Question</label>
                    <input
                      type="text"
                      value={faqQuestion}
                      onChange={(e) => setFaqQuestion(e.target.value)}
                      placeholder="e.g. How do I request a refund?"
                      required
                      className="w-full bg-white border border-[#c3c6d6]/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#003d9b] font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#191b23]">Answer</label>
                    <textarea
                      value={faqAnswer}
                      onChange={(e) => setFaqAnswer(e.target.value)}
                      placeholder="Type the answer details here..."
                      required
                      rows={6}
                      className="w-full bg-white border border-[#c3c6d6]/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#003d9b] resize-none font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#191b23]">Display Order (Lower values show first)</label>
                    <input
                      type="number"
                      value={faqOrder}
                      onChange={(e) => setFaqOrder(Number(e.target.value))}
                      className="w-32 bg-white border border-[#c3c6d6]/40 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#003d9b] font-mono"
                    />
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="bg-[#003d9b] hover:bg-[#0052cc] text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      Create FAQ
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[#737685]">
                <span className="material-symbols-outlined text-5xl mb-3 text-[#c3c6d6]">help_center</span>
                <p className="font-semibold">Select an FAQ to edit, or click '+ Add FAQ' to create a new one</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
