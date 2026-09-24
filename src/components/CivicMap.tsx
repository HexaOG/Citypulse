import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { usePulseStore } from '../store/useStore';

const LocationPicker = () => {
  const { setIsSelectingLocation, setSelectedLocation } = usePulseStore();
  
  useMapEvents({
    click(e) {
      // Use getState to avoid stale closure if useMapEvents doesn't re-bind on every render
      if (usePulseStore.getState().isSelectingLocation) {
        setSelectedLocation([e.latlng.lat, e.latlng.lng]);
        setIsSelectingLocation(false);
      }
    },
  });
  
  return null;
};

export const CivicMap = () => {
  const events = usePulseStore(state => state.events);
  const selectedLocation = usePulseStore(state => state.selectedLocation);
  
  return (
    <div className="absolute inset-0 z-0">
      <MapContainer 
        center={[40.7128, -74.0060]} 
        zoom={14} 
        style={{ height: '100%', width: '100%', cursor: usePulseStore(s => s.isSelectingLocation) ? 'crosshair' : 'grab' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <LocationPicker />
        
        {selectedLocation && (
          <CircleMarker
            center={selectedLocation}
            pathOptions={{ color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 1 }}
            radius={8}
            className="animate-pulse"
          >
            <Popup>Selected Location</Popup>
          </CircleMarker>
        )}
        
        {events.map((ev, i) => {
          let color = 'var(--accent-blue)'; // weather
          if (ev.sourceFeed === 'transit') color = 'var(--accent-yellow)';
          if (ev.sourceFeed === '311') color = '#f43f5e'; // rose-500
          if (ev.sourceFeed === 'aqi') color = 'var(--accent-green)';
          
          return (
            <CircleMarker
              key={`${ev.eventId}-${i}`}
              center={[ev.coordinates[0], ev.coordinates[1]]} // Note: usually [lat, lng]
              pathOptions={{ color, fillColor: color, fillOpacity: 0.8 }}
              radius={ev.severity === 'Critical' ? 10 : 6}
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
