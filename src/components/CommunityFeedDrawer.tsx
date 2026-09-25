import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquareText, 
  ChevronRight, 
  ChevronDown,
  Globe,
  Check,
  MapPin, 
  ArrowUpDown, 
  Droplets, 
  Zap, 
  Construction, 
  Trash2, 
  TreePine, 
  HelpCircle,
  Lightbulb,
  Crosshair,
  CheckCircle2,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { usePulseStore } from '../store/useStore';

const CATEGORY_MAP: Record<string, { icon: any; color: string; bg: string }> = {
  'Power Outage': { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  'Waterlogging/Drainage': { icon: Droplets, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  'Pothole/Road Hazard': { icon: Construction, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  'Broken Streetlight': { icon: Lightbulb, color: 'text-yellow-300', bg: 'bg-yellow-500/10' },
  'Fallen Tree/Debris': { icon: TreePine, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  'Garbage/Sanitation': { icon: Trash2, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  'Other': { icon: HelpCircle, color: 'text-purple-400', bg: 'bg-purple-500/10' }
};

const CATEGORY_PILLS = [
  { id: 'All', label: 'All' },
  { id: 'Power Outage', label: 'Outages' },
  { id: 'Waterlogging/Drainage', label: 'Waterlogging' },
  { id: 'Pothole/Road Hazard', label: 'Road Hazards' },
  { id: 'Garbage/Sanitation', label: 'Sanitation' },
  { id: 'Other', label: 'Other' }
];

const AREA_OPTIONS = [
  'All Areas',
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

const KNOWN_AREAS = [
  'Malviya Nagar',
  'Vaishali Nagar',
  'Mansarovar',
  'Pink City',
  'Raja Park',
  'Jagatpura',
  'Vidyadhar Nagar',
  'Sodala'
];

interface CommunityFeedDrawerProps {
  onOpenReportModal?: () => void;
}

export const CommunityFeedDrawer = ({ onOpenReportModal }: CommunityFeedDrawerProps) => {
  const {
    communityReports,
    selectedAreaFilter,
    setSelectedAreaFilter,
    focusedIncidentId,
    setFocusedIncidentId,
    setFocusedLocation,
    isCommunityDrawerOpen,
    setIsCommunityDrawerOpen,
    confirmReportIssue,
    replayOffsetHours
  } = usePulseStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recent' | 'severity'>('recent');
  const [isAreaMenuOpen, setIsAreaMenuOpen] = useState(false);
  const areaDropdownRef = useRef<HTMLDivElement>(null);

  // Close area dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (areaDropdownRef.current && !areaDropdownRef.current.contains(event.target as Node)) {
        setIsAreaMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAreaMenuOpen(false);
      }
    };

    if (isAreaMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAreaMenuOpen]);

  // Auto-scroll to card when focused from map or list
  useEffect(() => {
    if (focusedIncidentId) {
      const card = document.getElementById(`report-card-${focusedIncidentId}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [focusedIncidentId]);

  // Historical Replay Time Travel Filtering
  // Reports created after simulated scrubber time are hidden
  const simulatedTimeAgo = Math.abs(replayOffsetHours);
  const timeFilteredReports = communityReports.filter((report) => {
    const reportAgo = report.createdAtHoursAgo ?? 0;
    return reportAgo >= simulatedTimeAgo;
  });

  // Filter Reports
  const filteredReports = timeFilteredReports.filter((report) => {
    const matchesArea = selectedAreaFilter === 'All Areas' 
      ? true 
      : (selectedAreaFilter === 'Other'
          ? !KNOWN_AREAS.includes(report.area) || report.area === 'Other'
          : report.area === selectedAreaFilter);
    const matchesCat = selectedCategory === 'All' 
      ? true 
      : (selectedCategory === 'Other' 
          ? !['Power Outage', 'Waterlogging/Drainage', 'Pothole/Road Hazard', 'Broken Streetlight', 'Fallen Tree/Debris', 'Garbage/Sanitation'].includes(report.category) || report.category === 'Other'
          : report.category === selectedCategory);
    return matchesArea && matchesCat;
  });

  // Sort Reports
  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === 'severity') {
      const severityRank: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
    }
    return 0; // Default is order array (most recent first)
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Low':
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  const getCategoryDetails = (cat: string) => {
    return CATEGORY_MAP[cat] || CATEGORY_MAP['Other'];
  };

  // If collapsed, render right-side slide tab
  if (!isCommunityDrawerOpen) {
    return (
      <button
        onClick={() => setIsCommunityDrawerOpen(true)}
        aria-label="Open Community Reports Feed"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-40 bg-[#121821]/90 backdrop-blur-xl border-l border-y border-white/10 hover:border-cyan-500/50 p-3 rounded-l-2xl shadow-[0_0_25px_rgba(0,0,0,0.5)] flex flex-col items-center gap-2.5 text-white group cursor-pointer transition-all hover:pr-4"
      >
        <div className={`p-2 rounded-xl transition-all ${
          replayOffsetHours < 0 
            ? 'bg-amber-500/20 text-amber-400 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black' 
            : 'bg-cyan-500/20 text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-black'
        }`}>
          <MessageSquareText size={20} />
        </div>
        <div className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-bold tracking-widest uppercase text-gray-300 group-hover:text-cyan-300">
          {replayOffsetHours < 0 ? `Replay (T-${Math.abs(replayOffsetHours)}h)` : 'Community Feed'}
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border shadow-sm ${
          replayOffsetHours < 0 
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
            : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
        }`}>
          {timeFilteredReports.length}
        </span>
      </button>
    );
  }

  return (
    <aside className="absolute top-24 bottom-6 right-6 w-96 md:w-[430px] z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl flex flex-col pointer-events-auto animate-in slide-in-from-right-6 duration-300">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${
            replayOffsetHours < 0
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
              : 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30'
          }`}>
            <MessageSquareText size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base tracking-wide text-slate-900 dark:text-white">Community Feed</h2>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full border ${
                replayOffsetHours < 0
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/40'
                  : 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30'
              }`}>
                {sortedReports.length} Reports
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {replayOffsetHours < 0 ? (
                <span className="text-amber-600 dark:text-amber-400 font-mono font-semibold">
                  Historical view at T - {Math.abs(replayOffsetHours)}h
                </span>
              ) : (
                'Live resident incident verification stream'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Report</span>
            </button>
          )}
          <button
            onClick={() => setIsCommunityDrawerOpen(false)}
            aria-label="Collapse Community Feed"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/15 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer border border-slate-200/60 dark:border-transparent"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Historical Simulation Ribbon if in replay mode */}
      {replayOffsetHours < 0 && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-300">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Showing reports created ≤ T - {Math.abs(replayOffsetHours)}h
          </span>
          <span className="font-mono text-[10px] text-amber-500 font-bold">HISTORICAL</span>
        </div>
      )}

      {/* Filter & Sort Controls */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/80 dark:bg-slate-900/50">
        {/* Row 1: Area Dropdown & Sort Toggle */}
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative" ref={areaDropdownRef}>
            <button
              type="button"
              onClick={() => setIsAreaMenuOpen(!isAreaMenuOpen)}
              aria-haspopup="listbox"
              aria-expanded={isAreaMenuOpen}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/30 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                {selectedAreaFilter === 'All Areas' ? (
                  <Globe size={15} className="text-slate-500 dark:text-slate-400 shrink-0" />
                ) : (
                  <MapPin size={15} className="text-slate-500 dark:text-slate-400 shrink-0" />
                )}
                <span className="truncate">
                  {selectedAreaFilter === 'All Areas'
                    ? 'All City Areas'
                    : (selectedAreaFilter === 'Other' ? 'Other Areas' : selectedAreaFilter)}
                </span>
              </div>
              <ChevronDown
                size={15}
                className={`text-slate-500 dark:text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 ${
                  isAreaMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isAreaMenuOpen && (
              <div
                role="listbox"
                className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-1 max-h-64 overflow-y-auto space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
              >
                {AREA_OPTIONS.map((area) => {
                  const isSelected = selectedAreaFilter === area;
                  return (
                    <button
                      key={area}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setSelectedAreaFilter(area);
                        setIsAreaMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {area === 'All Areas' ? (
                          <Globe size={14} className={isSelected ? 'text-sky-500' : 'text-slate-400'} />
                        ) : (
                          <MapPin size={14} className={isSelected ? 'text-sky-500' : 'text-slate-400'} />
                        )}
                        <span className="truncate">
                          {area === 'All Areas' ? 'All City Areas' : (area === 'Other' ? 'Other Areas' : area)}
                        </span>
                      </div>
                      {isSelected && <Check size={14} className="text-sky-500 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => setSortBy(sortBy === 'recent' ? 'severity' : 'recent')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/30 cursor-pointer whitespace-nowrap"
            title="Toggle Sorting"
          >
            <ArrowUpDown size={15} className="text-slate-500 dark:text-slate-400" />
            <span>{sortBy === 'recent' ? 'Most Recent' : 'High Severity'}</span>
          </button>
        </div>

        {/* Row 2: Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_PILLS.map((pill) => {
            const isActive = selectedCategory === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setSelectedCategory(pill.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? 'bg-sky-500 text-white font-medium border-sky-500 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reports Feed List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 pr-3">
        {sortedReports.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center gap-3 text-slate-500 dark:text-gray-400">
            <AlertTriangle size={32} className="text-amber-500/70" />
            <p className="text-sm font-medium">No reports match your selected filters.</p>
            <button
              onClick={() => {
                setSelectedAreaFilter('All Areas');
                setSelectedCategory('All');
              }}
              className="text-xs text-sky-500 hover:underline font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          sortedReports.map((report) => {
            const isFocused = focusedIncidentId === report.id;
            const catDetails = getCategoryDetails(report.category);
            const Icon = catDetails.icon;

            return (
              <div
                key={report.id}
                id={`report-card-${report.id}`}
                onClick={() => {
                  setFocusedIncidentId(report.id);
                  setFocusedLocation({ coordinates: report.coordinates, zoom: 16 });
                }}
                className={`group rounded-xl p-3 transition-all duration-200 cursor-pointer border shadow-sm relative overflow-hidden ${
                  isFocused
                    ? 'bg-sky-50 dark:bg-sky-950/30 border-sky-500 ring-2 ring-sky-500/40 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm'
                }`}
              >
                {/* Header: ID, Timestamp, Severity Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-sky-500 transition-colors">
                      #{report.id}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">• {report.timestamp}</span>
                    {report.isNew && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-500/40 animate-pulse">
                        NEW
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getSeverityBadge(report.severity)}`}>
                    {report.severity}
                  </span>
                </div>

                {/* Category Badge & Description */}
                <div className="space-y-1.5 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${catDetails.bg} ${catDetails.color}`}>
                      <Icon size={14} />
                    </div>
                    <span className="text-slate-900 dark:text-white font-semibold text-sm">{report.category}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
                    {report.description}
                  </p>
                </div>

                {/* Location Street Row */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-2.5 pl-1">
                  <MapPin size={13} className="text-rose-500 dark:text-rose-400 shrink-0" />
                  <span className="truncate">{report.street}</span>
                </div>

                {/* Card Action Footer */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2">
                  {/* Upvote / Me Too Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmReportIssue(report.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      report.userConfirmed
                        ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                        : 'bg-white dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {report.userConfirmed ? (
                      <CheckCircle2 size={13} className="text-white" />
                    ) : (
                      <span className="text-sky-500">▲</span>
                    )}
                    <span>
                      {report.userConfirmed ? 'Confirmed' : 'Confirm Issue'} ({report.confirmations})
                    </span>
                  </button>

                  {/* Show on Map Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFocusedIncidentId(report.id);
                      setFocusedLocation({ coordinates: report.coordinates, zoom: 16 });
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200 dark:border-slate-600"
                  >
                    <Crosshair size={13} className="text-sky-500" />
                    <span>Focus Pin</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
