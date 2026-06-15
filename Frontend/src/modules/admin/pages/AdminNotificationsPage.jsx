import React, { useState, useEffect } from 'react';

const TEMPLATES = [
  { title: 'Card Renewal Reminder',   message: 'Your MedCred healthcare card is expiring soon. Renew now to continue enjoying uninterrupted benefits.', target: 'All Users',   channel: 'Push' },
  { title: 'Claim Update Alert',      message: 'Your recent claim has been processed. Please log in to check the updated status.', target: 'All Users',   channel: 'SMS' },
  { title: 'KYC Verification Required', message: 'Your account requires KYC verification to activate your healthcare card. Please complete it at your earliest.', target: 'All Users', channel: 'Email' },
  { title: 'Commission Credited',     message: 'Your commission for the latest activation has been credited to your wallet. Login to view details.', target: 'All Agents', channel: 'Push' },
];

const CHANNEL_COLORS = {
  Push:   'bg-[#dae2ff] text-[#003d9b]',
  SMS:    'bg-green-100 text-green-700',
  Email:  'bg-orange-100 text-orange-700',
  'In-App': 'bg-purple-100 text-purple-700',
};

export default function AdminNotificationsPage() {
  const [form, setForm] = useState({ target: 'All Users', channel: 'Push', title: '', message: '', schedule: 'now' });
  const [notifications, setNotifications] = useState([]);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('medcred_notifications');
    setNotifications(raw ? JSON.parse(raw) : [
      { id: 'NOTIF001', target:'All Users',  channel:'Push',  title:'Welcome to MedCred!',      message:'Your healthcare journey starts here.',     sentAt:'2026-06-01 09:00', status:'Sent' },
      { id: 'NOTIF002', target:'All Agents', channel:'Email', title:'Commission Update',          message:'New commission rates are now live.',          sentAt:'2026-06-05 14:30', status:'Sent' },
      { id: 'NOTIF003', target:'All Users',  channel:'SMS',   title:'Card Renewal Reminder',      message:'Renew your card before it expires.',          sentAt:'2026-06-10 10:00', status:'Sent' },
    ]);
  }, []);

  const applyTemplate = (tpl) => {
    setForm(prev => ({ ...prev, title: tpl.title, message: tpl.message, target: tpl.target, channel: tpl.channel }));
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    setSending(true);
    setTimeout(() => {
      const newNotif = {
        id: `NOTIF${String(Date.now()).slice(-4)}`,
        target: form.target,
        channel: form.channel,
        title: form.title,
        message: form.message,
        sentAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        status: form.schedule === 'now' ? 'Sent' : 'Scheduled',
      };
      const updated = [newNotif, ...notifications];
      setNotifications(updated);
      localStorage.setItem('medcred_notifications', JSON.stringify(updated));
      setSending(false);
      setSuccess(true);
      setForm({ target: 'All Users', channel: 'Push', title: '', message: '', schedule: 'now' });
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Banner */}
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[11px] uppercase tracking-widest text-blue-200 font-bold">Communication Hub</span>
          <h2 className="text-xl font-extrabold mt-1">Notification Management</h2>
          <p className="text-sm text-white/80 mt-1">Send broadcast notifications to users and agents via Push, SMS, Email, or In-App channels.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left: Compose */}
        <div className="lg:col-span-3 space-y-5">

          {/* Quick Templates */}
          <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-5 shadow-sm">
            <h3 className="font-extrabold text-[#191b23] mb-3 text-sm">Quick Templates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => applyTemplate(tpl)}
                  className="text-left bg-[#f5f8ff] hover:bg-[#f0f4ff] border border-[#dae2ff] rounded-xl px-4 py-3 transition-all cursor-pointer"
                >
                  <p className="text-xs font-bold text-[#003d9b]">{tpl.title}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${CHANNEL_COLORS[tpl.channel]}`}>{tpl.channel}</span>
                    <span className="text-[10px] text-[#737685]">→ {tpl.target}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Compose Form */}
          <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-5 shadow-sm">
            <h3 className="font-extrabold text-[#191b23] mb-4 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003d9b] text-[20px]">edit_note</span>
              Compose Notification
            </h3>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#516161] uppercase tracking-wider">Target Audience</label>
                  <select
                    value={form.target}
                    onChange={e => setForm(p => ({ ...p, target: e.target.value }))}
                    className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
                  >
                    {['All Users','All Agents','Premium Users','Basic Users','Elite Users'].map(v=><option key={v}>{v}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#516161] uppercase tracking-wider">Channel</label>
                  <select
                    value={form.channel}
                    onChange={e => setForm(p => ({ ...p, channel: e.target.value }))}
                    className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
                  >
                    {['Push','SMS','Email','In-App'].map(v=><option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#516161] uppercase tracking-wider">Notification Title</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Card Renewal Reminder"
                  className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#516161] uppercase tracking-wider">Message Body</label>
                <textarea
                  required
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Enter your notification message…"
                  rows={4}
                  className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#516161] uppercase tracking-wider">Schedule</label>
                <div className="flex gap-3">
                  {[{val:'now',label:'Send Now'},{val:'scheduled',label:'Schedule Later'}].map(opt=>(
                    <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="schedule"
                        value={opt.val}
                        checked={form.schedule === opt.val}
                        onChange={() => setForm(p=>({...p, schedule: opt.val}))}
                        className="accent-[#003d9b] cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-[#516161]">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {success && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
                  <p className="text-xs text-green-700 font-bold">Notification sent successfully!</p>
                </div>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold py-3.5 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#003d9b]/20"
              >
                {sending ? (
                  <><span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span> Sending…</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">send</span> {form.schedule === 'now' ? 'Send Notification' : 'Schedule Notification'}</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: History */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl shadow-sm overflow-hidden h-full">
            <div className="px-5 py-4 border-b border-[#c3c6d6]/20">
              <h3 className="font-extrabold text-[#191b23] text-sm">Sent History</h3>
            </div>
            <div className="divide-y divide-[#c3c6d6]/10 overflow-y-auto max-h-[600px]">
              {notifications.map((n, i) => (
                <div key={i} className="px-5 py-3.5 hover:bg-[#faf8ff] transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs font-bold text-[#191b23] leading-snug">{n.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${n.status==='Sent'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>
                      {n.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#516161] leading-relaxed mb-2">{n.message}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${CHANNEL_COLORS[n.channel]}`}>{n.channel}</span>
                    <span className="text-[10px] text-[#737685]">→ {n.target}</span>
                    <span className="text-[10px] text-[#737685] ml-auto">{n.sentAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
