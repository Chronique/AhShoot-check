
import React from 'react';
import { FarcasterUser } from '../types';

interface NavbarProps {
  connectedAddress: string;
  farcasterUser: FarcasterUser | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ connectedAddress, farcasterUser, onConnect, isConnecting }) => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#0f172a]/95 backdrop-blur-md pt-[env(safe-area-inset-top)]">
      <div className="px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
             <span className="material-symbols-rounded text-white text-lg">verified</span>
           </div>
           <span className="text-lg font-bold text-white tracking-tight">AH SHOOT</span>
        </div>

        {/* User Identity Pill */}
        <div>
            {farcasterUser ? (
                 // Farcaster User Display
                 <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 shadow-sm">
                    {farcasterUser.pfpUrl ? (
                        <img src={farcasterUser.pfpUrl} alt={farcasterUser.username} className="w-5 h-5 rounded-full border border-slate-600" />
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                            {(farcasterUser.username || 'F').charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="text-xs font-bold text-white">@{farcasterUser.username || farcasterUser.fid}</span>
                 </div>
            ) : !connectedAddress ? (
                // Connect Button (Web Mode)
                <button 
                onClick={onConnect}
                disabled={isConnecting}
                className="text-xs font-bold bg-white text-indigo-600 hover:bg-slate-100 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-sm"
                >
                    {isConnecting ? (
                        <span className="material-symbols-rounded text-sm animate-spin">progress_activity</span>
                    ) : (
                        <span className="material-symbols-rounded text-sm">wallet</span>
                    )}
                    Connect
                </button>
            ) : (
                // Wallet Address Display (Web Mode)
                <div 
                    onClick={onConnect}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-700 cursor-pointer transition-colors"
                >
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                    <span className="text-xs font-mono text-slate-300 font-medium">
                        {connectedAddress.slice(0, 4)}...{connectedAddress.slice(-4)}
                    </span>
                </div>
            )}
        </div>
      </div>
    </nav>
  );
};
