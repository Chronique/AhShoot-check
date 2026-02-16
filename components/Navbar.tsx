import React from 'react';
import { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(AppView.EXPLORER)}>
          <div className="p-2 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="material-symbols-rounded text-white text-xl">grid_view</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            AH SHOOT
          </span>
        </div>

        <div className="flex gap-1 bg-slate-800 p-1 rounded-full">
          <button
            onClick={() => setView(AppView.EXPLORER)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              currentView === AppView.EXPLORER
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-rounded text-[18px]">explore</span>
            Explorer
          </button>
          <button
            onClick={() => setView(AppView.TUTORIALS)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              currentView === AppView.TUTORIALS
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-rounded text-[18px]">school</span>
            Learn
          </button>
        </div>

        <div className="hidden md:block">
           <span className="text-xs font-mono text-slate-500 border border-slate-800 px-2 py-1 rounded">v1.0.0-beta</span>
        </div>
      </div>
    </nav>
  );
};