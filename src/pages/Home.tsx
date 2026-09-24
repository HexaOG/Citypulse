import React, { useMemo } from 'react';
import { Header } from '../components/Header';
import { Link } from 'react-router-dom';
import { CloudRain, Car, Wind, AlertTriangle, ArrowRight, Activity } from 'lucide-react';
import { usePulseStore } from '../store/useStore';

export const Home = () => {
  const events = usePulseStore(state => state.events);
  const chiScore = usePulseStore(state => state.chiScore);
  const narrative = usePulseStore(state => state.narrative);

  const latestWeather = useMemo(() => events.slice().reverse().find(e => e.sourceFeed === 'weather'), [events]);
  const latestAQI = useMemo(() => events.slice().reverse().find(e => e.sourceFeed === 'aqi'), [events]);

  let weatherMetric = 'Connecting...';
  let weatherStatus = 'active';
  if (latestWeather && latestWeather.rawMetrics) {
      const temp = latestWeather.rawMetrics.temperature;
      const condition = latestWeather.category === 'rain' ? 'Rain' : 'Clear';
      weatherMetric = temp !== undefined ? `${temp}°C / ${condition}` : condition;
      weatherStatus = latestWeather.severity === 'critical' || latestWeather.severity === 'high' ? 'critical' : 'good';
  }

  let aqiMetric = 'Connecting...';
  let aqiStatus = 'active';
  if (latestAQI && latestAQI.rawMetrics?.us_aqi !== undefined) {
      const aqi = latestAQI.rawMetrics.us_aqi;
      aqiMetric = `${aqi} AQI`;
      if (aqi < 50) aqiStatus = 'good';
      else if (aqi < 100) aqiStatus = 'warning';
      else aqiStatus = 'critical';
  }

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
      metric: 'Moderate Delay',
      color: 'amber',
      status: 'warning'
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
      metric: '14 Active',
      color: 'rose',
      status: 'critical'
    }
  ];

  const getColorClasses = (color: string) => {
    const map: Record<string, string> = {
      emerald: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50',
      amber: 'bg-amber-500/20 text-amber-500 border-amber-500/50',
      cyan: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/50',
      rose: 'bg-rose-500/20 text-rose-500 border-rose-500/50'
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
    <div className="relative w-full h-full bg-[#0a0a0f] text-white overflow-y-auto">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0f] to-[#0a0a0f]"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col p-6 pointer-events-auto">
        <Header />
        
        <div className="mt-24 ml-24 max-w-6xl w-full mx-auto flex-1 flex flex-col">
          {/* Hero / Pulse Overview */}
          <div className="glass-panel p-8 mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter mb-2 flex items-center gap-3">
                SYSTEM PULSE <Activity className="text-emerald-500" />
              </h2>
              <p className="text-gray-400">Aggregate civic health score across all active monitoring feeds.</p>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 max-w-sm">
                <div className="text-xs font-bold text-gray-500 mb-1">AI SITUATION SUMMARY</div>
                <div className="text-sm leading-relaxed">
                  "{narrative}"
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 flex items-center justify-center rounded-full border-4 border-emerald-500/30">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" style={{ animationDuration: '4s' }} />
                  <div className="text-2xl font-bold text-emerald-500">{chiScore}</div>
                </div>
                <div className="mt-2 text-xs font-bold tracking-widest text-emerald-500">
                  {chiScore > 80 ? 'STABLE' : (chiScore > 50 ? 'WARNING' : 'CRITICAL')}
                </div>
              </div>
            </div>
          </div>
          
          {/* Module Grid Navigation */}
          <h3 className="text-sm font-bold tracking-widest text-gray-500 mb-4 ml-2">ACTIVE SENSORY MODULES</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
            {modules.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <Link key={idx} to={mod.to} className="group glass-panel p-6 hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] cursor-pointer flex flex-col justify-between h-48 relative overflow-hidden">
                  <div className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${
                    mod.color === 'emerald' ? 'bg-emerald-500' :
                    mod.color === 'amber' ? 'bg-amber-500' :
                    mod.color === 'cyan' ? 'bg-cyan-500' : 'bg-rose-500'
                  }`}></div>
                  
                  <div className="flex justify-between items-start z-10">
                    <div className={`p-3 rounded-xl ${getColorClasses(mod.color)}`}>
                      <Icon size={28} />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${getDotClass(mod.status)}`} />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{mod.status}</span>
                    </div>
                  </div>
                  
                  <div className="z-10 mt-auto">
                    <div className="text-sm text-gray-400 mb-1 font-mono">{mod.metric}</div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-bold tracking-wider">{mod.title}</h4>
                      <span className="text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-white">
                        Inspect Stream <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
