import { useMemo } from 'react';
import { Header } from '../components/Header';
import { CivicMap } from '../components/CivicMap';
import { TimeTravelSlider } from '../components/TimeTravelSlider';
import { CloudRain, Wind, Droplets, History, RotateCcw } from 'lucide-react';
import { usePulseStore } from '../store/useStore';
import { getHistoricalWeather } from '../utils/historicalSimulation';

export const Weather = () => {
  const events = usePulseStore(state => state.events);
  const replayOffsetHours = usePulseStore(state => state.replayOffsetHours);
  const setReplayOffsetHours = usePulseStore(state => state.setReplayOffsetHours);
  const setIsReplaying = usePulseStore(state => state.setIsReplaying);

  const latestWeather = useMemo(() => events.slice().reverse().find(e => e.sourceFeed === 'weather'), [events]);
  
  const weatherData = useMemo(() => {
    return getHistoricalWeather(replayOffsetHours, {
      temp: latestWeather?.rawMetrics?.temperature,
      precip: latestWeather?.rawMetrics?.precipitation,
      wind: latestWeather?.rawMetrics?.windSpeed,
      condition: latestWeather?.category
    });
  }, [replayOffsetHours, latestWeather]);

  const { temp, precip, wind, condition, synthesis } = weatherData;

  const isRain = precip > 2;
  const isStorm = precip > 6;
  const themeColor = isStorm ? 'text-amber-400' : (isRain ? 'text-cyan-400' : 'text-emerald-500');
  const borderLeft = isStorm ? 'border-l-amber-500' : (isRain ? 'border-l-cyan-500' : 'border-l-emerald-500');
  const bgOpacity = isStorm ? 'bg-amber-500/20' : (isRain ? 'bg-cyan-500/20' : 'bg-emerald-500/20');

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
              <h2 className={`text-xl font-bold tracking-wider mb-2 flex items-center gap-2 ${themeColor}`}>
                <CloudRain className={themeColor} /> METEOROLOGY
              </h2>
              
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-white/5 dark:text-white/5"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${Math.min((Math.abs(temp) / 50), 1) * (2 * Math.PI * 40)} ${2 * Math.PI * 40}`}
                      strokeLinecap="round"
                      className={`${themeColor} transition-all duration-1000 ease-out`}
                    />
                  </svg>
                  <div className="flex flex-col items-center z-10">
                    <span className={`text-4xl font-black font-mono tracking-tight ${themeColor}`}>{temp}°C</span>
                    <span className={`text-[10px] tracking-widest uppercase font-bold text-gray-300 mt-1`}>{condition}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-lg border border-white/5">
                  <span className="text-xs text-gray-400 flex items-center gap-1.5"><Droplets size={13} className="text-cyan-400" /> Precipitation</span>
                  <span className="font-mono text-sm font-bold text-white">{precip.toFixed(1)} mm</span>
                </div>
                <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-lg border border-white/5">
                  <span className="text-xs text-gray-400 flex items-center gap-1.5"><Wind size={13} className="text-emerald-400" /> Wind Speed</span>
                  <span className="font-mono text-sm font-bold text-white">{Math.round(wind)} km/h</span>
                </div>
              </div>
            </div>

            {/* AI Synthesis Banner with Integrated Replay Header */}
            <div className={`glass-panel p-4 flex-1 flex flex-col gap-2.5 border-l-4 ${borderLeft} pointer-events-auto shadow-lg`}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl shrink-0 ${bgOpacity} ${themeColor}`}>
                    {replayOffsetHours < 0 ? <History size={18} /> : <CloudRain size={18} />}
                  </div>
                  <div className={`text-xs font-bold tracking-widest ${themeColor}`}>
                    {replayOffsetHours < 0 ? 'HISTORICAL METEOROLOGICAL REPLAY' : 'LIVE METEOROLOGICAL FORECAST'}
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
