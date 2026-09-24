import { create } from 'zustand';

interface Event {
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
  setPulseState: (data: any) => void;
  addEvent: (event: Event) => void;
  setScenario: (scenario: string) => void;
  setConnectionStatus: (status: boolean) => void;
}

export const usePulseStore = create<PulseState>((set) => ({
  chiScore: 100,
  narrative: "Connecting to civic streams...",
  anomalies: [],
  events: [],
  scenario: "normal",
  connected: false,
  setPulseState: (data) => set((state) => ({
    chiScore: data.status.chiScore,
    narrative: data.narrative,
    anomalies: data.anomalies,
  })),
  addEvent: (event) => set((state) => ({
    events: [...state.events, event].slice(-100) // Keep last 100 events
  })),
  setScenario: (scenario) => set({ scenario }),
  setConnectionStatus: (connected) => set({ connected })
}));
