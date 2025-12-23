
import React from 'react';

const ActivityTicker: React.FC = () => {
  const activities = [
    "正在链接神经节点_771",
    "同步银河核心数据中",
    "模块已部署: [时钟训练]",
    "连接稳定: 12ms",
    "系统负载: 0.24%",
    "加密密钥已更新",
    "用户_X102_进入模块中心"
  ];

  return (
    <div className="fixed bottom-0 w-full bg-slate-950/40 backdrop-blur-sm border-t border-slate-900 py-1.5 z-[45] overflow-hidden flex items-center">
      <div className="px-6 border-r border-slate-900 text-[9px] font-black tracking-widest uppercase text-emerald-500/50 italic shrink-0">
        系统日志
      </div>
      
      <div className="flex-1 relative overflow-hidden h-3">
        <div className="absolute flex whitespace-nowrap gap-16 animate-[ticker_60s_linear_infinite]">
          {[...activities, ...activities].map((text, i) => (
            <span key={i} className="text-[8px] font-mono text-slate-700 flex items-center gap-3 italic tracking-widest">
              <span className="text-emerald-500/20">{" >> "}</span> {text}
            </span>
          ))}
        </div>
      </div>

      <div className="px-6 flex items-center gap-6 text-slate-800 shrink-0">
        <span className="text-[8px] font-mono uppercase tracking-tighter">状态: 正常</span>
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default ActivityTicker;
