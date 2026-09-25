import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Weather } from './pages/Weather';
import { Traffic } from './pages/Traffic';
import { AirQuality } from './pages/AirQuality';
import { Complaints } from './pages/Complaints';
import { usePulseStream } from './hooks/usePulseStream';

function App() {
  // Initialize websocket stream
  usePulseStream();

  return (
    <BrowserRouter>
      <div className="relative w-screen h-screen overflow-hidden bg-background">
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
