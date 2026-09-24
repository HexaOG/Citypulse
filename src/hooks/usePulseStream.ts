import { useEffect } from 'react';
import { usePulseStore } from '../store/useStore';

export const usePulseStream = () => {
  const { setPulseState, addEvent, setConnectionStatus, appendCommunityReportStoreOnly, setCommunityReports } = usePulseStore();

  useEffect(() => {
    // Fetch initial persistent reports from database
    fetch('http://localhost:8080/api/reports')
      .then(r => r.json())
      .then(res => {
        if (res.status === 'success' && res.data) {
           setCommunityReports(res.data);
        }
      })
      .catch(e => console.warn('Could not fetch historical reports:', e));

    let ws: WebSocket;
    
    const connect = () => {
      ws = new WebSocket('ws://localhost:8080/ws/pulse');
      
      ws.onopen = () => {
        setConnectionStatus(true);
      };
      
      ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.type === 'PULSE_UPDATE') {
          setPulseState(data);
          if (data.event) {
            addEvent(data.event);
          }
        } else if (data.type === 'NEW_REPORT' && data.report) {
          appendCommunityReportStoreOnly(data.report);
        }
      };
      
      ws.onclose = () => {
        setConnectionStatus(false);
        setTimeout(connect, 3000); // reconnect
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
    };
  }, []);
};
