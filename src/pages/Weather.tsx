import React from 'react';
import { Header } from '../components/Header';
import { PulseMeter } from '../components/PulseMeter';
import { SituationBriefing } from '../components/SituationBriefing';
import { CivicMap } from '../components/CivicMap';
import { AnomalyDrawer } from '../components/AnomalyDrawer';
import { TimeTravelSlider } from '../components/TimeTravelSlider';
import { AlertConfigModal } from '../components/AlertConfigModal';

export const Weather = () => {
  return (
    <div className="relative w-full h-full">
      <CivicMap />
      
      {/* Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Header />
        
        <div className="absolute top-24 left-24 right-6 flex items-start justify-between pointer-events-auto">
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
};
