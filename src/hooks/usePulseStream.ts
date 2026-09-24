import { useEffect } from 'react';
import { usePulseStore } from '../store/useStore';

export const usePulseStream = () => {
  const { setPulseState, addEvent, setConnectionStatus } = usePulseStore();

  useEffect(() => {
    let ws: WebSocket;
    
    const connect = () => {
      ws = new WebSocket('ws://localhost:8000/ws/pulse');
      
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
