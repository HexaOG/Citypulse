import { create } from 'zustand';

export interface Event {
  eventId: string;
  sourceFeed: string;
  timestamp: string;
  coordinates: [number, number];
  category: string;
  severity: string;
}

export interface CommunityReport {
  id: string; // e.g. "CP-1082"
  category: string;
  description: string;
  area: string;
  street: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  timestamp: string;
  coordinates: [number, number];
  confirmations: number;
  userConfirmed?: boolean;
  isNew?: boolean;
}

export const SECTORS: Record<string, { name: string; center: [number, number]; polygon: [number, number][] }> = {
  'Sector 4': {
    name: 'Sector 4 (Metro Center)',
    center: [40.7180, -74.0020],
    polygon: [
      [40.7135, -74.0075],
      [40.7225, -74.0075],
      [40.7225, -73.9950],
      [40.7135, -73.9950],
    ]
  },
  'East Corridor': {
    name: 'East Corridor (Waterfront)',
    center: [40.7100, -73.9900],
    polygon: [
      [40.7040, -73.9970],
      [40.7160, -73.9970],
      [40.7160, -73.9820],
      [40.7040, -73.9820],
    ]
  },
  'Central Bypass': {
    name: 'Central Bypass (West Highway)',
    center: [40.7150, -74.0150],
    polygon: [
      [40.7070, -74.0220],
      [40.7210, -74.0220],
      [40.7210, -74.0080],
      [40.7070, -74.0080],
    ]
  },
  'North Ring': {
    name: 'North Ring (Heights)',
    center: [40.7250, -74.0040],
    polygon: [
      [40.7210, -74.0130],
      [40.7300, -74.0130],
      [40.7300, -73.9950],
      [40.7210, -73.9950],
    ]
  }
};

export const INITIAL_COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: "CP-1082",
    category: "Power Outage",
    description: "Substation trip caused complete blackout across 4 residential blocks. Traffic signals inoperative.",
    area: "Sector 4",
    street: "Maple Ave & 4th Street",
    severity: "Critical",
    timestamp: "8 mins ago",
    coordinates: [40.7185, -74.0015],
    confirmations: 19,
    userConfirmed: false
  },
  {
    id: "CP-1079",
    category: "Waterlogging/Drainage",
    description: "Storm drain blocked by debris; water accumulated up to curb height blocking lane access.",
    area: "Sector 4",
    street: "Oak Ridge Blvd",
    severity: "High",
    timestamp: "18 mins ago",
    coordinates: [40.7165, -74.0040],
    confirmations: 14,
    userConfirmed: true
  },
  {
    id: "CP-1065",
    category: "Pothole/Road Hazard",
    description: "Deep crater in right transit lane causing severe vehicle swerving and tire damage.",
    area: "Central Bypass",
    street: "Bypass Expressway Exit 12",
    severity: "Medium",
    timestamp: "35 mins ago",
    coordinates: [40.7130, -74.0170],
    confirmations: 8,
    userConfirmed: false
  },
  {
    id: "CP-1054",
    category: "Broken Streetlight",
    description: "Multiple overhead LED fixtures flickering violently and dark on pedestrian crossing.",
    area: "East Corridor",
    street: "Hudson Way Crossing",
    severity: "Low",
    timestamp: "1 hr ago",
    coordinates: [40.7090, -73.9880],
    confirmations: 5,
    userConfirmed: false
  },
  {
    id: "CP-1048",
    category: "Garbage/Sanitation",
    description: "Overflowing commercial dumpster spilling onto bicycle path near public park.",
    area: "North Ring",
    street: "North Ring Greenway",
    severity: "Low",
    timestamp: "2 hrs ago",
    coordinates: [40.7265, -74.0025],
    confirmations: 7,
    userConfirmed: false
  },
  {
    id: "CP-1041",
    category: "Fallen Tree/Debris",
    description: "Large pine branch snapped in high wind and resting across eastbound traffic lane.",
    area: "East Corridor",
    street: "East Riverfront Parkway",
    severity: "High",
    timestamp: "3 hrs ago",
    coordinates: [40.7115, -73.9920],
    confirmations: 22,
    userConfirmed: false
  }
];

