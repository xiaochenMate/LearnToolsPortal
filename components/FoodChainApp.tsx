
import React, { useState } from 'react';
import { RefreshCw, CheckCircle, ArrowRight, X, Leaf, Info } from 'lucide-react';

// --- 类型定义 ---
interface Organism {
  id: string;
  name: string;
  icon: string;
  role: 'producer' | 'consumer' | 'decomposer';
  description: string;
}

// --- 数据配置 ---
const ORGANISMS: Organism[] = [
  { id: 'grass', name: '草', icon: '🌱', role: 'producer', description: '生产者：通过光合作用制造能量' },
  { id: 'mushroom', name: '蘑菇', icon: '🍄', role: 'decomposer', description: '分解者：分解动植物遗体' },
  { id: 'locust', name: '蝗虫', icon: '🦗', role: 'consumer', description: '初级消费者：以植物为食' },
  { id: 'rabbit', name: '兔子', icon: '🐰', role: 'consumer', description: '初级消费者：喜爱吃草' },
  { id: 'frog', name: '青蛙', icon: '🐸', role: 'consumer', description: '次级消费者：捕食昆虫' },
  { id: 'snake', name: '蛇', icon: '🐍', role: 'consumer', description: '三级消费者：捕食小型动物' },
  { id: 'wolf', name: '狼', icon: '🐺', role: 'consumer', description: '顶级掠食者：捕食草食动物' },
  { id: 'eagle', name: '老鹰', icon: '🦅', role: 'consumer', description: '顶级掠食者：空中捕猎' },
];

const PREDATOR_PREY_MAP: Record<string, string[]> = {
  'grass': ['rabbit', 'locust'],
  'locust': ['frog'],
  'frog': ['snake', 'eagle'],
  'rabbit': ['wolf', 'snake', 'eagle'],
  'snake': ['eagle', 'wolf'],
  'wolf': ['mushroom'],
  'eagle': ['mushroom'],
  'mushroom': ['grass'],
};

const DECOMPOSER_TARGETS = ['grass', 'locust', 'rabbit', 'frog', 'snake', 'wolf', 'eagle'];

const FoodChainApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [chain, setChain] = useState<Organism[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'neutral' | 'success' | 'error', msg: string }>({
    type: 'neutral',
    msg: '请将生物加入轨道，构建完整食物链。'
  });
  const [shakingIds, setShakingIds] = useState<number[]>([]);
  const [showEnergyFlow, setShowEnergyFlow] = useState(false);

  // --- 交互处理 ---
  const handleDragStart = (e: React.DragEvent, organism: Organism) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(organism));
  };

  // 兼容移动端点击添加
  const handleAddClick = (organism: Organism) => {
    setChain(prev => [...prev, organism]);
    setFeedback({ type: 'neutral', msg: '已添加节点。' });
    setShowEnergyFlow(false);
    setShakingIds([]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;
    try {
      const organism = JSON.parse(data) as Organism;
      handleAddClick(organism);
    } catch (err) {
      console.error('Drop error', err);
    }
  };

  const handleRemove = (index: number) => {
    setChain(prev => prev.filter((_, i) => i !== index));
    setShowEnergyFlow(false);
    setShakingIds([]);
  };

  const handleReset = () => {
    setChain([]);
    setFeedback({ type: 'neutral', msg: '轨道已清空。' });
    setShowEnergyFlow(false);
    setShakingIds([]);
  };

  const handleVerify = () => {
    if (chain.length < 2) {
      setFeedback({ type: 'error', msg: '链条太短，至少需要两个生物！' });
      return;
    }
    if (chain[0].role !== 'producer') {
      setFeedback({ type: 'error', msg: '食物链应从生产者（如植物）开始。' });
      setShakingIds([0]);
      return;
    }
    let isValid = true;
    let errorMsg = '';
    const errors: number[] = [];

    for (let i = 0; i < chain.length - 1; i++) {
      const current = chain[i];
      const next = chain[i+1];
      let canEat = false;
      if (next.role === 'decomposer') {
         if (DECOMPOSER_TARGETS.includes(current.id)) canEat = true;
      } else {
         const predators = PREDATOR_PREY_MAP[current.id] || [];
         if (predators.includes(next.id)) canEat = true;
      }
      if (!canEat) {
        isValid = false;
        errors.push(i, i + 1);
        errorMsg = `${next.name} 不以 ${current.name} 为食。`;
        break;
      }
    }

    if (isValid) {
      setFeedback({ type: 'success', msg: '完美构建！能量正在流动。' });
      setShowEnergyFlow(true);
      setTimeout(() => setShowEnergyFlow(false), 3000);
    } else {
      setFeedback({ type: 'error', msg: errorMsg });
      setShakingIds(errors);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#051a1a] flex flex-col font-sans text-slate-200 overflow-hidden">
      {/* 顶部导航 - 移动端高度优化 */}
      <header className="h-14 sm:h-16 bg-[#0a2e2e] border-b border-[#155e5e] flex items-center justify-between px-4 sm:px-6 shadow-lg z-20 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            <div className="p-1.5 bg-emerald-500/20 rounded-lg border border-emerald-500/50 shrink-0">
                <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <h1 className="text-sm sm:text-xl font-bold tracking-wider text-emerald-100 font-orbitron truncate uppercase">
              Eco-Logic <span className="hidden sm:inline text-emerald-500 text-xs ml-2 tracking-widest opacity-60">Terminal</span>
            </h1>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>

        {/* 生物库 - 移动端改为顶部横向滑动区域 */}
        <aside className="w-full md:w-72 bg-[#082020]/90 backdrop-blur border-b md:border-b-0 md:border-r border-[#155e5e] p-3 sm:p-5 flex flex-col z-10 shadow-xl shrink-0 max-h-[35%] md:max-h-none">
          <div className="flex items-center justify-between mb-2 md:mb-4 px-1">
            <h2 className="text-[10px] sm:text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
              <Info className="w-3 h-3 sm:w-4 sm:h-4" /> 样本库
            </h2>
            <span className="hidden md:inline text-[9px] text-slate-500 italic">点击或拖拽添加</span>
          </div>
          
          <div className="flex md:grid md:grid-cols-2 gap-2 sm:gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-0 touch-pan-x">
            {ORGANISMS.map(org => (
              <div
                key={org.id}
                draggable
                onDragStart={(e) => handleDragStart(e, org)}
                onClick={() => handleAddClick(org)}
                className="group relative flex-shrink-0 w-20 h-24 sm:w-24 sm:h-28 md:w-auto md:h-auto bg-[#0f3535] border border-[#1e4e4e] rounded-xl p-2 sm:p-3 cursor-pointer hover:border-emerald-500 hover:bg-[#134040] transition-all flex flex-col items-center justify-center gap-1 sm:gap-2 active:scale-95 shadow-md"
              >
                <div className="text-3xl sm:text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform">{org.icon}</div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-300 truncate w-full text-center">{org.name}</span>
                
                {/* 桌面端 Tooltip */}
                <div className="hidden md:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-2 bg-black/90 border border-emerald-500/50 rounded-lg text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                    <p className="font-bold text-emerald-400 mb-0.5">{org.role === 'producer' ? '生产者' : org.role === 'decomposer' ? '分解者' : '消费者'}</p>
                    <p className="line-clamp-2">{org.description}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* 轨道面板 */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-10 relative overflow-hidden">
          
          <div className="mb-4 sm:mb-8 flex flex-col items-center shrink-0">
             <h2 className="text-xl sm:text-3xl font-black text-white mb-2 tech-font tracking-tight uppercase italic" style={{ textShadow: '0 0 15px rgba(16,185,129,0.4)' }}>
               食物链重构区
             </h2>
             <div className={`text-[10px] sm:text-xs font-bold px-4 py-1.5 rounded-full transition-all border ${
                 feedback.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' :
                 feedback.type === 'error' ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse' :
                 'bg-slate-800/80 text-slate-400 border-slate-700'
             }`}>
                {feedback.msg}
             </div>
          </div>

          <div 
             onDragOver={handleDragOver}
             onDrop={handleDrop}
             className="flex-1 bg-black/40 border-2 border-dashed border-[#1e4e4e] rounded-3xl relative flex items-center justify-start px-6 overflow-x-auto no-scrollbar transition-all group"
          >
             {chain.length === 0 && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600/40 pointer-events-none">
                    <Leaf size={48} className="mb-4 opacity-10" />
                    <p className="text-xs sm:text-sm font-black uppercase tracking-[0.3em]">待构建区域 / Empty Field</p>
                 </div>
             )}

             <div className="flex items-center gap-1 sm:gap-2 min-w-max mx-auto px-4">
                 {chain.map((item, index) => (
                    <React.Fragment key={`${item.id}-${index}`}>
                        {index > 0 && (
                            <div className="text-emerald-500/30 flex items-center justify-center px-1 sm:px-2">
                                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                            </div>
                        )}

                        <div className={`
                            relative w-20 h-28 sm:w-28 sm:h-36 bg-[#0f2525] border-2 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-xl transition-all
                            ${shakingIds.includes(index) ? 'border-red-500 animate-[shake_0.5s_ease-in-out]' : 'border-emerald-500/20'}
                        `}>
                            <button 
                                onClick={() => handleRemove(index)}
                                className="absolute -top-1.5 -right-1.5 bg-slate-800 border border-slate-700 hover:bg-red-500 text-white rounded-full p-1.5 shadow-lg z-10"
                            >
                                <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>

                            <div className="text-3xl sm:text-4xl filter drop-shadow-xl">{item.icon}</div>
                            <div className="text-center px-1">
                                <div className="text-[10px] sm:text-xs font-black text-slate-200 truncate w-full">{item.name}</div>
                                <div className="text-[8px] sm:text-[9px] text-emerald-500/50 uppercase tracking-tighter mt-0.5">{item.role}</div>
                            </div>

                            {showEnergyFlow && (
                                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                                    <div 
                                        className="w-full h-full bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent"
                                        style={{ 
                                            animation: `energyFlow 1.2s ease-in-out forwards`, 
                                            animationDelay: `${index * 0.2}s`,
                                            transform: 'translateX(-100%)'
                                        }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    </React.Fragment>
                 ))}
             </div>
          </div>

          <footer className="mt-4 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 shrink-0 pb-[env(safe-area-inset-bottom)]">
              <button 
                onClick={handleReset}
                className="order-2 sm:order-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border border-slate-700"
              >
                  <RefreshCw className="w-4 h-4" />
                  重置系统
              </button>
              
              <button 
                onClick={handleVerify}
                disabled={chain.length < 2}
                className={`
                    order-1 sm:order-2 px-8 py-3 sm:py-4 rounded-xl font-black flex items-center justify-center gap-3 text-sm sm:text-base shadow-2xl transition-all
                    ${chain.length < 2 
                        ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-800' 
                        : 'bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-105 active:scale-95'
                    }
                `}
              >
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  验证逻辑链条
              </button>
          </footer>
        </div>
      </main>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px) rotate(-1deg); }
          40% { transform: translateX(4px) rotate(1deg); }
          60% { transform: translateX(-4px) rotate(-1deg); }
          80% { transform: translateX(4px) rotate(1deg); }
        }
        @keyframes energyFlow {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        .tech-font { font-family: 'Orbitron', sans-serif; }
      `}</style>
    </div>
  );
};

export default FoodChainApp;
