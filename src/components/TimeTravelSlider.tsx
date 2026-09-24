import React, { useState } from 'react';
import { Play, Pause, Rewind, FastForward } from 'lucide-react';

export const TimeTravelSlider = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(100); // 100 = Live
  
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[600px] glass-panel p-4 z-10 pointer-events-auto flex flex-col gap-3">
      <div className="flex justify-between items-center text-xs text-gray-400 font-semibold tracking-wider uppercase">
        <span>Historical Replay (48h)</span>
        <span className="text-white">{progress === 100 ? 'LIVE' : `T - ${Math.floor((100-progress)*0.48)} hrs`}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Rewind size={16}/></button>
          <button 
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><FastForward size={16}/></button>
        </div>
        
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="flex-grow h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
        />
      </div>
    </div>
  );
};
