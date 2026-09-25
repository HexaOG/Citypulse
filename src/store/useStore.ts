import { create } from 'zustand';

export interface Event {
  eventId: string;
  sourceFeed: string;
  timestamp: string;
  coordinates: [number, number];
  category: string;
  severity: string;
  rawMetrics?: any;
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
  createdAtHoursAgo: number;
}

export const SECTORS: Record<string, { name: string; center: [number, number]; polygon: [number, number][] }> = {
  'Malviya Nagar': {
    name: 'Malviya Nagar',
    center: [26.8505, 75.8118],
    polygon: [
      [26.8300, 75.8000], [26.8700, 75.8000], [26.8700, 75.8300], [26.8300, 75.8300],
    ]
  },
  'Vaishali Nagar': {
    name: 'Vaishali Nagar',
    center: [26.9124, 75.7429],
    polygon: [
      [26.8900, 75.7200], [26.9300, 75.7200], [26.9300, 75.7600], [26.8900, 75.7600],
    ]
  },
  'Mansarovar': {
    name: 'Mansarovar',
    center: [26.8549, 75.7605],
    polygon: [
      [26.8300, 75.7300], [26.8800, 75.7300], [26.8800, 75.7800], [26.8300, 75.7800],
    ]
  },
  'Pink City': {
    name: 'Pink City (Walled City)',
    center: [26.9240, 75.8267],
    polygon: [
      [26.9100, 75.8100], [26.9400, 75.8100], [26.9400, 75.8400], [26.9100, 75.8400],
    ]
  },
  'Raja Park': {
    name: 'Raja Park',
    center: [26.8967, 75.8239],
    polygon: [
      [26.8800, 75.8100], [26.9100, 75.8100], [26.9100, 75.8400], [26.8800, 75.8400],
    ]
  },
  'Jagatpura': {
    name: 'Jagatpura',
    center: [26.8122, 75.8354],
    polygon: [
      [26.7900, 75.8100], [26.8400, 75.8100], [26.8400, 75.8600], [26.7900, 75.8600],
    ]
  },
  'Vidyadhar Nagar': {
    name: 'Vidyadhar Nagar',
    center: [26.9669, 75.7838],
    polygon: [
      [26.9400, 75.7600], [26.9900, 75.7600], [26.9900, 75.8100], [26.9400, 75.8100],
    ]
  },
  'Sodala': {
    name: 'Sodala',
    center: [26.8943, 75.7725],
    polygon: [
      [26.8800, 75.7500], [26.9100, 75.7500], [26.9100, 75.7900], [26.8800, 75.7900],
    ]
  }
};

