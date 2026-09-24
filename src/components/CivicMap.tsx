import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents, useMap, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { usePulseStore, SECTORS } from '../store/useStore';
import { getHistoricalTraffic } from '../utils/historicalSimulation';

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

const STADIA_API_KEY = import.meta.env.VITE_STADIA_API_KEY;
const STADIA_DARK_URL = STADIA_API_KEY
  ? `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${STADIA_API_KEY}`
  : 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';

const STADIA_LIGHT_URL = STADIA_API_KEY
  ? `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${STADIA_API_KEY}`
  : 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png';

const STADIA_ATTRIBUTION = '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export const CivicMap = () => {
  const events = usePulseStore(state => state.events);
  const selectedLocation = usePulseStore(state => state.selectedLocation);
  const communityReports = usePulseStore(state => state.communityReports);
  const focusedIncidentId = usePulseStore(state => state.focusedIncidentId);
  const setFocusedIncidentId = usePulseStore(state => state.setFocusedIncidentId);
  const setIsCommunityDrawerOpen = usePulseStore(state => state.setIsCommunityDrawerOpen);
  const selectedAreaFilter = usePulseStore(state => state.selectedAreaFilter);
  const isSelectingLocation = usePulseStore(state => state.isSelectingLocation);
  const replayOffsetHours = usePulseStore(state => state.replayOffsetHours);
  const theme = usePulseStore(state => state.theme);

  const tileUrl = theme === 'light' ? STADIA_LIGHT_URL : STADIA_DARK_URL;

  // Historical Replay Time Travel Filtering
  // Reports created after simulated scrubber time (T - |offset|) are hidden.
  // Only show reports that were created prior to or at simulated replay time.
  const simulatedTimeAgo = Math.abs(replayOffsetHours);
  const timeFilteredReports = communityReports.filter((report) => {
    const reportAgo = report.createdAtHoursAgo ?? 0;
    return reportAgo >= simulatedTimeAgo;
  });

  // Historical traffic disruptions active at this simulated hour
  const historicalTrafficDisruptions = useMemo(() => {
    if (replayOffsetHours === 0) return [];
    return getHistoricalTraffic(replayOffsetHours).disruptions;
  }, [replayOffsetHours]);

  const visibleReports = selectedAreaFilter === 'All Areas'
    ? timeFilteredReports
    : timeFilteredReports.filter(r => r.area === selectedAreaFilter);

  // Sector polygon boundary
  const currentSector = selectedAreaFilter !== 'All Areas' ? SECTORS[selectedAreaFilter] : null;

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer 
        center={[26.9124, 75.7873]} 
        zoom={14} 
        style={{ height: '100%', width: '100%', cursor: isSelectingLocation ? 'crosshair' : 'grab' }}
        zoomControl={false}
      >
        <TileLayer
          key={tileUrl}
          attribution={STADIA_ATTRIBUTION}
          url={tileUrl}
          subdomains={['a', 'b', 'c', 'd']}
          maxZoom={20}
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
            key={`poly-${isSelectingLocation}-${currentSector.name}`}
            positions={currentSector.polygon}
            interactive={!isSelectingLocation}
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
        
        {/* Community 311 Reports on Map (Chronologically synchronized to replay offset) */}
        {visibleReports.map((report) => {
          const isFocused = focusedIncidentId === report.id;
          const isCritical = report.severity === 'Critical';
          const isHigh = report.severity === 'High';
          const markerColor = isFocused ? '#06b6d4' : (isCritical ? '#f43f5e' : (isHigh ? '#f97316' : '#eab308'));

          return (
            <CircleMarker
              key={`community-${report.id}`}
              center={report.coordinates}
              interactive={!isSelectingLocation}
              pathOptions={{ 
                color: markerColor, 
                fillColor: markerColor, 
                fillOpacity: isFocused ? 1 : 0.85,
                weight: isFocused ? 3 : 1.5
              }}
              radius={isFocused ? 11 : (isCritical ? 9 : 7)}
              className={`pin-spawn-marker ${isFocused ? 'animate-pulse' : ''}`}
              eventHandlers={{
                click: () => {
                  setFocusedIncidentId(report.id);
                  setIsCommunityDrawerOpen(true);
                }
              }}
            >
              <Popup>
                <div className="font-bold border-b border-white/10 pb-1 mb-1 flex items-center justify-between gap-2">
                  <span>{report.category}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono uppercase ${
                    isCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {report.severity}
                  </span>
                </div>
                <div className="text-xs mb-1 text-gray-200">{report.description}</div>
                <div className="text-[10px] text-gray-400 flex justify-between">
                  <span>{report.street}</span>
                  <span>{report.timestamp}</span>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Historical Traffic Disruption Pins active at simulated hour */}
        {historicalTrafficDisruptions.map((disrupt) => (
          <CircleMarker
            key={`hist-traffic-${disrupt.id}`}
            center={disrupt.coordinates}
            interactive={!isSelectingLocation}
            pathOptions={{ 
              color: '#f59e0b', 
              fillColor: '#f59e0b', 
              fillOpacity: 0.9, 
              weight: 2 
            }}
            radius={9}
            className="pin-spawn-marker"
          >
            <Popup>
              <div className="font-bold border-b border-white/10 pb-1 mb-1 text-amber-400 flex items-center justify-between gap-2">
                <span>{disrupt.title}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 uppercase font-mono font-bold">
                  {disrupt.severity}
                </span>
              </div>
              <div className="text-xs text-gray-200">{disrupt.corridor}</div>
              <div className="text-[10px] text-gray-400 mt-1">Disruption active at T - {Math.abs(replayOffsetHours)}h</div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Other feed streams (weather, transit, aqi) */}
        {events
          .filter(ev => ev.sourceFeed !== '311' && (replayOffsetHours === 0 || ev.sourceFeed !== 'transit'))
          .map((ev, i) => {
            let color = '#00b0ff'; // weather
            if (ev.sourceFeed === 'transit') color = '#ffea00';
            if (ev.sourceFeed === 'aqi') color = '#00e676';
            
            return (
              <CircleMarker
                key={`${ev.eventId}-${i}`}
                center={[ev.coordinates[0], ev.coordinates[1]]}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 2 }}
                radius={ev.severity === 'Critical' ? 10 : 7}
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
