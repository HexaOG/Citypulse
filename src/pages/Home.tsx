import { useMemo } from 'react';
import { Header } from '../components/Header';
import { Link } from 'react-router-dom';
import { CloudRain, Car, Wind, AlertTriangle, ArrowRight, Activity, History, RotateCcw } from 'lucide-react';
import { usePulseStore } from '../store/useStore';
import { TimeTravelSlider } from '../components/TimeTravelSlider';
import { getHistoricalTraffic, getHistoricalWeather, getHistoricalAQI } from '../utils/historicalSimulation';

export const Home = () => {
  const events = usePulseStore(state => state.events);
  const chiScore = usePulseStore(state => state.chiScore);
  const narrative = usePulseStore(state => state.narrative);
  const replayOffsetHours = usePulseStore(state => state.replayOffsetHours);
  const setReplayOffsetHours = usePulseStore(state => state.setReplayOffsetHours);
  const setIsReplaying = usePulseStore(state => state.setIsReplaying);
  const communityReports = usePulseStore(state => state.communityReports);
  const activeTickets = usePulseStore(state => state.activeTickets);

  const latestWeather = useMemo(() => events.slice().reverse().find(e => e.sourceFeed === 'weather'), [events]);
  const latestAQI = useMemo(() => events.slice().reverse().find(e => e.sourceFeed === 'aqi'), [events]);
  const latestTraffic = useMemo(() => events.slice().reverse().find(e => e.sourceFeed === 'transit'), [events]);

  // Weather metric
  const weatherSim = useMemo(() => {
    return getHistoricalWeather(replayOffsetHours, {
      temp: latestWeather?.rawMetrics?.temperature,
      precip: latestWeather?.rawMetrics?.precipitation,
      wind: latestWeather?.rawMetrics?.windSpeed,
      condition: latestWeather?.category
    });
  }, [replayOffsetHours, latestWeather]);

  const weatherMetric = `${weatherSim.temp}°C / ${weatherSim.condition}`;
  const weatherStatus = weatherSim.precip > 6 ? 'critical' : (weatherSim.precip > 2 ? 'warning' : 'good');

  // Traffic metric
  const trafficSim = useMemo(() => {
    return getHistoricalTraffic(replayOffsetHours, latestTraffic?.rawMetrics?.delay_minutes);
  }, [replayOffsetHours, latestTraffic]);

  const trafficMetric = `${trafficSim.congestion}% load • +${trafficSim.delay}m delay`;
  const trafficStatus = trafficSim.isCritical ? 'critical' : (trafficSim.isWarning ? 'warning' : 'good');

  // AQI metric
  const aqiSim = useMemo(() => {
    return getHistoricalAQI(replayOffsetHours, latestAQI?.rawMetrics?.us_aqi);
  }, [replayOffsetHours, latestAQI]);

  const aqiMetric = `${aqiSim.aqi} AQI • ${aqiSim.status}`;
  const aqiStatus = aqiSim.isPoor ? 'critical' : (aqiSim.isModerate ? 'warning' : 'good');

  // Complaints metric
  const simulatedTimeAgo = Math.abs(replayOffsetHours);
  const historicalComplaints = communityReports.filter((r) => (r.createdAtHoursAgo ?? 0) >= simulatedTimeAgo);
  const dynamicActiveTickets = replayOffsetHours === 0 
    ? activeTickets 
    : Math.round(38 + (historicalComplaints.length / Math.max(1, communityReports.length)) * (activeTickets - 38));
  const complaintsMetric = `${dynamicActiveTickets} Active Reports`;
  const complaintsStatus = dynamicActiveTickets > 90 ? 'critical' : (dynamicActiveTickets > 50 ? 'warning' : 'good');

  // Dynamic system health score
  const dynamicChiScore = replayOffsetHours === 0 
    ? chiScore 
    : Math.round(100 - (trafficSim.congestion * 0.35 + (aqiSim.aqi > 100 ? 25 : 8) + (weatherSim.precip > 5 ? 20 : 5)));


  const modules = [
    {
      title: 'Weather & Environment',
      to: '/weather',
      icon: CloudRain,
      metric: weatherMetric,
      color: weatherStatus === 'critical' ? 'rose' : 'emerald',
      status: weatherStatus
    },
    {
      title: 'Traffic & Transit',
      to: '/traffic',
      icon: Car,
      metric: trafficMetric,
      color: trafficStatus === 'critical' ? 'rose' : (trafficStatus === 'warning' ? 'amber' : 'emerald'),
      status: trafficStatus
    },
    {
      title: 'Air Quality (AQI)',
      to: '/air-quality',
      icon: Wind,
      metric: aqiMetric,
      color: aqiStatus === 'critical' ? 'rose' : (aqiStatus === 'warning' ? 'amber' : 'cyan'),
      status: aqiStatus
    },
    {
      title: '311 Complaints',
      to: '/complaints',
      icon: AlertTriangle,
      metric: complaintsMetric,
      color: complaintsStatus === 'critical' ? 'rose' : (complaintsStatus === 'warning' ? 'amber' : 'emerald'),
      status: complaintsStatus
    }
  ];

  const getColorClasses = (color: string) => {
    const map: Record<string, string> = {
      emerald: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50',
      amber: 'bg-amber-500/20 text-amber-500 border-amber-500/50',
      cyan: 'bg-rose-500/20 text-zinc-300 border-rose-500/50',
      rose: 'bg-rose-500/20 text-zinc-300 border-rose-500/50'
    };
    return map[color] || map.emerald;
  };

  const getDotClass = (status: string) => {
    switch (status) {
      case 'good': return 'bg-emerald-500';
      case 'active': return 'bg-emerald-500 animate-pulse';
      case 'warning': return 'bg-amber-500';
      case 'critical': return 'bg-rose-500 animate-pulse';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative w-full h-full bg-zinc-50 dark:bg-[#08090e] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 overflow-y-auto">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_rgba(6,182,212,0.12)_0%,_rgba(139,92,246,0.06)_40%,_transparent_75%)] opacity-40 dark:opacity-100 pointer-events-none"></div>
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col p-6 pointer-events-auto">
        <Header />
        
        <div className="mt-24 ml-20 md:ml-24 max-w-6xl w-full mx-auto flex-1 flex flex-col pb-36 mb-12">
          {/* Hero / Pulse Overview */}
          <div className={`p-8 mb-8 rounded-xl flex items-center justify-between transition-all bg-white dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800/80 shadow-sm ${
            replayOffsetHours < 0 ? 'border-l-4 border-l-amber-500 shadow-[0_8px_32px_rgba(245,158,11,0.15)]' : ''
          }`}>
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-3xl font-bold tracking-tighter flex items-center gap-3 text-zinc-900 dark:text-white">
                  SYSTEM PULSE {replayOffsetHours < 0 ? <History className="text-amber-500" /> : <Activity className="text-emerald-500" />}
                </h2>
                {replayOffsetHours < 0 && (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 animate-pulse">
                      T - {Math.abs(replayOffsetHours)} HRS
                    </span>
                    <button
                      onClick={() => {
                        setReplayOffsetHours(0);
                        setIsReplaying(false);
                      }}
                      className="px-2.5 py-1 text-xs font-bold bg-amber-500/20 hover:bg-amber-400 text-amber-600 dark:text-amber-300 hover:text-black rounded-full border border-amber-500/40 transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                    >
                      <RotateCcw size={12} />
                      <span>Live</span>
                    </button>
                  </div>
                )}
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                {replayOffsetHours < 0 
                  ? `Reconstructed aggregate civic pulse at T - ${Math.abs(replayOffsetHours)} hours across all telemetry streams.` 
                  : 'Aggregate civic health score across all active monitoring feeds.'}
              </p>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/10 max-w-sm">
                <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                  {replayOffsetHours < 0 ? `REPLAY SUMMARY (T - ${Math.abs(replayOffsetHours)}H)` : 'AI SITUATION SUMMARY'}
                </div>
                <div className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-200 font-medium">
                  {replayOffsetHours < 0 
                    ? `Historical timeline evaluation: Traffic congestion standing at ${trafficSim.congestion}%, ambient AQI at ${aqiSim.aqi}, and ${dynamicActiveTickets} active municipal tickets open.`
                    : `"${narrative}"`}
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-zinc-200 dark:text-white/5"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${(dynamicChiScore / 100) * (2 * Math.PI * 40)} ${2 * Math.PI * 40}`}
                      strokeLinecap="round"
                      className={`${replayOffsetHours < 0 ? 'text-amber-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`}
                    />
                  </svg>
                  <div className={`text-3xl font-black font-mono tracking-tight z-10 ${replayOffsetHours < 0 ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {dynamicChiScore}
                  </div>
                </div>
                <div className={`mt-2 text-[10px] font-bold tracking-widest px-2.5 py-1 flex items-center rounded-xl border ${
                  replayOffsetHours < 0 ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {dynamicChiScore > 80 ? 'STABLE' : (dynamicChiScore > 50 ? 'WARNING' : 'CRITICAL')}
                </div>
              </div>
            </div>
          </div>
          
          {/* Module Grid Navigation */}
          <h3 className="text-xs font-bold tracking-widest text-zinc-500 dark:text-zinc-400 mb-4 ml-2 uppercase">ACTIVE SENSORY MODULES</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
            {modules.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <Link 
                  key={idx} 
                  to={mod.to} 
                  className="group bg-white dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800/80 shadow-sm hover:shadow-md p-6 rounded-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer flex flex-col justify-between h-48 relative overflow-hidden"
                >
                  <div className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity ${
                    mod.color === 'emerald' ? 'bg-emerald-500' :
                    mod.color === 'amber' ? 'bg-amber-500' :
                    mod.color === 'cyan' ? 'bg-rose-500' : 'bg-rose-500'
                  }`}></div>
                  
                  <div className="flex justify-between items-start z-10">
                    <div className={`p-3 rounded-xl ${getColorClasses(mod.color)}`}>
                      <Icon size={26} />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${getDotClass(mod.status)}`} />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{mod.status}</span>
                    </div>
                  </div>
                  
                  <div className="z-10 mt-auto">
                    <div className="text-sm text-zinc-600 dark:text-zinc-300 mb-1 font-mono font-medium">{mod.metric}</div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-bold tracking-wider text-zinc-900 dark:text-white">{mod.title}</h4>
                      <span className="text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-zinc-100 dark:text-zinc-100">
                        Inspect Stream <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <TimeTravelSlider />
      </div>
    </div>
  );
};
