
import React from 'react';
import { Play, ShieldCheck } from 'lucide-react';
import { AppItem } from '../types';

interface HeroSpotlightProps {
  item: AppItem;
  onRun: (item: AppItem) => void;
}

const HeroSpotlight: React.FC<HeroSpotlightProps> = ({ item, onRun }) => {
  return (
    <div className="relative w-full h-[460px] mb-16 rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl group">
      <div className="absolute inset-0 bg-slate-950">
        <img 
          src={item.imageUrl} 
          alt={item.title} 
          className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-[20s] linear"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>

      <div className="relative h-full flex items-center px-12">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest clip-button shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              主同步
            </span>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck size={14} /> 链接已验证
            </div>
          </div>

          <h1 className="text-6xl font-black text-white tech-font mb-6 italic tracking-tighter leading-none uppercase">
            {item.title}
          </h1>

          <p className="text-slate-400 text-lg mb-10 font-light leading-relaxed border-l border-slate-800 pl-6 italic">
            {item.description}
          </p>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => onRun(item)}
              className="px-10 py-4 bg-white text-black font-black flex items-center gap-4 clip-button hover:bg-emerald-500 transition-all active:scale-95 shadow-xl group/btn"
            >
              <Play className="w-5 h-5 fill-current group-hover/btn:translate-x-1 transition-transform" />
              启动模块
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 right-12 hidden lg:flex flex-col items-end gap-2 opacity-30 pointer-events-none">
        <div className="flex gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`w-3 h-1 ${i < 3 ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
          ))}
        </div>
        <div className="text-[9px] font-mono text-emerald-400 uppercase tracking-[0.3em]">量子链接: 安全</div>
        <div className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.3em]">编号: 模块_{item.id.toUpperCase()}</div>
      </div>
    </div>
  );
};

export default HeroSpotlight;