export const INITIAL_COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: "CP-1082",
    category: "Power Outage",
    description: "Substation trip caused complete blackout across 4 residential blocks. Traffic signals inoperative.",
    area: "Malviya Nagar",
    street: "JLN Marg & Calgiri Road",
    severity: "Critical",
    timestamp: "8 mins ago",
    coordinates: [26.8505, 75.8118],
    confirmations: 19,
    userConfirmed: false,
    createdAtHoursAgo: 0.13
  },
  {
    id: "CP-1083",
    category: "Water Main Break",
    description: "Significant flooding on main avenue. Pressure dropped in adjacent apartment complexes.",
    area: "Pink City",
    street: "Moti Dungri & MI Road",
    severity: "High",
    timestamp: "24 mins ago",
    coordinates: [26.9240, 75.8267],
    confirmations: 42,
    userConfirmed: true,
    createdAtHoursAgo: 0.4
  },
  {
    id: "CP-1084",
    category: "Traffic Hazard",
    description: "Overturned delivery vehicle blocking two right lanes. EMS on scene.",
    area: "Vaishali Nagar",
    street: "Gandhi Path",
    severity: "High",
    timestamp: "45 mins ago",
    coordinates: [26.9124, 75.7429],
    confirmations: 8,
    userConfirmed: false,
    createdAtHoursAgo: 0.75
  },
  {
    id: "CP-1085",
    category: "Urban Hazard",
    description: "Scaffolding collapse at construction site. Structural team required for assessment.",
    area: "Mansarovar",
    street: "Madhyam Marg",
    severity: "Medium",
    timestamp: "1.5 hrs ago",
    coordinates: [26.8549, 75.7605],
    confirmations: 11,
    userConfirmed: false,
    createdAtHoursAgo: 1.5
  },
  {
    id: "CP-1078",
    category: "Broken Streetlight",
    description: "Dark zone stretching over 3 blocks near central market. Pedestrian safety concern.",
    area: "Raja Park",
    street: "Lane 4 Commercial Hub",
    severity: "Low",
    timestamp: "3 hrs ago",
    coordinates: [26.8967, 75.8239],
    confirmations: 5,
    userConfirmed: false,
    createdAtHoursAgo: 3
  },
  {
    id: "CP-1074",
    category: "Waterlogging/Drainage",
    description: "Stormwater drain backup with 1.5ft water accumulation under elevated road corridor.",
    area: "Sodala",
    street: "Elevated Road Pillar 14",
    severity: "High",
    timestamp: "6 hrs ago",
    coordinates: [26.8943, 75.7725],
    confirmations: 28,
    userConfirmed: false,
    createdAtHoursAgo: 6
  },
  {
    id: "CP-1070",
    category: "Garbage/Sanitation",
    description: "Commercial bin overflow spilling onto pedestrian pathway. Stray animals gathering.",
    area: "Vidyadhar Nagar",
    street: "Sector 2 Central Park East",
    severity: "Low",
    timestamp: "9 hrs ago",
    coordinates: [26.9669, 75.7838],
    confirmations: 14,
    userConfirmed: false,
    createdAtHoursAgo: 9
  },
  {
    id: "CP-1065",
    category: "Pothole/Road Hazard",
    description: "Severe deep crater on fast-lane approach causing bike slippages during rain.",
    area: "Jagatpura",
    street: "Mahal Road Junction",
    severity: "Medium",
    timestamp: "14 hrs ago",
    coordinates: [26.8122, 75.8354],
    confirmations: 17,
    userConfirmed: false,
    createdAtHoursAgo: 14
  },
  {
    id: "CP-1061",
    category: "Power Outage",
    description: "Distribution transformer failure affecting hospital periphery and residential quarters.",
    area: "Malviya Nagar",
    street: "Sector 4 Grid Feeder",
    severity: "Critical",
    timestamp: "18 hrs ago",
    coordinates: [26.8560, 75.8160],
    confirmations: 36,
    userConfirmed: false,
    createdAtHoursAgo: 18
  },
  {
    id: "CP-1055",
    category: "Fallen Tree/Debris",
    description: "Large banyan branch snapped across tram corridor. Crew dispatched.",
    area: "Pink City",
    street: "Chaura Rasta North",
    severity: "High",
    timestamp: "24 hrs ago",
    coordinates: [26.9210, 75.8220],
    confirmations: 19,
    userConfirmed: false,
    createdAtHoursAgo: 24
  },
  {
    id: "CP-1050",
    category: "Waterlogging/Drainage",
    description: "Culvert choke causing localized flooding across residential basements.",
    area: "Mansarovar",
    street: "Shipra Path Underpass",
    severity: "Medium",
    timestamp: "29 hrs ago",
    coordinates: [26.8510, 75.7550],
    confirmations: 23,
    userConfirmed: false,
    createdAtHoursAgo: 29
  },
  {
    id: "CP-1044",
    category: "Traffic Hazard",
    description: "Signal light timing malfunction causing severe 1.2km bottleneck at roundabout.",
    area: "Vaishali Nagar",
    street: "Amrapali Circle",
    severity: "High",
    timestamp: "35 hrs ago",
    coordinates: [26.9180, 75.7380],
    confirmations: 31,
    userConfirmed: false,
    createdAtHoursAgo: 35
  },
  {
    id: "CP-1038",
    category: "Broken Streetlight",
    description: "Three consecutive poles offline near school zone crosswalk.",
    area: "Sodala",
    street: "New Sanganer Road",
    severity: "Low",
    timestamp: "40 hrs ago",
    coordinates: [26.8910, 75.7680],
    confirmations: 7,
    userConfirmed: false,
    createdAtHoursAgo: 40
  },
  {
    id: "CP-1032",
    category: "Pothole/Road Hazard",
    description: "Asphalt subsidence near drainage trench. Marked with improvised warning cones.",
    area: "Raja Park",
    street: "Dhuleshwar Garden Ring",
    severity: "Medium",
    timestamp: "43 hrs ago",
    coordinates: [26.8940, 75.8290],
    confirmations: 15,
    userConfirmed: false,
    createdAtHoursAgo: 43
  },
  {
    id: "CP-1025",
    category: "Water Main Break",
    description: "Burst 18-inch ductile iron supply line. Sector pumping halted for emergency repairs.",
    area: "Vidyadhar Nagar",
    street: "Sector 6 Main Pipeline",
    severity: "Critical",
    timestamp: "46 hrs ago",
    coordinates: [26.9720, 75.7790],
    confirmations: 52,
    userConfirmed: false,
    createdAtHoursAgo: 46
  }
];

interface PulseState {
  chiScore: number;
  narrative: string;
  anomalies: any[];
  events: Event[];
  scenario: string;
  connected: boolean;
  isSimulated: boolean;
  
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

