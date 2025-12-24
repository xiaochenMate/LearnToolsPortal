
import React from 'react';
import { Fingerprint, RefreshCcw } from 'lucide-react';

interface AuthUIProps {
  user: { email: string } | null;
}

const AuthUI: React.FC<AuthUIProps> = ({ user }) => {
  const handleRegenerate = () => {
    if (confirm("重新初始化身份将清空当前设备的本地收藏记录，确定吗？")) {
      localStorage.removeItem('zst_identity');
      window.location.reload();
    }
  };

  if (!user) return null;

  // 从格式 GUEST-ABCD@zst.local 中提取编号
  const displayId = user.email.split('@')[0];

  return (
    <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col items-end hidden sm:flex">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest italic">链路激活</span>
        </div>
        <div className="text-xs text-white font-mono font-bold tracking-tighter opacity-80 uppercase">ID: {displayId}</div>
      </div>
      
      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
        <div className="w-10 h-10 bg-slate-800 flex items-center justify-center clip-button">
          <Fingerprint className="text-emerald-500 w-5 h-5" />
        </div>
        <button 
          onClick={handleRegenerate}
          title="重新初始化身份"
          className="w-8 h-10 flex items-center justify-center hover:bg-slate-800 text-slate-600 hover:text-emerald-400 transition-all rounded-lg group"
        >
          <RefreshCcw size={14} className="group-active:rotate-180 transition-transform duration-500" />
        </button>
      </div>
    </div>
  );
};

export default AuthUI;
