import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useMemo } from 'react';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Weather } from './pages/Weather';
import { Traffic } from './pages/Traffic';
import { AirQuality } from './pages/AirQuality';
import { Complaints } from './pages/Complaints';
import { usePulseStream } from './hooks/usePulseStream';
import { usePulseStore } from './store/useStore';
import { AlertTriangle } from 'lucide-react';

function App() {
  // Initialize websocket stream
  usePulseStream();

  const events = usePulseStore(state => state.events);
  
  // Look backwards through events to find the most recent critical/high incident
  const criticalEvent = useMemo(() => {
    return events.slice().reverse().find(e => e.severity === 'critical' || e.severity === 'high');
  }, [events]);

  return (
    <BrowserRouter>
      {/* Global Emergency Ticker */}
      {criticalEvent && (
        <div className="absolute top-0 w-full bg-rose-600/90 text-white text-[11px] font-mono font-bold tracking-widest py-1 flex items-center justify-center gap-2 z-[9999] backdrop-blur-md border-b border-rose-500/50 shadow-2xl pointer-events-auto">
          <AlertTriangle size={12} className="animate-pulse" />
          <span>ACTIVE CITY ALERT:</span>
          <span>{criticalEvent.category.toUpperCase()} IN PROGRESS [{criticalEvent.coordinates[0].toFixed(3)}, {criticalEvent.coordinates[1].toFixed(3)}] - AWAITING CREW DISPATCH</span>
        </div>
      )}

      <div className={`relative w-screen h-screen overflow-hidden bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-all duration-300 ${criticalEvent ? 'pt-6' : ''}`}>
        <Navigation />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/traffic" element={<Traffic />} />
          <Route path="/air-quality" element={<AirQuality />} />
          <Route path="/complaints" element={<Complaints />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