  // Historical Replay State (48H)
  replayOffsetHours: number; // -48 to 0 (0 = LIVE)
  isReplaying: boolean;
  setReplayOffsetHours: (offset: number) => void;
  setIsReplaying: (isReplaying: boolean) => void;
  stepReplayOffset: (deltaHours: number) => void;

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Actions
  setPulseState: (data: any) => void;
  addEvent: (event: Event) => void;
  setScenario: (scenario: string) => void;
  setConnectionStatus: (status: boolean, isSimulated?: boolean) => void;
  setIsSimulated: (isSimulated: boolean) => void;
  setIsSelectingLocation: (val: boolean) => void;
  setSelectedLocation: (loc: [number, number] | null) => void;
  setActiveTickets: (count: number) => void;
  setComplaintSynthesis: (msg: string) => void;
  
  // Community Feed Actions
  addCommunityReport: (report: CommunityReport) => void;
  confirmReportIssue: (id: string) => void;
  setCommunityReports: (reports: CommunityReport[]) => void;
  appendCommunityReportStoreOnly: (report: CommunityReport) => void;
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
      document.documentElement.classList.remove('dark');
      return 'light';
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      return 'dark';
    }
  }
  return 'dark';
};

const getInitialReports = (): CommunityReport[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('citypulse_db_reports');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse local database records", e);
      }
    }
  }
  return INITIAL_COMMUNITY_REPORTS;
};

export const usePulseStore = create<PulseState>((set) => ({
  chiScore: 100,
  narrative: "Connecting to civic streams...",
  anomalies: [],
  events: [],
  scenario: "normal",
  connected: false,
  isSimulated: false,
  theme: getInitialTheme(),
  
  isSelectingLocation: false,
  selectedLocation: null,
  activeTickets: 142,
  complaintSynthesis: "Surge in power failure tickets clustered in Sector 4 following localized rainfall. High correlation with current storm cell. Dispatching emergency crews.",
  
  communityReports: getInitialReports(),
  selectedAreaFilter: 'All Areas',
  focusedIncidentId: null,
  focusedLocation: null,
  isCommunityDrawerOpen: true,

  // Historical Replay initial state
  replayOffsetHours: 0,
  isReplaying: false,
  setReplayOffsetHours: (offset) => set({
    replayOffsetHours: Math.max(-48, Math.min(0, Math.round(offset)))
  }),
  setIsReplaying: (isReplaying) => set({ isReplaying }),
  stepReplayOffset: (deltaHours) => set((state) => {
    const nextOffset = Math.max(-48, Math.min(0, state.replayOffsetHours + deltaHours));
    return {
      replayOffsetHours: nextOffset,
      isReplaying: nextOffset === 0 ? false : state.isReplaying
    };
  }),

  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('citypulse_theme', nextTheme);
      if (nextTheme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
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
  setConnectionStatus: (connected, isSimulated = false) => set({ connected, isSimulated }),
  setIsSimulated: (isSimulated) => set({ isSimulated }),
  setIsSelectingLocation: (val) => set({ isSelectingLocation: val }),
  setSelectedLocation: (loc) => set({ selectedLocation: loc }),
  setActiveTickets: (count) => set({ activeTickets: count }),
  setComplaintSynthesis: (msg) => set({ complaintSynthesis: msg }),
  setCommunityReports: (reports) => set({ communityReports: reports }),
  appendCommunityReportStoreOnly: (report) => set((state) => {
    // avoid duplicates
    if (state.communityReports.some(r => r.id === report.id)) return state;
    return {
      communityReports: [{ ...report, createdAtHoursAgo: report.createdAtHoursAgo ?? 0 }, ...state.communityReports],
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
      ]
    };
  }),

  addCommunityReport: (report) => {
    // Post to backend database if available
    fetch('http://localhost:8080/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...report, createdAtHoursAgo: report.createdAtHoursAgo ?? 0 })
    }).catch(err => console.info('Local API unavailable, falling back to local database persistence.'));

    // Optimistically update store & persist locally
    set((state) => {
      if (state.communityReports.some(r => r.id === report.id)) return state;
      
      const newReports = [{ ...report, createdAtHoursAgo: report.createdAtHoursAgo ?? 0 }, ...state.communityReports];
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('citypulse_db_reports', JSON.stringify(newReports));
      }

      return {
        communityReports: newReports,
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
        ]
      };
    });
  },

  confirmReportIssue: (id) => set((state) => {
    const updatedReports = state.communityReports.map((item) => {
      if (item.id === id) {
        const isConfirmed = !!item.userConfirmed;
        return {
          ...item,
          userConfirmed: !isConfirmed,
          confirmations: isConfirmed ? item.confirmations - 1 : item.confirmations + 1
        };
      }
      return item;
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('citypulse_db_reports', JSON.stringify(updatedReports));
    }

    return { communityReports: updatedReports };
  }),

  setSelectedAreaFilter: (area) => set({ selectedAreaFilter: area }),
  setFocusedIncidentId: (id) => set({ focusedIncidentId: id }),
  setFocusedLocation: (loc) => set({ focusedLocation: loc }),
  setIsCommunityDrawerOpen: (open) => set({ isCommunityDrawerOpen: open })
}));
