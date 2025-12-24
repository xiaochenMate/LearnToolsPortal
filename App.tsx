
import React, { useState, useEffect } from 'react';
import { EDUCATION_ITEMS, ENTERTAINMENT_ITEMS, UTILITIES_ITEMS } from './constants';
import { AppItem } from './types';
import AppCard from './components/AppCard';
import Modal from './components/Modal';
import Earth3D from './components/Earth3D';
import FoodChainApp from './components/FoodChainApp';
import CharacterApp from './components/CharacterApp';
import ClockApp from './components/ClockApp';
import WaveApp from './components/WaveApp';
import MathSprintApp from './components/MathSprintApp';
import HistorySortingApp from './components/HistorySortingApp';
import BrainTeaseApp from './components/BrainTeaseApp';
import GobangApp from './components/GobangApp';
import PixelArtApp from './components/PixelArtApp';
import ChineseChessApp from './components/ChineseChessApp';
import ProArtApp from './components/ProArtApp';
import VocabularyApp from './components/VocabularyApp';
import IdiomApp from './components/IdiomApp';
import HeroSpotlight from './components/HeroSpotlight';
import ActivityTicker from './components/ActivityTicker';
import AuthUI from './components/AuthUI';
import { Search, Cpu, Loader2, Terminal, LayoutGrid, Book, Gamepad2, Settings } from 'lucide-react';
import sql from './lib/neon';

