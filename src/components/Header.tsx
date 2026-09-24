import type { ChangeEvent } from 'react';
import { usePulseStore } from '../store/useStore';
import { Radio, CloudRain, Sun, Moon } from 'lucide-react';

export const Header = () => {
  const connected = usePulseStore(state => state.connected);
  const scenario = usePulseStore(state => state.scenario);
  const setScenario = usePulseStore(state => state.setScenario);
  const theme = usePulseStore(state => state.theme);
  const toggleTheme = usePulseStore(state => state.toggleTheme);
  
  const handleScenarioChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setScenario(val);
    fetch('http://localhost:8000/api/scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: val })
    });
  };
  
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-start p-6 pointer-events-auto">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tighter">CityPulse</h1>
        <div className="text-xs tracking-widest text-gray-400 uppercase">Live Civic Health Dashboard</div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="glass-panel px-4 py-2 flex items-center gap-3">
          <CloudRain size={16} className="text-accent-blue" />
          <select 
            value={scenario}
            onChange={handleScenarioChange}
            className="bg-transparent border-none text-sm outline-none cursor-pointer"
          >
            <option value="normal" className="bg-panel">Scenario: Normal Operations</option>
            <option value="storm" className="bg-panel">Scenario: Severe Storm Surge</option>
          </select>
        </div>
        
        <div className={`glass-panel px-4 py-2 flex items-center gap-2 text-sm font-semibold ${connected ? 'text-accent-green' : 'text-accent-red'}`}>
          <Radio size={16} className={connected ? 'animate-pulse' : ''} />
          {connected ? 'LIVE' : 'DISCONNECTED'}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="glass-panel px-3.5 py-2 flex items-center gap-2 text-sm font-semibold hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all cursor-pointer group"
        >
          {theme === 'dark' ? (
            <>
              <Sun size={16} className="text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
              <span className="hidden sm:inline text-xs tracking-wider">LIGHT</span>
            </>
          ) : (
            <>
              <Moon size={16} className="text-indigo-400 group-hover:-rotate-12 transition-transform duration-300" />
              <span className="hidden sm:inline text-xs tracking-wider">DARK</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
