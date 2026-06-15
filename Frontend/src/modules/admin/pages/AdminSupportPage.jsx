import React, { useState } from 'react';

const INITIAL_TICKETS = [
  { id: 'TKT-1042', user: 'Arjun Mehta', type: 'User', subject: 'Claim amount not received in bank', status: 'Open', date: '2 hours ago' },
  { id: 'TKT-1043', user: 'Priya Sharma',type: 'User', subject: 'How to add my mother to family card?', status: 'Open', date: '4 hours ago' },
  { id: 'TKT-1044', user: 'Suresh Kumar',type: 'Agent',subject: 'Commission for last registration missing', status: 'Pending', date: '1 day ago' },
  { id: 'TKT-1045', user: 'Rohan Gupta', type: 'User', subject: 'App crashes when uploading documents', status: 'Resolved', date: '2 days ago' },
];

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');

  const handleReply = (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setTickets(tickets.map(t => t.id === selected.id ? { ...t, status: 'Resolved' } : t));
    setSelected(null);
    setReply('');
    alert('Reply sent and ticket resolved!');
  };

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-120px)] flex flex-col">
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md shrink-0">
        <h2 className="text-xl font-extrabold">Support Helpdesk</h2>
        <p className="text-sm text-white/80 mt-1">Manage user and agent queries from the support center.</p>
      </section>

      <div className="flex-grow flex gap-6 overflow-hidden">
        {/* Ticket List */}
        <div className="w-1/3 bg-white border border-[#c3c6d6]/20 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#c3c6d6]/20 bg-[#faf8ff]">
            <h3 className="font-extrabold text-[#191b23]">Inbox ({tickets.filter(t=>t.status==='Open').length} Open)</h3>
          </div>
          <div className="overflow-y-auto flex-grow divide-y divide-[#c3c6d6]/10">
            {tickets.map(t => (
              <div
                key={t.id}
                onClick={() => setSelected(t)}
                className={`p-4 cursor-pointer transition-colors ${selected?.id === t.id ? 'bg-[#f0f4ff] border-l-4 border-[#003d9b]' : 'hover:bg-[#faf8ff] border-l-4 border-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${t.type==='Agent'?'bg-purple-100 text-purple-700':'bg-blue-100 text-blue-700'}`}>{t.type}</span>
                  <span className="text-[10px] text-[#737685]">{t.date}</span>
                </div>
                <p className="font-bold text-[#191b23] text-sm truncate">{t.subject}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-[#516161]">{t.user}</p>
                  <span className={`text-[10px] font-bold ${t.status==='Resolved'?'text-green-600':t.status==='Open'?'text-orange-600':'text-[#003d9b]'}`}>{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat / View Area */}
        <div className="w-2/3 bg-white border border-[#c3c6d6]/20 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          {selected ? (
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
              
              <div className="flex-grow p-6 overflow-y-auto bg-gray-50">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-[#c3c6d6]/20 max-w-md">
                  <p className="text-xs text-[#516161] mb-2 font-bold">{selected.user}</p>
                  <p className="text-sm text-[#191b23]">{selected.subject}</p>
                  <p className="text-[10px] text-[#737685] mt-3 text-right">Sent {selected.date}</p>
                </div>
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
          )}
        </div>
      </div>
    </div>
  );
}
