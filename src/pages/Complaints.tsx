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
  'Sodala'
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
    events
  } = usePulseStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  
  // Form State
  const [category, setCategory] = useState('Power Outage');
  const [customCategory, setCustomCategory] = useState('');
  const [area, setArea] = useState('Malviya Nagar');
  const [severity, setSeverity] = useState('High');
  const [description, setDescription] = useState('');

  // Dropdown menus state
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAreaOpen, setIsAreaOpen] = useState(false);

  const selectedCategoryObj = CATEGORY_OPTIONS.find(c => c.id === category) || CATEGORY_OPTIONS[0];
  const CategoryIcon = selectedCategoryObj.icon;

  // Combine static incidents with live ones from store
  const liveIncidents = events
    .filter(ev => ev.sourceFeed === '311')
    .map(ev => ({
      type: ev.category,
      area: 'Map Pinned',
      time: 'Just now',
      status: 'Active'
    })).reverse();

  const incidents = [
    ...liveIncidents,
    { type: 'Waterlogging', area: 'Malviya Nagar', time: '10 min ago', status: 'Active' },
    { type: 'Power Outage', area: 'Pink City', time: '25 min ago', status: 'Active' },
    { type: 'Pothole', area: 'JLN Marg', time: '1 hr ago', status: 'Investigating' }
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) {
      alert("Please pin a location on the map first.");
      return;
    }

    const finalCategory = category === 'Other' ? (customCategory.trim() || 'Other Problem') : category;
    const eventId = `CP-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Live Submission Sync to Community Feed
    addCommunityReport({
      id: eventId,
      category: finalCategory,
      description: description.trim() || `${finalCategory} reported in ${area}.`,
      area,
      street: `${area} • Verified Resident Report`,
      severity: severity as any,
      timestamp: 'Just now',
      coordinates: selectedLocation,
      confirmations: 1,
      userConfirmed: true,
      isNew: true
    });

    setComplaintSynthesis(`New report logged: ${finalCategory} in ${area}. Anomaly detection recalculating cluster severity...`);
    setToast(`Incident ${eventId} successfully broadcasted to community stream.`);
    
    // Auto-hide toast
    setTimeout(() => setToast(null), 4000);
    
    setIsModalOpen(false);
    setSelectedLocation(null);
    setDescription('');
    setCustomCategory('');
  };

  return (
    <div className="relative w-full h-full">
      <CivicMap />
      
      {/* Overlay Layer */}
      <div className={`absolute inset-0 z-10 ${isSelectingLocation ? 'pointer-events-none' : 'pointer-events-none'}`}>
        <Header />
        
        {/* Floating Action Button */}
        <div className={`absolute bottom-10 left-24 z-30 ${isSelectingLocation ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'}`}>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3.5 rounded-full font-bold shadow-[0_0_25px_rgba(244,63,94,0.6)] transition-all transform hover:scale-105 cursor-pointer"
          >
            <Plus size={20} />
            REPORT INCIDENT
          </button>
        </div>

        {/* Community Feed Drawer */}
        <div className={`${isSelectingLocation ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
          <CommunityFeedDrawer onOpenReportModal={() => setIsModalOpen(true)} />
        </div>

        <div className={`absolute top-24 left-24 ${isCommunityDrawerOpen ? 'right-[460px]' : 'right-16'} transition-all duration-300 flex items-start justify-between pointer-events-none`}>
          <div className="flex gap-6 items-start w-full">
            {/* Key Metrics Card */}
            <div className={`glass-panel p-6 flex flex-col gap-4 w-72 transition-opacity ${isSelectingLocation ? 'opacity-20 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
              <h2 className="text-xl font-bold tracking-wider mb-2 flex items-center gap-2">
                <AlertTriangle className="text-rose-500" /> 311 TICKETS
              </h2>
              
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-4 border-rose-500/30">
                  <div className="absolute inset-0 rounded-full border-4 border-rose-500 border-r-transparent animate-[spin_5s_linear_infinite_reverse]" />
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-rose-500">{Math.min(100, Math.floor(activeTickets / 2))}%</span>
                    <span className="text-[10px] tracking-widest text-gray-400">LOAD INDEX</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="text-xs text-gray-400 flex items-center gap-1 mb-1"><TrendingUp size={12}/> OPEN</div>
                  <div className="text-lg font-mono font-bold text-rose-500">{activeTickets}</div>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="text-xs text-gray-400 flex items-center gap-1 mb-1"><CheckCircle size={12}/> AVG TIME</div>
                  <div className="text-lg font-mono font-bold text-emerald-500">4.2h</div>
                </div>
              </div>

              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto pr-1">
                <div className="text-xs font-bold text-gray-400 mb-1">RECENT REPORTS</div>
                {incidents.map((incident, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-white/5 p-2 rounded border border-white/5">
                    <div>
                      <div className="text-white">{incident.type}</div>
                      <div className="text-gray-500 text-[10px]">{incident.area} • {incident.time}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-[9px] ${incident.status === 'Active' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'}`}>
                      {incident.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Synthesis Banner */}
            <div className={`glass-panel p-4 flex-1 flex items-center gap-4 border-l-4 border-l-rose-500 transition-opacity ${isSelectingLocation ? 'opacity-20 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
              <div className="p-3 bg-rose-500/20 rounded-full text-rose-500">
                <Lightbulb size={24} />
              </div>
              <div>
                <div className="text-xs font-bold tracking-widest text-rose-500 mb-1">LIVE AI SYNTHESIS</div>
                <div className="text-sm text-gray-300 leading-relaxed">
                  {complaintSynthesis}
                </div>
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

        {/* Report Incident Modal */}
        {isModalOpen && !isSelectingLocation && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto p-4 overflow-y-auto">
            <div className="glass-panel w-[520px] max-h-[92vh] overflow-y-auto p-8 border border-white/10 relative shadow-2xl">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <AlertTriangle className="text-cyan-500" />
                Report Civic Incident
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Custom Category Dropdown */}
                <div className="relative z-30">
                  <label className="block text-xs font-bold tracking-widest text-gray-400 mb-2">CATEGORY</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCategoryOpen(!isCategoryOpen);
                      setIsAreaOpen(false);
                    }}
                    className="w-full bg-black/40 hover:bg-black/60 border border-white/10 hover:border-cyan-500/50 rounded-xl p-3 text-white flex items-center justify-between transition-all group focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${selectedCategoryObj.bg} ${selectedCategoryObj.color}`}>
                        <CategoryIcon size={18} />
                      </div>
                      <span className="font-medium text-sm text-gray-200 group-hover:text-white transition-colors">
                        {selectedCategoryObj.label}
                      </span>
                    </div>
                    <ChevronDown 
                      size={18} 
                      className={`text-gray-400 group-hover:text-white transition-transform duration-200 ${isCategoryOpen ? 'rotate-180 text-cyan-400' : ''}`} 
                    />
                  </button>

                  {/* Glassmorphic Category Menu */}
                  {isCategoryOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setIsCategoryOpen(false)}
                      />
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#0e111a]/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-[0_12px_35px_rgba(0,0,0,0.85)] z-40 p-1.5 space-y-1 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
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
                              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm text-left transition-all ${
                                isSelected 
                                  ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-semibold' 
                                  : 'text-gray-300 hover:bg-white/[0.06] hover:text-white border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-md ${opt.bg} ${opt.color}`}>
                                  <Icon size={16} />
                                </div>
                                <span>{opt.label}</span>
                              </div>
                              {isSelected && <Check size={16} className="text-cyan-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Extra Specification for Other */}
                  {category === 'Other' && (
                    <div className="mt-3 p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center gap-2 mb-2">
                        <HelpCircle size={14} className="text-purple-400" />
                        <label className="text-[11px] font-bold tracking-widest text-purple-400 uppercase">
                          Specify Problem / Issue
                        </label>
                      </div>
                      <input
                        type="text"
                        required
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="e.g. Gas Leak, Noise Pollution, Stray Animals..."
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-400 transition-all shadow-inner"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
                
                {/* Custom Target Area Dropdown */}
                <div className="relative z-20">
                  <label className="block text-xs font-bold tracking-widest text-gray-400 mb-2">TARGET AREA</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAreaOpen(!isAreaOpen);
                      setIsCategoryOpen(false);
                    }}
                    className="w-full bg-black/40 hover:bg-black/60 border border-white/10 hover:border-cyan-500/50 rounded-xl p-3 text-white flex items-center justify-between transition-all group focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5 text-gray-300">
                        <Building2 size={18} />
                      </div>
                      <span className="font-medium text-sm text-gray-200 group-hover:text-white transition-colors">
                        {area}
                      </span>
                    </div>
                    <ChevronDown 
                      size={18} 
                      className={`text-gray-400 group-hover:text-white transition-transform duration-200 ${isAreaOpen ? 'rotate-180 text-cyan-400' : ''}`} 
                    />
                  </button>

                  {/* Glassmorphic Area Menu */}
                  {isAreaOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setIsAreaOpen(false)}
                      />
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#0e111a]/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-[0_12px_35px_rgba(0,0,0,0.85)] z-40 p-1.5 space-y-1 max-h-52 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                        {AREA_OPTIONS.map((item) => {
                          const isSelected = area === item;
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                setArea(item);
                                setIsAreaOpen(false);
                              }}
                              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm text-left transition-all ${
                                isSelected 
                                  ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-semibold' 
                                  : 'text-gray-300 hover:bg-white/[0.06] hover:text-white border border-transparent'
                              }`}
                            >
                              <span>{item}</span>
                              {isSelected && <Check size={16} className="text-cyan-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 mb-2">SEVERITY LEVEL</label>
                  <div className="flex gap-2">
                    {['Low', 'Medium', 'High', 'Critical'].map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSeverity(level)}
                        className={`flex-1 py-2 rounded-full text-sm font-bold border transition-colors ${
                          severity === level 
                            ? (level === 'Critical' ? 'bg-rose-500 border-rose-500 text-white' : 'bg-cyan-500 border-cyan-500 text-black')
                            : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 mb-2">LOCATION PIN</label>
                  <button
                    type="button"
                    onClick={() => setIsSelectingLocation(true)}
                    className="w-full flex items-center justify-center gap-2 bg-black/40 border border-dashed border-white/20 hover:border-cyan-500 hover:text-cyan-500 text-gray-400 p-4 rounded-lg transition-colors"
                  >
                    <MapPin size={18} />
                    {selectedLocation ? `Pinned: ${selectedLocation[0].toFixed(4)}, ${selectedLocation[1].toFixed(4)}` : 'Click to Pin on Map'}
                  </button>
                </div>
                
                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 mb-2">DESCRIPTION</label>
                  <textarea 
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief plain-language explanation of the issue..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-cyan-500 transition-colors resize-none"
                    required
                  ></textarea>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all"
                  >
                    Broadcast Incident
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
