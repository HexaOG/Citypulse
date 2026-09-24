import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents, useMap, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { usePulseStore, SECTORS } from '../store/useStore';

const LocationPicker = () => {
  const { setIsSelectingLocation, setSelectedLocation } = usePulseStore();
  
  useMapEvents({
    click(e) {
      if (usePulseStore.getState().isSelectingLocation) {
        setSelectedLocation([e.latlng.lat, e.latlng.lng]);
        setIsSelectingLocation(false);
      }
    },
  });
  
  return null;
};

const MapController = () => {
  const map = useMap();
  const focusedLocation = usePulseStore(state => state.focusedLocation);
  const selectedAreaFilter = usePulseStore(state => state.selectedAreaFilter);

  // Pan to focused incident pin
  useEffect(() => {
    if (focusedLocation) {
      map.flyTo(focusedLocation.coordinates, focusedLocation.zoom || 15, {
        duration: 1.2
      });
    }
  }, [focusedLocation, map]);

  // Pan to sector when area filter changes
  useEffect(() => {
    if (selectedAreaFilter && selectedAreaFilter !== 'All Areas' && SECTORS[selectedAreaFilter]) {
      map.flyTo(SECTORS[selectedAreaFilter].center, 14, {
        duration: 1.2
      });
    }
  }, [selectedAreaFilter, map]);

  return null;
};

export const CivicMap = () => {
  const events = usePulseStore(state => state.events);
  const selectedLocation = usePulseStore(state => state.selectedLocation);
  const communityReports = usePulseStore(state => state.communityReports);
  const selectedAreaFilter = usePulseStore(state => state.selectedAreaFilter);
  const focusedIncidentId = usePulseStore(state => state.focusedIncidentId);
  const setFocusedIncidentId = usePulseStore(state => state.setFocusedIncidentId);
  const setIsCommunityDrawerOpen = usePulseStore(state => state.setIsCommunityDrawerOpen);

  // Filter community reports by selected sector
  const visibleReports = selectedAreaFilter === 'All Areas'
    ? communityReports
    : communityReports.filter(r => r.area === selectedAreaFilter);

  // Sector polygon boundary
  const currentSector = selectedAreaFilter !== 'All Areas' ? SECTORS[selectedAreaFilter] : null;

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
        <MapController />
        
        {/* User Selected Pin for reporting */}
        {selectedLocation && (
          <CircleMarker
            center={selectedLocation}
            pathOptions={{ color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 1 }}
            radius={8}
            className="animate-pulse"
          >
            <Popup>Selected Location for Incident</Popup>
          </CircleMarker>
        )}

        {/* Sector Boundary Polygon Highlight */}
        {currentSector && (
          <Polygon 
            positions={currentSector.polygon}
            pathOptions={{ 
              color: '#06b6d4', 
              fillColor: '#06b6d4', 
              fillOpacity: 0.14, 
              weight: 2, 
              dashArray: '6, 6' 
            }}
          >
            <Popup>
              <strong>{currentSector.name}</strong><br/>
              Active Civic Monitoring Sector
            </Popup>
          </Polygon>
        )}
        
        {/* Community 311 Reports on Map */}
        {visibleReports.map((report) => {
          const isFocused = focusedIncidentId === report.id;
          const isCritical = report.severity === 'Critical';
          const isHigh = report.severity === 'High';
          const markerColor = isFocused ? '#06b6d4' : (isCritical ? '#f43f5e' : (isHigh ? '#f97316' : '#eab308'));

          return (
            <CircleMarker
              key={`community-${report.id}`}
              center={report.coordinates}
              pathOptions={{ 
                color: markerColor, 
                fillColor: markerColor, 
                fillOpacity: isFocused ? 1 : 0.8,
                weight: isFocused ? 3 : 1
              }}
              radius={isFocused ? 11 : (isCritical ? 9 : 7)}
              className={isFocused ? 'animate-pulse' : ''}
              eventHandlers={{
                click: () => {
                  setFocusedIncidentId(report.id);
                  setIsCommunityDrawerOpen(true);
                }
              }}
            >
              <Popup>
                <div className="text-xs min-w-[180px]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono font-bold text-rose-500">#{report.id}</span>
                    <span className="text-[10px] text-gray-500">{report.area}</span>
                  </div>
                  <div className="font-bold text-sm">{report.category}</div>
                  <div className="text-[11px] text-gray-600 dark:text-gray-300 my-1">{report.description}</div>
                  <div className="flex justify-between items-center text-[10px] pt-1 mt-1 border-t border-gray-200">
                    <span className="font-semibold text-amber-500">Severity: {report.severity}</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">▲ {report.confirmations} confirmed</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Other feed streams (weather, transit, aqi) */}
        {events.filter(ev => ev.sourceFeed !== '311').map((ev, i) => {
          let color = 'var(--accent-blue)'; // weather
          if (ev.sourceFeed === 'transit') color = 'var(--accent-yellow)';
          if (ev.sourceFeed === 'aqi') color = 'var(--accent-green)';
          
          return (
            <CircleMarker
              key={`${ev.eventId}-${i}`}
              center={[ev.coordinates[0], ev.coordinates[1]]}
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
