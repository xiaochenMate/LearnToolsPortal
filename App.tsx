
import React, { useState, useEffect } from 'react';
import { EDUCATION_ITEMS, ENTERTAINMENT_ITEMS, UTILITIES_ITEMS } from './constants';
import { AppItem, Category } from './types';
import { supabase } from './lib/supabase';
import AppCard from './components/AppCard';
import Modal from './components/Modal';
import Earth3D from './components/Earth3D';
import FoodChainApp from './components/FoodChainApp';
import CharacterApp from './components/CharacterApp';
import ClockApp from './components/ClockApp';
import PoetryApp from './components/PoetryApp'; // 新增导入
import HeroSpotlight from './components/HeroSpotlight';
import ActivityTicker from './components/ActivityTicker';
import AuthUI from './components/AuthUI';
import { Search, Cpu, Loader2, Zap, Terminal, User, LayoutGrid, Sparkles, Filter } from 'lucide-react';

const App: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<AppItem | null>(null);
  const [runningAppId, setRunningAppId] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(false);
  const [bootingAppTitle, setBootingAppTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  
  const [allModules, setAllModules] = useState<AppItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const staticModules = [...EDUCATION_ITEMS, ...ENTERTAINMENT_ITEMS, ...UTILITIES_ITEMS];

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) setShowAuthModal(false);
      });
    }
    fetchModules();
  }, []);

  const fetchModules = async () => {
    setIsLoading(true);
    if (!supabase) {
      setAllModules(staticModules);
      setIsLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.from('modules').select('*');
      if (data && !error && data.length > 0) {
        setAllModules(data as any);
      } else {
        setAllModules(staticModules);
      }
    } catch (e) {
      setAllModules(staticModules);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredModules = allModules.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || item.category.toUpperCase() === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRunApp = (item: AppItem) => {
    setSelectedItem(null); 
    setBootingAppTitle(item.title);
    setIsBooting(true);
    setTimeout(() => {
      setIsBooting(false);
      setRunningAppId(item.id);
    }, 1200);
  };

  if (isBooting) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 bg-emerald-500 clip-tech-border flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(16,185,129,0.3)]">
            <Cpu className="w-12 h-12 text-black animate-spin" />
          </div>
        </div>
        <h2 className="mt-8 text-xl font-black tech-font text-white italic tracking-widest uppercase">Initializing_Link: {bootingAppTitle}</h2>
        <div className="mt-4 w-48 h-1 bg-slate-900 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 animate-[loading_1.2s_linear_infinite]"></div>
        </div>
        <style>{`@keyframes loading { 0% { width: 0%; } 100% { width: 100%; } }`}</style>
      </div>
    );
  }

  // 应用分发逻辑
  if (runningAppId === 'e1') return <Earth3D onClose={() => setRunningAppId(null)} />;
  if (runningAppId === 'e2') return <FoodChainApp onClose={() => setRunningAppId(null)} />;
  if (runningAppId === 'e4') return <CharacterApp onClose={() => setRunningAppId(null)} />;
  if (runningAppId === 'e7') return <ClockApp onClose={() => setRunningAppId(null)} />;
  if (runningAppId === 'e5') return <PoetryApp onClose={() => setRunningAppId(null)} />; // 挂载古诗模块

  if (runningAppId) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center">
        <Terminal className="w-16 h-16 text-emerald-500 mb-4 opacity-50" />
        <h1 className="text-2xl font-bold text-white mb-2 tech-font uppercase">STANDBY_MODE</h1>
        <p className="text-slate-500 mb-8 font-mono text-xs tracking-widest">MODULE: {runningAppId}</p>
        <button onClick={() => setRunningAppId(null)} className="px-8 py-3 border border-red-500/50 text-red-500 hover:bg-red-600 hover:text-white transition-all font-black tracking-[0.2em] uppercase italic">Abort_Process</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300">
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveCategory('ALL')}>
            <div className="w-10 h-10 bg-emerald-500 flex items-center justify-center clip-button">
              <Cpu className="text-black w-6 h-6" />
            </div>
            <span className="text-2xl font-black italic tech-font text-white tracking-tighter uppercase">Zst_Portal</span>
          </div>

          <div className="hidden lg:flex items-center gap-8 bg-slate-900/50 px-6 py-2 border border-slate-800 rounded-full">
            {['ALL', 'EDUCATION', 'ENTERTAINMENT', 'UTILITIES'].map(cat => (
              <button 
                key={cat} onClick={() => setActiveCategory(cat)}
                className={`text-[10px] font-black tracking-widest transition-all ${activeCategory === cat ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-400'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" placeholder="GLOBAL_SEARCH..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-2.5 bg-slate-900 border border-slate-800 text-xs font-mono focus:outline-none focus:border-emerald-500 w-56 transition-all focus:w-72"
              />
            </div>
            {user ? <AuthUI user={user} onClose={() => setShowAuthModal(false)} /> : (
              <button onClick={() => setShowAuthModal(true)} className="text-[10px] font-black uppercase text-emerald-500 border border-emerald-500/20 px-6 py-2.5 hover:bg-emerald-500 hover:text-black transition-all">Link_Identity</button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {!searchQuery && activeCategory === 'ALL' && allModules.length > 0 && (
          <HeroSpotlight item={allModules.find(m => m.id === 'e7') || allModules[0]} onRun={handleRunApp} />
        )}

        <div className="flex items-center gap-4 mb-10 border-b border-slate-900 pb-6">
          <LayoutGrid className="text-emerald-500 w-5 h-5" />
          <h2 className="text-2xl font-black text-white tech-font uppercase tracking-tight italic">Deployed_Modules / {activeCategory}</h2>
          {isLoading && <Loader2 className="animate-spin text-emerald-500 w-5 h-5 ml-auto" />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredModules.map(item => <AppCard key={item.id} item={item} onClick={setSelectedItem} />)}
        </div>

        {filteredModules.length === 0 && !isLoading && (
          <div className="py-40 text-center border border-dashed border-slate-800 rounded-2xl">
            <Terminal className="mx-auto text-slate-800 w-12 h-12 mb-4" />
            <h3 className="text-white font-black tech-font uppercase">Dataset_Empty</h3>
            <p className="text-slate-600 font-mono text-xs mt-2 italic">No modules matched the current protocol filters.</p>
          </div>
        )}
      </main>

      <ActivityTicker />
      {selectedItem && <Modal item={selectedItem} onClose={() => setSelectedItem(null)} onRun={handleRunApp} />}
      {showAuthModal && <AuthUI user={user} onClose={() => setShowAuthModal(false)} />}
    </div>
  );
};

export default App;
