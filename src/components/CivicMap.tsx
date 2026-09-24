import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { usePulseStore } from '../store/useStore';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export const CivicMap = () => {
  const events = usePulseStore(state => state.events);
  
  return (
    <div className="absolute inset-0 z-0">
      <MapContainer 
        center={[40.7128, -74.0060]} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={`https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`}
          maxZoom={20}
        />
        
        {events.map((ev, i) => {
          let color = 'var(--accent-blue)'; // weather
          if (ev.sourceFeed === 'transit') color = 'var(--accent-yellow)';
          if (ev.sourceFeed === '311') color = 'var(--accent-red)';
          if (ev.sourceFeed === 'aqi') color = 'var(--accent-green)';
          
          return (
            <CircleMarker
              key={`${ev.eventId}-${i}`}
              center={[ev.coordinates[1], ev.coordinates[0]]}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.8 }}
              radius={ev.severity === 'critical' ? 10 : 6}
            >
              <Popup>
                <strong className="uppercase">{ev.sourceFeed}</strong><br/>
                Condition: {ev.category}<br/>
                {ev.sourceFeed === 'weather' && ev.rawMetrics?.temperature !== undefined && (
                  <>Temp: {ev.rawMetrics.temperature}°C<br/></>
                )}
                {ev.sourceFeed === 'aqi' && ev.rawMetrics?.us_aqi !== undefined && (
                  <>AQI: {ev.rawMetrics.us_aqi}<br/></>
                )}
                Severity: {ev.severity}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};
