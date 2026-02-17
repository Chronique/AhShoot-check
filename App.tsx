
import React, { useState, useEffect } from 'react';
import { AttestationCard } from './components/AttestationCard';
import { TerminalAgent } from './components/TerminalAgent';
import { CHAINS, BASE_CHAIN, TARGET_SCHEMA_UID, POPULAR_SCHEMAS } from './constants';
import { Attestation, Chain } from './types';
import { fetchAttestations } from './services/easService';
import { connectWallet, interactWithContract, checkWalletConnection } from './services/walletService';
import { resolveEnsName } from './services/ensService';
import { analyzeAttestationPortfolio, AnalysisResult } from './services/geminiService';

const App: React.FC = () => {
  // Navigation State
  const [view, setView] = useState<'LANDING' | 'DASHBOARD' | 'LEARN'>('LANDING');

  // Wallet & User State
  const [connectedAddress, setConnectedAddress] = useState<string>(''); // Actual Wallet
  const [targetAddress, setTargetAddress] = useState<string>(''); // Address being viewed
  const [isConnecting, setIsConnecting] = useState(true);
  
  // Input State
  const [searchInput, setSearchInput] = useState('');
  const [networkType, setNetworkType] = useState('All EVM Rollups'); // Dropdown state

  // Data & Transaction State
  const [txStatus, setTxStatus] = useState<'idle' | 'mining' | 'success'>('idle');
  // CHANGED: Now holds array
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Analysis State
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- LOGIC ---

  // 1. Auto-Connect Wallet
  useEffect(() => {
    // Auto Connect Wallet
    const attemptAutoConnect = async () => {
        const address = await checkWalletConnection();
        if (address) {
            setConnectedAddress(address);
            setTargetAddress(address);
            if (view !== 'LEARN') setView('DASHBOARD');
        }
        setIsConnecting(false);
    };
    attemptAutoConnect();
  }, []);

  // Improved Poll for attestation: Checks ALL chains relevant to the selection
  const checkForAttestation = async (address: string) => {
    if (!address) return;
    setIsLoadingData(true);
    setAttestations([]);
    setAnalysis(null);
    
    try {
        console.log("Fetching attestations for:", address);
        
        // 1. Determine chains to query based on Dropdown
        let chainsToQuery: Chain[] = [];
        
        if (networkType === 'All EVM Rollups') {
            // Query all EVM chains that have a graphqlUrl configured
            chainsToQuery = CHAINS.filter(c => c.vmType === 'EVM' && c.graphqlUrl); 
        } else if (networkType === 'Ethereum Mainnet') {
            chainsToQuery = CHAINS.filter(c => c.id === 1 && c.graphqlUrl);
        } else {
             chainsToQuery = [BASE_CHAIN];
        }

        if (chainsToQuery.length === 0) {
            chainsToQuery = [BASE_CHAIN]; 
        }

        // 2. Fetch from all selected chains in parallel
        const promises = chainsToQuery.map(chain => fetchAttestations(address, chain));
        const results = await Promise.all(promises);
        
        // 3. Flatten results
        const allAttestations = results.flat();

        if (allAttestations.length === 0) {
             setAttestations([]);
             return;
        }

        // 4. Enrich & Filter
        // We map through ALL found attestations and enrich them if they match a Popular Schema.
        const enriched = allAttestations.map(att => {
            const schemaDef = POPULAR_SCHEMAS.find(s => s.uid.toLowerCase() === att.schemaUid.toLowerCase());
            if (schemaDef) {
                return { 
                    ...att, 
                    provider: schemaDef.provider, 
                    schemaName: schemaDef.name,
                    schemaLogo: schemaDef.logoUrl // Add logo from Schema
                };
            }
            return att;
        });

        // 5. Sort: Popular schemas first, then by time
        enriched.sort((a, b) => {
            const aIsPop = POPULAR_SCHEMAS.some(s => s.uid.toLowerCase() === a.schemaUid.toLowerCase());
            const bIsPop = POPULAR_SCHEMAS.some(s => s.uid.toLowerCase() === b.schemaUid.toLowerCase());
            
            if (aIsPop && !bIsPop) return -1;
            if (!aIsPop && bIsPop) return 1;
            return b.time - a.time;
        });

        // Remove duplicates if same UID appears (rare but possible with overlap)
        const unique = Array.from(new Map(enriched.map(item => [item.uid, item])).values());

        setAttestations(unique);
        
        // 6. Trigger AI Analysis
        if (unique.length > 0) {
            setIsAnalyzing(true);
            const identifiers = unique.map(a => a.schemaName || a.uid);
            analyzeAttestationPortfolio(identifiers).then(res => {
                setAnalysis(res);
                setIsAnalyzing(false);
            });
        }

    } catch (e) {
        console.error("Error fetching attestations:", e);
        setAttestations([]);
    } finally {
        setIsLoadingData(false);
    }
  };

  // 2. Refresh data when targetAddress changes AND we are in dashboard
  useEffect(() => {
    if (view === 'DASHBOARD' && targetAddress) {
        checkForAttestation(targetAddress);
    }
  }, [targetAddress, view]);

  // --- HANDLERS ---

  const handleManualConnect = async () => {
    setIsConnecting(true);
    const address = await connectWallet();
    if (address) {
        setConnectedAddress(address);
        setTargetAddress(address);
        setView('DASHBOARD');
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
          if (ens) {
              resolvedAddress = ens;
          } else {
              alert(`Could not resolve ENS name: ${rawInput}`);
              setIsLoadingData(false);
              return;
          }
      } else if (!rawInput.startsWith('0x') || rawInput.length !== 42) {
          alert("Please enter a valid Ethereum address (0x...) or ENS name.");
          setIsLoadingData(false);
          return;
      }

      setTargetAddress(resolvedAddress);
      setView('DASHBOARD');
  };

  const handleInteract = async () => {
    if (!connectedAddress) {
        await handleManualConnect();
        return;
    }
    
    if (targetAddress.toLowerCase() !== connectedAddress.toLowerCase()) {
        if(!confirm("You are viewing a different address. Switch to your wallet address to mint?")) return;
        setTargetAddress(connectedAddress);
    }

    setTxStatus('mining');
    const success = await interactWithContract();
    
    if (success) {
        setTxStatus('success');
        setTimeout(() => {
            checkForAttestation(connectedAddress);
        }, 3000); 
    } else {
        setTxStatus('idle');
    }
  };

  const goBackToHome = () => {
      setView('LANDING');
      setSearchInput('');
      setTargetAddress('');
      setAttestations([]);
      setAnalysis(null);
  };

  // --- RENDER ---

  const hasTargetSchema = attestations.some(a => a.schemaUid.toLowerCase() === TARGET_SCHEMA_UID.toLowerCase());

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-50 flex flex-col font-sans selection:bg-indigo-500/30">
      
      {/* NAVBAR */}
      <nav className="w-full border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              {/* Logo / Home Link */}
              <div className="flex items-center gap-6">
                <div 
                    className="flex items-center gap-3 cursor-pointer group" 
                    onClick={goBackToHome}
                >
                    <div className="p-2 bg-indigo-600 rounded-lg group-hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20">
                        <span className="material-symbols-rounded text-white text-xl">grid_view</span>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                        AH SHOOT
                    </span>
                </div>

                {/* Navbar Tabs */}
                <div className="hidden md:flex items-center bg-slate-800/50 p-1 rounded-full border border-slate-700/50">
                    <button 
                        onClick={() => setView(connectedAddress ? 'DASHBOARD' : 'LANDING')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${view !== 'LEARN' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <span className="material-symbols-rounded text-base">explore</span>
                        Explorer
                    </button>
                    <button 
                        onClick={() => setView('LEARN')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${view === 'LEARN' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <span className="material-symbols-rounded text-base">terminal</span>
                        Learn
                    </button>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                  {!connectedAddress ? (
                      <button 
                        onClick={handleManualConnect}
                        disabled={isConnecting}
                        className="text-sm font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-rounded text-lg">account_balance_wallet</span>
                        {isConnecting ? '...' : 'Connect'}
                      </button>
                  ) : (
                      <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-mono text-slate-400">
                              {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
                          </span>
                      </div>
                  )}
              </div>
          </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center min-h-[80vh]">
        
        {/* VIEW: LEARN (TERMINAL) */}
        {view === 'LEARN' && (
             <div className="w-full animate-in fade-in duration-300">
                 <div className="mb-8 text-center">
                     <h1 className="text-3xl font-bold text-white mb-2">Schema Intelligence</h1>
                     <p className="text-slate-400">Query the Ethereum Attestation Service using natural language.</p>
                 </div>
                 <TerminalAgent />
             </div>
        )}

        {/* VIEW: LANDING (GUEST MODE) */}
        {view === 'LANDING' && (
            <div className="w-full max-w-5xl flex flex-col items-center text-center animate-in fade-in duration-700 slide-in-from-bottom-4">
                
                {/* Hero Section */}
                <div className="mt-12 mb-12">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
                        Verify On-Chain Reputation
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Check identity schemas instantly across <span className="text-indigo-400 font-medium">all major networks</span>.
                        Supporting EVM, SVM, and Move based chains.
                    </p>
                </div>

                {/* Search & Interact Area */}
                <div className="w-full max-w-2xl mx-auto space-y-4">
                    
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 bg-slate-800/50 p-2 rounded-xl border border-slate-700 shadow-xl">
                        <div className="relative group">
                            <select 
                                value={networkType}
                                onChange={(e) => setNetworkType(e.target.value)}
                                className="appearance-none bg-slate-900 text-slate-300 pl-4 pr-10 py-3 rounded-lg border border-slate-700 outline-none focus:border-indigo-500 font-medium cursor-pointer h-full min-w-[180px]"
                            >
                                <option>All EVM Rollups</option>
                                <option>Ethereum Mainnet</option>
                                <option>SVM (Solana)</option>
                                <option>Move (Aptos/Sui)</option>
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none material-symbols-rounded text-slate-500 text-sm">
                                expand_more
                            </span>
                        </div>
                        
                        <input 
                            type="text" 
                            placeholder="Paste Address or ENS (e.g. 0x123...)"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="flex-1 bg-transparent px-4 py-3 text-white placeholder-slate-500 outline-none"
                        />
                        
                        <button 
                            type="submit"
                            disabled={isLoadingData}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoadingData ? (
                                <span className="material-symbols-rounded animate-spin">progress_activity</span>
                            ) : (
                                <span className="material-symbols-rounded">search</span>
                            )}
                            Check
                        </button>
                    </form>

                    <div className="flex justify-center pt-2">
                        <button
                            onClick={handleManualConnect}
                            className="text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-colors border-b border-transparent hover:border-slate-500 pb-0.5"
                        >
                            <span className="material-symbols-rounded text-lg">history_edu</span>
                            Interact with Schema (Connect Wallet)
                        </button>
                    </div>
                </div>

                {/* Popular Schemas Grid */}
                <div className="mt-24 w-full text-left">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
                        <span className="material-symbols-rounded text-indigo-400">verified</span>
                        Popular Schemas to Verify
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {POPULAR_SCHEMAS.map((schema) => (
                            <div key={schema.uid} className="bg-slate-800/30 border border-slate-700/50 p-5 rounded-xl hover:bg-slate-800/50 hover:border-indigo-500/30 transition-all group cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-rounded text-indigo-400 text-sm">open_in_new</span>
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <img src={schema.logoUrl} alt={schema.provider} className="w-10 h-10 rounded-full bg-slate-900 object-cover border border-slate-700" />
                                    <div>
                                        <h4 className="font-bold text-slate-200 text-sm">{schema.name}</h4>
                                        <span className="text-xs text-indigo-400 font-medium">{schema.provider}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-2 mb-4 h-8 leading-relaxed">
                                    {schema.description}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {schema.tags.map(tag => (
                                        <span key={tag} className="text-[10px] uppercase font-bold bg-slate-900/80 text-slate-500 px-2 py-1 rounded border border-slate-700/50">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* VIEW: DASHBOARD (RESULT / INTERACT) */}
        {view === 'DASHBOARD' && (
             <div className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-300">
                <button onClick={goBackToHome} className="mb-6 text-slate-500 hover:text-white flex items-center gap-2 text-sm transition-colors">
                    <span className="material-symbols-rounded">arrow_back</span>
                    Back to Search
                </button>

                {/* Advanced Analytics Box (Only shows if Analysis exists) */}
                {attestations.length > 0 && (
                    <>
                        {isAnalyzing ? (
                            <div className="mb-8 p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl animate-pulse">
                                <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
                                <div className="h-20 bg-slate-700/50 rounded w-full"></div>
                            </div>
                        ) : analysis ? (
                             <div className="mb-8 p-6 bg-slate-800/80 border border-indigo-500/20 rounded-2xl relative overflow-hidden shadow-2xl backdrop-blur-sm animate-in slide-in-from-top-4 duration-500">
                                {/* Background decoration */}
                                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                                        <span className="material-symbols-rounded text-lg">auto_awesome</span> 
                                        Portfolio Analysis
                                    </h3>
                                    {/* Only show badges if real analysis confirms checks (using placeholder logic for now) */}
                                    <div className="flex gap-2 flex-wrap">
                                        <div className="px-2 py-1 bg-indigo-900/50 rounded text-xs text-indigo-200 border border-indigo-500/50 flex items-center gap-1">
                                            <span className="material-symbols-rounded text-[14px]">psychology</span> AI Generated
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                    {/* Left: Text Analysis */}
                                    <div>
                                        <h4 className="text-white font-bold mb-2">Behavioral Insight</h4>
                                        <p className="text-sm text-slate-400 leading-relaxed min-h-[60px]">
                                            {analysis.analysis}
                                        </p>
                                    </div>

                                    {/* Right: Advanced Signals */}
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                        <h5 className="text-xs font-bold text-indigo-300 uppercase mb-4 flex items-center gap-2">
                                            <span className="material-symbols-rounded text-sm">hub</span>
                                            Advanced Signals
                                        </h5>

                                        {/* Identity Cluster */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-400">Identity Segment</span>
                                                <span className="text-indigo-400 font-mono bg-indigo-400/10 px-1.5 rounded">
                                                    {analysis.identityCluster}
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '75%' }}></div>
                                            </div>
                                        </div>

                                        {/* Confidence Score */}
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-400">AI Confidence</span>
                                                <span className="text-emerald-400 font-mono">
                                                    {(analysis.confidenceScore * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-emerald-500 rounded-full" 
                                                    style={{ width: `${analysis.confidenceScore * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </>
                )}

                <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <h2 className="text-xl font-bold text-white">Status</h2>
                        
                        {isLoadingData ? (
                             <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs font-bold uppercase animate-pulse">Loading...</span>
                        ) : attestations.length > 0 ? (
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                                <span className="material-symbols-rounded text-sm">check_circle</span> Verified ({attestations.length})
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-slate-700 text-slate-400 rounded-full text-xs font-bold uppercase">
                                Unverified
                            </span>
                        )}
                    </div>

                    {isLoadingData ? (
                        <div className="py-8 flex justify-center flex-col items-center gap-4">
                            <span className="material-symbols-rounded text-4xl text-slate-600 animate-spin">sync</span>
                            <span className="text-sm text-slate-500">Checking registry...</span>
                        </div>
                    ) : attestations.length > 0 ? (
                         <div className="animate-in slide-in-from-bottom-4 duration-500 relative z-10 grid gap-4">
                            {attestations.map((att) => (
                                <AttestationCard key={att.uid} attestation={att} />
                            ))}
                            <div className="mt-2 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 text-center">
                                <p className="text-slate-300 font-medium text-sm">🎉 Address is verified!</p>
                                <p className="text-slate-500 text-xs mt-1">Found {attestations.length} credential(s) on-chain.</p>
                            </div>
                         </div>
                    ) : (
                        <div className="text-center py-6 relative z-10">
                            <div className="w-16 h-16 bg-slate-900 rounded-full mx-auto mb-4 flex items-center justify-center border border-dashed border-slate-600">
                                <span className="material-symbols-rounded text-3xl text-slate-600">fingerprint</span>
                            </div>
                            <p className="text-slate-300 font-medium mb-1">
                                No credential found
                            </p>
                            <p className="text-slate-500 text-sm px-4">
                                Address <span className="font-mono text-xs bg-slate-900 px-1 py-0.5 rounded text-indigo-400">{targetAddress.slice(0,6)}...{targetAddress.slice(-4)}</span> has not interacted with any popular schemas on {networkType === 'All EVM Rollups' ? 'these networks' : 'this network'}.
                            </p>
                        </div>
                    )}
                </div>

                {/* Only show "Mint" button if the user doesn't have the specific TARGET schema (Base User) */}
                {!hasTargetSchema && (
                    <button 
                        onClick={handleInteract}
                        disabled={txStatus === 'mining'}
                        className={`w-full h-14 font-bold rounded-xl text-lg transition-all shadow-xl flex items-center justify-center gap-2 border ${
                            txStatus === 'mining' 
                            ? 'bg-slate-800 text-slate-400 border-slate-700 cursor-wait' 
                            : 'bg-white text-indigo-600 border-white hover:bg-slate-100 hover:scale-[1.02] active:scale-95'
                        }`}
                    >
                        {txStatus === 'mining' ? (
                            <>
                                <span className="material-symbols-rounded animate-spin">progress_activity</span>
                                Minting on Base...
                            </>
                        ) : !connectedAddress ? (
                            <>
                                <span className="material-symbols-rounded">wallet</span>
                                Connect & Mint Verification
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-rounded">history_edu</span>
                                Mint Verification
                            </>
                        )}
                    </button>
                )}
             </div>
        )}
      </main>
      
      <footer className="py-6 text-center text-slate-600 text-xs border-t border-slate-800/50 mt-auto bg-[#0f172a]">
         <div className="flex justify-center gap-4 mb-2">
             <span className="hover:text-slate-400 cursor-pointer">Privacy</span>
             <span className="hover:text-slate-400 cursor-pointer">Terms</span>
             <span className="hover:text-slate-400 cursor-pointer">Docs</span>
         </div>
         <p className="opacity-50">AH SHOOT &copy; 2024. Powered by Ethereum Attestation Service.</p>
      </footer>
    </div>
  );
};

export default App;
