import React from 'react';
import { Attestation } from '../types';

interface AttestationCardProps {
  attestation: Attestation;
}

export const AttestationCard: React.FC<AttestationCardProps> = ({ attestation }) => {
  const date = new Date(attestation.time * 1000).toLocaleDateString();

  return (
    <div className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 rounded-xl p-5 transition-all duration-300">
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="material-symbols-rounded text-slate-400 hover:text-white cursor-pointer text-base">open_in_new</span>
      </div>
      
      <div className="flex items-start gap-4">
        {/* If we have a provider logo (passed through complex means) or just use generic shield, 
            for now we keep the shield but we could enhance this later. 
            The Network Logo is the main request. */}
        <div className="p-3 rounded-full bg-slate-700/50 text-indigo-400 flex items-center justify-center">
          <span className="material-symbols-rounded text-2xl">verified_user</span>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <h3 className="text-lg font-semibold text-white mb-1 truncate">
            {attestation.schemaName || 'Unknown Schema'}
          </h3>
          <p className="text-sm text-slate-400 mb-3">{attestation.provider || 'Unknown Provider'}</p>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <span className="material-symbols-rounded text-[14px]">tag</span>
              <span className="truncate" title={attestation.uid}>{attestation.uid.slice(0, 10)}...</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-rounded text-[14px]">schedule</span>
              <span>{date}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center">
        {/* Network Badge with Real Logo */}
        <div className={`flex items-center gap-2 px-2 py-1 rounded-full border border-slate-700 bg-slate-900/50`}>
             {attestation.networkLogo ? (
                 <img 
                    src={attestation.networkLogo} 
                    alt={attestation.network} 
                    className="w-4 h-4 rounded-full object-contain"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                 />
             ) : (
                 <div className={`w-3 h-3 rounded-full bg-${attestation.networkColor}`}></div>
             )}
             <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                {attestation.network}
             </span>
        </div>

        <span className="text-xs text-slate-500 font-mono">
            By: {attestation.attester.slice(0, 6)}...
        </span>
      </div>
    </div>
  );
};