interface PulseState {
  chiScore: number;
  narrative: string;
  anomalies: any[];
  events: Event[];
  scenario: string;
  connected: boolean;
  
  // Incident Reporting State
  isSelectingLocation: boolean;
  selectedLocation: [number, number] | null;
  activeTickets: number;
  complaintSynthesis: string;
  
  // Community Feed State
  communityReports: CommunityReport[];
  selectedAreaFilter: string;
  focusedIncidentId: string | null;
  focusedLocation: { coordinates: [number, number]; zoom?: number } | null;
  isCommunityDrawerOpen: boolean;

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Actions
  setPulseState: (data: any) => void;
  addEvent: (event: Event) => void;
  setScenario: (scenario: string) => void;
  setConnectionStatus: (status: boolean) => void;
  setIsSelectingLocation: (val: boolean) => void;
  setSelectedLocation: (loc: [number, number] | null) => void;
  setActiveTickets: (count: number) => void;
  setComplaintSynthesis: (msg: string) => void;
  
  // Community Feed Actions
  addCommunityReport: (report: CommunityReport) => void;
  confirmReportIssue: (id: string) => void;
  setSelectedAreaFilter: (area: string) => void;
  setFocusedIncidentId: (id: string | null) => void;
  setFocusedLocation: (loc: { coordinates: [number, number]; zoom?: number } | null) => void;
  setIsCommunityDrawerOpen: (open: boolean) => void;
}

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('citypulse_theme');
    if (saved === 'light') {
      document.documentElement.classList.add('light');
      return 'light';
    }
  }
  return 'dark';
};

export const usePulseStore = create<PulseState>((set) => ({
  chiScore: 100,
  narrative: "Connecting to civic streams...",
  anomalies: [],
  events: [],
  scenario: "normal",
  connected: false,
  theme: getInitialTheme(),
  
  isSelectingLocation: false,
  selectedLocation: null,
  activeTickets: 142,
  complaintSynthesis: "Surge in power failure tickets clustered in Sector 4 following localized rainfall. High correlation with current storm cell. Dispatching emergency crews.",
  
  communityReports: INITIAL_COMMUNITY_REPORTS,
  selectedAreaFilter: 'All Areas',
  focusedIncidentId: null,
  focusedLocation: null,
  isCommunityDrawerOpen: true,

  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('citypulse_theme', nextTheme);
      if (nextTheme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    }
    return { theme: nextTheme };
  }),

  setPulseState: (data) => set({
    chiScore: data.status.chiScore,
    narrative: data.narrative,
    anomalies: data.anomalies,
  }),
  addEvent: (event) => set((state) => ({
    events: [...state.events, event].slice(-100) // Keep last 100 events
  })),
  setScenario: (scenario) => set({ scenario }),
  setConnectionStatus: (connected) => set({ connected }),
  setIsSelectingLocation: (val) => set({ isSelectingLocation: val }),
  setSelectedLocation: (loc) => set({ selectedLocation: loc }),
  setActiveTickets: (count) => set({ activeTickets: count }),
  setComplaintSynthesis: (msg) => set({ complaintSynthesis: msg }),

  addCommunityReport: (report) => set((state) => ({
    communityReports: [report, ...state.communityReports],
    activeTickets: state.activeTickets + 1,
    events: [
      {
        eventId: report.id,
        sourceFeed: '311',
        timestamp: new Date().toISOString(),
        coordinates: report.coordinates,
        category: report.category,
        severity: report.severity
      },
      ...state.events
    ].slice(-100)
  })),

  confirmReportIssue: (id) => set((state) => ({
    communityReports: state.communityReports.map((item) => {
      if (item.id === id) {
        const isConfirmed = !!item.userConfirmed;
        return {
          ...item,
          userConfirmed: !isConfirmed,
          confirmations: isConfirmed ? item.confirmations - 1 : item.confirmations + 1
        };
      }
      return item;
    })
  })),

  setSelectedAreaFilter: (area) => set({ selectedAreaFilter: area }),
  setFocusedIncidentId: (id) => set({ focusedIncidentId: id }),
  setFocusedLocation: (loc) => set({ focusedLocation: loc }),
  setIsCommunityDrawerOpen: (open) => set({ isCommunityDrawerOpen: open })
}));
