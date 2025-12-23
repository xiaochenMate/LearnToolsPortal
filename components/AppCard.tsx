
import React from 'react';
import { AppItem } from '../types';
import { Play, ScanSearch } from 'lucide-react';

interface AppCardProps {
  item: AppItem;
  onClick: (item: AppItem) => void;
}

const AppCard: React.FC<AppCardProps> = ({ item, onClick }) => {
  return (
    <div 
      className="group relative bg-slate-800/30 backdrop-blur-md transition-all duration-500 cursor-pointer hover:-translate-y-3"
      onClick={() => onClick(item)}
    >
      <div className="absolute -inset-[2px] bg-gradient-to-br from-emerald-500/20 via-transparent to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 clip-tech-border -z-10"></div>

      <div className="relative h-full flex flex-col clip-tech-border bg-slate-900 border border-slate-800/50 z-10 overflow-hidden">
        
        <div className="relative h-1 w-full bg-slate-800 overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500 w-1/3 animate-[loading_2s_linear_infinite] opacity-50 group-hover:opacity-100"></div>
        </div>

        <div className="relative h-56 w-full overflow-hidden bg-slate-950">
          <img 
            src={item.imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0 opacity-60 group-hover:opacity-100"
            loading="lazy"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
          
          <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-emerald-500/50 group-hover:border-emerald-400"></div>
          <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-emerald-500/50 group-hover:border-emerald-400"></div>
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-emerald-500/50 group-hover:border-emerald-400"></div>
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-emerald-500/50 group-hover:border-emerald-400"></div>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-emerald-500/5 backdrop-blur-[1px]">
              <div className="flex flex-col items-center gap-2">
                 <div className="bg-emerald-500 text-black p-4 clip-button shadow-[0_0_30px_rgba(16,185,129,0.5)] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <Play className="w-8 h-8 fill-black" />
                 </div>
                 <span className="tech-font text-[10px] text-emerald-400 font-black tracking-[0.3em] mt-2 animate-pulse uppercase">启动程序</span>
              </div>
          </div>

          <div className="absolute top-4 right-4 translate-x-12 group-hover:translate-x-0 transition-transform duration-500">
            <span className="px-3 py-1 bg-emerald-500/90 text-black text-[9px] font-black uppercase tracking-widest clip-button tech-font">
              {item.category === 'education' ? '知识网' : item.category === 'entertainment' ? '娱乐区' : '工具箱'}
            </span>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col relative bg-slate-900/50">
          <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-100 tech-font group-hover:text-emerald-400 transition-colors uppercase italic tracking-tight">
                  {item.title}
                </h3>
                <div className="h-0.5 w-12 bg-emerald-500/30 group-hover:w-full transition-all duration-700 mt-1"></div>
              </div>
              <ScanSearch size={18} className="text-slate-700 group-hover:text-emerald-500 transition-colors mt-1" />
          </div>
          
          <p className="text-sm text-slate-400 line-clamp-3 mb-6 flex-1 font-light leading-relaxed italic">
            {item.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-auto">
            {item.tags.map((tag, idx) => (
              <span 
                key={idx} 
                className="inline-block px-3 py-1 text-[9px] font-black text-emerald-300 bg-emerald-950/30 border border-emerald-800/30 rounded-sm uppercase tracking-tighter"
              >
                [{tag}]
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppCard;
