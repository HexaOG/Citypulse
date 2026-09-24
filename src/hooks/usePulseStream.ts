import { useEffect } from 'react';
import { createDemoPulseState, resolvePulseSocketUrl } from '../lib/pulse';
import { usePulseStore } from '../store/useStore';

export const usePulseStream = () => {
  const { setPulseState, addEvent, setConnectionStatus } = usePulseStore();
  const scenario = usePulseStore((state) => state.scenario);

  useEffect(() => {
    let ws: WebSocket | undefined;
    let demoTimer: number | undefined;
    let isMounted = true;

    const stopDemoLoop = () => {
      if (demoTimer !== undefined) {
        window.clearTimeout(demoTimer);
        demoTimer = undefined;
      }
    };

    const startDemoLoop = () => {
      stopDemoLoop();
      let tick = 0;

      const pushDemoState = () => {
        if (!isMounted) return;

        const payload = createDemoPulseState(tick, scenario);
        setPulseState(payload);
        if (payload.event) {
          addEvent(payload.event);
        }
        setConnectionStatus(true);
        tick += 1;
        demoTimer = window.setTimeout(pushDemoState, 5000);
      };

      pushDemoState();
    };

    const connect = () => {
      const { socketUrl, useSimulation } = resolvePulseSocketUrl(window.location.href);

      if (useSimulation) {
        startDemoLoop();
        return;
      }

      ws = new WebSocket(socketUrl);

      ws.onopen = () => {
        stopDemoLoop();
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

      ws.onerror = () => {
        if (isMounted) {
          setConnectionStatus(false);
          startDemoLoop();
        }
      };

      ws.onclose = () => {
        if (isMounted) {
          setConnectionStatus(false);
          setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      stopDemoLoop();
      if (ws) {
        ws.close();
      }
    };
  }, [addEvent, scenario, setConnectionStatus, setPulseState]);
};
