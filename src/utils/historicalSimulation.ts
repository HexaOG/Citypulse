export interface HistoricalTrafficData {
  congestion: number;
  delay: number;
  incidents: number;
  isCritical: boolean;
  isWarning: boolean;
  synthesis: string;
  disruptions: Array<{
    id: string;
    coordinates: [number, number];
    title: string;
    severity: 'Critical' | 'High' | 'Medium';
    corridor: string;
  }>;
}

export interface HistoricalWeatherData {
  temp: number;
  precip: number;
  wind: number;
  condition: string;
  synthesis: string;
}

export interface HistoricalAQIData {
  aqi: number;
  pm25: number;
  pm10: number;
  ozone: number;
  status: 'GOOD' | 'MODERATE' | 'POOR';
  isPoor: boolean;
  isModerate: boolean;
  synthesis: string;
}

/**
 * Traffic Simulation across 48 hours
 * Key Events:
 * - T-18h to T-22h: Storm surge + evening rush hour congestion peak (88-94%, +36m delay)
 * - T-12h to T-15h: Morning peak rush (76-82%, +22m delay)
 * - T-36h to T-38h: Prior day morning rush (72-78%, +19m delay)
 * - T-6h to T-10h & T-30h to T-34h: Nocturnal off-peak lull (10-18%, +2-4m delay)
 */
export const getHistoricalTraffic = (
  offsetHours: number, 
  liveDelayMinutes?: number
): HistoricalTrafficData => {
  if (offsetHours === 0) {
    const delay = liveDelayMinutes !== undefined ? Math.round(liveDelayMinutes) : 4;
    const congestion = Math.min(100, Math.max(8, delay * 8));
    const isCritical = delay > 25;
    const isWarning = delay > 10;
    return {
      congestion,
      delay,
      incidents: isCritical ? 3 : (isWarning ? 1 : 0),
      isCritical,
      isWarning,
      synthesis: isCritical
        ? "Severe congestion detected. Main bypass clogged due to scattered incidents. Traffic diverted via Ring Road. Consider alternative routes for the next 2 hours."
        : (isWarning ? "Moderate congestion building on major corridors. Adjust commute time by ~15 minutes." : "Traffic flowing nominally across all monitored sectors. No significant delays."),
      disruptions: []
    };
  }

  const h = Math.abs(offsetHours);

  // Smooth sinusoidal base diurnal curve with hour periodicity (peaks at ~8 AM and ~6 PM)
  // Let's model exact realistic timestamps:
  let congestion = 40;
  let delay = 8;
  let incidents = 1;
  let summary = "";

  if (h >= 17 && h <= 22) {
    // Storm surge & severe evening gridlock
    congestion = Math.round(86 + Math.sin(h * 1.5) * 8); // 86% - 94%
    delay = Math.round(32 + (22 - h) * 2.5); // 32m - 42m
    incidents = 4;
    summary = `Historical Traffic Analysis at T - ${h} hrs: Severe corridor congestion registered along Ajmer Road, JLN Marg & 200ft Bypass due to localized flash flooding. Traffic speed dropped by 64% with ${incidents} active bottlenecks.`;
  } else if (h >= 11 && h <= 15) {
    // Morning rush hour peak
    congestion = Math.round(74 + Math.sin((h - 11) * 0.8) * 8); // 74% - 82%
    delay = Math.round(18 + (h - 11) * 1.5); // 18m - 24m
    incidents = 2;
    summary = `Historical Traffic Analysis at T - ${h} hrs: Morning rush hour pulse across Sodala Elevated Road and MI Road. Average commuter delay evaluated at +${delay} minutes.`;
  } else if (h >= 35 && h <= 39) {
    // Yesterday morning rush
    congestion = Math.round(70 + Math.sin((h - 35) * 0.8) * 8);
    delay = Math.round(16 + (h - 35) * 1.8);
    incidents = 2;
    summary = `Historical Traffic Analysis at T - ${h} hrs: Heavy morning transit volume observed. Tonk Road intersection bottleneck registered +${delay}m transit latency.`;
  } else if ((h >= 6 && h <= 10) || (h >= 30 && h <= 34)) {
    // Nocturnal off-peak hours
    congestion = Math.round(12 + Math.abs(Math.sin(h)) * 6); // 12% - 18%
    delay = Math.round(2 + Math.abs(Math.sin(h)) * 2); // 2m - 4m
    incidents = 0;
    summary = `Historical Traffic Analysis at T - ${h} hrs: Off-peak nocturnal transit conditions. Arterial corridors operating with fluid vehicular flow and zero critical gridlocks.`;
  } else if (h >= 1 && h <= 5) {
    // Recent evening commute
    congestion = Math.round(62 + (5 - h) * 3);
    delay = Math.round(14 + (5 - h) * 1.5);
    incidents = 2;
    summary = `Historical Traffic Analysis at T - ${h} hrs: Evening transit volume tapering down. Peripheral bypass routes experiencing minor +${delay}m slowdowns.`;
  } else {
    // Moderate baseline traffic
    congestion = Math.round(38 + Math.sin(h * 0.5) * 12);
    delay = Math.round(7 + Math.sin(h * 0.5) * 4);
    incidents = 1;
    summary = `Historical Traffic Analysis at T - ${h} hrs: Nominal metropolitan traffic flow with minor queuing near central commercial zones.`;
  }

  // Ensure bounds
  congestion = Math.min(98, Math.max(10, congestion));
  delay = Math.max(1, delay);

  const isCritical = congestion >= 75 || delay >= 25;
  const isWarning = (congestion >= 45 && congestion < 75) || (delay >= 10 && delay < 25);

  // Generate historical disruption pins visible on the map for that hour
  const disruptions: HistoricalTrafficData['disruptions'] = [];
  if (congestion >= 65) {
    disruptions.push({
      id: `TR-DISRUPT-${h}-1`,
      coordinates: [26.8943, 75.7725], // Sodala
      title: 'Elevated Road Gridlock',
      severity: 'Critical',
      corridor: 'Sodala Elevated Flyover'
    });
  }
  if (congestion >= 75) {
    disruptions.push({
      id: `TR-DISRUPT-${h}-2`,
      coordinates: [26.8505, 75.8118], // Malviya Nagar
      title: 'Waterlogged Underpass Bypass',
      severity: 'Critical',
      corridor: 'JLN Marg Underpass'
    });
  }
  if (incidents >= 1) {
    disruptions.push({
      id: `TR-DISRUPT-${h}-3`,
      coordinates: [26.9124, 75.7429], // Vaishali Nagar
      title: 'Stalled Vehicle Lane Blockage',
      severity: 'High',
      corridor: 'Gandhi Path Junction'
    });
  }

  return {
    congestion,
    delay,
    incidents,
    isCritical,
    isWarning,
    synthesis: summary,
    disruptions
  };
};

