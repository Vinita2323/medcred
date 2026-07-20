import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/Navigation/BottomNavBar';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

export default function WalletPage() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [walletRes, txRes] = await Promise.all([
        api.get(ENDPOINTS.USER_WALLET),
        api.get(ENDPOINTS.USER_WALLET_TRANSACTIONS)
      ]);
      setBalance(walletRes.data?.data?.availableBalance || 0);
      setTransactions(txRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoneySubmit = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountToAdd);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      setIsProcessing(true);
      const res = await api.post(ENDPOINTS.USER_WALLET_TOPUP, {
        amount: parsedAmount,
        paymentMethod: 'UPI'
      });
      
      if (res.data.success) {
        setBalance(res.data.data.wallet.availableBalance);
        setTransactions([res.data.data.transaction, ...transactions]);
        setAmountToAdd('');
        setShowAddMoney(false);
        alert(res.data.message);
      }
    } catch (error) {
      console.error('Top up error:', error);
      alert(error.response?.data?.message || 'Failed to add money.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to format date
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md relative pb-24">
      {/* TopAppBar */}
      <header className="flex justify-between items-center pl-2 pr-4 w-full h-20 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="material-symbols-outlined text-primary hover:opacity-80 transition-opacity active:scale-95 duration-150 cursor-pointer"
          >
            arrow_back
          </button>
          <h1 className="text-sm font-bold text-primary">MedCred Wallet</h1>
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
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Wallet Balance Card */}
            <section className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="relative z-10 space-y-5">
                <div>
                  <p className="text-[10px] opacity-75 uppercase tracking-wider font-semibold">Available Wallet Balance</p>
                  <p className="text-3xl font-black mt-1">₹{balance.toLocaleString('en-IN')}</p>
                </div>

              </div>
            </section>

            {/* Add Money Form Modal overlay */}
            {showAddMoney && (
              <section className="bg-white border border-primary/20 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Top Up Wallet</h3>
                  <button 
                    onClick={() => setShowAddMoney(false)}
                    className="material-symbols-outlined text-outline hover:text-on-surface cursor-pointer"
                  >
                    close
                  </button>
                </div>
                <form onSubmit={handleAddMoneySubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant" htmlFor="amount">Enter Amount (₹)</label>
                    <input 
                      type="number"
                      id="amount"
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-xs font-semibold"
                      placeholder="e.g. 5000"
                      value={amountToAdd}
                      onChange={(e) => setAmountToAdd(e.target.value)}
                      disabled={isProcessing}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-primary text-white text-xs font-bold py-2.5 rounded-xl shadow hover:opacity-90 active:scale-95 transition-all cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Proceed to Pay'}
                  </button>
                </form>
              </section>
            )}

            {/* Transactions List */}
            <section className="space-y-3">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-base">receipt_long</span>
                Recent Transactions
              </h3>
              
              <div className="space-y-2">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 bg-white border border-outline-variant/30 rounded-xl">
                    <p className="text-xs font-semibold text-on-surface-variant">No transactions yet.</p>
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div 
                      key={tx._id || tx.transactionId}
                      className="p-3.5 bg-white border border-outline-variant/30 rounded-xl flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          tx.type === 'credit' ? 'bg-tertiary/10 text-tertiary' : 'bg-primary/10 text-primary'
                        }`}>
                          <span className="material-symbols-outlined text-base">
                            {tx.type === 'credit' ? 'arrow_downward' : 'arrow_upward'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-on-surface uppercase tracking-wide">{tx.category.replace('_', ' ')}</h4>
                          <p className="text-[9px] text-on-surface-variant">{tx.sourceDescription}</p>
                          <span className="text-[8px] text-outline font-semibold mt-0.5 block">{formatDate(tx.createdAt)}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className={`font-bold text-xs ${
                          tx.type === 'credit' ? 'text-tertiary' : 'text-on-surface'
                        }`}>
                          {tx.type === 'credit' ? '+' : ''}₹{tx.amount.toLocaleString('en-IN')}
                        </p>
                        <span className="text-[8px] bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}
