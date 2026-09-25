import { usePulseStore } from '../store/useStore';
import { Radio, Sun, Moon } from 'lucide-react';

export const Header = () => {
  const connected = usePulseStore(state => state.connected);
  const isSimulated = usePulseStore(state => state.isSimulated);
  const theme = usePulseStore(state => state.theme);
  const toggleTheme = usePulseStore(state => state.toggleTheme);
  
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-start p-6 pointer-events-auto">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-white">CityPulse</h1>
        <div className="text-xs tracking-widest text-slate-500 dark:text-slate-400 uppercase font-semibold">Live Civic Health Dashboard</div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl px-4 py-2 flex items-center gap-2 text-sm font-semibold ${
          connected ? 'text-emerald-600 dark:text-accent-green' : (isSimulated ? 'text-sky-600 dark:text-cyan-400' : 'text-rose-600 dark:text-accent-red')
        }`}>
          <Radio size={16} className={connected || isSimulated ? 'animate-pulse' : ''} />
          {connected ? 'LIVE' : (isSimulated ? 'SIMULATED LIVE' : 'DISCONNECTED')}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm rounded-2xl px-3.5 py-2 flex items-center gap-2 text-sm font-semibold hover:border-sky-500/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer group"
        >
          {theme === 'dark' ? (
            <>
              <Sun size={16} className="text-amber-500 group-hover:rotate-45 transition-transform duration-300" />
              <span className="hidden sm:inline text-xs tracking-wider font-semibold">LIGHT</span>
            </>
          ) : (
            <>
              <Moon size={16} className="text-indigo-500 group-hover:-rotate-12 transition-transform duration-300" />
              <span className="hidden sm:inline text-xs tracking-wider font-semibold">DARK</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
