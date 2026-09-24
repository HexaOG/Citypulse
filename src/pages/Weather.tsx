import { useMemo } from 'react';
import { Header } from '../components/Header';
import { CivicMap } from '../components/CivicMap';
import { TimeTravelSlider } from '../components/TimeTravelSlider';
import { CloudRain, Wind, Droplets } from 'lucide-react';
import { usePulseStore } from '../store/useStore';

export const Weather = () => {
  const events = usePulseStore(state => state.events);
  const latestWeather = useMemo(() => events.slice().reverse().find(e => e.sourceFeed === 'weather'), [events]);
  
  const temp = latestWeather?.rawMetrics?.temperature ?? 0;
  const precip = latestWeather?.rawMetrics?.precipitation ?? 0;
  const wind = latestWeather?.rawMetrics?.windSpeed ?? 0;
  const condition = latestWeather?.category || 'Clear';

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
              <h2 className="text-xl font-bold tracking-wider mb-2 flex items-center gap-2">
                <CloudRain className="text-emerald-500" /> METEOROLOGY
              </h2>
              
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-4 border-emerald-500/30">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-[spin_5s_linear_infinite]" />
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-emerald-500">{temp}°C</span>
                    <span className="text-[10px] tracking-widest text-emerald-500/80 uppercase">{condition}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5">
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Droplets size={12}/> Precipitation</span>
                  <span className="font-mono text-sm">{precip.toFixed(1)} mm</span>
                </div>
                <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5">
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Wind size={12}/> Wind Speed</span>
                  <span className="font-mono text-sm">{Math.round(wind)} km/h</span>
                </div>
              </div>
            </div>

            {/* AI Synthesis Banner */}
            <div className="glass-panel p-4 flex-1 flex items-center gap-4 border-l-4 border-l-emerald-500 pointer-events-auto">
              <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-500">
                <CloudRain size={24} />
              </div>
              <div>
                <div className="text-xs font-bold tracking-widest text-emerald-500 mb-1">LIVE METEOROLOGICAL FORECAST</div>
                <div className="text-sm text-gray-300 leading-relaxed">
                  {precip > 5 ? "Elevated precipitation currently impacting multiple sectors. Expect potential localized waterlogging." : "Meteorological conditions are currently stable. No immediate weather advisories issued for the metropolitan area."}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <TimeTravelSlider />
      </div>
    </div>
  );
};
