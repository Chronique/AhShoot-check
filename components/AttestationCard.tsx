import React from 'react';
import { Attestation } from '../types';
import { ShieldCheck, Clock, Hash, ExternalLink } from 'lucide-react';

interface AttestationCardProps {
  attestation: Attestation;
}

export const AttestationCard: React.FC<AttestationCardProps> = ({ attestation }) => {
  const date = new Date(attestation.time * 1000).toLocaleDateString();

  return (
    <div className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 rounded-xl p-5 transition-all duration-300">
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
      </div>
      
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-green-500/10 text-green-400">
          <ShieldCheck className="w-6 h-6" />
        </div>
        
        <div className="flex-1 overflow-hidden">
          <h3 className="text-lg font-semibold text-white mb-1 truncate">
            {attestation.schemaName || 'Unknown Schema'}
          </h3>
          <p className="text-sm text-slate-400 mb-3">{attestation.provider || 'Unknown Provider'}</p>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              <span className="truncate" title={attestation.uid}>{attestation.uid.slice(0, 10)}...</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{date}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center">
        <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
          Verified
        </span>
        <span className="text-xs text-slate-500 font-mono">
            By: {attestation.attester.slice(0, 6)}...
        </span>
      </div>
    </div>
  );
};
