
import React from 'react';
import { AppItem } from '../types';
import { Play } from 'lucide-react';

interface AppCardProps {
  item: AppItem;
  onClick: (item: AppItem) => void;
}

const AppCard: React.FC<AppCardProps> = ({ item, onClick }) => {
  return (
    <div 
      className="group relative bg-slate-800/50 backdrop-blur-sm transition-all duration-300 cursor-pointer hover:-translate-y-2"
      onClick={() => onClick(item)}
    >
      {/* Decorative Border Layer */}
      <div className="absolute -inset-[1px] bg-gradient-to-br from-cyan-500/30 via-transparent to-yellow-500/30 opacity-50 group-hover:opacity-100 group-hover:from-cyan-400 group-hover:to-yellow-400 transition-all duration-300 clip-tech-border z-0"></div>

      {/* Main Content Container */}
      <div className="relative h-full flex flex-col clip-tech-border bg-slate-900 z-10 overflow-hidden">
        
        {/* Header Strip */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:from-yellow-400 group-hover:to-orange-500 transition-all duration-500"></div>

        {/* Image Container */}
        <div className="relative h-40 w-full overflow-hidden bg-slate-800">
          <img 
            src={item.imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
            loading="lazy"
          />
          {/* Overlay Grid */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
          
          {/* Holographic Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-yellow-400/90 text-black p-3 clip-button shadow-[0_0_15px_rgba(250,204,21,0.6)] transform scale-0 group-hover:scale-100 transition-transform duration-300">
                  <Play className="w-6 h-6 fill-black" />
              </div>
          </div>

          {/* Category Badge */}
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 bg-black/70 border border-cyan-500/50 text-[10px] text-cyan-400 font-bold uppercase tracking-wider backdrop-blur-md tech-font">
              {item.category === 'education' ? 'EDU-CORE' : item.category === 'entertainment' ? 'FUN-ZONE' : 'TOOL-KIT'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col relative">
          {/* Tech decoration lines */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-slate-700/50 rounded-tr-xl pointer-events-none"></div>

          <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-slate-100 tech-font group-hover:text-yellow-400 transition-colors truncate">
              {item.title}
              </h3>
          </div>
          
          <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1 font-light leading-relaxed">
            {item.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-auto">
            {item.tags.map((tag, idx) => (
              <span 
                key={idx} 
                className="inline-block px-2 py-0.5 text-[10px] font-bold text-cyan-300 bg-cyan-950/50 border border-cyan-800/50 rounded-sm uppercase"
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
