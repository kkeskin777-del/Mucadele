import React, { useState, useEffect } from 'react';

interface IOSFrameProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { id: string; label: string; icon: React.ReactNode }[];
}

export default function IOSFrame({ children, activeTab, onTabChange, tabs }: IOSFrameProps) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-indigo-50/60 flex items-center justify-center p-0 md:p-8 font-sans antialiased text-slate-800">
      {/* Phone Wrapper Mockup on Desktop, Full screen on Mobile */}
      <div className="relative w-full max-w-md h-screen md:h-[880px] md:max-h-[95vh] md:rounded-[50px] md:border-[10px] md:border-indigo-600 md:shadow-2xl bg-slate-50 flex flex-col overflow-hidden ring-4 ring-indigo-500/10">
        
        {/* iOS Notch / Dynamic Island on Desktop */}
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-indigo-700 rounded-b-2xl z-50 pointer-events-none"></div>

        {/* iOS Status Bar */}
        <div className="h-12 bg-slate-50/80 backdrop-blur-md flex items-center justify-between px-6 text-xs select-none shrink-0 z-40">
          <span className="font-semibold text-slate-700">{time}</span>
          <div className="flex items-center gap-1.5 text-slate-600">
            {/* Cellular Signal Icon */}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 17h2v4H2v-4zm4-4h2v8H6v-8zm4-4h2v12h-2V9zm4-4h2v16h-2V5zm4-4h2v20h-2V1z" />
            </svg>
            {/* WiFi Icon */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15c.622-.622 1.464-1 2.39-1.002L11 14h2c.934 0 1.777.378 2.39.998m-9.39-4a7.978 7.978 0 0111.134-.002m-13.354-4a11.976 11.976 0 0115.572-.002M12 18h.008v.008H12V18z" />
            </svg>
            {/* Battery Icon */}
            <div className="flex items-center border border-slate-400 rounded-sm w-5.5 h-3 px-0.5 relative">
              <div className="bg-emerald-500 h-1.5 rounded-2xs w-[80%]"></div>
              <div className="absolute right-[-2.5px] top-[2.5px] w-[2px] h-[3.5px] bg-slate-400 rounded-r-2xs"></div>
            </div>
          </div>
        </div>

        {/* Application Core Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 pb-24 scrollbar-none relative">
          {children}
        </div>

        {/* Custom iOS Bottom Tab Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-xl border-t border-indigo-100/80 flex items-stretch justify-around px-2 pb-5 pt-1 z-40">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-500'}`}>
                  {tab.icon}
                </div>
                <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* iOS Home Indicator Line on Desktop */}
        <div className="hidden md:block absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-300 rounded-full z-50 pointer-events-none"></div>

      </div>
    </div>
  );
}
