import { usePulseStore } from '../store/useStore';
import { Activity } from 'lucide-react';

export const SituationBriefing = () => {
  const narrative = usePulseStore(state => state.narrative);
  const chiScore = usePulseStore(state => state.chiScore);
  
  const isCritical = chiScore < 50;
  const isWarning = chiScore >= 50 && chiScore < 80;

  return (
    <div className={`glass-panel p-5 flex items-center gap-5 flex-grow border-l-4`} style={{ borderLeftColor: `var(--tw-colors-${isCritical ? 'rose' : (isWarning ? 'amber' : 'emerald')}-500, ${isCritical ? '#f43f5e' : (isWarning ? '#f97316' : '#10b981')})` }}>
      <div className="shrink-0 p-3 rounded-full bg-white/5 border border-white/10" style={{ color: `var(--tw-colors-${isCritical ? 'rose' : (isWarning ? 'amber' : 'emerald')}-500, ${isCritical ? '#f43f5e' : (isWarning ? '#f97316' : '#10b981')})` }}>
        <Activity size={24} />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="text-[10px] font-bold tracking-widest uppercase font-mono" style={{ color: `var(--tw-colors-${isCritical ? 'rose' : (isWarning ? 'amber' : 'emerald')}-500, ${isCritical ? '#f43f5e' : (isWarning ? '#f97316' : '#10b981')})` }}>
          LIVE AI SYNTHESIS
        </div>
        <div className="text-sm text-zinc-300 leading-relaxed font-medium">
          "{narrative}"
        </div>
      </div>
    </div>
  );
};
