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
}

export const SECTORS: Record<string, { name: string; center: [number, number]; polygon: [number, number][] }> = {
  'Sector 4': {
    name: 'Sector 4 (Metro Center)',
    center: [26.9180, 75.7820],
    polygon: [
      [26.9135, 75.7775],
      [26.9225, 75.7775],
      [26.9225, 75.7850],
      [26.9135, 75.7850],
    ]
  },
  'East Corridor': {
    name: 'East Corridor (Waterfront)',
    center: [26.9100, 75.7900],
    polygon: [
      [26.9040, 75.7830],
      [26.9160, 75.7830],
      [26.9160, 75.7980],
      [26.9040, 75.7980],
    ]
  },
  'Central Bypass': {
    name: 'Central Bypass (West Highway)',
    center: [26.9150, 75.7750],
    polygon: [
      [26.9070, 75.7680],
      [26.9210, 75.7680],
      [26.9210, 75.7820],
      [26.9070, 75.7820],
    ]
  },
  'North Ring': {
    name: 'North Ring (Heights)',
    center: [26.9250, 75.7860],
    polygon: [
      [26.9210, 75.7770],
      [26.9300, 75.7770],
      [26.9300, 75.7950],
      [26.9210, 75.7950],
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
    coordinates: [26.9185, 75.7815],
    confirmations: 19,
    userConfirmed: false
  },
  {
    id: "CP-1083",
    category: "Water Main Break",
    description: "Significant flooding on main avenue. Pressure dropped in adjacent apartment complexes.",
    area: "East Corridor",
    street: "Riverside Dr & 12th",
    severity: "High",
    timestamp: "24 mins ago",
    coordinates: [26.9110, 75.7920],
    confirmations: 42,
    userConfirmed: true
  },
  {
    id: "CP-1084",
    category: "Traffic Hazard",
    description: "Overturned delivery vehicle blocking two right lanes. EMS on scene.",
    area: "Central Bypass",
    street: "Westbound Mile 4",
    severity: "High",
    timestamp: "45 mins ago",
    coordinates: [26.9155, 75.7730],
    confirmations: 8,
    userConfirmed: false
  },
  {
    id: "CP-1085",
    category: "Urban Hazard",
    description: "Scaffolding collapse at construction site. Structural team required for assessment.",
    area: "North Ring",
    street: "Heights Boulevard",
    severity: "Medium",
    timestamp: "1 hr ago",
    coordinates: [26.9230, 75.7830],
    confirmations: 11,
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
