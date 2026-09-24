import React from 'react';
import { Header } from './components/Header';
import { PulseMeter } from './components/PulseMeter';
import { SituationBriefing } from './components/SituationBriefing';
import { CivicMap } from './components/CivicMap';
import { AnomalyDrawer } from './components/AnomalyDrawer';
import { TimeTravelSlider } from './components/TimeTravelSlider';
import { AlertConfigModal } from './components/AlertConfigModal';
import { usePulseStream } from './hooks/usePulseStream';

function App() {
  // Initialize websocket stream
  usePulseStream();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      <CivicMap />
      
      {/* Overlay Layer (pointer-events-none so we can click map, children can override) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Header />
        
        <div className="absolute top-24 left-6 right-6 flex items-start justify-between pointer-events-auto">
          <div className="flex gap-6 items-start w-full">
            <PulseMeter />
            <SituationBriefing />
          </div>
        </div>
        
        <AnomalyDrawer />
        
        <TimeTravelSlider />
        <AlertConfigModal />
      </div>
    </div>
  );
}

export default App;
