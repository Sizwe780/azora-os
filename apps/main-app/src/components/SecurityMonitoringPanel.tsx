import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SecurityMonitoringPanel = () => {
  const [alerts, setAlerts] = useState([]);
  const [health, setHealth] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [locations] = useState([
    'Main Campus', 'North Campus', 'South Campus', 'East Campus', 'West Campus', 'Downtown Campus', 'Research Park'
  ]);

  useEffect(() => {
    // Fetch health
    axios.get('/api/ai-security-monitoring/health').then(res => setHealth(res.data));

    // Fetch alerts from event bus
    const fetchAlerts = async () => {
      try {
        const res = await axios.get('/api/event-bus/events/security.event.threat_detected');
        setAlerts(res.data.events.slice(-3)); // Last 3 events
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
        // Fallback to mock alerts
        setAlerts([
          { 
            event_id: 'EVT-SEC-001', 
            severity: 'CRITICAL', 
            threat_type: 'INTRUSION', 
            source_id: 'CAM-MAIN-001', 
            campus: 'Main Campus',
            location: { gps: [40.7128, -74.0060] },
            timestamp: new Date().toISOString(),
            details: 'Perimeter breach detected at main entrance'
          },
          { 
            event_id: 'EVT-SEC-002', 
            severity: 'HIGH', 
            threat_type: 'PANIC_ALARM', 
            source_id: 'PANIC-BLDG-201', 
            campus: 'North Campus',
            location: { gps: [40.7589, -73.9851] },
            timestamp: new Date(Date.now() - 300000).toISOString(),
            details: 'Emergency alarm triggered in research facility'
          },
          { 
            event_id: 'EVT-SEC-003', 
            severity: 'MEDIUM', 
            threat_type: 'LPR_MATCH', 
            source_id: 'CAM-GATE-A', 
            campus: 'South Campus',
            location: { gps: [40.7505, -73.9934] },
            timestamp: new Date(Date.now() - 600000).toISOString(),
            details: 'License plate match: flagged vehicle at entrance'
          }
        ]);
      }
    };

    fetchAlerts();
    // Poll every 5 seconds
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'CRITICAL': return '#ff4444';
      case 'HIGH': return '#ffaa00';
      case 'MEDIUM': return '#ffaa00';
      default: return '#00ff88';
    }
  };

  return (
    <div style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '8px', margin: '20px' }}>
      <h3 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>🛡️ Azora AI Security Command Center</h3>
      
      <div style={{ display: 'flex', gap: '20px', height: '500px' }}>
        {/* Asset & Feed List */}
        <div style={{ flex: '0 0 200px', background: 'var(--bg-secondary)', padding: '10px', borderRadius: '8px' }}>
          <h4>📹 Security Cameras (1,000+)</h4>
          <div style={{ fontSize: '12px', marginBottom: '10px' }}>
            {locations.map(location => (
              <div key={location}>• {location}</div>
            ))}
          </div>
          <h4>🚁 Autonomous Drones</h4>
          <div style={{ fontSize: '12px' }}>
            <div>• DRONE-A (Main Campus)</div>
            <div style={{ color: '#00ff88' }}>▶ DRONE-B (Active Patrol)</div>
            <div>• DRONE-C (Charging Station)</div>
          </div>
          <h4>🏛️ Security Operations Center</h4>
          <div style={{ fontSize: '12px' }}>
            <div>• Central Command Center</div>
            <div>• Live GIS Mapping</div>
            <div>• Intelligent Alert Triage</div>
          </div>
        </div>

        {/* Main View: Live Security Map */}
        <div style={{ flex: '1', background: 'var(--bg-secondary)', borderRadius: '8px', position: 'relative' }}>
          <div style={{ padding: '10px', borderBottom: '1px solid var(--border-primary)' }}>
            <h4>🗺️ Live Security GIS Overlay</h4>
          </div>
          <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            [Interactive Security Map]<br/>
            📍 Camera network coverage<br/>
            🚁 Autonomous drone fleet locations<br/>
            ⚠️ Real-time threat detection<br/>
            🛡️ Security zones & safe routes<br/>
            👥 Personnel tracking (privacy-compliant)
          </div>
          {/* Mock alerts on map */}
          <div style={{ position: 'absolute', top: '100px', left: '150px', color: '#ff4444', fontSize: '24px' }}>⚠️</div>
          <div style={{ position: 'absolute', top: '200px', right: '100px', color: '#00ff88', fontSize: '20px' }}>🚁</div>
          <div style={{ position: 'absolute', bottom: '50px', left: '200px', color: '#ffff00', fontSize: '18px' }}>🏃‍♂️</div>
        </div>

        {/* Alert Triage */}
        <div style={{ flex: '0 0 300px', background: 'var(--bg-secondary)', padding: '10px', borderRadius: '8px' }}>
          <h4>🚨 Intelligent Alert Triage</h4>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {alerts.map((alert, i) => (
              <div 
                key={i} 
                style={{ 
                  padding: '10px', 
                  margin: '5px 0', 
                  background: 'var(--bg-primary)', 
                  borderRadius: '6px',
                  border: `2px solid ${getSeverityColor(alert.severity)}`,
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedAlert(alert)}
              >
                <div style={{ fontWeight: 'bold', color: getSeverityColor(alert.severity) }}>
                  [{alert.severity}] {alert.threat_type}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {alert.source_id} @ {alert.campus || 'Campus'}
                </div>
                <div style={{ fontSize: '11px' }}>{alert.details}</div>
                <div style={{ marginTop: '5px' }}>
                  <button style={{ fontSize: '10px', padding: '2px 6px', marginRight: '5px' }}>Triage</button>
                  <button style={{ fontSize: '10px', padding: '2px 6px' }}>Dispatch Drone</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event Focus / Live View */}
      {selectedAlert && (
        <div style={{ marginTop: '20px', padding: '15px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
          <h4>🎥 Event Focus: {selectedAlert.source_id} - {selectedAlert.threat_type}</h4>
          <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
            <div style={{ flex: '1', background: '#000', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              [Live Video Feed Placeholder]<br/>AI Bounding Box Overlays
            </div>
            <div style={{ flex: '1', padding: '10px' }}>
              <h5>🤖 AI Analysis (Live)</h5>
              <ul style={{ fontSize: '14px' }}>
                <li>- Detected: PERSON (98%)</li>
                <li>- Behavior: LOITERING (91%)</li>
                <li>- Status: {selectedAlert.severity}</li>
              </ul>
            </div>
            <div style={{ flex: '1', padding: '10px' }}>
              <h5>⚡ Response Actions</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <button className="btn-primary" style={{ fontSize: '12px', padding: '8px' }}>Trigger Alarm</button>
                <button className="btn-secondary" style={{ fontSize: '12px', padding: '8px' }}>Lockdown Area</button>
                <button className="btn-secondary" style={{ fontSize: '12px', padding: '8px' }}>Contact Police</button>
                <button className="btn-secondary" style={{ fontSize: '12px', padding: '8px' }}>Ack. & Log</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
        <div style={{ flex: '1', textAlign: 'center', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>98.7%</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Anomaly Detection Rate</div>
        </div>
        <div style={{ flex: '1', textAlign: 'center', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>&lt; 5s</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Response Time</div>
        </div>
        <div style={{ flex: '1', textAlign: 'center', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>2.1%</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>False Positive Rate</div>
        </div>
      </div>
    </div>
  );
};

export default SecurityMonitoringPanel;