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
    <div className="fixed bottom-4 left-1/2 -tranzinc-x-1/2 z-[1000] w-[90vw] max-w-[480px] pointer-events-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800 shadow-2xl rounded-xl p-3.5 flex flex-col gap-2.5 transition-all">
      {/* Header Row: Label & Time Display */}
      <div className="flex justify-between items-center text-xs font-semibold tracking-wider">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 uppercase text-[11px]">
          <span>Historical Replay (48H)</span>
          {replayOffsetHours < 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 animate-pulse">
              Past
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {replayOffsetHours === 0 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>LIVE</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs tracking-wide bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30">
                T - {Math.abs(replayOffsetHours)} HRS
              </span>
              <button
                onClick={handleReturnToLive}
                title="Return to real-time live feed"
                className="flex items-center gap-1 text-[11px] font-bold text-zinc-100 dark:text-zinc-300 hover:underline transition-all cursor-pointer"
              >
                <RotateCcw size={11} />
                <span>Live</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Playback Controls & Range Track */}
      <div className="flex items-center gap-3">
        {/* Buttons: Rewind, Play/Pause, Fast-Forward */}
        <div className="flex items-center gap-1 shrink-0">
          <button 
            onClick={handleRewind}
            title="Rewind 3 hours"
            disabled={replayOffsetHours <= -48}
            className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none rounded-xl transition-all cursor-pointer"
          >
            <Rewind size={15} />
          </button>

          <button 
            onClick={togglePlay}
            title={isReplaying ? "Pause historical playback" : "Play historical timeline"}
            className={`p-2 rounded-full transition-all active:scale-95 cursor-pointer shadow-md ${
              isReplaying 
                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]' 
                : 'bg-violet-500 hover:bg-violet-400 text-white shadow-[0_0_12px_rgba(14,165,233,0.4)]'
            }`}
          >
            {isReplaying ? <Pause size={15} className="fill-current" /> : <Play size={15} className="fill-current ml-0.5" />}
          </button>

          <button 
            onClick={handleFastForward}
            title="Fast-forward 3 hours"
            disabled={replayOffsetHours >= 0}
            className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none rounded-xl transition-all cursor-pointer"
          >
            <FastForward size={15} />
          </button>
        </div>
        
        {/* Styled Timeline Scrubber */}
        <div className="flex-1 flex flex-col gap-1 relative">
          <div className="relative w-full flex items-center">
            {/* Custom filled track gradient */}
            <div 
              className="absolute left-0 top-1/2 -tranzinc-y-1/2 h-1.5 rounded-full pointer-events-none bg-gradient-to-r from-amber-500 via-violet-500 to-emerald-400 transition-all duration-75"
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
              className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700/60 rounded-full appearance-none cursor-pointer outline-none transition-all z-10
                [&::-webkit-slider-thumb]:appearance-none 
                [&::-webkit-slider-thumb]:w-3.5 
                [&::-webkit-slider-thumb]:h-3.5 
                [&::-webkit-slider-thumb]:bg-white 
                [&::-webkit-slider-thumb]:border
                [&::-webkit-slider-thumb]:border-zinc-300
                dark:[&::-webkit-slider-thumb]:border-transparent
                [&::-webkit-slider-thumb]:rounded-full 
                [&::-webkit-slider-thumb]:shadow-md 
                [&::-webkit-slider-thumb]:hover:scale-125 
                [&::-webkit-slider-thumb]:transition-transform
                [&::-moz-range-thumb]:w-3.5 
                [&::-moz-range-thumb]:h-3.5 
                [&::-moz-range-thumb]:bg-white 
                [&::-moz-range-thumb]:border
                [&::-moz-range-thumb]:border-zinc-300
                dark:[&::-moz-range-thumb]:border-transparent
                [&::-moz-range-thumb]:rounded-full 
                [&::-moz-range-thumb]:shadow-md"
            />
          </div>

          {/* Tick Labels */}
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 dark:text-zinc-400 px-0.5 pt-0.5 select-none">
            <span className="hover:text-zinc-900 dark:hover:text-white cursor-pointer" onClick={() => setReplayOffsetHours(-48)}>-48h</span>
            <span className="hover:text-zinc-900 dark:hover:text-white cursor-pointer" onClick={() => setReplayOffsetHours(-36)}>-36h</span>
            <span className="hover:text-zinc-900 dark:hover:text-white cursor-pointer" onClick={() => setReplayOffsetHours(-24)}>-24h</span>
            <span className="hover:text-zinc-900 dark:hover:text-white cursor-pointer" onClick={() => setReplayOffsetHours(-12)}>-12h</span>
            <span 
              className={`cursor-pointer font-bold ${replayOffsetHours === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400 hover:text-emerald-500'}`}
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
