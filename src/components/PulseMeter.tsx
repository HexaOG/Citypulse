import { usePulseStore } from '../store/useStore';
import { TrendingDown, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';

export const PulseMeter = () => {
  const chiScore = usePulseStore(state => state.chiScore);
  
  const isCritical = chiScore < 50;
  const isWarning = chiScore >= 50 && chiScore < 80;
  
  const strokeColor = isCritical ? '#f43f5e' : (isWarning ? '#f97316' : '#10b981');
  const textColorClass = isCritical ? 'text-zinc-300' : (isWarning ? 'text-amber-500' : 'text-emerald-500');
  let label = isCritical ? 'CRITICAL' : (isWarning ? 'WARNING' : 'STABLE');
  let TrendIcon = isCritical || isWarning ? TrendingDown : TrendingUp;

  // Calculate SVG stroke dash array for percentage (Max 251.2 for r=40)
  const circumference = 2 * Math.PI * 40;
  const strokeDash = (chiScore / 100) * circumference;

  return (
    <div className="glass-panel p-6 flex flex-col items-center w-64 border-t-2" style={{ borderTopColor: strokeColor }}>
      <div className="flex items-center justify-between w-full mb-6">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono">SYSTEM PULSE</span>
        {isCritical ? <AlertTriangle size={14} className={textColorClass} /> : <CheckCircle2 size={14} className={textColorClass} />}
      </div>
      
      <div className="relative w-44 h-44 flex flex-col items-center justify-center mb-6">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="6"
            className="text-white/5 dark:text-white/5"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke={strokeColor}
            strokeWidth="6"
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className={`text-5xl font-black font-mono tracking-tight ${textColorClass}`}>{chiScore}</span>
        <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${textColorClass}`}>{label}</span>
      </div>
      
      <div className="flex items-center justify-center gap-2 w-full p-2.5 rounded-lg bg-black/20 border border-white/5 text-zinc-400">
        <TrendIcon size={14} className={textColorClass} />
        <span className="text-xs font-mono font-medium">Real-time Index</span>
      </div>
    </div>
  );
};
