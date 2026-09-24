import React from 'react';
import { Radio, CloudRain } from 'lucide-react';
import { resolveScenarioUrl } from '../lib/pulse.js';
import { usePulseStore } from '../store/useStore';

export const Header = () => {
  const connected = usePulseStore(state => state.connected);
  const scenario = usePulseStore(state => state.scenario);
  const setScenario = usePulseStore(state => state.setScenario);
  
  const handleScenarioChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setScenario(val);

    try {
      await fetch(resolveScenarioUrl(window.location.href), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: val }),
      });
    } catch {
      // No local backend in the static deployment; the UI keeps running with simulated data.
    }
  };
  
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-start p-6 pointer-events-auto">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tighter">CityPulse</h1>
        <div className="text-xs tracking-widest text-gray-400 uppercase">Live Civic Health Dashboard</div>
      </div>
      
      <div className="flex items-center gap-4">
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
      </div>
    </div>
  );
};
