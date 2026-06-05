import React from 'react';

export default function UserMainLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-[#faf9ff] text-[#051a3e] relative flex flex-col">
      {/* Child Screen */}
      <div className="flex-grow flex flex-col w-full h-full relative">
        {children}
      </div>
    </div>
  );
}
