import { useEffect } from 'react';
import { Play, Pause, Rewind, FastForward, RotateCcw } from 'lucide-react';
import { usePulseStore } from '../store/useStore';

export const TimeTravelSlider = () => {
  const {
    replayOffsetHours,
    isReplaying,
    setReplayOffsetHours,
    setIsReplaying,
    stepReplayOffset
  } = usePulseStore();

  // Playback timer effect: advances scrubber forward by 2 hours every 800ms
  useEffect(() => {
    if (!isReplaying) return;

    const interval = setInterval(() => {
      usePulseStore.setState((state) => {
        const next = Math.min(0, state.replayOffsetHours + 2);
        if (next >= 0) {
          return { replayOffsetHours: 0, isReplaying: false };
        }
        return { replayOffsetHours: next };
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isReplaying]);

  const togglePlay = () => {
    if (!isReplaying) {
      // If already at LIVE (0), restart playback from 48h ago
      if (replayOffsetHours === 0) {
        setReplayOffsetHours(-48);
      }
      setIsReplaying(true);
    } else {
      setIsReplaying(false);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setReplayOffsetHours(val);
    if (val === 0 && isReplaying) {
      setIsReplaying(false);
    }
  };

  const handleRewind = () => {
    stepReplayOffset(-3);
  };

  const handleFastForward = () => {
    stepReplayOffset(3);
  };

  const handleReturnToLive = () => {
    setReplayOffsetHours(0);
    setIsReplaying(false);
  };

  // Calculate percentage for progress fill (0% at -48, 100% at 0)
  const progressPercent = Math.min(100, Math.max(0, ((replayOffsetHours + 48) / 48) * 100));

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92vw] max-w-[640px] glass-panel p-4 z-20 pointer-events-auto flex flex-col gap-3.5 border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
      {/* Header Row: Label & Time Display */}
      <div className="flex justify-between items-center text-xs font-semibold tracking-wider">
        <div className="flex items-center gap-2 text-gray-400 uppercase">
          <span>Historical Replay (48H)</span>
          {replayOffsetHours < 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
              Simulating Past
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {replayOffsetHours === 0 ? (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>LIVE</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-amber-400 text-sm tracking-wide bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                T - {Math.abs(replayOffsetHours)} HRS
              </span>
              <button
                onClick={handleReturnToLive}
                title="Return to real-time live feed"
                className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 hover:underline transition-all cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Live</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Playback Controls & Range Track */}
      <div className="flex items-center gap-4">
        {/* Buttons: Rewind, Play/Pause, Fast-Forward */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button 
            onClick={handleRewind}
            title="Rewind 3 hours"
            disabled={replayOffsetHours <= -48}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none rounded-xl transition-all cursor-pointer"
          >
            <Rewind size={16} />
          </button>

          <button 
            onClick={togglePlay}
            title={isReplaying ? "Pause historical playback" : "Play historical timeline"}
            className={`p-3 rounded-full transition-all active:scale-95 cursor-pointer shadow-lg ${
              isReplaying 
                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]'
            }`}
          >
            {isReplaying ? <Pause size={17} className="fill-black" /> : <Play size={17} className="fill-black ml-0.5" />}
          </button>

          <button 
            onClick={handleFastForward}
            title="Fast-forward 3 hours"
            disabled={replayOffsetHours >= 0}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none rounded-xl transition-all cursor-pointer"
          >
            <FastForward size={16} />
          </button>
        </div>
        
        {/* Styled Timeline Scrubber */}
        <div className="flex-1 flex flex-col gap-1 relative">
          <div className="relative w-full flex items-center">
            {/* Custom filled track gradient */}
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-2 rounded-full pointer-events-none bg-gradient-to-r from-amber-500 via-cyan-500 to-emerald-400 transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
            
            <input 
              type="range" 
              min="-48" 
              max="0" 
              step="1"
              value={replayOffsetHours}
              onChange={handleSliderChange}
              aria-label="Historical Replay Timeline Scrubber"
              className="w-full h-2 bg-white/15 rounded-full appearance-none cursor-pointer outline-none transition-all z-10
                [&::-webkit-slider-thumb]:appearance-none 
                [&::-webkit-slider-thumb]:w-4 
                [&::-webkit-slider-thumb]:h-4 
                [&::-webkit-slider-thumb]:bg-white 
                [&::-webkit-slider-thumb]:rounded-full 
                [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(255,255,255,0.9)] 
                [&::-webkit-slider-thumb]:hover:scale-125 
                [&::-webkit-slider-thumb]:transition-transform
                [&::-moz-range-thumb]:w-4 
                [&::-moz-range-thumb]:h-4 
                [&::-moz-range-thumb]:bg-white 
                [&::-moz-range-thumb]:rounded-full 
                [&::-moz-range-thumb]:shadow-[0_0_12px_rgba(255,255,255,0.9)]"
            />
          </div>

          {/* Tick Labels */}
          <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 px-0.5 pt-0.5 select-none">
            <span className="hover:text-white cursor-pointer" onClick={() => setReplayOffsetHours(-48)}>-48h</span>
            <span className="hover:text-white cursor-pointer" onClick={() => setReplayOffsetHours(-36)}>-36h</span>
            <span className="hover:text-white cursor-pointer" onClick={() => setReplayOffsetHours(-24)}>-24h</span>
            <span className="hover:text-white cursor-pointer" onClick={() => setReplayOffsetHours(-12)}>-12h</span>
            <span 
              className={`cursor-pointer font-bold ${replayOffsetHours === 0 ? 'text-emerald-400' : 'text-gray-400 hover:text-emerald-300'}`}
              onClick={handleReturnToLive}
            >
              LIVE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
