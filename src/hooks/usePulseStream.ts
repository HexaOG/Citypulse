import { useEffect, useRef } from 'react';
import { usePulseStore, type Event } from '../store/useStore';

export const usePulseStream = () => {
  const { 
    setPulseState, 
    addEvent, 
    setConnectionStatus, 
    appendCommunityReportStoreOnly, 
    setCommunityReports 
  } = usePulseStore();

  const isSimulatingRef = useRef(false);
  const simIntervalRef = useRef<any>(null);

  useEffect(() => {
    // 1. Fetch initial persistent reports if API endpoint available or on localhost
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    
    const apiUrl = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:8080/api/reports' : null);

    if (apiUrl) {
      fetch(apiUrl)
        .then(r => r.json())
        .then(res => {
          if (res.status === 'success' && res.data && Array.isArray(res.data)) {
            setCommunityReports(res.data);
          }
        })
        .catch(e => console.warn('Could not fetch historical reports:', e));
    }

    // 2. Simulation engine fallback for production or when backend is offline
    const startSimulation = () => {
      if (isSimulatingRef.current) return;
      isSimulatingRef.current = true;
      setConnectionStatus(false, true);

      let step = 0;

      // Seed baseline telemetry if store has none so all dashboard widgets populate immediately
      const currentEvents = usePulseStore.getState().events;
      if (currentEvents.length === 0) {
        const now = new Date().toISOString();
        const baseWeather: Event = {
          eventId: `sim-wx-init`,
          sourceFeed: 'weather',
          timestamp: now,
          coordinates: [26.9124, 75.7873],
          category: 'Clear',
          severity: 'low',
          rawMetrics: { temperature: 28, precipitation: 0, windSpeed: 11 }
        };
        const baseTraffic: Event = {
          eventId: `sim-tr-init`,
          sourceFeed: 'transit',
          timestamp: now,
          coordinates: [26.9180, 75.7920],
          category: 'Normal',
          severity: 'low',
          rawMetrics: { delay_minutes: 4, congestion: 32 }
        };
        const baseAQI: Event = {
          eventId: `sim-aqi-init`,
          sourceFeed: 'aqi',
          timestamp: now,
          coordinates: [26.8967, 75.8239],
          category: 'Moderate',
          severity: 'low',
          rawMetrics: { us_aqi: 72, pm25: 22, pm10: 45 }
        };

        addEvent(baseWeather);
        addEvent(baseTraffic);
        addEvent(baseAQI);

        setPulseState({
          status: { chiScore: 94 },
          narrative: "All municipal infrastructure operating within normal operational thresholds across Jaipur sectors.",
          anomalies: []
        });
      }

      if (simIntervalRef.current) clearInterval(simIntervalRef.current);

      simIntervalRef.current = setInterval(() => {
        step++;
        const currentScenario = usePulseStore.getState().scenario;
        const now = new Date().toISOString();
        const lat = 26.9124 + (Math.random() - 0.5) * 0.05;
        const lng = 75.7873 + (Math.random() - 0.5) * 0.05;

        if (currentScenario === 'storm') {
          const chiScore = Math.floor(45 + Math.random() * 12);
          const narrative = "Severe convective storm surge active across Jaipur metro. Localized stormwater drainage backup and delays on key arteries.";
          const anomalies = [
            { id: 'ANOM-1', title: 'Stormwater Gridlock Surge', type: 'transit', severity: 'critical' },
            { id: 'ANOM-2', title: 'Substation Load Imbalance', type: 'power', severity: 'high' }
          ];

          setPulseState({
            status: { chiScore },
            narrative,
            anomalies
          });

          // Rotate event generation
          const mod = step % 3;
          if (mod === 0) {
            addEvent({
              eventId: `sim-${Date.now()}`,
              sourceFeed: 'weather',
              timestamp: now,
              coordinates: [lat, lng],
              category: 'Thunderstorm',
              severity: 'critical',
              rawMetrics: {
                temperature: 22 + Math.round(Math.random() * 2),
                precipitation: 32 + Math.round(Math.random() * 18),
                windSpeed: 52 + Math.round(Math.random() * 20)
              }
            });
          } else if (mod === 1) {
            addEvent({
              eventId: `sim-${Date.now()}`,
              sourceFeed: 'transit',
              timestamp: now,
              coordinates: [lat, lng],
              category: 'Heavy Congestion',
              severity: 'high',
              rawMetrics: {
                delay_minutes: 24 + Math.round(Math.random() * 14),
                congestion: 86 + Math.round(Math.random() * 10)
              }
            });
          } else {
            addEvent({
              eventId: `sim-${Date.now()}`,
              sourceFeed: 'aqi',
              timestamp: now,
              coordinates: [lat, lng],
              category: 'Good',
              severity: 'low',
              rawMetrics: {
                us_aqi: 42 + Math.round(Math.random() * 15),
                pm25: 14 + Math.round(Math.random() * 8),
                pm10: 28 + Math.round(Math.random() * 12)
              }
            });
          }
        } else {
          // Normal scenario
          const chiScore = Math.floor(91 + Math.random() * 7);
          const narrative = "Urban telemetry nominal. City traffic flowing smoothly, power distribution balanced, and air quality within acceptable ranges.";
          
          setPulseState({
            status: { chiScore },
            narrative,
            anomalies: []
          });

          const mod = step % 3;
          if (mod === 0) {
            addEvent({
              eventId: `sim-${Date.now()}`,
              sourceFeed: 'weather',
              timestamp: now,
              coordinates: [lat, lng],
              category: 'Clear',
              severity: 'low',
              rawMetrics: {
                temperature: 27 + Math.round(Math.random() * 3),
                precipitation: 0,
                windSpeed: 9 + Math.round(Math.random() * 6)
              }
            });
          } else if (mod === 1) {
            addEvent({
              eventId: `sim-${Date.now()}`,
              sourceFeed: 'transit',
              timestamp: now,
              coordinates: [lat, lng],
              category: 'Normal Flow',
              severity: 'low',
              rawMetrics: {
                delay_minutes: 2 + Math.round(Math.random() * 4),
                congestion: 28 + Math.round(Math.random() * 12)
              }
            });
          } else {
            addEvent({
              eventId: `sim-${Date.now()}`,
              sourceFeed: 'aqi',
              timestamp: now,
              coordinates: [lat, lng],
              category: 'Moderate',
              severity: 'low',
              rawMetrics: {
                us_aqi: 68 + Math.round(Math.random() * 16),
                pm25: 22 + Math.round(Math.random() * 10),
                pm10: 44 + Math.round(Math.random() * 16)
              }
            });
          }
        }
      }, 3000);
    };

    const stopSimulation = () => {
      isSimulatingRef.current = false;
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
    };

    // 3. WebSocket Connection with 3-Second Fallback
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws/pulse';
    let ws: WebSocket | null = null;
    let connectTimeout: any = null;
    let reconnectTimer: any = null;
    let isDisposed = false;

    const connect = () => {
      if (isDisposed) return;

      try {
        ws = new WebSocket(wsUrl);

        // 3-second connection timeout: if not open after 3s, switch to simulated live
        connectTimeout = setTimeout(() => {
          if (!ws || ws.readyState !== WebSocket.OPEN) {
            startSimulation();
          }
        }, 3000);

        ws.onopen = () => {
          if (connectTimeout) clearTimeout(connectTimeout);
          stopSimulation();
          setConnectionStatus(true, false);
        };

        ws.onmessage = (msg) => {
          try {
            const data = JSON.parse(msg.data);
            if (data.type === 'PULSE_UPDATE') {
              setPulseState(data);
              if (data.event) {
                addEvent(data.event);
              }
            } else if (data.type === 'NEW_REPORT' && data.report) {
              appendCommunityReportStoreOnly(data.report);
            }
          } catch (e) {
            console.error('Error parsing WS message:', e);
          }
        };

        ws.onerror = () => {
          startSimulation();
        };

        ws.onclose = () => {
          startSimulation();
          // Periodically attempt reconnection without breaking simulation mode
          if (!isDisposed) {
            reconnectTimer = setTimeout(connect, 5000);
          }
        };
      } catch (err) {
        startSimulation();
      }
    };

    connect();

    return () => {
      isDisposed = true;
      if (connectTimeout) clearTimeout(connectTimeout);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      stopSimulation();
      if (ws) {
        ws.onclose = null;
        ws.onerror = null;
        ws.close();
      }
    };
  }, [setPulseState, addEvent, setConnectionStatus, appendCommunityReportStoreOnly, setCommunityReports]);
};
