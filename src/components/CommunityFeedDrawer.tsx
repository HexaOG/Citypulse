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
  'Waterlogging/Drainage': { icon: Droplets, color: 'text-zinc-300', bg: 'bg-rose-500/10' },
  'Pothole/Road Hazard': { icon: Construction, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  'Broken Streetlight': { icon: Lightbulb, color: 'text-yellow-300', bg: 'bg-yellow-500/10' },
  'Fallen Tree/Debris': { icon: TreePine, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  'Garbage/Sanitation': { icon: Trash2, color: 'text-zinc-300', bg: 'bg-rose-500/10' },
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
        return 'bg-rose-500/20 text-zinc-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]';
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

  return (
    <>
      {/* Collapsed Vertical Tab Trigger Pill */}
      {!isCommunityDrawerOpen && (
        <button
          type="button"
          onClick={() => setIsCommunityDrawerOpen(true)}
          aria-label="Open Community Reports Feed"
          className="fixed right-0 top-1/3 -tranzinc-y-1/2 z-[1050] pointer-events-auto flex flex-col items-center gap-2 py-4 px-2 rounded-l-xl shadow-xl border border-r-0 cursor-pointer transition-all bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-zinc-200/90 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 hover:px-3 group animate-in fade-in slide-in-from-right-2 duration-200"
        >
          <div className={`p-2 rounded-xl transition-all ${
            replayOffsetHours < 0 
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white' 
              : 'bg-white/10 text-zinc-100 dark:text-zinc-100 group-hover:bg-violet-500 group-hover:text-white'
          }`}>
            <MessageSquareText size={18} />
          </div>
          <span className="[writing-mode:vertical-lr] text-xs font-bold tracking-wider uppercase text-zinc-800 dark:text-zinc-100 py-1">
            COMMUNITY FEED
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border shadow-sm ${
            replayOffsetHours < 0 
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/40' 
              : 'bg-zinc-800 text-zinc-300 dark:text-zinc-300 border-rose-500/30'
          }`}>
            {timeFilteredReports.length}
          </span>
        </button>
      )}

      {/* Main Community Feed Drawer Panel */}
      <aside
        className={`fixed top-20 bottom-6 right-4 md:right-6 w-96 md:w-[430px] z-[1050] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800 shadow-2xl rounded-xl flex flex-col transition-transform duration-300 ease-in-out ${
          isCommunityDrawerOpen ? 'tranzinc-x-0 pointer-events-auto' : 'tranzinc-x-[calc(100%+32px)] pointer-events-none'
        }`}
      >
      {/* Drawer Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${
            replayOffsetHours < 0
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
              : 'bg-white/10 text-zinc-100 dark:text-zinc-100 border-white/20'
          }`}>
            <MessageSquareText size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base tracking-wide text-zinc-900 dark:text-white">Community Feed</h2>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full border ${
                replayOffsetHours < 0
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/40'
                  : 'bg-white/10 text-zinc-100 dark:text-zinc-100 border-white/20'
              }`}>
                {sortedReports.length} Reports
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
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
          <button
            onClick={() => {
              const headers = "ID,Category,Description,Area,Street,Severity,Confirmations\n";
              const rows = communityReports.map(r => `"${r.id}","${r.category}","${r.description.replace(/"/g, '""')}","${r.area}","${r.street}","${r.severity}",${r.confirmations}`).join("\n");
              const blob = new Blob([headers + rows], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `citypulse_incident_reports_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            title="Download database export"
          >
            <Globe size={14} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          
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
            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/15 text-zinc-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white transition-colors cursor-pointer border border-zinc-200/60 dark:border-transparent"
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
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-3 bg-zinc-50/80 dark:bg-zinc-900/50">
        {/* Row 1: Area Dropdown & Sort Toggle */}
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative" ref={areaDropdownRef}>
            <button
              type="button"
              onClick={() => setIsAreaMenuOpen(!isAreaMenuOpen)}
              aria-haspopup="listbox"
              aria-expanded={isAreaMenuOpen}
              className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/30 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                {selectedAreaFilter === 'All Areas' ? (
                  <Globe size={15} className="text-zinc-500 dark:text-zinc-400 shrink-0" />
                ) : (
                  <MapPin size={15} className="text-zinc-500 dark:text-zinc-400 shrink-0" />
                )}
                <span className="truncate">
                  {selectedAreaFilter === 'All Areas'
                    ? 'All City Areas'
                    : (selectedAreaFilter === 'Other' ? 'Other Areas' : selectedAreaFilter)}
                </span>
              </div>
              <ChevronDown
                size={15}
                className={`text-zinc-500 dark:text-zinc-400 transition-transform duration-200 shrink-0 ml-1.5 ${
                  isAreaMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isAreaMenuOpen && (
              <div
                role="listbox"
                className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl p-1 max-h-64 overflow-y-auto space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
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
                          ? 'bg-violet-500/10 text-zinc-100 dark:text-zinc-100 font-semibold'
                          : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {area === 'All Areas' ? (
                          <Globe size={14} className={isSelected ? 'text-zinc-100' : 'text-zinc-400'} />
                        ) : (
                          <MapPin size={14} className={isSelected ? 'text-zinc-100' : 'text-zinc-400'} />
                        )}
                        <span className="truncate">
                          {area === 'All Areas' ? 'All City Areas' : (area === 'Other' ? 'Other Areas' : area)}
                        </span>
                      </div>
                      {isSelected && <Check size={14} className="text-zinc-100 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => setSortBy(sortBy === 'recent' ? 'severity' : 'recent')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-800 dark:text-zinc-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer whitespace-nowrap"
            title="Toggle Sorting"
          >
            <ArrowUpDown size={15} className="text-zinc-500 dark:text-zinc-400" />
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
                    ? 'bg-violet-500 text-white font-medium border-white/20 shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
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
          <div className="text-center py-12 flex flex-col items-center gap-3 text-zinc-500 dark:text-gray-400">
            <AlertTriangle size={32} className="text-amber-500/70" />
            <p className="text-sm font-medium">No reports match your selected filters.</p>
            <button
              onClick={() => {
                setSelectedAreaFilter('All Areas');
                setSelectedCategory('All');
              }}
              className="text-xs text-zinc-100 hover:underline font-bold cursor-pointer"
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
                    ? 'bg-violet-50 dark:bg-violet-950/30 border-white/20 border-zinc-500 shadow-2xl'
                    : 'bg-zinc-50 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 shadow-sm'
                }`}
              >
                {/* Header: ID, Timestamp, Severity Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-100 transition-colors">
                      #{report.id}
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">• {report.timestamp}</span>
                    {report.isNew && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-violet-500/20 text-zinc-100 dark:text-violet-300 border border-white/20 animate-pulse">
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
                    <span className="text-zinc-900 dark:text-white font-semibold text-sm">{report.category}</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pl-1">
                    {report.description}
                  </p>
                </div>

                {/* Location Street Row */}
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 mb-2.5 pl-1">
                  <MapPin size={13} className="text-zinc-300 dark:text-zinc-300 shrink-0" />
                  <span className="truncate">{report.street}</span>
                </div>

                {/* Card Action Footer */}
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between gap-2">
                  {/* Upvote / Me Too Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmReportIssue(report.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      report.userConfirmed
                        ? 'bg-violet-500 text-white border-white/20 shadow-sm'
                        : 'bg-white dark:bg-zinc-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600'
                    }`}
                  >
                    {report.userConfirmed ? (
                      <CheckCircle2 size={13} className="text-white" />
                    ) : (
                      <span className="text-zinc-100">▲</span>
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
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-600"
                  >
                    <Crosshair size={13} className="text-zinc-100" />
                    <span>Focus Pin</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
    </>
  );
};
