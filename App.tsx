import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AttestationCard } from './components/AttestationCard';
import { TutorialModal } from './components/TutorialModal';
import { CHAINS, POPULAR_SCHEMAS } from './constants';
import { Chain, Attestation, AppView, SchemaDefinition } from './types';
import { fetchAttestations } from './services/easService';
import { resolveEnsName } from './services/ensService';
import { generateTutorial, analyzeAttestationPortfolio, AnalysisResult } from './services/geminiService';
import { Search, Info, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Filter, Gauge, UserCircle2, Loader2, Network, BrainCircuit, Database, Layers, ShieldCheck, Lock, Cpu, Fingerprint } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [view, setView] = useState<AppView>(AppView.EXPLORER);
  const [address, setAddress] = useState<string>('');
  const [resolvedAddress, setResolvedAddress] = useState<string>('');
  
  // Selection is now based on Group Name, not individual chain
  const [selectedGroup, setSelectedGroup] = useState<string>('Optimism Rollups');
  
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string>('');
  
  // Analysis State
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Tutorial State
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [tutorialContent, setTutorialContent] = useState('');
  const [tutorialTitle, setTutorialTitle] = useState('');
  const [isGeneratingTutorial, setIsGeneratingTutorial] = useState(false);
  
  // Filtering
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Derived state
  const categories = ['All', ...Array.from(new Set(POPULAR_SCHEMAS.map(s => s.category)))];
  const filteredSchemas = selectedCategory === 'All' 
    ? POPULAR_SCHEMAS 
    : POPULAR_SCHEMAS.filter(s => s.category === selectedCategory);

  // Get unique group names for the dropdown
  const chainGroups = Array.from(new Set(CHAINS.map(c => c.group)));

  // Handlers
  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!address) return;

    setIsSearching(true);
    setHasSearched(false);
    setAttestations([]); 
    setPortfolioAnalysis(null);
    setResolvedAddress('');
    
    try {
      let targetAddress = address;

      // ENS Resolution (only relevant for EVM)
      if (address.includes('.') && selectedGroup !== 'SVM' && selectedGroup !== 'MoveVM') {
        setSearchStatus('Resolving ENS...');
        const resolved = await resolveEnsName(address);
        if (resolved) {
          targetAddress = resolved;
          setResolvedAddress(resolved);
        } else {
          console.warn("Could not resolve ENS");
        }
      }

      setSearchStatus(`Scanning ${selectedGroup}...`);
      
      // Identify all chains in the selected group
      const targetChains = CHAINS.filter(c => c.group === selectedGroup);
      
      // Fetch from all chains in the group concurrently
      const promises = targetChains.map(chain => fetchAttestations(targetAddress, chain));
      const resultsArray = await Promise.all(promises);
      
      // Flatten results and sort by time
      const allAttestations = resultsArray.flat().sort((a, b) => b.time - a.time);
      
      setAttestations(allAttestations);
      setHasSearched(true);
      
      // Only analyze if we have data
      if (allAttestations.length > 0) {
        setIsAnalyzing(true);
        const names = allAttestations.map(r => r.schemaName || 'Unknown');
        const analysis = await analyzeAttestationPortfolio(names.slice(0, 20));
        setPortfolioAnalysis(analysis);
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error(error);
      setHasSearched(true); 
    } finally {
      setIsSearching(false);
      setSearchStatus('');
    }
  };

  const openTutorial = async (schema: SchemaDefinition) => {
    setTutorialTitle(`Learn: ${schema.name}`);
    setTutorialContent('');
    setIsTutorialOpen(true);
    setIsGeneratingTutorial(true);

    const content = await generateTutorial(schema, selectedGroup);
    setTutorialContent(content);
    setIsGeneratingTutorial(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTagIcon = (tag: string) => {
    if (tag.includes('TEE')) return <Cpu className="w-3 h-3 text-cyan-400" />;
    if (tag.includes('ZK')) return <Lock className="w-3 h-3 text-purple-400" />;
    if (tag.includes('Biometric') || tag.includes('Iris')) return <Fingerprint className="w-3 h-3 text-rose-400" />;
    if (tag.includes('AI')) return <BrainCircuit className="w-3 h-3 text-emerald-400" />;
    return <CheckCircle2 className="w-3 h-3 text-slate-400" />;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col">
      <Navbar currentView={view} setView={setView} />

      {/* EXPLORER VIEW */}
      {view === AppView.EXPLORER && (
        <main className="flex-1 container mx-auto px-4 py-12">
          
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
              Verify On-Chain Reputation
            </h1>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Check identity schemas instantly across <strong>{selectedGroup}</strong> networks. Supporting Coinbase, Gitcoin, World ID, and more.
            </p>

            <div className="bg-slate-800/50 p-2 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
                
                {/* Chain Category Selector */}
                <div className="relative">
                  <select
                    className="w-full md:w-56 h-12 pl-4 pr-8 bg-slate-900 border border-slate-700 rounded-xl text-white appearance-none focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:border-slate-600 transition-colors font-medium"
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                  >
                    {chainGroups.map(group => (
                        <option key={group} value={group}>
                            {group}
                        </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    ▼
                  </div>
                </div>

                {/* Address Input */}
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder="Paste Address or ENS (e.g., vitalik.eth)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-12 pl-4 pr-12 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none hover:border-slate-600 transition-colors"
                  />
                  {address && (
                    <button 
                        type="button"
                        onClick={() => {
                          setAddress('');
                          setResolvedAddress('');
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                        ✕
                    </button>
                  )}
                </div>

                {/* Search Button */}
                <button 
                  type="submit"
                  disabled={isSearching || !address}
                  className="h-12 px-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/25 min-w-[120px]"
                >
                  {isSearching ? (
                    <div className="flex items-center gap-2">
                       <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Check</span>
                    </>
                  )}
                </button>
              </form>
            </div>
            
            {/* Status Feedback */}
            {isSearching && searchStatus && (
                <div className="mt-4 text-indigo-300 text-sm animate-pulse flex justify-center items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> {searchStatus}
                </div>
            )}
          </div>

          {/* Results Section */}
          {hasSearched && (
            <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                    <span className="text-slate-200">Results for</span>
                    <span className="text-indigo-400 font-mono text-base bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
                        {address}
                    </span>
                    </h2>
                    {resolvedAddress && resolvedAddress !== address && (
                        <p className="text-slate-500 text-sm mt-1 ml-1 flex items-center gap-1">
                            Resolved to: <span className="font-mono text-slate-400">{resolvedAddress}</span>
                        </p>
                    )}
                </div>
                <div className="text-slate-400 text-sm">
                    Found {attestations.length} credentials across {selectedGroup}
                </div>
              </div>

              {/* Advanced Analytics Box (Clique/AI/ML) */}
              {attestations.length > 0 && (
                <div className="mb-8 p-6 bg-slate-800/80 border border-indigo-500/20 rounded-2xl relative overflow-hidden shadow-2xl backdrop-blur-sm">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> 
                            Reputation & ML Analysis
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                             <div className="px-2 py-1 bg-indigo-900/50 rounded text-xs text-indigo-200 border border-indigo-500/50 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Clique TEE
                             </div>
                             <div className="px-2 py-1 bg-slate-900/50 rounded text-xs text-slate-400 border border-slate-700 flex items-center gap-1">
                                <Database className="w-3 h-3" /> Dune
                             </div>
                             <div className="px-2 py-1 bg-slate-900/50 rounded text-xs text-slate-400 border border-slate-700 flex items-center gap-1">
                                <Layers className="w-3 h-3" /> Allium
                             </div>
                             <div className="px-2 py-1 bg-slate-900/50 rounded text-xs text-slate-400 border border-slate-700 flex items-center gap-1">
                                <BrainCircuit className="w-3 h-3" /> Chaos Labs
                             </div>
                        </div>
                    </div>

                    {isAnalyzing ? (
                         <div className="flex items-center gap-3 py-12 justify-center text-slate-400 animate-pulse">
                            <Gauge className="w-8 h-8 animate-spin-slow text-indigo-500" />
                            <span className="text-lg">Running TEE Secured ML inference...</span>
                         </div>
                    ) : portfolioAnalysis ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* Col 1: Score & Persona */}
                            <div className="flex flex-col items-center justify-center border-r border-slate-700/50 pr-4">
                                <div className="relative flex items-center justify-center w-32 h-32 mb-4">
                                    <svg className="w-full h-full" viewBox="0 0 36 36">
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#1e293b"
                                            strokeWidth="3"
                                        />
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke={portfolioAnalysis.score >= 80 ? '#4ade80' : portfolioAnalysis.score >= 50 ? '#facc15' : '#f87171'}
                                            strokeWidth="3"
                                            strokeDasharray={`${portfolioAnalysis.score}, 100`}
                                            className="animate-[dash_1s_ease-out]"
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center">
                                        <span className={`text-3xl font-bold ${getScoreColor(portfolioAnalysis.score)}`}>
                                            {portfolioAnalysis.score}
                                        </span>
                                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Score</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <UserCircle2 className="w-5 h-5 text-indigo-400" />
                                    <span className="text-lg font-bold text-white">{portfolioAnalysis.persona}</span>
                                </div>
                            </div>

                            {/* Col 2: Text Analysis */}
                            <div className="lg:col-span-1 flex flex-col justify-center">
                                <h4 className="text-slate-300 font-medium mb-2">Behavioral Insight (TEE Verified)</h4>
                                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                    {portfolioAnalysis.analysis}
                                </p>
                            </div>

                            {/* Col 3: ML Metrics */}
                            <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-700/50">
                                <h4 className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Network className="w-4 h-4" /> Advanced Signals
                                </h4>
                                
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-400">Louvain Cluster</span>
                                            <span className="text-white font-mono text-xs bg-indigo-600/20 px-2 py-0.5 rounded border border-indigo-500/30">
                                                {portfolioAnalysis.louvainCluster || "N/A"}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
                                            <div className="bg-indigo-500 h-full w-2/3 opacity-70"></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-400">LightGBM Confidence</span>
                                            <span className="text-green-400 font-mono">
                                                {(portfolioAnalysis.lightgbmConfidence * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-green-500 h-full transition-all duration-1000" 
                                                style={{ width: `${portfolioAnalysis.lightgbmConfidence * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-slate-700/50 flex gap-2 flex-wrap">
                                        <span className="text-[10px] text-slate-500 uppercase">Verified Sources:</span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-indigo-400" /> Subgraph</span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-indigo-400" /> Dune</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="text-slate-500 text-sm">Analysis unavailable.</div>
                    )}
                </div>
              )}

              {attestations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {attestations.map((att) => (
                    <AttestationCard key={att.uid + att.network} attestation={att} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                  <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-300 mb-2">No Credentials Found</h3>
                  <p className="text-slate-500 max-w-md mx-auto mb-6">
                    This address doesn't have any known credentials on <strong>{selectedGroup}</strong> networks yet.
                  </p>
                  <button 
                    onClick={() => setView(AppView.TUTORIALS)}
                    className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 mx-auto"
                  >
                    Learn how to get verified <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

           {/* Quick Tutorial Links if no search yet */}
           {!hasSearched && (
             <div className="max-w-5xl mx-auto mt-16">
                <h3 className="text-xl font-bold text-slate-300 mb-6 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Popular Schemas to Verify
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {POPULAR_SCHEMAS.slice(0, 3).map(schema => (
                        <div key={schema.uid} className="bg-slate-800/30 border border-slate-700 p-5 rounded-xl hover:border-slate-600 transition-colors">
                            <h4 className="font-semibold text-white mb-2">{schema.name}</h4>
                            <p className="text-sm text-slate-400 mb-4 h-10 line-clamp-2">{schema.description}</p>
                            <button 
                                onClick={() => openTutorial(schema)}
                                className="w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium transition-colors text-white"
                            >
                                View Guide
                            </button>
                        </div>
                    ))}
                </div>
             </div>
           )}
        </main>
      )}

      {/* TUTORIALS VIEW */}
      {view === AppView.TUTORIALS && (
         <main className="flex-1 container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">Verification Center</h1>
                    <p className="text-slate-400">Step-by-step guides to build your on-chain reputation.</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 justify-center">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                selectedCategory === cat 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSchemas.map((schema) => (
                         <div key={schema.uid} className="bg-slate-800/40 border border-slate-700 hover:border-indigo-500/50 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                             <div className="flex justify-between items-start mb-4">
                                 <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded uppercase tracking-wider">
                                    {schema.provider}
                                 </span>
                                 <span className="text-xs text-slate-500 border border-slate-700 px-2 py-1 rounded-full">
                                    {schema.category}
                                 </span>
                             </div>
                             
                             <h3 className="text-xl font-bold text-white mb-2">{schema.name}</h3>
                             <p className="text-slate-400 text-sm mb-6 flex-1">{schema.description}</p>
                             
                             <div className="flex flex-wrap gap-2 mb-6">
                                {schema.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="flex items-center gap-1 text-[10px] text-slate-300 bg-slate-900/80 border border-slate-800 px-2 py-1 rounded">
                                        {getTagIcon(tag)}
                                        {tag}
                                    </span>
                                ))}
                             </div>

                             <button 
                                onClick={() => openTutorial(schema)}
                                className="w-full py-3 rounded-xl bg-slate-700 hover:bg-indigo-600 text-white font-medium transition-colors flex items-center justify-center gap-2"
                             >
                                <Info className="w-4 h-4" />
                                Learn & Verify
                             </button>
                         </div>
                    ))}
                </div>
            </div>
         </main>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-800 py-8 bg-slate-900 mt-auto">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
            <p className="mb-2">EAS Nexus Explorer - Built with React, Tailwind & Gemini AI</p>
            <p>Data provided by EAS GraphQL API (EVM), Dune Analytics & Ecosystem Simulators</p>
        </div>
      </footer>

      {/* Tutorial Modal */}
      <TutorialModal 
        isOpen={isTutorialOpen} 
        onClose={() => setIsTutorialOpen(false)} 
        title={tutorialTitle}
        content={tutorialContent}
        isLoading={isGeneratingTutorial}
      />
    </div>
  );
};

export default App;