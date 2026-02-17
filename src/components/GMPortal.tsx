
import React, { useState, useEffect } from 'react';
import { sayGM, getStreak } from '../services/walletService';
import { fetchAttestations, fetchRecentAttestations } from '../services/easService';
import { BASE_CHAIN, TARGET_SCHEMA_UID, POPULAR_SCHEMAS } from '../constants';
import { FarcasterUser, Attestation } from '../types';
import { AttestationCard } from './AttestationCard';

interface GMPortalProps {
  connectedAddress: string;
  farcasterUser: FarcasterUser | null;
  onConnect: () => void;
}

export const GMPortal: React.FC<GMPortalProps> = ({ connectedAddress, farcasterUser, onConnect }) => {
  const [streak, setStreak] = useState(0);
  const [isMining, setIsMining] = useState(false);
  const [userAttestation, setUserAttestation] = useState<Attestation | null>(null);
  const [recentActivity, setRecentActivity] = useState<Attestation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Initial Load
  useEffect(() => {
    // Load Recent Activity (Real Data)
    loadRecentActivity();

    if (connectedAddress) {
        checkVerificationStatus();
        getStreak(connectedAddress).then(s => setStreak(s));
    }
  }, [connectedAddress]);

  const loadRecentActivity = async () => {
      try {
          const recents = await fetchRecentAttestations(TARGET_SCHEMA_UID, BASE_CHAIN);
          setRecentActivity(recents);
      } catch (e) {
          console.error("Error loading recents:", e);
      }
  };

  const checkVerificationStatus = async () => {
    setIsLoading(true);
    try {
        const attestations = await fetchAttestations(connectedAddress, BASE_CHAIN);
        const found = attestations.find(att => 
            att.schemaUid.toLowerCase() === TARGET_SCHEMA_UID.toLowerCase()
        );

        if (found) {
            const schemaDef = POPULAR_SCHEMAS.find(s => s.uid.toLowerCase() === TARGET_SCHEMA_UID.toLowerCase());
            setUserAttestation({
                ...found,
                schemaName: schemaDef?.name || 'Verified Base User',
                provider: schemaDef?.provider || 'Base Portal',
                schemaLogo: schemaDef?.logoUrl
            });
        } else {
            setUserAttestation(null);
        }
    } catch (e) {
        console.error("Failed to check status", e);
    } finally {
        setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!connectedAddress) {
        onConnect();
        return;
    }
    setIsMining(true);
    
    // Interact with contract
    const success = await sayGM();
    
    if (success) {
        setStreak(prev => prev + 1);
        // Wait for Indexer
        setTimeout(() => {
            checkVerificationStatus();
            loadRecentActivity(); // Refresh list after minting
            setIsMining(false);
        }, 4000); 
    } else {
        setIsMining(false);
    }
  };

  // Helper for time ago
  const timeAgo = (timestamp: number) => {
      const seconds = Math.floor((Date.now() / 1000) - timestamp);
      if (seconds < 60) return `${seconds}s ago`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-24">
       {/* Header Card */}
       <div className="mb-6 p-6 bg-gradient-to-br from-indigo-900/50 to-slate-900 rounded-2xl border border-indigo-500/20 relative overflow-hidden">
           <div className="relative z-10 flex flex-col items-center text-center">
                
                {/* Status Icon */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 border ${userAttestation ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-slate-700/50 border-slate-600'}`}>
                    {userAttestation ? (
                        <span className="material-symbols-rounded text-emerald-400 text-3xl">verified</span>
                    ) : (
                        <span className="material-symbols-rounded text-slate-400 text-3xl">lock</span>
                    )}
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">
                    {userAttestation ? 'You are Verified!' : 'Verify Reputation'}
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                    {userAttestation 
                        ? 'You have successfully minted your on-chain verification.' 
                        : 'Interact with the GM Portal to mint your "Verified User" schema.'
                    }
                </p>

                {/* Main Action Button */}
                {!userAttestation ? (
                    <button 
                        onClick={handleVerify}
                        disabled={isMining}
                        className="w-full py-4 bg-white text-indigo-900 font-bold rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {isMining ? (
                            <>
                                <span className="material-symbols-rounded animate-spin">progress_activity</span>
                                Verifying on Blockchain...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-rounded">fingerprint</span>
                                VERIFY / MINT SCHEMA
                            </>
                        )}
                    </button>
                ) : (
                    <div className="w-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                        <span className="material-symbols-rounded">check_circle</span>
                        Already Verified
                    </div>
                )}
           </div>
       </div>

       {/* Result Display: Show the Actual Schema Card if verified */}
       {userAttestation && (
           <div className="mb-6 animate-in zoom-in-95 duration-500">
               <h3 className="font-bold text-slate-400 text-sm uppercase tracking-wide mb-3 pl-1">Your Credential</h3>
               <AttestationCard attestation={userAttestation} />
           </div>
       )}

       {/* Social Verification Badges (Visual Context) */}
       {!userAttestation && (
        <>
           <h3 className="font-bold text-slate-400 text-sm uppercase tracking-wide mb-3 pl-1">Requirements</h3>
           <div className="space-y-3 opacity-80">
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${farcasterUser ? 'bg-purple-900/20 border-purple-500/30' : 'bg-slate-800 border-slate-700'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${farcasterUser ? 'bg-purple-600' : 'bg-slate-700'}`}>
                        <span className="material-symbols-rounded text-white">alternate_email</span>
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-white">Farcaster Account</p>
                        <p className="text-xs text-slate-400">{farcasterUser ? 'Connected' : 'Optional'}</p>
                    </div>
                    {farcasterUser && <span className="material-symbols-rounded text-purple-400">check_circle</span>}
                </div>
           </div>
        </>
       )}

       {/* REAL Leaderboard / Recent Activity */}
       <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-400 text-sm uppercase tracking-wide pl-1">Recent Activity</h3>
                <button onClick={loadRecentActivity} className="text-xs text-indigo-400 hover:text-white flex items-center gap-1">
                    <span className="material-symbols-rounded text-sm">refresh</span> Refresh
                </button>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                {recentActivity.length > 0 ? (
                    recentActivity.map((att) => (
                        <div key={att.uid} className="flex items-center p-3 border-b border-slate-700/50 last:border-0 gap-3 hover:bg-slate-800 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                <span className="material-symbols-rounded text-sm">person</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white font-mono truncate">
                                    {att.recipient.slice(0, 6)}...{att.recipient.slice(-4)}
                                </p>
                                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <span className="material-symbols-rounded text-[10px]">history</span>
                                    {timeAgo(att.time)}
                                </p>
                            </div>
                            <a 
                                href={`https://base.easscan.org/attestation/view/${att.uid}`}
                                target="_blank"
                                rel="noreferrer"
                                className="material-symbols-rounded text-emerald-500 text-lg hover:text-emerald-400"
                            >
                                open_in_new
                            </a>
                        </div>
                    ))
                ) : (
                    <div className="p-6 text-center text-slate-500 text-sm">
                        No recent activity found for this schema.
                    </div>
                )}
            </div>
       </div>
    </div>
  );
};
