
import React from 'react';

export type Tab = 'home' | 'verify' | 'gm' | 'learn';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#0f172a]/95 backdrop-blur-lg border-t border-slate-800 pb-[env(safe-area-inset-bottom)] z-50">
      <div className="flex justify-around items-center h-16">
        
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${activeTab === 'home' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <span className={`material-symbols-rounded text-2xl ${activeTab === 'home' ? 'font-variation-filled' : ''}`}>home</span>
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button 
          onClick={() => setActiveTab('verify')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${activeTab === 'verify' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <span className={`material-symbols-rounded text-2xl ${activeTab === 'verify' ? 'font-variation-filled' : ''}`}>search</span>
          <span className="text-[10px] font-medium">Verify</span>
        </button>

        <button 
          onClick={() => setActiveTab('gm')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${activeTab === 'gm' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <span className={`material-symbols-rounded text-2xl ${activeTab === 'gm' ? 'font-variation-filled' : ''}`}>waving_hand</span>
          <span className="text-[10px] font-medium">GM</span>
        </button>

        <button 
          onClick={() => setActiveTab('learn')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${activeTab === 'learn' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <span className={`material-symbols-rounded text-2xl ${activeTab === 'learn' ? 'font-variation-filled' : ''}`}>smart_toy</span>
          <span className="text-[10px] font-medium">AI Agent</span>
        </button>

      </div>
    </div>
  );
};
