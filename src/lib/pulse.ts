export function resolvePulseSocketUrl(location = typeof window !== 'undefined' ? window.location.href : 'http://localhost:5173') {
  const url = new URL(location, 'http://localhost');
  const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = url.hostname;
  const port = url.port ? `:${url.port}` : '';
  const isLocalServer = host === 'localhost' || host === '127.0.0.1';

  return {
    socketUrl: `${protocol}//${host}${port}/ws/pulse`,
    useSimulation: !isLocalServer,
  };
}

export function createDemoPulseState(step = 0, scenario = 'normal') {
  const scenarioOffset = scenario === 'storm' ? 14 : 0;
  const wave = Math.sin(step / 3) * 10;
  const chiScore = Math.max(35, Math.min(96, 82 + wave - scenarioOffset));

  const eventSeeds = [
    { sourceFeed: 'weather', category: 'storm', severity: 'medium', coordinates: [-74.006, 40.7128], narrative: 'A weather front is moving across the downtown corridor.' },
    { sourceFeed: 'transit', category: 'traffic', severity: 'low', coordinates: [-73.9857, 40.7484], narrative: 'Commuter rail load is trending back toward normal levels.' },
    { sourceFeed: 'aqi', category: 'air', severity: 'medium', coordinates: [-73.9712, 40.7829], narrative: 'Air quality remains stable but elevated near arterial routes.' },
    { sourceFeed: '311', category: 'service', severity: 'low', coordinates: [-73.9994, 40.7306], narrative: 'Public works requests are staying within expected city thresholds.' },
  ];

  const event = eventSeeds[step % eventSeeds.length];
  const narrative = scenario === 'storm'
    ? 'Severe weather conditions are creating intermittent pressure across transit and air corridors.'
    : 'Traffic and civic health indicators remain within expected operating thresholds.';

  return {
    type: 'PULSE_UPDATE',
    status: {
      chiScore: Number(chiScore.toFixed(1)),
      districtId: 'downtown-core',
      domainScores: {
        weather: Number((96 - Math.max(0, scenarioOffset / 2)).toFixed(1)),
        transit: Number((89 + wave / 3).toFixed(1)),
        311: Number((93 - Math.abs(wave) / 5).toFixed(1)),
        aqi: Number((90 - scenarioOffset / 3).toFixed(1)),
      },
      activeAnomalies: scenario === 'storm' ? ['weather-impacts', 'transit-buffer'] : [],
    },
    narrative,
    anomalies: scenario === 'storm'
      ? [
          {
            clusterId: 'weather-impacts',
            title: 'Storm Surge Pressure',
            description: 'Weather-driven disruption is stressing the central network.',
            confidence: 84.2,
          },
        ]
      : [],
    event: {
      eventId: `demo-${step}`,
      sourceFeed: event.sourceFeed,
      timestamp: new Date().toISOString(),
      coordinates: event.coordinates,
      category: event.category,
      severity: event.severity,
    },
  };
}

export function resolveScenarioUrl(location = typeof window !== 'undefined' ? window.location.href : 'https://citypulse0.netlify.app/traffic') {
  const url = new URL(location, 'https://citypulse0.netlify.app/traffic');
  const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  return isLocal ? 'http://localhost:8000/api/scenario' : '/api/scenario';
}
