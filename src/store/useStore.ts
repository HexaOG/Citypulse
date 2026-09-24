import { create } from 'zustand';

export interface Event {
  eventId: string;
  sourceFeed: string;
  timestamp: string;
  coordinates: [number, number];
  category: string;
  severity: string;
}

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
  setComplaintSynthesis: (msg) => set({ complaintSynthesis: msg })
}));