/**
 * Weather Simulation across 48 hours
 * Key Events:
 * - T-18h to T-22h: Severe storm cell with heavy rainfall (12.4 mm, 34 km/h wind, 23.4°C)
 * - T-6h: Light scattered showers (2.4 mm, 18 km/h wind, 26.8°C)
 * - Daytime peaks (T-2h, T-26h): 32°C - 34°C, Clear/Partly Cloudy
 * - Night lows (T-8h, T-32h): 21°C - 23°C
 */
export const getHistoricalWeather = (
  offsetHours: number,
  liveWeather?: { temp?: number; precip?: number; wind?: number; condition?: string }
): HistoricalWeatherData => {
  if (offsetHours === 0) {
    const temp = liveWeather?.temp ?? 29.4;
    const precip = liveWeather?.precip ?? 0.2;
    const wind = liveWeather?.wind ?? 14.2;
    const condition = liveWeather?.condition || 'Partly Cloudy';
    return {
      temp: Number(temp.toFixed(1)),
      precip: Number(precip.toFixed(1)),
      wind: Number(wind.toFixed(1)),
      condition,
      synthesis: precip > 5 
        ? "Elevated precipitation currently impacting multiple sectors. Expect potential localized waterlogging." 
        : "Meteorological conditions are currently stable. No immediate weather advisories issued for the metropolitan area."
    };
  }

  const h = Math.abs(offsetHours);

  let temp = 28.0;
  let precip = 0.0;
  let wind = 14.0;
  let condition = "Partly Cloudy";
  let synthesis = "";

  if (h >= 17 && h <= 21) {
    // Storm event
    temp = Number((23.2 + (h - 17) * 0.4).toFixed(1));
    precip = Number((13.4 - Math.abs(h - 19) * 4.2).toFixed(1));
    precip = Math.max(3.2, precip);
    wind = Math.round(31 + Math.sin(h) * 5);
    condition = "Heavy Thunderstorm";
    synthesis = `Historical Meteorological Analysis at T - ${h} hrs: Severe convective storm cell centered over metropolitan Jaipur. Heavy downpour registered at ${precip}mm with wind gusts peaking at ${wind} km/h. Localized drainage overflow alerted.`;
  } else if (h === 6 || h === 7) {
    // Scattered light showers
    temp = 26.5;
    precip = 2.4;
    wind = 19.0;
    condition = "Scattered Rain";
    synthesis = `Historical Meteorological Analysis at T - ${h} hrs: Light intermittent showers observed across eastern corridors. Accumulated precipitation at ${precip}mm with moderate breezy winds.`;
  } else if ((h >= 8 && h <= 14) || (h >= 32 && h <= 38)) {
    // Night to early morning cool period
    temp = Number((21.8 + Math.sin(h * 0.4) * 2.2).toFixed(1));
    precip = 0.0;
    wind = Number((9.5 + Math.sin(h) * 2).toFixed(1));
    condition = "Clear Night";
    synthesis = `Historical Meteorological Analysis at T - ${h} hrs: Calm nighttime atmospheric conditions with cool breezes. Ground ambient temperature settled at ${temp}°C under clear skies.`;
  } else if ((h >= 1 && h <= 4) || (h >= 24 && h <= 28)) {
    // Afternoon warm peak
    temp = Number((32.6 + Math.sin(h * 0.7) * 2.1).toFixed(1));
    precip = 0.0;
    wind = Number((14.0 + Math.sin(h) * 3).toFixed(1));
    condition = "Sunny & Warm";
    synthesis = `Historical Meteorological Analysis at T - ${h} hrs: High solar radiation and elevated ambient temperatures (${temp}°C) recorded across the urban heat island corridor.`;
  } else {
    // General overcast / partly cloudy
    temp = Number((27.4 + Math.sin(h * 0.3) * 3).toFixed(1));
    precip = 0.1;
    wind = Number((13.0 + Math.sin(h) * 3).toFixed(1));
    condition = "Partly Cloudy";
    synthesis = `Historical Meteorological Analysis at T - ${h} hrs: Stable barometric pressure and mild humidity levels. Temperature averaged ${temp}°C with normal visibility.`;
  }

  return {
    temp,
    precip,
    wind,
    condition,
    synthesis
  };
};

