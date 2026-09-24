import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { usePulseStore } from '../store/useStore';

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
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                {ev.category}<br/>
                Severity: {ev.severity}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};
