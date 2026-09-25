import { useState, type FormEvent } from 'react';
import { Header } from '../components/Header';
import { CivicMap } from '../components/CivicMap';
import { TimeTravelSlider } from '../components/TimeTravelSlider';
import { CommunityFeedDrawer } from '../components/CommunityFeedDrawer';
import { 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  Lightbulb, 
  Plus, 
  MapPin, 
  X,
  Droplets,
  Zap,
  Construction,
  Trash2,
  TreePine,
  HelpCircle,
  ChevronDown,
  Check,
  RotateCcw,
  History,
  Building2
} from 'lucide-react';
import { usePulseStore } from '../store/useStore';

const CATEGORY_OPTIONS = [
  { id: 'Waterlogging/Drainage', label: 'Waterlogging / Drainage', icon: Droplets, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { id: 'Power Outage', label: 'Power Outage', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { id: 'Pothole/Road Hazard', label: 'Pothole / Road Hazard', icon: Construction, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { id: 'Broken Streetlight', label: 'Broken Streetlight', icon: Lightbulb, color: 'text-yellow-300', bg: 'bg-yellow-500/10' },
  { id: 'Fallen Tree/Debris', label: 'Fallen Tree / Debris', icon: TreePine, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'Garbage/Sanitation', label: 'Garbage / Sanitation', icon: Trash2, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { id: 'Other', label: 'Other / Unlisted Issue', icon: HelpCircle, color: 'text-purple-400', bg: 'bg-purple-500/10' }
];

const AREA_OPTIONS = [
  'Malviya Nagar',
  'Vaishali Nagar',
  'Mansarovar',
  'Pink City',
  'Raja Park',
  'Jagatpura',
  'Vidyadhar Nagar',
  'Sodala',
  'Other'
];

export const Complaints = () => {
  const { 
    activeTickets, 
    complaintSynthesis, 
    isSelectingLocation, 
    selectedLocation, 
    addCommunityReport,
    isCommunityDrawerOpen,
    setComplaintSynthesis, 
    setIsSelectingLocation,
    setSelectedLocation,
    communityReports,
    replayOffsetHours,
    setReplayOffsetHours,
    setIsReplaying
  } = usePulseStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  
  // Form State
  const [category, setCategory] = useState('Power Outage');
  const [customCategory, setCustomCategory] = useState('');
  const [area, setArea] = useState('Malviya Nagar');
  const [customArea, setCustomArea] = useState('');
  const [severity, setSeverity] = useState('High');
  const [description, setDescription] = useState('');

  // Dropdown menus state
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAreaOpen, setIsAreaOpen] = useState(false);

  const selectedCategoryObj = CATEGORY_OPTIONS.find(c => c.id === category) || CATEGORY_OPTIONS[0];
  const CategoryIcon = selectedCategoryObj.icon;

  // Historical Replay Time Travel State & Calculations
  const simulatedTimeAgo = Math.abs(replayOffsetHours);
  const historicalReports = communityReports.filter((r) => (r.createdAtHoursAgo ?? 0) >= simulatedTimeAgo);
  
  // Dynamic recalculation strictly tied to tickets open at simulated hour
  const reportRatio = historicalReports.length / Math.max(1, communityReports.length);
  const dynamicActiveTickets = replayOffsetHours === 0 
    ? activeTickets 
    : Math.round(38 + reportRatio * (activeTickets - 38));
  
  const loadIndex = Math.min(100, Math.floor(dynamicActiveTickets / 2));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) {
      alert("Please pin a location on the map first.");
      return;
    }

    const finalCategory = category === 'Other' ? (customCategory.trim() || 'Other Problem') : category;
    const finalArea = area === 'Other' ? (customArea.trim() || 'Other Area') : area;
    const eventId = `CP-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Live Submission Sync to Community Feed
    addCommunityReport({
      id: eventId,
      category: finalCategory,
      description: description.trim() || `${finalCategory} reported in ${finalArea}.`,
      area: finalArea,
      street: `${finalArea} • Verified Resident Report`,
      severity: severity as any,
      timestamp: 'Just now',
      coordinates: selectedLocation,
      confirmations: 1,
      userConfirmed: true,
      isNew: true,
      createdAtHoursAgo: 0
    });

    setComplaintSynthesis(`New report logged: ${finalCategory} in ${finalArea}. Anomaly detection recalculating cluster severity...`);
    setToast(`Incident ${eventId} in ${finalArea} successfully broadcasted to community stream.`);
    
    // Auto-hide toast
    setTimeout(() => setToast(null), 4000);
    
    setIsModalOpen(false);
    setSelectedLocation(null);
    setDescription('');
    setCustomCategory('');
    setCustomArea('');
  };

  return (
    <div className="relative w-full h-full">
      <CivicMap />
      
      {/* Overlay Layer */}
      <div className={`absolute inset-0 z-10 ${isSelectingLocation ? 'pointer-events-none' : 'pointer-events-none'}`}>
        <Header />
        
        {/* Community Feed Drawer */}
        <div className={`${isSelectingLocation ? 'opacity-20 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
          <CommunityFeedDrawer onOpenReportModal={() => setIsModalOpen(true)} />
        </div>

        <div className={`fixed top-16 left-20 md:left-[88px] ${isCommunityDrawerOpen ? 'right-[420px] md:right-[460px]' : 'right-8 md:right-12 lg:right-16'} z-[900] transition-all duration-300 flex items-start justify-between pointer-events-none`}>
          <div className="flex gap-6 items-start w-full">
            {/* Key Metrics Card */}
            <div className={`glass-panel p-5 flex flex-col gap-3.5 w-72 max-h-[calc(100vh-5rem)] overflow-y-auto transition-opacity ${isSelectingLocation ? 'opacity-20 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
              <h2 className="text-xl font-bold tracking-wider mb-2 flex items-center gap-2 text-slate-800 dark:text-white">
                <AlertTriangle className={replayOffsetHours < 0 ? 'text-amber-400' : 'text-rose-500'} /> 311 TICKETS
              </h2>
              
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-slate-200 dark:text-white/5"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${(loadIndex / 100) * (2 * Math.PI * 40)} ${2 * Math.PI * 40}`}
                      strokeLinecap="round"
                      className={`${replayOffsetHours < 0 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000 ease-out`}
                    />
                  </svg>
                  <div className="flex flex-col items-center z-10">
                    <span className={`text-4xl font-black font-mono tracking-tight ${replayOffsetHours < 0 ? 'text-amber-400' : 'text-rose-500'}`}>
                      {loadIndex}%
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 mt-1">LOAD INDEX</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-100/80 dark:bg-black/20 p-3 rounded-xl border border-slate-200/80 dark:border-white/5">
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1 mb-1"><TrendingUp size={12}/> OPEN</div>
                  <div className={`text-lg font-mono font-bold ${replayOffsetHours < 0 ? 'text-amber-500 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                    {dynamicActiveTickets}
                  </div>
                </div>
                <div className="bg-slate-100/80 dark:bg-black/20 p-3 rounded-xl border border-slate-200/80 dark:border-white/5">
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1 mb-1"><CheckCircle size={12}/> AVG TIME</div>
                  <div className="text-lg font-mono font-bold text-slate-900 dark:text-white">4.2h</div>
                </div>
              </div>

              <div className="mt-2 space-y-2 max-h-36 overflow-y-auto pr-1">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
                  <span>{replayOffsetHours === 0 ? 'RECENT REPORTS' : `TICKETS AT T - ${Math.abs(replayOffsetHours)}H`}</span>
                  <span className="text-[10px] text-sky-500 dark:text-cyan-400 font-mono font-normal">{historicalReports.length} visible</span>
                </div>
                {historicalReports.slice(0, 4).map((report, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-slate-100/70 dark:bg-white/5 p-2 rounded-lg border border-slate-200/80 dark:border-white/5">
                    <div className="truncate pr-2">
                      <div className="text-slate-700 dark:text-slate-300 font-medium truncate">{report.category}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-[10px] truncate">{report.area} • {report.timestamp}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono shrink-0 ${
                      report.severity === 'Critical' 
                        ? 'bg-rose-500/20 text-rose-500 dark:text-rose-400' 
                        : report.severity === 'High' 
                        ? 'bg-orange-500/20 text-orange-500 dark:text-orange-400' 
                        : 'bg-amber-500/20 text-amber-500 dark:text-amber-400'
                    }`}>
                      {report.severity}
                    </span>
                  </div>
                ))}
                {historicalReports.length === 0 && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 italic py-2 text-center">
                    No active incidents logged prior to this time.
                  </div>
                )}
              </div>

              {/* Nested + REPORT INCIDENT Button: single plus */}
              <button 
                onClick={() => {
                  if (replayOffsetHours < 0) {
                    setReplayOffsetHours(0);
                    setIsReplaying(false);
                    setToast("Returned to LIVE feed to submit real-time incident report.");
                    setTimeout(() => setToast(null), 3500);
                  }
                  setIsModalOpen(true);
                }}
                className="mt-2 w-full py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.01]"
              >
                <Plus size={18} />
                <span>REPORT INCIDENT</span>
              </button>
            </div>

            {/* AI Synthesis Banner with Integrated Historical Replay Header */}
            <div className={`glass-panel p-4 flex-1 flex flex-col gap-2.5 transition-opacity ${
              replayOffsetHours < 0 
                ? 'border-l-4 border-l-amber-500 shadow-[0_8px_32px_rgba(245,158,11,0.15)]' 
                : 'border-l-4 border-l-rose-500'
            } ${isSelectingLocation ? 'opacity-20 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
              {/* Header Line */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    replayOffsetHours < 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-500'
                  }`}>
                    {replayOffsetHours < 0 ? <History size={18} /> : <Lightbulb size={18} />}
                  </div>
                  <div className={`text-xs font-bold tracking-widest ${
                    replayOffsetHours < 0 ? 'text-amber-400' : 'text-rose-500'
                  }`}>
                    {replayOffsetHours < 0 ? `HISTORICAL REPLAY SYNTHESIS` : 'LIVE AI SYNTHESIS'}
                  </div>
                </div>

                {/* Right side: Amber Simulation Badge + Return to Live Button */}
                {replayOffsetHours < 0 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-semibold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                      </span>
                      <span>
                        Simulating Historical State: <strong className="font-mono text-amber-300">T - {Math.abs(replayOffsetHours)} hrs</strong> <span className="text-amber-400/70 font-normal">(Read Only)</span>
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setReplayOffsetHours(0);
                        setIsReplaying(false);
                      }}
                      title="Return to real-time live feed"
                      className="px-3 py-1 text-xs font-bold bg-amber-500/25 hover:bg-amber-400 text-amber-300 hover:text-black rounded-full border border-amber-500/50 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <RotateCcw size={12} />
                      <span>Return to Live ⚡</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Explanatory Body Text */}
              <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed pl-1">
                {replayOffsetHours < 0 
                  ? `Historical municipal state reconstructed at T - ${Math.abs(replayOffsetHours)} hrs. Showing ${historicalReports.length} active civic complaint clusters across monitored Jaipur sectors. Intake system is operating in historical review mode.`
                  : complaintSynthesis
                }
              </div>
            </div>
          </div>
        </div>
        
        {/* Toast Notification */}
        {toast && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-[#13131a]/90 backdrop-blur-md border border-cyan-500/30 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.2)] animate-in fade-in slide-in-from-bottom-4 pointer-events-auto z-50">
            <CheckCircle className="text-cyan-500" size={20} />
            <span className="text-sm font-medium">{toast}</span>
          </div>
        )}
        
        {/* Map Selection Overlay Hint */}
        {isSelectingLocation && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-cyan-500/20 border border-cyan-500 text-cyan-100 px-6 py-3 rounded-full flex items-center gap-3 animate-pulse pointer-events-auto z-50 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <MapPin size={20} />
            <span className="font-bold">Click anywhere on the map to drop a pin</span>
            <button 
              onClick={() => setIsSelectingLocation(false)}
              className="ml-4 bg-white/10 hover:bg-white/20 p-1.5 rounded-full text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        {/* TimeTravel Slider */}
        <div className={`${isSelectingLocation ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
          <TimeTravelSlider />
        </div>
      </div>

      {/* Report Incident Modal Dialog */}
      {isModalOpen && !isSelectingLocation && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 pointer-events-auto">
          {/* Click outside to close area */}
          <div 
            className="absolute inset-0" 
            onClick={() => setIsModalOpen(false)} 
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-6 bg-white dark:bg-slate-900/95 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl">
            {/* Header with Title and Close 'X' Button */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700/60">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <AlertTriangle className="text-rose-500" size={20} />
                Report Civic Incident
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* CATEGORY */}
              <div className="relative z-30">
                <label className="block text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 mb-2 uppercase">CATEGORY</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryOpen(!isCategoryOpen);
                    setIsAreaOpen(false);
                  }}
                  className="w-full bg-slate-100 dark:bg-black/40 hover:bg-slate-200 dark:hover:bg-black/60 border border-slate-200 dark:border-white/10 hover:border-sky-500/50 rounded-xl p-3 text-slate-900 dark:text-white flex items-center justify-between transition-all group focus:outline-none focus:ring-2 focus:ring-sky-500/30 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedCategoryObj.bg} ${selectedCategoryObj.color}`}>
                      <CategoryIcon size={18} />
                    </div>
                    <span className="font-medium text-sm text-slate-800 dark:text-gray-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {selectedCategoryObj.label}
                    </span>
                  </div>
                  <ChevronDown 
                    size={18} 
                    className={`text-slate-400 dark:text-gray-400 group-hover:text-slate-700 dark:group-hover:text-white transition-transform duration-200 ${isCategoryOpen ? 'rotate-180 text-sky-500' : ''}`} 
                  />
                </button>

                {/* Glassmorphic Category Menu */}
                {isCategoryOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setIsCategoryOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-[#0e111a]/95 backdrop-blur-xl border border-slate-200 dark:border-white/15 rounded-xl shadow-2xl z-40 p-1.5 space-y-1 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                      {CATEGORY_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = category === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setCategory(opt.id);
                              setIsCategoryOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm text-left transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-sky-500/15 border border-sky-500/40 text-sky-600 dark:text-cyan-300 font-semibold' 
                                : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-md ${opt.bg} ${opt.color}`}>
                                <Icon size={16} />
                              </div>
                              <span>{opt.label}</span>
                            </div>
                            {isSelected && <Check size={16} className="text-sky-500 dark:text-cyan-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Extra Specification for Other Category */}
                {category === 'Other' && (
                  <div className="mt-3 p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/30 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle size={14} className="text-purple-600 dark:text-purple-400" />
                      <label className="text-[11px] font-bold tracking-widest text-purple-600 dark:text-purple-400 uppercase">
                        Specify Problem / Issue
                      </label>
                    </div>
                    <input
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g. Gas Leak, Noise Pollution, Stray Animals..."
                      className="w-full bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 outline-none focus:border-purple-400 transition-all shadow-inner"
                      autoFocus
                    />
                  </div>
                )}
              </div>
              
              {/* TARGET AREA */}
              <div className="relative z-20">
                <label className="block text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 mb-2 uppercase">TARGET AREA</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsAreaOpen(!isAreaOpen);
                    setIsCategoryOpen(false);
                  }}
                  className="w-full bg-slate-100 dark:bg-black/40 hover:bg-slate-200 dark:hover:bg-black/60 border border-slate-200 dark:border-white/10 hover:border-sky-500/50 rounded-xl p-3 text-slate-900 dark:text-white flex items-center justify-between transition-all group focus:outline-none focus:ring-2 focus:ring-sky-500/30 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${area === 'Other' ? 'bg-sky-500/15 text-sky-600 dark:text-cyan-400' : 'bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-gray-300'}`}>
                      <Building2 size={18} />
                    </div>
                    <span className="font-medium text-sm text-slate-800 dark:text-gray-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {area === 'Other' ? (customArea.trim() ? `Other (${customArea})` : 'Other / Custom Area') : area}
                    </span>
                  </div>
                  <ChevronDown 
                    size={18} 
                    className={`text-slate-400 dark:text-gray-400 group-hover:text-slate-700 dark:group-hover:text-white transition-transform duration-200 ${isAreaOpen ? 'rotate-180 text-sky-500' : ''}`} 
                  />
                </button>

                {/* Glassmorphic Area Menu */}
                {isAreaOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setIsAreaOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-[#0e111a]/95 backdrop-blur-xl border border-slate-200 dark:border-white/15 rounded-xl shadow-2xl z-40 p-1.5 space-y-1 max-h-56 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                      {AREA_OPTIONS.map((item) => {
                        const isSelected = area === item;
                        const isOther = item === 'Other';
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              setArea(item);
                              setIsAreaOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm text-left transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-sky-500/15 border border-sky-500/40 text-sky-600 dark:text-cyan-300 font-semibold' 
                                : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white border border-transparent'
                            }`}
                          >
                            <span className={isOther ? 'text-sky-600 dark:text-cyan-400 font-semibold' : ''}>
                              {isOther ? 'Other / Custom Area' : item}
                            </span>
                            {isSelected && <Check size={16} className="text-sky-500 dark:text-cyan-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Extra Specification for Other Area */}
                {area === 'Other' && (
                  <div className="mt-3 p-3.5 rounded-xl bg-sky-50 dark:bg-cyan-950/20 border border-sky-200 dark:border-cyan-500/30 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={14} className="text-sky-600 dark:text-cyan-400" />
                      <label className="text-[11px] font-bold tracking-widest text-sky-600 dark:text-cyan-400 uppercase">
                        Specify Custom Area / Neighborhood
                      </label>
                    </div>
                    <input
                      type="text"
                      required
                      value={customArea}
                      onChange={(e) => setCustomArea(e.target.value)}
                      placeholder="e.g. C-Scheme, Shastri Nagar, Civil Lines, Tonk Phatak..."
                      className="w-full bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 outline-none focus:border-sky-400 dark:focus:border-cyan-400 transition-all shadow-inner"
                      autoFocus
                    />
                  </div>
                )}
              </div>
              
              {/* SEVERITY LEVEL */}
              <div>
                <label className="block text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 mb-2 uppercase">SEVERITY LEVEL</label>
                <div className="flex gap-2">
                  {['Low', 'Medium', 'High', 'Critical'].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSeverity(level)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        severity === level 
                          ? (level === 'Critical' ? 'bg-rose-500 border-rose-500 text-white shadow-sm' : 'bg-sky-500 border-sky-500 text-white shadow-sm')
                          : 'bg-slate-100 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/30'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* LOCATION PIN */}
              <div>
                <label className="block text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 mb-2 uppercase">LOCATION PIN</label>
                <button
                  type="button"
                  onClick={() => setIsSelectingLocation(true)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-black/40 border border-dashed border-slate-300 dark:border-white/20 hover:border-sky-500 dark:hover:border-cyan-500 text-slate-700 dark:text-gray-300 hover:text-sky-600 dark:hover:text-cyan-400 p-3.5 rounded-xl transition-colors cursor-pointer text-sm font-medium"
                >
                  <MapPin size={18} className="text-rose-500" />
                  <span>{selectedLocation ? `Pinned: ${selectedLocation[0].toFixed(4)}, ${selectedLocation[1].toFixed(4)}` : 'Click to Pin on Map'}</span>
                </button>
              </div>
              
              {/* DESCRIPTION */}
              <div>
                <label className="block text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 mb-2 uppercase">DESCRIPTION</label>
                <textarea 
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief plain-language explanation of the issue..."
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-sky-500/30 transition-colors resize-none text-sm"
                  required
                ></textarea>
              </div>
              
              {/* Modal Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 transition-all cursor-pointer active:scale-95"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
