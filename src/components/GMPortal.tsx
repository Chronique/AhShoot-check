
import React, { useState, useEffect } from 'react';
import { mintIdentity, getIdentityStatus } from '../services/walletService';
import { fetchAttestations, fetchRecentAttestations } from '../services/easService';
import { fetchVeraxAttestations, fetchRecentVeraxAttestations } from '../services/veraxService';
import { BASE_CHAIN, LINEA_CHAIN, BASE_SCHEMA_UID, LINEA_SCHEMA_ID, BASE_CHAIN_ID, LINEA_CHAIN_ID } from '../constants';
import { FarcasterUser, Attestation } from '../types';
import { AttestationCard } from './AttestationCard';

interface GMPortalProps {
  connectedAddress: string;
  farcasterUser: FarcasterUser | null;
  onConnect: () => void;
}

type NetworkMode = 'BASE' | 'LINEA';

export const GMPortal: React.FC<GMPortalProps> = ({ connectedAddress, farcasterUser, onConnect }) => {
  const [mode, setMode] = useState<NetworkMode>('BASE');
  
  // Identity States
  const [hasBaseIdentity, setHasBaseIdentity] = useState(false);
  const [hasLineaIdentity, setHasLineaIdentity] = useState(false);
  
  const [isMining, setIsMining] = useState(false);
  const [userAttestation, setUserAttestation] = useState<Attestation | null>(null);
  const [recentActivity, setRecentActivity] = useState<Attestation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const activeChain = mode === 'BASE' ? BASE_CHAIN : LINEA_CHAIN;
  const activeSchemaId = mode === 'BASE' ? BASE_SCHEMA_UID : LINEA_SCHEMA_ID;
  const hasStrongIdentity = hasBaseIdentity && hasLineaIdentity;

  // Initial Load & Refresh when Mode changes
  useEffect(() => {
    loadData();
    if(connectedAddress) checkIdentities();
  }, [connectedAddress, mode]);

  const checkIdentities = async () => {
      if(!connectedAddress) return;
      // Check Base
      const baseStatus = await getIdentityStatus(connectedAddress, BASE_CHAIN_ID);
      setHasBaseIdentity(baseStatus.hasIdentity);
      
      // Check Linea
      const lineaStatus = await getIdentityStatus(connectedAddress, LINEA_CHAIN_ID);
      setHasLineaIdentity(lineaStatus.hasIdentity);
  };

  const loadData = async () => {
      setIsLoading(true);
      
      // 1. Fetch Recents
      try {
          let recents: Attestation[] = [];
          if (mode === 'BASE') {
              recents = await fetchRecentAttestations(activeSchemaId, activeChain);
          } else {
              recents = await fetchRecentVeraxAttestations(activeSchemaId, activeChain);
          }
          setRecentActivity(recents);
      } catch (e) { console.error(e); }

      // 2. Check User Status
      if (connectedAddress) {
          try {
              // Check Last Attestation
              let attestations: Attestation[] = [];
              if (mode === 'BASE') {
                  attestations = await fetchAttestations(connectedAddress, activeChain);
              } else {
                  attestations = await fetchVeraxAttestations(connectedAddress, activeChain);
              }

              const found = attestations.find(att => 
                  att.schemaUid.toLowerCase() === activeSchemaId.toLowerCase()
              );

              if (found) {
                  setUserAttestation({
                      ...found,
                      schemaName: mode === 'BASE' ? 'Verified Base User' : 'Linea Soulbound ID',
                      provider: mode === 'BASE' ? 'Base Portal' : 'Verax Portal',
                      schemaLogo: activeChain.logoUrl,
                      data: mode === 'LINEA' ? 'Soulbound (Non-Transferable)' : found.data
                  });
              } else {
                  setUserAttestation(null);
              }
          } catch (e) {
              console.error("Status check failed", e);
          }
      } else {
          setUserAttestation(null);
      }
      setIsLoading(false);
  };

  const handleMint = async () => {
    if (!connectedAddress) {
        onConnect();
        return;
    }
    setIsMining(true);
    
    // Interact with Factory Contract
    const targetChainId = mode === 'BASE' ? BASE_CHAIN_ID : LINEA_CHAIN_ID;
    const success = await mintIdentity(targetChainId);
    
    if (success) {
        setTimeout(() => {
            checkIdentities();
            loadData(); 
            setIsMining(false);
        }, 5000); 
    } else {
        // Even if failed (e.g. reverted because already owned), refresh status
        // This fixes cases where the UI didn't know the user owned it.
        await checkIdentities();
        setIsMining(false);
    }
  };

  const timeAgo = (timestamp: number) => {
      const seconds = Math.floor((Date.now() / 1000) - timestamp);
      if (seconds < 60) return `${seconds}s ago`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      return `${hours}h ago`;
  };

  // Determine current identity status for the active mode
  const currentIdentityOwned = mode === 'BASE' ? hasBaseIdentity : hasLineaIdentity;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-24">
       
       {/* NETWORK TOGGLE */}
       <div className="flex bg-slate-900/80 p-1 rounded-xl mb-6 border border-slate-700">
           <button 
               onClick={() => setMode('BASE')}
               className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'BASE' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
               <img src={BASE_CHAIN.logoUrl} className="w-4 h-4 rounded-full bg-white"/>
               Base ID
               {hasBaseIdentity && <span className="text-emerald-400 text-[10px] ml-1">✓</span>}
           </button>
           <button 
               onClick={() => setMode('LINEA')}
               className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'LINEA' ? 'bg-slate-100 text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
               <img src={LINEA_CHAIN.logoUrl} className="w-4 h-4 rounded-full"/>
               Linea ID
               {hasLineaIdentity && <span className="text-emerald-400 text-[10px] ml-1">✓</span>}
           </button>
       </div>

       {/* Strong Identity Badge */}
       {hasStrongIdentity && (
           <div className="mb-4 bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-3 animate-in zoom-in-95">
               <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400">
                   <span className="material-symbols-rounded">security</span>
               </div>
               <div>
                   <h3 className="text-sm font-bold text-white">Strong Identity Verified</h3>
                   <p className="text-xs text-slate-400">You hold identities on both Base and Linea.</p>
               </div>
           </div>
       )}

       {/* Factory Status Card */}
       <div className={`mb-6 p-6 rounded-2xl border relative overflow-hidden transition-colors duration-500
            ${mode === 'BASE' 
                ? 'bg-gradient-to-br from-blue-900/40 to-slate-900 border-blue-500/20' 
                : 'bg-gradient-to-br from-slate-800 to-black border-slate-500/20'}
       `}>
           <div className="relative z-10 flex flex-col items-center text-center">
                
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 border ${currentIdentityOwned ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-slate-700/50 border-slate-600'}`}>
                    {currentIdentityOwned ? (
                        <span className="material-symbols-rounded text-emerald-400 text-3xl">verified</span>
                    ) : (
                        <span className="material-symbols-rounded text-slate-400 text-3xl">fingerprint</span>
                    )}
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">
                    {mode === 'BASE' ? 'Base Identity' : 'Linea Identity'}
                </h2>
                
                <div className="text-slate-400 text-sm mb-6 flex flex-col items-center gap-1">
                    {mode === 'BASE' ? (
                        <span className="flex items-center gap-1 text-blue-300 bg-blue-900/20 px-2 py-0.5 rounded text-xs border border-blue-500/20">
                            <span className="material-symbols-rounded text-xs">token</span>
                            Standard ERC-721 Identity
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-slate-300 bg-slate-700/50 px-2 py-0.5 rounded text-xs border border-slate-500/20">
                            <span className="material-symbols-rounded text-xs">lock_person</span>
                            Soulbound Token (SBT)
                        </span>
                    )}
                </div>

                {/* Interaction Button */}
                {!currentIdentityOwned ? (
                    <button 
                        onClick={handleMint}
                        disabled={isMining}
                        className={`w-full py-4 font-bold rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2
                            ${mode === 'BASE' ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-white hover:bg-slate-200 text-black'}
                        `}
                    >
                        {isMining ? (
                            <>
                                <span className="material-symbols-rounded animate-spin">progress_activity</span>
                                Minting Identity...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-rounded">add_circle</span>
                                MINT {mode} IDENTITY
                            </>
                        )}
                    </button>
                ) : (
                    <div className="w-full bg-emerald-900/20 border border-emerald-500/20 text-emerald-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                        <span className="material-symbols-rounded">check_circle</span>
                        Identity Owned
                    </div>
                )}
           </div>
       </div>

       {/* Last Minted Display */}
       {userAttestation && (
           <div className="mb-6 animate-in zoom-in-95 duration-500">
               <h3 className="font-bold text-slate-400 text-sm uppercase tracking-wide mb-3 pl-1">Your On-Chain Proof</h3>
               <AttestationCard attestation={userAttestation} />
           </div>
       )}

       {/* Factory Activity Feed */}
       <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-400 text-sm uppercase tracking-wide pl-1">
                    Recent Mints
                </h3>
                <button onClick={loadData} className="text-xs text-indigo-400 hover:text-white flex items-center gap-1">
                    <span className="material-symbols-rounded text-sm">refresh</span> Refresh
                </button>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                {recentActivity.length > 0 ? (
                    recentActivity.map((att) => (
                        <div key={att.uid} className="flex items-center p-3 border-b border-slate-700/50 last:border-0 gap-3 hover:bg-slate-800 transition-colors">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white
                                ${mode === 'BASE' ? 'bg-blue-600' : 'bg-slate-600'}
                            `}>
                                {mode === 'BASE' ? 'ID' : 'SBT'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white font-mono truncate">
                                    {att.recipient.slice(0, 6)}...{att.recipient.slice(-4)}
                                </p>
                                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <span className="material-symbols-rounded text-[10px]">history</span>
                                    Minted {timeAgo(att.time)}
                                </p>
                            </div>
                            <a 
                                href={mode === 'BASE' 
                                    ? `https://base.easscan.org/attestation/view/${att.uid}` 
                                    : `https://explorer.ver.ax/linea/attestations/${att.uid}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="material-symbols-rounded text-slate-400 hover:text-white text-lg"
                            >
                                open_in_new
                            </a>
                        </div>
                    ))
                ) : (
                    <div className="p-6 text-center text-slate-500 text-sm">
                        {isLoading ? 'Loading...' : 'No recent mints.'}
                    </div>
                )}
            </div>
       </div>
    </div>
  );
};
