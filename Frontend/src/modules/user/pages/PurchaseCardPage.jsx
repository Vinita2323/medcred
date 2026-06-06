import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/Navigation/BottomNavBar';

export default function PurchaseCardPage() {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);

  const cards = [
    {
      id: 'single',
      title: 'Single Health Card',
      icon: 'person',
      price: '₹499/yr',
      benefits: ['Individual Coverage', '10% off Pharmacy', '1 Free Consultation'],
      colorFrom: 'from-primary',
      colorTo: 'to-primary-container',
      textColor: 'text-on-primary',
    },
    {
      id: 'family',
      title: 'Family Health Card',
      icon: 'family_restroom',
      price: '₹1499/yr',
      benefits: ['Up to 4 Members', '20% off Pharmacy', '4 Free Consultations', 'Priority Support'],
      colorFrom: 'from-tertiary',
      colorTo: 'to-tertiary-container',
      textColor: 'text-on-tertiary',
    },
    {
      id: 'senior',
      title: 'Senior Citizen Card',
      icon: 'elderly',
      price: '₹899/yr',
      benefits: ['Special Care', 'Free Home Sample Collection', 'Dedicated Manager'],
      colorFrom: 'from-secondary',
      colorTo: 'to-secondary-container',
      textColor: 'text-on-secondary',
    }
  ];

  const handlePurchase = () => {
    if (!selectedCard) {
      alert("Please select a card to proceed.");
      return;
    }
    alert(`Proceeding to purchase: ${cards.find(c => c.id === selectedCard).title}`);
    // Navigate to payment or digital card page after successful purchase
    navigate('/card');
  };

  return (
    <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md relative pb-24">
      <header className="flex justify-between items-center pl-2 pr-4 w-full h-20 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="material-symbols-outlined text-primary hover:opacity-80 transition-opacity active:scale-95 duration-150 cursor-pointer"
          >
            arrow_back
          </button>
          <h1 className="text-sm font-bold text-primary">Claim Health Card</h1>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto p-4 space-y-6 max-w-md mx-auto w-full animate-fade-in">
        <div className="text-center space-y-2 mt-4 mb-8">
          <h2 className="text-2xl font-bold text-on-surface">Choose Your Plan</h2>
          <p className="text-sm text-on-surface-variant">Select a health card that fits your needs.</p>
        </div>

        <div className="space-y-4">
          {cards.map((card) => (
            <div 
              key={card.id}
              onClick={() => setSelectedCard(card.id)}
              className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 transform active:scale-95 ${
                selectedCard === card.id 
                  ? 'ring-4 ring-primary scale-[1.02] shadow-lg' 
                  : 'shadow-md hover:shadow-lg border border-outline-variant'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.colorFrom} ${card.colorTo} opacity-10`}></div>
              
              <div className="p-5 flex flex-col gap-4 relative z-10 bg-surface-container-lowest">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${card.colorFrom} ${card.colorTo}`}>
                      <span className={`material-symbols-outlined ${card.textColor}`}>{card.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-on-surface">{card.title}</h3>
                      <p className="text-xs font-semibold text-primary">{card.price}</p>
                    </div>
                  </div>
                  {selectedCard === card.id && (
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  )}
                </div>

                <ul className="space-y-2 mt-2">
                  {card.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px] text-tertiary">task_alt</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 pb-4">
          <button 
            onClick={handlePurchase}
            disabled={!selectedCard}
            className={`w-full py-4 rounded-xl text-sm font-bold shadow-md transition-all duration-200 ${
              selectedCard 
                ? 'bg-primary text-on-primary hover:opacity-90 active:scale-95' 
                : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-70'
            }`}
          >
            {selectedCard ? 'Proceed to Claim' : 'Select a Plan'}
          </button>
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
}
