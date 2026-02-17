
import React, { useState, useEffect } from 'react';
import { AttestationCard } from '../components/AttestationCard';
import { TerminalAgent } from '../components/TerminalAgent';
import { Navbar } from '../components/Navbar';
import { BottomNav, Tab } from '../components/BottomNav';
import { CHAINS, BASE_CHAIN, POPULAR_SCHEMAS } from '../constants';
import { Attestation, Chain } from '../types';
import { fetchAttestations } from '../services/easService';
import { connectWallet, interactWithContract, checkWalletConnection } from '../services/walletService';
import { resolveEnsName } from '../services/ensService';
import { analyzeAttestationPortfolio, AnalysisResult } from '../services/geminiService';
import { sdk } from '@farcaster/miniapp-sdk';

const Page: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<Tab>('home');

  // Wallet & User State
  const [connectedAddress, setConnectedAddress] = useState<string>(''); 
  const [targetAddress, setTargetAddress] = useState<string>(''); 
  const [isConnecting, setIsConnecting] = useState(true);
  
  // Input State
  const [searchInput, setSearchInput] = useState('');
  const [networkType, setNetworkType] = useState('All EVM Rollups');

  // Data State
  const [txStatus, setTxStatus] = useState<'idle' | 'mining' | 'success'>('idle');
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- LOGIC ---

  useEffect(() => {
    const initializeApp = async () => {
      let isFarcaster = false;

      // 1. Attempt to detect Farcaster/Frame Context
      try {
        const context = await sdk.context;
        if (context) {
            isFarcaster = true;
            // Signal to Farcaster that the app is ready (hides splash screen)
            sdk.actions.ready();
            
            // Auto Connect Logic for Farcaster / Base App
            const ethProvider = sdk.wallet.ethProvider;
            if (ethProvider) {
                 try {
                     const accounts = await ethProvider.request({ method: 'eth_requestAccounts' }) as string[];
                     if (accounts && accounts.length > 0) {
                         setConnectedAddress(accounts[0]);
                         if (!targetAddress) setTargetAddress(accounts[0]);
                     }
                 } catch (err) {
                     console.warn("Farcaster auto-connect failed:", err);
                 }
            }
        }
      } catch (e) {
         // Not running in Farcaster context
         console.debug("Not running in Farcaster Frame context.");
      }

      // 2. If not Farcaster, fallback to standard web auto-connect
      if (!isFarcaster) {
        const address = await checkWalletConnection();
        if (address) {
            setConnectedAddress(address);
            if (!targetAddress) setTargetAddress(address); // Default to viewing self
        }
      }
      
      setIsConnecting(false);
    };

    initializeApp();
  }, []);

  const checkForAttestation = async (address: string) => {
    if (!address) return;
    setIsLoadingData(true);
    setAttestations([]);
    setAnalysis(null);
    
    try {
        let chainsToQuery: Chain[] = [];
        if (networkType === 'All EVM Rollups') {
            chainsToQuery = CHAINS.filter(c => c.vmType === 'EVM' && c.graphqlUrl); 
        } else if (networkType === 'Ethereum Mainnet') {
            chainsToQuery = CHAINS.filter(c => c.id === 1 && c.graphqlUrl);
        } else {
             chainsToQuery = [BASE_CHAIN];
        }
        if (chainsToQuery.length === 0) chainsToQuery = [BASE_CHAIN]; 

        const promises = chainsToQuery.map(chain => fetchAttestations(address, chain));
        const results = await Promise.all(promises);
        const allAttestations = results.flat();

        if (allAttestations.length === 0) {
             setAttestations([]);
             return;
        }

        const enriched = allAttestations.map(att => {
            const schemaDef = POPULAR_SCHEMAS.find(s => s.uid.toLowerCase() === att.schemaUid.toLowerCase());
            if (schemaDef) {
                return { 
                    ...att, 
                    provider: schemaDef.provider, 
                    schemaName: schemaDef.name,
                    schemaLogo: schemaDef.logoUrl 
                };
            }
            return att;
        });

        enriched.sort((a, b) => {
            const aIsPop = POPULAR_SCHEMAS.some(s => s.uid.toLowerCase() === a.schemaUid.toLowerCase());
            const bIsPop = POPULAR_SCHEMAS.some(s => s.uid.toLowerCase() === b.schemaUid.toLowerCase());
            if (aIsPop && !bIsPop) return -1;
            if (!aIsPop && bIsPop) return 1;
            return b.time - a.time;
        });

        const unique = Array.from(new Map(enriched.map(item => [item.uid, item])).values());
        setAttestations(unique);
        
        if (unique.length > 0) {
            setIsAnalyzing(true);
            const identifiers = unique.map(a => a.schemaName || a.uid);
            analyzeAttestationPortfolio(identifiers).then(res => {
                setAnalysis(res);
                setIsAnalyzing(false);
            });
        }
    } catch (e) {
        console.error(e);
        setAttestations([]);
    } finally {
        setIsLoadingData(false);
    }
  };

  const handleManualConnect = async () => {
    setIsConnecting(true);
    // Check if we are in Farcaster context first for manual connect
    try {
        const context = await sdk.context;
        if (context && sdk.wallet.ethProvider) {
            const accounts = await sdk.wallet.ethProvider.request({ method: 'eth_requestAccounts' }) as string[];
            if (accounts && accounts.length > 0) {
                setConnectedAddress(accounts[0]);
                setTargetAddress(accounts[0]);
                setIsConnecting(false);
                return;
            }
        }
    } catch (e) {}

    // Fallback to standard web wallet
    const address = await connectWallet();
    if (address) {
        setConnectedAddress(address);
        setTargetAddress(address);
    }
    setIsConnecting(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      const rawInput = searchInput.trim();
      if (!rawInput) return;
      setIsLoadingData(true);
      
      let resolvedAddress = rawInput;
      if (rawInput.includes('.') && !rawInput.startsWith('0x')) {
          const ens = await resolveEnsName(rawInput);
          if (ens) resolvedAddress = ens;
          else {
              alert(`Could not resolve ENS name: ${rawInput}`);
              setIsLoadingData(false);
              return;
          }
      } else if (!rawInput.startsWith('0x') || rawInput.length !== 42) {
          alert("Invalid address");
          setIsLoadingData(false);
          return;
      }

      setTargetAddress(resolvedAddress);
      checkForAttestation(resolvedAddress);
  };

  const handleInteract = async () => {
    if (!connectedAddress) {
        await handleManualConnect();
        return;
    }
    setTxStatus('mining');
    const success = await interactWithContract();
    if (success) {
        setTxStatus('success');
        setTimeout(() => checkForAttestation(connectedAddress), 3000); 
    } else {
        setTxStatus('idle');
    }
  };

  // --- RENDER CONTENT BASED ON TAB ---

  const renderHome = () => (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-24">
          <div className="mb-6 p-4 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl border border-indigo-500/20 relative overflow-hidden">
              <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white mb-2">My Reputation</h2>
                  {connectedAddress ? (
                      <div>
                          <p className="text-slate-300 text-sm mb-4">You are connected as <span className="font-mono text-indigo-300">{connectedAddress.slice(0,6)}...</span></p>
                          <button 
                            onClick={() => { setTargetAddress(connectedAddress); setActiveTab('verify'); checkForAttestation(connectedAddress); }}
                            className="bg-white text-indigo-900 px-4 py-2 rounded-lg font-bold text-sm shadow-md active:scale-95 transition-transform"
                          >
                            Check My Score
                          </button>
                      </div>
                  ) : (
                      <div>
                          <p className="text-slate-300 text-sm mb-4">Connect wallet to view your on-chain credentials.</p>
                          <button onClick={handleManualConnect} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md">Connect Wallet</button>
                      </div>
                  )}
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-20 text-white">
                  <span className="material-symbols-rounded text-[120px]">verified_user</span>
              </div>
          </div>

          <h3 className="font-bold text-slate-400 text-sm uppercase tracking-wide mb-3 pl-1">Trending Schemas</h3>
          
          <div className="flex overflow-x-auto gap-3 pb-4 -mx-4 px-4 snap-x touch-pan-x">
              {POPULAR_SCHEMAS.map(s => (
                  <div key={s.uid} className="min-w-[160px] w-[160px] flex-shrink-0 snap-start bg-slate-800 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-2 shadow-sm hover:bg-slate-800/80 active:scale-95 transition-all">
                      <img src={s.logoUrl} className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 object-cover" />
                      <div className="flex-1">
                          <p className="font-bold text-white text-sm line-clamp-1">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.provider}</p>
                      </div>
                      <span className="text-[10px] bg-slate-900 text-slate-500 px-2 py-1 rounded w-fit border border-slate-700/30">{s.category}</span>
                  </div>
              ))}
          </div>
          
          <div className="mt-4 p-4 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
             <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                     <span className="material-symbols-rounded">campaign</span>
                 </div>
                 <div>
                     <h4 className="font-bold text-sm text-slate-200">Did you know?</h4>
                     <p className="text-xs text-slate-400">You can verify your Coinbase account on-chain using the "Coinbase Verified" schema.</p>
                 </div>
             </div>
          </div>
      </div>
  );

  const renderVerify = () => (
      <div className="animate-in fade-in duration-300 pb-24">
          <h2 className="text-2xl font-bold text-white mb-4">Explorer</h2>
          
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
              <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-500">search</span>
                  <input 
                    type="text" 
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search 0x.. or ENS"
                    className="w-full bg-slate-800 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none text-sm"
                  />
              </div>
              <button type="submit" className="bg-indigo-600 w-12 rounded-xl flex items-center justify-center text-white shadow-lg active:bg-indigo-700">
                  <span className="material-symbols-rounded">arrow_forward</span>
              </button>
          </form>

          {/* Results Area */}
          {targetAddress && (
              <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                      <span>Result for: <span className="text-indigo-400 font-mono bg-indigo-900/30 px-1 rounded">{targetAddress.slice(0,6)}...{targetAddress.slice(-4)}</span></span>
                      <button onClick={() => setTargetAddress('')} className="text-slate-500 hover:text-white">Clear</button>
                  </div>

                  {isLoadingData ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
                          <span className="material-symbols-rounded animate-spin text-3xl">donut_large</span>
                          <span className="text-xs">Scanning multiple chains...</span>
                      </div>
                  ) : attestations.length > 0 ? (
                      <div className="space-y-3">
                          {/* AI Insight Card */}
                          {analysis && (
                             <div className="bg-gradient-to-r from-indigo-900/40 to-slate-900 p-4 rounded-xl border border-indigo-500/30 mb-2">
                                 <div className="flex items-center gap-2 mb-2">
                                     <span className="material-symbols-rounded text-indigo-400 text-sm">auto_awesome</span>
                                     <span className="text-xs font-bold text-indigo-200 uppercase">AI Insight</span>
                                 </div>
                                 <p className="text-sm text-slate-300 leading-snug">{analysis.analysis}</p>
                                 <div className="mt-3 flex gap-2">
                                     <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded border border-indigo-500/20">{analysis.identityCluster}</span>
                                     <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded border border-emerald-500/20">Conf: {(analysis.confidenceScore * 100).toFixed(0)}%</span>
                                 </div>
                             </div>
                          )}
                          
                          {attestations.map(att => (
                              <AttestationCard key={att.uid} attestation={att} />
                          ))}
                      </div>
                  ) : (
                      <div className="text-center py-10 opacity-50">
                          <span className="material-symbols-rounded text-4xl mb-2">search_off</span>
                          <p className="text-sm">No attestations found.</p>
                      </div>
                  )}
              </div>
          )}

          {/* Fallback Mint Prompt if Self */}
          {!isLoadingData && targetAddress === connectedAddress && connectedAddress && attestations.length === 0 && (
             <div className="mt-8 text-center">
                 <p className="text-slate-400 text-sm mb-4">You have no reputation yet.</p>
                 <button 
                    onClick={handleInteract}
                    className="w-full py-3 bg-white text-indigo-900 font-bold rounded-xl"
                 >
                    Mint First Badge
                 </button>
             </div>
          )}
      </div>
  );

  const renderLearn = () => (
      <div className="animate-in fade-in duration-300 h-[calc(100vh-140px)] flex flex-col">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-white">AI Assistant</h2>
            <p className="text-sm text-slate-400">Ask about schemas, verification, or EAS.</p>
          </div>
          <div className="flex-1 overflow-hidden bg-slate-900 rounded-xl border border-slate-800">
             <TerminalAgent />
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-50 flex flex-col font-sans selection:bg-indigo-500/30">
      
      <Navbar 
        connectedAddress={connectedAddress} 
        onConnect={handleManualConnect} 
        isConnecting={isConnecting}
      />

      <main className="flex-1 px-4 py-6 w-full max-w-lg mx-auto">
         {activeTab === 'home' && renderHome()}
         {activeTab === 'verify' && renderVerify()}
         {activeTab === 'learn' && renderLearn()}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
    </div>
  );
};

export default Page;