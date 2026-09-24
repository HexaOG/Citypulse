import { useMemo } from 'react';
import { Header } from '../components/Header';
import { CivicMap } from '../components/CivicMap';
import { TimeTravelSlider } from '../components/TimeTravelSlider';
import { Car, AlertCircle, Clock, History, RotateCcw } from 'lucide-react';
import { usePulseStore } from '../store/useStore';
import { getHistoricalTraffic } from '../utils/historicalSimulation';

export const Traffic = () => {
  const events = usePulseStore(state => state.events);
  const replayOffsetHours = usePulseStore(state => state.replayOffsetHours);
  const setReplayOffsetHours = usePulseStore(state => state.setReplayOffsetHours);
  const setIsReplaying = usePulseStore(state => state.setIsReplaying);

  const latestTraffic = useMemo(() => events.slice().reverse().find(e => e.sourceFeed === 'transit'), [events]);
  const liveDelay = latestTraffic?.rawMetrics?.delay_minutes;

  const trafficData = useMemo(() => {
    return getHistoricalTraffic(replayOffsetHours, liveDelay);
  }, [replayOffsetHours, liveDelay]);

  const { congestion, delay, incidents, isCritical, isWarning, synthesis } = trafficData;

  const textColor = isCritical ? 'text-rose-500' : (isWarning ? 'text-amber-500' : 'text-emerald-500');
  const borderColor = isCritical ? 'border-rose-500' : (isWarning ? 'border-amber-500' : 'border-emerald-500');
  const borderOpacity = isCritical ? 'border-rose-500/30' : (isWarning ? 'border-amber-500/30' : 'border-emerald-500/30');
  const borderLeft = isCritical ? 'border-l-rose-500' : (isWarning ? 'border-l-amber-500' : 'border-l-emerald-500');
  const bgOpacity = isCritical ? 'bg-rose-500/20' : (isWarning ? 'bg-amber-500/20' : 'bg-emerald-500/20');

  return (
    <div className="relative w-full h-full">
      <CivicMap />
      
      {/* Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Header />
        
        <div className="absolute top-24 left-24 right-6 flex items-start justify-between pointer-events-none">
          <div className="flex gap-6 items-start w-full">
            {/* Key Metrics Card */}
            <div className="glass-panel p-6 flex flex-col gap-4 w-72 pointer-events-auto">
              <h2 className={`text-xl font-bold tracking-wider mb-2 flex items-center gap-2 ${textColor}`}>
                <Car className={`${textColor}`} /> TRAFFIC STATUS
              </h2>
              
              <div className="flex flex-col items-center justify-center mb-4">
                <div className={`relative w-32 h-32 flex items-center justify-center rounded-full border-4 ${borderOpacity}`}>
                  <div className={`absolute inset-0 rounded-full border-4 ${borderColor} border-t-transparent animate-[spin_3s_linear_infinite]`} />
                  <div className="flex flex-col items-center">
                    <span className={`text-3xl font-bold ${textColor}`}>{congestion}%</span>
                    <span className="text-[10px] tracking-widest text-gray-400">CONGESTION</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="text-xs text-gray-400 flex items-center gap-1 mb-1"><Clock size={12}/> AVG DELAY</div>
                  <div className={`text-lg font-mono font-bold ${textColor}`}>+{delay} mins</div>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="text-xs text-gray-400 flex items-center gap-1 mb-1"><AlertCircle size={12}/> INCIDENTS</div>
                  <div className={`text-lg font-mono font-bold ${textColor}`}>{incidents} Active</div>
                </div>
              </div>
            </div>

            {/* AI Synthesis Banner with Integrated Replay Header */}
            <div className={`glass-panel p-4 flex-1 flex flex-col gap-2.5 border-l-4 ${borderLeft} pointer-events-auto shadow-lg`}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl shrink-0 ${bgOpacity} ${textColor}`}>
                    {replayOffsetHours < 0 ? <History size={18} /> : <Car size={18} />}
                  </div>
                  <div className={`text-xs font-bold tracking-widest ${textColor}`}>
                    {replayOffsetHours < 0 ? 'HISTORICAL TRAFFIC REPLAY' : 'LIVE AI SYNTHESIS'}
                  </div>
                </div>

                {replayOffsetHours < 0 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-semibold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                      </span>
                      <span>
                        SIMULATED REPLAY: <strong className="font-mono text-amber-300">T - {Math.abs(replayOffsetHours)} hrs</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setReplayOffsetHours(0);
                        setIsReplaying(false);
                      }}
                      title="Return to real-time live feed"
                      className="px-3 py-1 text-xs font-bold bg-amber-500/25 hover:bg-amber-400 text-amber-300 hover:text-black rounded-full border border-amber-500/50 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <RotateCcw size={12} />
                      <span>Return to Live ⚡</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-300 leading-relaxed pl-1">
                {synthesis}
              </div>
            </div>
          </div>
        </div>
        
        <TimeTravelSlider />
      </div>
    </div>
  );
};
