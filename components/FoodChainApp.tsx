import React, { useState, useRef } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, ArrowRight, X, Leaf, Info } from 'lucide-react';

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

// 捕食关系图 (key 被 value 吃)
const PREDATOR_PREY_MAP: Record<string, string[]> = {
  'grass': ['rabbit', 'locust'],
  'locust': ['frog'],
  'frog': ['snake', 'eagle'], // 简化
  'rabbit': ['wolf', 'snake', 'eagle'],
  'snake': ['eagle', 'wolf'], // 简化
  'wolf': ['mushroom'], // 死后被分解
  'eagle': ['mushroom'], // 死后被分解
  'mushroom': ['grass'], // 分解物滋养土地(循环逻辑，或仅作为终点)
};

// 宽松的分解者逻辑：所有生物死后都可以被分解
const DECOMPOSER_TARGETS = ['grass', 'locust', 'rabbit', 'frog', 'snake', 'wolf', 'eagle'];

const FoodChainApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [chain, setChain] = useState<Organism[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'neutral' | 'success' | 'error', msg: string }>({
    type: 'neutral',
    msg: '请将左侧生物拖入右侧轨道，构建一条完整的食物链。'
  });
  const [shakingIds, setShakingIds] = useState<number[]>([]); // 存储链中出错的索引
  const [showEnergyFlow, setShowEnergyFlow] = useState(false);

  // --- 拖拽处理 ---
  const handleDragStart = (e: React.DragEvent, organism: Organism) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(organism));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;
    
    try {
      const organism = JSON.parse(data) as Organism;
      setChain(prev => [...prev, organism]);
      setFeedback({ type: 'neutral', msg: '已添加。继续添加或点击验证。' });
      setShowEnergyFlow(false); // 重置动画
      setShakingIds([]); // 重置错误震动
    } catch (err) {
      console.error('Drop error', err);
    }
  };

  // --- 逻辑处理 ---
  const handleRemove = (index: number) => {
    setChain(prev => prev.filter((_, i) => i !== index));
    setFeedback({ type: 'neutral', msg: '节点已移除。' });
    setShowEnergyFlow(false);
    setShakingIds([]);
  };

  const handleReset = () => {
    setChain([]);
    setFeedback({ type: 'neutral', msg: '轨道已清空，请重新开始。' });
    setShowEnergyFlow(false);
    setShakingIds([]);
  };

  const handleVerify = () => {
    if (chain.length < 2) {
      setFeedback({ type: 'error', msg: '食物链太短啦，至少需要两个生物！' });
      return;
    }

    const errors: number[] = [];
    
    // 1. 检查起点 (通常是生产者)
    if (chain[0].role !== 'producer') {
      setFeedback({ type: 'error', msg: '食物链通常从“生产者”（如植物）开始哦！' });
      setShakingIds([0]);
      return;
    }

    // 2. 检查每一环的关系
    let isValid = true;
    let errorMsg = '';

    for (let i = 0; i < chain.length - 1; i++) {
      const current = chain[i];
      const next = chain[i+1];
      
      let canEat = false;

      // 分解者特殊判定
      if (next.role === 'decomposer') {
         if (DECOMPOSER_TARGETS.includes(current.id)) canEat = true;
      } else {
         // 常规捕食判定
         const predators = PREDATOR_PREY_MAP[current.id] || [];
         if (predators.includes(next.id)) canEat = true;
      }

      if (!canEat) {
        isValid = false;
        errors.push(i); // 标记当前节点（被吃者）和下一节点（捕食者）之间的关系错误
        errors.push(i + 1);
        errorMsg = `哎呀！${next.name} 并不吃 ${current.name} 哦。`;
        break; // 发现第一个错误就停止
      }
    }

    if (isValid) {
      setFeedback({ type: 'success', msg: '太棒了！这是一条完美的食物链！能量正在流动！' });
      setShakingIds([]);
      setShowEnergyFlow(true);
      // 3秒后自动关闭动画
      setTimeout(() => setShowEnergyFlow(false), 3000);
    } else {
      setFeedback({ type: 'error', msg: errorMsg });
      setShakingIds(errors);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#051a1a] flex flex-col font-sans text-slate-200 overflow-hidden">
      {/* 顶部导航 */}
      <div className="h-16 bg-[#0a2e2e] border-b border-[#155e5e] flex items-center justify-between px-6 shadow-lg z-20">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/50">
                <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold tracking-wider text-emerald-100 font-orbitron">
              ECO-LOGIC <span className="text-emerald-500 text-sm">BIO ANALYSIS TERMINAL</span>
            </h1>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* 主体内容 */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* 背景网格 */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', 
               backgroundSize: '30px 30px' 
             }}>
        </div>

        {/* 左侧：生物库 */}
        <div className="w-full md:w-80 bg-[#082020]/90 backdrop-blur border-r border-[#155e5e] p-6 flex flex-col z-10 shadow-xl overflow-y-auto">
          <h2 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Info className="w-4 h-4" /> Specimen Library
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {ORGANISMS.map(org => (
              <div
                key={org.id}
                draggable
                onDragStart={(e) => handleDragStart(e, org)}
                className="group relative bg-[#0f3535] border border-[#1e4e4e] rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-emerald-500 hover:bg-[#134040] transition-all flex flex-col items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                <div className="text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform">{org.icon}</div>
                <span className="text-sm font-medium text-slate-300">{org.name}</span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-black/90 border border-emerald-500/50 rounded-lg text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                    <p className="font-bold text-emerald-400 mb-1">{org.role === 'producer' ? '生产者' : org.role === 'decomposer' ? '分解者' : '消费者'}</p>
                    <p>{org.description}</p>
                    {/* 小三角 */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black/90"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-6 text-xs text-slate-500 text-center">
            拖拽生物到右侧区域构建食物链<br/>Drag organisms to the right
          </div>
        </div>

        {/* 右侧：轨道面板 */}
        <div className="flex-1 flex flex-col p-4 md:p-8 relative z-0">
          
          {/* 顶部标题区域 */}
          <div className="mb-6 flex flex-col items-center">
             <h2 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ textShadow: '0 0 10px rgba(16,185,129,0.5)' }}>
               食物链构建器
             </h2>
             <p className={`text-sm font-medium px-4 py-1 rounded-full transition-colors ${
                 feedback.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' :
                 feedback.type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/50' :
                 'bg-slate-700/50 text-slate-400'
             }`}>
                {feedback.msg}
             </p>
          </div>

          {/* 拖放轨道区域 */}
          <div 
             onDragOver={handleDragOver}
             onDrop={handleDrop}
             className="flex-1 bg-black/40 border-2 border-dashed border-[#1e4e4e] rounded-3xl relative flex items-center justify-start px-8 overflow-x-auto overflow-y-hidden no-scrollbar transition-colors hover:border-emerald-500/50 hover:bg-black/50"
          >
             {chain.length === 0 && (
                 <div className="absolute inset-0 flex items-center justify-center text-slate-600 pointer-events-none">
                    <div className="text-center">
                        <p className="text-4xl mb-4 opacity-30">🌱 ➡️ 🐰 ➡️ 🐺</p>
                        <p className="text-lg tracking-widest uppercase">Drop Zone Empty</p>
                    </div>
                 </div>
             )}

             {/* 链条内容 */}
             <div className="flex items-center gap-2 min-w-max mx-auto md:mx-0">
                 {chain.map((item, index) => (
                    <React.Fragment key={`${item.id}-${index}`}>
                        {/* 箭头 */}
                        {index > 0 && (
                            <div className="text-emerald-500/50 flex flex-col items-center justify-center px-2">
                                <ArrowRight className="w-6 h-6 animate-pulse" />
                            </div>
                        )}

                        {/* 生物卡片 */}
                        <div className={`
                            relative group w-24 h-32 md:w-28 md:h-36 bg-[#0f2525] border-2 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg transition-all
                            ${shakingIds.includes(index) ? 'border-red-500 animate-[shake_0.5s_ease-in-out]' : 'border-emerald-500/30'}
                        `}>
                            {/* 移除按钮 */}
                            <button 
                                onClick={() => handleRemove(index)}
                                className="absolute -top-2 -right-2 bg-slate-700 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all scale-75 hover:scale-100 z-10"
                            >
                                <X className="w-3 h-3" />
                            </button>

                            <div className="text-4xl filter drop-shadow-xl">{item.icon}</div>
                            <div className="text-center">
                                <div className="text-sm font-bold text-slate-200">{item.name}</div>
                                <div className="text-[10px] text-emerald-400/70 uppercase scale-90">{item.role}</div>
                            </div>

                            {/* 能量流动遮罩动画 */}
                            {showEnergyFlow && (
                                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                                    <div 
                                        className="w-full h-full bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"
                                        style={{ 
                                            animation: `energyFlow 1s linear forwards`, 
                                            animationDelay: `${index * 0.3}s`,
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

          {/* 底部控制栏 */}
          <div className="mt-6 flex justify-center gap-4">
              <button 
                onClick={handleReset}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold flex items-center gap-2 transition-transform active:scale-95 border border-slate-600"
              >
                  <RefreshCw className="w-5 h-5" />
                  重置 / Reset
              </button>
              
              <button 
                onClick={handleVerify}
                disabled={chain.length < 2}
                className={`
                    px-8 py-3 rounded-xl font-bold flex items-center gap-2 text-lg shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all
                    ${chain.length < 2 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105 border border-emerald-400'
                    }
                `}
              >
                  <CheckCircle className="w-6 h-6" />
                  验证顺序 / Verify
              </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px) rotate(-5deg); }
          75% { transform: translateX(5px) rotate(5deg); }
        }
        @keyframes energyFlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default FoodChainApp;