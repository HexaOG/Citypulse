import { useState, useEffect } from 'react';
import { 
  MessageSquareText, 
  ChevronRight, 
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
    confirmReportIssue
  } = usePulseStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recent' | 'severity'>('recent');

  // Auto-scroll to card when focused from map or list
  useEffect(() => {
    if (focusedIncidentId) {
      const card = document.getElementById(`report-card-${focusedIncidentId}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [focusedIncidentId]);

  // Filter Reports
  const filteredReports = communityReports.filter((report) => {
    const matchesArea = selectedAreaFilter === 'All Areas' || report.area === selectedAreaFilter;
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
        <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-black transition-all">
          <MessageSquareText size={20} />
        </div>
        <div className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-bold tracking-widest uppercase text-gray-300 group-hover:text-cyan-300">
          Community Feed
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]">
          {communityReports.length}
        </span>
      </button>
    );
  }

  return (
    <aside className="absolute top-24 bottom-6 right-6 w-96 md:w-[430px] z-40 glass-panel flex flex-col pointer-events-auto border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl animate-in slide-in-from-right-6 duration-300">
      {/* Drawer Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <MessageSquareText size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base tracking-wide">Community Feed</h2>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                {sortedReports.length} Reports
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Live resident incident verification stream</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-[0_0_12px_rgba(244,63,94,0.4)] transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Report</span>
            </button>
          )}
          <button
            onClick={() => setIsCommunityDrawerOpen(false)}
            aria-label="Collapse Community Feed"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Filter & Sort Controls */}
      <div className="p-4 border-b border-white/10 space-y-3 bg-black/20">
        {/* Row 1: Area Dropdown & Sort Toggle */}
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <select
              value={selectedAreaFilter}
              onChange={(e) => setSelectedAreaFilter(e.target.value)}
              className="w-full bg-[#0a0d14]/90 border border-white/15 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-cyan-400 transition-colors text-white cursor-pointer"
            >
              {AREA_OPTIONS.map((area) => (
                <option key={area} value={area} className="bg-[#111420] text-white">
                  {area === 'All Areas' ? '🌐 All City Areas' : `📍 ${area}`}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setSortBy(sortBy === 'recent' ? 'severity' : 'recent')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all cursor-pointer whitespace-nowrap"
            title="Toggle Sorting"
          >
            <ArrowUpDown size={14} className="text-cyan-400" />
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
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400 border-white/5 hover:text-white'
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
          <div className="text-center py-12 flex flex-col items-center gap-3 text-gray-400">
            <AlertTriangle size={32} className="text-amber-500/60" />
            <p className="text-sm font-medium">No reports match your selected filters.</p>
            <button
              onClick={() => {
                setSelectedAreaFilter('All Areas');
                setSelectedCategory('All');
              }}
              className="text-xs text-cyan-400 hover:underline font-bold"
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
                className={`group rounded-xl p-4 transition-all duration-200 cursor-pointer border relative overflow-hidden ${
                  isFocused
                    ? 'bg-cyan-950/30 border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                    : 'bg-black/30 hover:bg-black/50 border-white/10 hover:border-white/20'
                }`}
              >
                {/* Header: ID, Timestamp, Severity Badge */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-400 group-hover:text-cyan-300 transition-colors">
                      #{report.id}
                    </span>
                    <span className="text-[11px] text-gray-500">• {report.timestamp}</span>
                    {report.isNew && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                        NEW
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getSeverityBadge(report.severity)}`}>
                    {report.severity}
                  </span>
                </div>

                {/* Category Badge & Description */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${catDetails.bg} ${catDetails.color}`}>
                      <Icon size={14} />
                    </div>
                    <span className="font-bold text-sm text-gray-100">{report.category}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed pl-1">
                    {report.description}
                  </p>
                </div>

                {/* Location Street Row */}
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-3 pl-1">
                  <MapPin size={13} className="text-rose-400 shrink-0" />
                  <span className="truncate">{report.street}</span>
                </div>

                {/* Card Action Footer */}
                <div className="pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
                  {/* Upvote / Me Too Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmReportIssue(report.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      report.userConfirmed
                        ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                        : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {report.userConfirmed ? (
                      <CheckCircle2 size={13} className="text-black" />
                    ) : (
                      <span className="text-cyan-400">▲</span>
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
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-gray-400 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-white/10"
                  >
                    <Crosshair size={13} className="text-cyan-400" />
                    <span>Show on Map</span>
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
