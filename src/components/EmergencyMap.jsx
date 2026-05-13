import { useState, useMemo } from 'react'
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin, AlertCircle, Users, Activity } from 'lucide-react'

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN

export default function EmergencyMap({ donors = [], hospitals = [], requests = [], donorView = false }) {
  const [selectedEntity, setSelectedEntity] = useState(null)
  
  // Anonymize donor locations for donorView to protect privacy
  const processedDonors = useMemo(() => {
    if (!donorView) return donors
    return donors.map(d => ({
      ...d,
      // Add random jitter of ~200m to anonymize exact home locations
      latitude: d.latitude + (Math.random() - 0.5) * 0.004,
      longitude: d.longitude + (Math.random() - 0.5) * 0.004,
      isAnonymized: true
    }))
  }, [donors, donorView])

  const [viewState, setViewState] = useState({
    latitude: 19.0760, // Default to Mumbai
    longitude: 72.8777,
    zoom: 11
  })

  // Group active requests by hospital
  const activeRequestsByHospital = useMemo(() => {
    const map = {}
    requests.forEach(req => {
      if (req.status === 'open') {
        map[req.hospital_id] = (map[req.hospital_id] || 0) + 1
      }
    })
    return map
  }, [requests])

  if (!MAPBOX_TOKEN) {
    return (
      <div className="ui-panel flex-center" style={{ height: '500px', flexDirection: 'column', gap: '20px', borderStyle: 'dashed' }}>
        <AlertCircle size={48} className="text-muted" />
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '8px' }}>Map Configuration Required</h3>
          <p className="text-muted">Please add your <code>REACT_APP_MAPBOX_TOKEN</code> to the <code>.env</code> file to enable interactive maps.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ui-panel" style={{ height: '600px', overflow: 'hidden', padding: 0, position: 'relative' }}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />

        {/* Hospital Markers */}
        {hospitals.map(hospital => {
          const hasActiveRequest = activeRequestsByHospital[hospital.id] > 0
          if (!hospital.latitude || !hospital.longitude) return null

          return (
            <Marker 
              key={hospital.id} 
              latitude={hospital.latitude} 
              longitude={hospital.longitude} 
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation()
                setSelectedEntity({ ...hospital, type: 'hospital', requests: activeRequestsByHospital[hospital.id] || 0 })
              }}
            >
              <div className={`map-marker hospital-marker ${hasActiveRequest ? 'pulse-alert' : ''}`}>
                <Activity size={16} color="white" />
              </div>
            </Marker>
          )
        })}

        {/* Donor Markers (Clustered or points) */}
        {processedDonors.map(donor => {
          if (!donor.latitude || !donor.longitude) return null

          return (
            <Marker 
              key={donor.id} 
              latitude={donor.latitude} 
              longitude={donor.longitude} 
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation()
                setSelectedEntity({ ...donor, type: 'donor' })
              }}
            >
              <div className="map-marker donor-marker">
                <div className="donor-initial">{donor.blood_group}</div>
              </div>
            </Marker>
          )
        })}

        {/* Info Popup */}
        {selectedEntity && (
          <Popup
            latitude={selectedEntity.latitude}
            longitude={selectedEntity.longitude}
            anchor="top"
            onClose={() => setSelectedEntity(null)}
            closeButton={false}
            className="map-popup"
          >
            <div style={{ padding: '12px', minWidth: '180px' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{selectedEntity.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} /> {selectedEntity.city}
              </div>
              {selectedEntity.type === 'hospital' && (
                <div style={{ marginTop: '12px', padding: '8px', background: 'var(--bg-app)', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }}>
                  {selectedEntity.requests > 0 ? (
                    <span style={{ color: 'var(--accent-red)' }}>🔥 {selectedEntity.requests} Active Emergencies</span>
                  ) : (
                    <span style={{ color: 'var(--accent-green)' }}>✅ No active needs</span>
                  )}
                </div>
              )}
              {selectedEntity.type === 'donor' && (
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-low" style={{ fontSize: '10px' }}>{selectedEntity.blood_group} Donor</span>
                  <div className={`status-dot ${selectedEntity.available ? 'active' : 'offline'}`}></div>
                </div>
              )}
            </div>
          </Popup>
        )}
      </Map>

      {/* Legend Overlay */}
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(20, 20, 25, 0.8)', backdropFilter: 'blur(10px)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-soft)', zIndex: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="flex-center" style={{ gap: '10px', fontSize: '12px', fontWeight: 600 }}>
            <div className="map-marker hospital-marker" style={{ position: 'relative' }}>
              <Activity size={12} color="white" />
            </div>
            Hospital Facility
          </div>
          <div className="flex-center" style={{ gap: '10px', fontSize: '12px', fontWeight: 600 }}>
            <div className="map-marker donor-marker" style={{ position: 'relative', fontSize: '8px' }}>O+</div>
            Available Donor
          </div>
          <div className="flex-center" style={{ gap: '10px', fontSize: '12px', fontWeight: 600 }}>
            <div className="status-dot active"></div>
            Real-time Active Emergency
          </div>
        </div>
      </div>

      <style>{`
        .map-marker {
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
          border: 2px solid white;
        }
        .map-marker > * {
          transform: rotate(45deg);
        }
        .map-marker:hover {
          transform: rotate(-45deg) scale(1.2);
        }
        .hospital-marker {
          background: var(--accent-red);
        }
        .donor-marker {
          background: var(--accent-blue);
          border-radius: 50%;
          transform: none;
        }
        .donor-marker:hover {
          transform: scale(1.2);
        }
        .donor-initial {
          color: white;
          font-weight: 800;
          font-size: 10px;
          transform: none;
        }
        .pulse-alert::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: var(--accent-red);
          border-radius: inherit;
          z-index: -1;
          animation: map-pulse 2s infinite;
        }
        @keyframes map-pulse {
          0% { transform: rotate(45deg) scale(1); opacity: 0.8; }
          100% { transform: rotate(45deg) scale(3); opacity: 0; }
        }
        .mapboxgl-popup-content {
          background: var(--bg-card) !important;
          color: var(--text-main) !important;
          border-radius: 16px !important;
          border: 1px solid var(--border-soft) !important;
          padding: 0 !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4) !important;
        }
        .mapboxgl-popup-tip {
          border-top-color: var(--border-soft) !important;
        }
      `}</style>
    </div>
  )
}
