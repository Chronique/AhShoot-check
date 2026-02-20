
import React, { useState, useEffect } from 'react';
import { mintIdentity, getIdentityStatus, attestIdentity } from '../services/walletService';
import { fetchAttestations, fetchRecentAttestations } from '../services/easService';
import { BASE_CHAIN, BASE_SCHEMA_UID, BASE_CHAIN_ID } from '../constants';
import { FarcasterUser, Attestation } from '../types';
import { AttestationCard } from './AttestationCard';

interface GMPortalProps {
  connectedAddress: string;
  farcasterUser: FarcasterUser | null;
  onConnect: () => void;
}

export const GMPortal: React.FC<GMPortalProps> = ({ connectedAddress, farcasterUser, onConnect }) => {
  // Identity States
  const [hasBaseIdentity, setHasBaseIdentity] = useState(false);
  
  const [isMining, setIsMining] = useState(false);
  const [isAttesting, setIsAttesting] = useState(false);
  const [userAttestation, setUserAttestation] = useState<Attestation | null>(null);
  const [recentActivity, setRecentActivity] = useState<Attestation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const activeChain = BASE_CHAIN;
  const activeSchemaId = BASE_SCHEMA_UID;

  // Initial Load & Refresh
  useEffect(() => {
    loadData();
    if(connectedAddress) checkIdentities();
  }, [connectedAddress]);

  const checkIdentities = async () => {
      if(!connectedAddress) return;
      // Check Base
      const baseStatus = await getIdentityStatus(connectedAddress, BASE_CHAIN_ID);
      setHasBaseIdentity(baseStatus.hasIdentity);
  };

  const loadData = async () => {
      setIsLoading(true);
      
      // 1. Fetch User Status & Activity
      if (connectedAddress) {
          try {
              // Fetch All User Attestations
              const attestations = await fetchAttestations(connectedAddress, activeChain);

              // Filter for the specific schema to show as "Recent Mints" (Personalized)
              const userMints = attestations.filter(att => 
                  att.schemaUid.toLowerCase() === activeSchemaId.toLowerCase()
              );
              setRecentActivity(userMints);

              // Set the primary user attestation display
              const found = userMints[0]; // Take the latest one

              if (found) {
                  setUserAttestation({
                      ...found,
                      schemaName: 'Verified Base User',
                      provider: 'Base Portal',
                      schemaLogo: activeChain.logoUrl,
                      data: found.data
                  });
              } else {
                  setUserAttestation(null);
              }
          } catch (e) {
              console.error("Status check failed", e);
              setRecentActivity([]);
              setUserAttestation(null);
          }
      } else {
          setRecentActivity([]);
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
    const targetChainId = BASE_CHAIN_ID;
    const success = await mintIdentity(targetChainId);
    
    if (success) {
        setTimeout(() => {
            checkIdentities();
            loadData(); 
            setIsMining(false);
        }, 5000); 
    } else {
        // Even if failed (e.g. reverted because already owned), refresh status
        await checkIdentities();
        setIsMining(false);
    }
  };

  const handleVerify = async () => {
    if (!connectedAddress) {
        onConnect();
        return;
    }
    setIsAttesting(true);
    
    const uid = await attestIdentity();
    
    if (uid) {
        // Wait for indexer
        setTimeout(() => {
            loadData(); 
            setIsAttesting(false);
        }, 5000); 
    } else {
        setIsAttesting(false);
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

  // Determine current identity status
  const currentIdentityOwned = hasBaseIdentity;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-24">
       
       {/* Factory Status Card */}
       <div className="mb-6 p-6 rounded-2xl border relative overflow-hidden transition-colors duration-500 bg-gradient-to-br from-blue-900/40 to-slate-900 border-blue-500/20">
           <div className="relative z-10 flex flex-col items-center text-center">
                 
                 <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 border ${currentIdentityOwned ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-slate-700/50 border-slate-600'}`}>
                     {currentIdentityOwned ? (
                         <span className="material-symbols-rounded text-emerald-400 text-3xl">verified</span>
                     ) : (
                         <span className="material-symbols-rounded text-slate-400 text-3xl">fingerprint</span>
                     )}
                 </div>

                 <h2 className="text-2xl font-bold text-white mb-1">
                     Base Identity
                 </h2>
                 
                 <div className="text-slate-400 text-sm mb-6 flex flex-col items-center gap-1">
                    <span className="flex items-center gap-1 text-blue-300 bg-blue-900/20 px-2 py-0.5 rounded text-xs border border-blue-500/20">
                        <span className="material-symbols-rounded text-xs">token</span>
                        Standard ERC-721 Identity
                    </span>
                 </div>

                 {/* Interaction Button */}
                 {!currentIdentityOwned ? (
                     <button 
                         onClick={handleMint}
                         disabled={isMining}
                         className="w-full py-4 font-bold rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white"
                     >
                         {isMining ? (
                             <>
                                 <span className="material-symbols-rounded animate-spin">progress_activity</span>
                                 Minting Identity...
                             </>
                         ) : (
                             <>
                                 <span className="material-symbols-rounded">add_circle</span>
                                 MINT BASE IDENTITY
                             </>
                         )}
                     </button>
                 ) : !userAttestation ? (
                    <button 
                        onClick={handleVerify}
                        disabled={isAttesting}
                        className="w-full py-4 font-bold rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                        {isAttesting ? (
                            <>
                                <span className="material-symbols-rounded animate-spin">progress_activity</span>
                                Verifying on EAS...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-rounded">verified</span>
                                VERIFY IDENTITY (ON-CHAIN)
                            </>
                        )}
                    </button>
                 ) : (
                     <div className="w-full bg-emerald-900/20 border border-emerald-500/20 text-emerald-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                         <span className="material-symbols-rounded">check_circle</span>
                         Identity Verified
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
                    Your Recent Mints
                </h3>
                <button onClick={loadData} className="text-xs text-indigo-400 hover:text-white flex items-center gap-1">
                    <span className="material-symbols-rounded text-sm">refresh</span> Refresh
                </button>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                {recentActivity.length > 0 ? (
                    recentActivity.map((att) => (
                        <div key={att.uid} className="flex items-center p-3 border-b border-slate-700/50 last:border-0 gap-3 hover:bg-slate-800 transition-colors">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-blue-600">
                                ID
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
                                href={`https://base.easscan.org/attestation/view/${att.uid}`}
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
