import React, { useState, useMemo, useEffect, useRef } from 'react';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Hospital, Activity, Phone, Clock, Droplets } from 'lucide-react';

// Free Tile Provider (No key required) - Using OSM CartoDB Dark Matter
const MAP_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster',
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

export default function EmergencyMap({
  donors = [],
  hospitals = [],
  requests = [],
  donorView = false,
}) {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // Anonymize donor locations for donorView to protect privacy
  const processedDonors = useMemo(() => {
    if (!donorView) return donors;
    // Use a stable pseudo-random based on donor ID for consistent anonymization
    const pseudoRandom = (id) => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
        hash |= 0;
      }
      return (Math.abs(hash) % 10000) / 10000 - 0.5;
    };
    return donors.map(d => ({
      ...d,
      latitude: d.latitude + pseudoRandom(d.id) * 0.004,
      longitude: d.longitude + pseudoRandom(d.id + 'lng') * 0.004,
      isAnonymized: true,
    }));
  }, [donors, donorView]);

  const [viewState, setViewState] = useState({
    latitude: 19.076, // Default to Mumbai
    longitude: 72.8777,
    zoom: 12,
  });

  // Fit bounds to show all entities when data changes
  useEffect(() => {
    if (!mapRef.current || (!hospitals.length && !donors.length)) return;

    const coords = [
      ...hospitals.filter(h => h.latitude && h.longitude).map(h => [h.longitude, h.latitude]),
      ...donors.filter(d => d.latitude && d.longitude).map(d => [d.longitude, d.latitude]),
    ];

    if (coords.length > 0 && mapRef.current) {
      try {
        // Calculate bounds using maplibregl from react-map-gl
        const mapLib = mapRef.current.getMapLib();
        if (mapLib && mapLib.LngLatBounds) {
          const bounds = coords.reduce(
            (b, coord) => {
              return b.extend(coord);
            },
            new mapLib.LngLatBounds(coords[0], coords[0])
          );

          mapRef.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
        }
      } catch (e) {
        console.warn('Could not fit bounds:', e);
      }
    }
  }, [hospitals, donors]);

  // Filter active emergency requests for pulsing effects
  const activeEmergencies = useMemo(
    () =>
      requests.filter(
        r => (r.urgency === 'Critical' || r.urgency === 'Urgent') && r.status === 'open'
      ),
    [requests]
  );

  return (
    <div
      className="map-container"
      style={{
        height: '500px',
        width: '100%',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid var(--border-soft)',
        position: 'relative',
      }}
    >
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onLoad={e => {
          mapRef.current = e.target;
        }}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />

        {/* Hospital Markers */}
        {hospitals.map(hospital => {
          if (!hospital.latitude || !hospital.longitude) return null;
          const hasEmergency = activeEmergencies.some(r => r.hospital_id === hospital.id);

          return (
            <Marker
              key={hospital.id}
              latitude={hospital.latitude}
              longitude={hospital.longitude}
              onClick={e => {
                e.originalEvent.stopPropagation();
                setSelectedEntity({
                  ...hospital,
                  type: 'hospital',
                  hasEmergency,
                  facility_name: hospital.name,
                });
              }}
            >
              <div style={{ cursor: 'pointer', position: 'relative' }}>
                {hasEmergency && (
                  <div
                    className="pulse-ring"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'rgba(239, 68, 68, 0.4)',
                      borderRadius: '50%',
                      zIndex: -1,
                    }}
                  />
                )}
                <div
                  style={{
                    backgroundColor: hasEmergency ? 'var(--accent-red)' : 'var(--accent-blue)',
                    padding: '8px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    border: '2px solid white',
                  }}
                >
                  <Hospital size={20} color="white" />
                </div>
              </div>
            </Marker>
          );
        })}

        {/* Donor Markers */}
        {processedDonors.map(donor => {
          if (!donor.latitude || !donor.longitude) return null;

          return (
            <Marker
              key={donor.id}
              latitude={donor.latitude}
              longitude={donor.longitude}
              onClick={e => {
                e.originalEvent.stopPropagation();
                setSelectedEntity({ ...donor, type: 'donor' });
              }}
            >
              <div
                style={{
                  cursor: 'pointer',
                  backgroundColor: 'var(--accent-green)',
                  padding: '6px',
                  borderRadius: '50%',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  border: '2px solid white',
                }}
              >
                <Droplets size={14} color="white" />
              </div>
            </Marker>
          );
        })}

        {/* Info Popup */}
        {selectedEntity && (
          <Popup
            latitude={selectedEntity.latitude}
            longitude={selectedEntity.longitude}
            onClose={() => setSelectedEntity(null)}
            closeButton={true}
            closeOnClick={false}
            offset={20}
            maxWidth="300px"
          >
            <div style={{ padding: '8px', color: '#1a1a1a' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}
              >
                {selectedEntity.type === 'hospital' ? (
                  <Hospital size={18} />
                ) : (
                  <Droplets size={18} />
                )}
                <h4 style={{ margin: 0, fontWeight: 600 }}>
                  {selectedEntity.facility_name || selectedEntity.name}
                </h4>
              </div>

              <div
                style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} /> {selectedEntity.city}
                </div>
                {selectedEntity.type === 'hospital' && selectedEntity.hasEmergency && (
                  <div
                    style={{
                      color: 'var(--accent-red)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Activity size={14} /> ACTIVE EMERGENCY
                  </div>
                )}
                {selectedEntity.type === 'donor' && (
                  <div style={{ fontWeight: 600, color: 'var(--accent-red)' }}>
                    Blood Group: {selectedEntity.blood_group}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666' }}>
                  <Phone size={14} /> {selectedEntity.phone || selectedEntity.contact_phone}
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Map Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(12px)',
          padding: '12px 16px',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'white',
          fontSize: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--accent-red)',
              borderRadius: '3px',
            }}
          />
          Hospital (Active Emergency)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--accent-blue)',
              borderRadius: '3px',
            }}
          />
          Hospital (Normal)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--accent-green)',
              borderRadius: '50%',
            }}
          />
          Active Donor
        </div>
      </div>
    </div>
  );
}
