import { useMemo, useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { CivicMap } from '../components/CivicMap';
import { TimeTravelSlider } from '../components/TimeTravelSlider';
import { CloudRain, Wind, Droplets, History, RotateCcw, Cloud, Sun, CloudLightning, Moon } from 'lucide-react';
import { usePulseStore } from '../store/useStore';
import { getHistoricalWeather } from '../utils/historicalSimulation';

const getWeatherIcon = (condition: string, className = "") => {
  const c = condition.toLowerCase();
  if (c.includes("thunderstorm") || c.includes("storm")) return <CloudLightning className={className} />;
  if (c.includes("rain") || c.includes("showers") || c.includes("drizzle")) return <CloudRain className={className} />;
  if (c.includes("sunny") || c.includes("clear")) return <Sun className={className} />;
  if (c.includes("night")) return <Moon className={className} />;
  return <Cloud className={className} />;
};

export const Weather = () => {
  const replayOffsetHours = usePulseStore(state => state.replayOffsetHours);
  const setReplayOffsetHours = usePulseStore(state => state.setReplayOffsetHours);
  const setIsReplaying = usePulseStore(state => state.setIsReplaying);

  const [realtimeWeather, setRealtimeWeather] = useState<{ temp?: number; precip?: number; wind?: number; condition?: string } | undefined>(undefined);

  useEffect(() => {
    // Fetch live terrestrial weather via Open-Meteo
    fetch('https://api.open-meteo.com/v1/forecast?latitude=26.9124&longitude=75.7873&current=temperature_2m,precipitation,weathercode,windspeed_10m')
      .then(r => r.json())
      .then(d => {
        const w = d.current.weathercode;
        let cond = 'Clear Sky';
        if (w >= 1 && w <= 3) cond = 'Partly Cloudy';
        if (w >= 45 && w <= 48) cond = 'Fog';
        if (w >= 51 && w <= 67) cond = 'Rain Showers';
        if (w >= 71 && w <= 77) cond = 'Snow';
        if (w >= 95) cond = 'Thunderstorm';
        
        setRealtimeWeather({
          temp: d.current.temperature_2m,
          precip: d.current.precipitation,
          wind: d.current.windspeed_10m,
          condition: cond
        });
      })
      .catch(e => console.warn('Real-time weather unavailable, falling back to simulation', e));
  }, []);
  
  const weatherData = useMemo(() => {
    return getHistoricalWeather(replayOffsetHours, realtimeWeather);
  }, [replayOffsetHours, realtimeWeather]);

  const { temp, precip, wind, condition, synthesis } = weatherData;

  const isRain = precip > 2;
  const isStorm = precip > 6;
  const themeColor = isStorm ? 'text-amber-400' : (isRain ? 'text-cyan-400' : 'text-emerald-500');
  const borderLeft = isStorm ? 'border-l-amber-500' : (isRain ? 'border-l-cyan-500' : 'border-l-emerald-500');
  const bgOpacity = isStorm ? 'bg-amber-500/20' : (isRain ? 'bg-cyan-500/20' : 'bg-emerald-500/20');

  // Generate 4 forecast points (e.g. +1h, +3h, +6h, +12h) based on the current replay hour
  const forecastPoints = useMemo(() => {
    return [1, 3, 6, 12].map(offset => {
      // Simulate future by shifting the simulation timeline
      const fData = getHistoricalWeather(replayOffsetHours - offset, realtimeWeather);
      return { hourOffset: offset, ...fData };
    });
  }, [replayOffsetHours, realtimeWeather]);

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
            
            {/* Future Prediction Bar */}
            <div className="glass-panel p-4 flex flex-col gap-3 w-80 pointer-events-auto">
              <div className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1 flex items-center justify-between">
                <span>Forecast Projection</span>
              </div>
              <div className="flex justify-between items-center w-full">
                {forecastPoints.map((f, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 px-2">
                    <span className="text-[10px] text-gray-400 font-semibold">+{f.hourOffset} HR</span>
                    {getWeatherIcon(f.condition, `w-5 h-5 ${f.precip > 6 ? 'text-amber-400' : (f.precip > 2 ? 'text-cyan-400' : 'text-emerald-400')}`)}
                    <span className="font-mono text-sm font-bold text-white mt-0.5">{f.temp}°C</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
        
        <TimeTravelSlider />
      </div>
    </div>
  );
};