/**
 * AQI Simulation across 48 hours
 * Key Dynamics:
 * - T-28h to T-48h: High pre-storm particulate accumulation (AQI 142-168, Poor)
 * - T-17h to T-22h: Rain washout cleansing effect (AQI drops to 34-44, Good!)
 * - T-1h to T-15h: Gradual rebound toward moderate baseline (AQI 65-85, Moderate)
 */
export const getHistoricalAQI = (
  offsetHours: number,
  liveAqi?: number
): HistoricalAQIData => {
  if (offsetHours === 0) {
    const aqi = liveAqi !== undefined ? Math.round(liveAqi) : 68;
    const isPoor = aqi >= 100;
    const isModerate = aqi >= 50 && aqi < 100;
    const status = aqi < 50 ? 'GOOD' : (isModerate ? 'MODERATE' : 'POOR');
    return {
      aqi,
      pm25: 18,
      pm10: 38,
      ozone: 0.028,
      status,
      isPoor,
      isModerate,
      synthesis: aqi < 100 
        ? "Air quality is currently acceptable. No major health advisories in effect for the city." 
        : "AQI elevated. Safe for general public, but sensitive groups caution advised. Wind patterns suggest dispersion by 18:00."
    };
  }

  const h = Math.abs(offsetHours);

  let aqi = 70;
  let pm25 = 20;
  let pm10 = 42;
  let ozone = 0.025;
  let synthesis = "";

  if (h >= 26 && h <= 48) {
    // Pre-storm high pollution episode
    aqi = Math.round(145 + Math.sin(h * 0.6) * 20); // 130 - 165
    pm25 = Math.round(58 + Math.sin(h * 0.6) * 14); // 50 - 72 µg/m³
    pm10 = Math.round(118 + Math.sin(h * 0.6) * 22); // 100 - 140 µg/m³
    ozone = Number((0.042 + Math.sin(h) * 0.008).toFixed(3));
    synthesis = `Historical AQI Reconstruction at T - ${h} hrs: Elevated particulate pollution (AQI ${aqi}, POOR) detected across industrial zones and traffic junctions. Fine particulate PM2.5 reached ${pm25} µg/m³. Health advisory advised against prolonged outdoor exertion.`;
  } else if (h >= 16 && h <= 23) {
    // Rain washout cleansing effect
    aqi = Math.round(36 + Math.abs(Math.sin(h * 0.8)) * 8); // 36 - 44 (Good)
    pm25 = Math.round(9 + Math.abs(Math.sin(h * 0.8)) * 3); // 9 - 12 µg/m³
    pm10 = Math.round(19 + Math.abs(Math.sin(h * 0.8)) * 5); // 19 - 24 µg/m³
    ozone = Number((0.016 + Math.abs(Math.sin(h)) * 0.004).toFixed(3));
    synthesis = `Historical AQI Reconstruction at T - ${h} hrs: Atmospheric cleansing recorded post heavy precipitation (AQI ${aqi}, GOOD). PM2.5 plummeted to ${pm25} µg/m³ as rainwater scrubbed suspended particulates.`;
  } else {
    // Gradual post-storm rebound to moderate
    aqi = Math.round(62 + (15 - Math.min(15, h)) * 1.5 + Math.sin(h) * 6); // 60 - 82
    pm25 = Math.round(16 + (15 - Math.min(15, h)) * 0.6); // 16 - 25 µg/m³
    pm10 = Math.round(35 + (15 - Math.min(15, h)) * 1.2); // 35 - 52 µg/m³
    ozone = Number((0.026 + Math.sin(h * 0.5) * 0.006).toFixed(3));
    synthesis = `Historical AQI Reconstruction at T - ${h} hrs: Moderate air quality registered across Jaipur municipal monitoring grid (AQI ${aqi}). Particulate concentrations remained within safe ambient thresholds.`;
  }

  const isPoor = aqi >= 100;
  const isModerate = aqi >= 50 && aqi < 100;
  const status: 'GOOD' | 'MODERATE' | 'POOR' = aqi < 50 ? 'GOOD' : (isModerate ? 'MODERATE' : 'POOR');

  return {
    aqi,
    pm25,
    pm10,
    ozone,
    status,
    isPoor,
    isModerate,
    synthesis
  };
};