const App: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<AppItem | null>(null);
  const [runningAppId, setRunningAppId] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(false);
  const [bootingAppTitle, setBootingAppTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  
  const [allModules, setAllModules] = useState<AppItem[]>([]);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const staticModules = [...EDUCATION_ITEMS, ...ENTERTAINMENT_ITEMS, ...UTILITIES_ITEMS];

  useEffect(() => {
    const initIdentity = async () => {
      let identity = null;
      const saved = localStorage.getItem('zst_identity');
      
      if (saved) {
        identity = JSON.parse(saved);
      } else {
        const randomId = Math.random().toString(16).slice(2, 6).toUpperCase();
        identity = { email: `GUEST-${randomId}@zst.local` };
        localStorage.setItem('zst_identity', JSON.stringify(identity));
      }
      
      setUser(identity);

      if (sql && identity) {
        try {
          await sql`
            INSERT INTO portal_users (email) 
            VALUES (${identity.email}) 
            ON CONFLICT (email) DO NOTHING
          `;
        } catch (e) {
          console.warn("[Identity Sync] Offline or DB unavailable");
        }
      }
    };

    initIdentity();
    setAllModules(staticModules);
    setIsLoading(false);
  }, []);

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

  const categories = [
    { id: 'ALL', label: '全部', icon: LayoutGrid },
    { id: 'EDUCATION', label: '知识', icon: Book },
    { id: 'ENTERTAINMENT', label: '娱乐', icon: Gamepad2 },
    { id: 'UTILITIES', label: '工具', icon: Settings },
  ];

  if (isBooting) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-500 clip-tech-border flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(16,185,129,0.3)]">
            <Cpu className="w-10 h-10 md:w-12 md:h-12 text-black animate-spin" />
          </div>
        </div>
        <h2 className="mt-8 text-center text-lg md:text-xl font-black tech-font text-white italic tracking-widest uppercase">
          初始化链路: {bootingAppTitle}
        </h2>
        <div className="mt-6 w-48 h-1 bg-slate-900 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 animate-[loading_1.2s_linear_infinite]"></div>
        </div>
      </div>
    );
  }

  const renderApp = () => {
    switch (runningAppId) {
      case 'e1': return <Earth3D onClose={() => setRunningAppId(null)} />;
      case 'e2': return <FoodChainApp onClose={() => setRunningAppId(null)} />;
      case 'e3': return <WaveApp onClose={() => setRunningAppId(null)} />;
      case 'e4': return <CharacterApp onClose={() => setRunningAppId(null)} />;
      case 'e6': return <HistorySortingApp onClose={() => setRunningAppId(null)} />;
      case 'e7': return <ClockApp onClose={() => setRunningAppId(null)} />;
      case 'e18': return <MathSprintApp onClose={() => setRunningAppId(null)} />;
      case 'ent3': return <BrainTeaseApp onClose={() => setRunningAppId(null)} />;
      case 'ent4': return <GobangApp onClose={() => setRunningAppId(null)} />;
      case 'ent5': return <ChineseChessApp onClose={() => setRunningAppId(null)} />;
      case 'ent1': return <PixelArtApp onClose={() => setRunningAppId(null)} />;
      case 'u1': return <ProArtApp onClose={() => setRunningAppId(null)} />;
      case 'u2': return <VocabularyApp onClose={() => setRunningAppId(null)} userEmail={user?.email} />;
      case 'u3': return <IdiomApp onClose={() => setRunningAppId(null)} />;
      default: return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6">
          <Terminal className="w-12 h-12 text-emerald-500 mb-4 opacity-50" />
          <h1 className="text-xl font-bold text-white mb-2 tech-font uppercase">系统待机模式</h1>
          <p className="text-slate-500 mb-8 font-mono text-[10px] tracking-widest uppercase">ID: {runningAppId} / IN_DEV</p>
          <button onClick={() => setRunningAppId(null)} className="w-full max-w-xs py-4 border border-red-500/50 text-red-500 font-black tracking-[0.2em] uppercase italic clip-button">终止进程</button>
        </div>
      );
    }
  };

  if (runningAppId) return renderApp();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 pb-24 md:pb-20">
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/50 pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-4 cursor-pointer" onClick={() => setActiveCategory('ALL')}>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500 flex items-center justify-center clip-button">
              <Cpu className="text-black w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-lg md:text-2xl font-black italic tech-font text-white tracking-tighter uppercase truncate max-w-[120px] md:max-w-none">知识通</span>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" placeholder="搜索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-2.5 bg-slate-900 border border-slate-800 text-xs font-mono focus:outline-none focus:border-emerald-500 w-32 transition-all focus:w-64"
              />
            </div>
            <AuthUI user={user} />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {!searchQuery && activeCategory === 'ALL' && allModules.length > 0 && (
          <HeroSpotlight item={allModules.find(m => m.id === 'ent5') || allModules[0]} onRun={handleRunApp} />
        )}

        <div className="flex flex-col gap-6 mb-10 md:mb-12 border-b border-slate-900 pb-6 md:pb-8">
          <div className="flex items-center gap-3">
             <LayoutGrid className="text-emerald-500 w-4 h-4 md:w-5 md:h-5" />
             <h2 className="text-lg md:text-2xl font-black text-white tech-font uppercase tracking-tight italic">已部署模块</h2>
          </div>

          <div className="flex bg-slate-900/40 p-1 rounded-xl border border-slate-800/50 backdrop-blur-sm overflow-x-auto no-scrollbar touch-pan-x">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`
                    flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-[10px] md:text-[11px] font-black tech-font uppercase tracking-widest transition-all duration-300 whitespace-nowrap
                    ${isActive 
                      ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
                  `}
                >
                  <Icon size={14} className={isActive ? 'text-black' : 'text-slate-500'} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredModules.length > 0 ? (
            filteredModules.map(item => <AppCard key={item.id} item={item} onClick={setSelectedItem} />)
          ) : (
            <div className="col-span-full py-16 flex flex-col items-center opacity-30">
              <Loader2 className="w-10 h-10 mb-4 animate-spin" />
              <p className="tech-font text-[10px] uppercase tracking-widest text-center">当前扇区未发现匹配模块</p>
            </div>
          )}
        </div>
      </main>

      <ActivityTicker />
      {selectedItem && (
        <Modal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onRun={handleRunApp} 
          user={user} 
        />
      )}
    </div>
  );
};

export default App;
