import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ServicePanel from '../../components/ServicePanel'

const TrackingEnginePanel = () => {
  const [trackingMetrics, setTrackingMetrics] = useState(null)
  const [activeShipments, setActiveShipments] = useState([])
  const [assetLocations, setAssetLocations] = useState([])
  const [routeHistory, setRouteHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [trackingId, setTrackingId] = useState('')
  const [trackingResult, setTrackingResult] = useState(null)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    fetchTrackingMetrics()
  }, [])

  const fetchTrackingMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Try to connect to azora-forge tracking endpoints
      const response = await axios.get('http://localhost:4048/api/tracking/metrics')
      setTrackingMetrics(response.data)

      const shipmentsResponse = await axios.get('http://localhost:4048/api/tracking/shipments/active')
      setActiveShipments(shipmentsResponse.data.shipments || [])

      const assetsResponse = await axios.get('http://localhost:4048/api/tracking/assets/locations')
      setAssetLocations(assetsResponse.data.assets || [])

      const routesResponse = await axios.get('http://localhost:4048/api/tracking/routes/history')
      setRouteHistory(routesResponse.data.routes || [])
    } catch (err) {
      console.error('Error fetching tracking metrics:', err)
      setError('Forge tracking system unavailable. Using simulated data.')

      setTrackingMetrics({
        totalTrackedAssets: 1247,
        activeShipments: 89,
        coverageArea: 95.2,
        updateFrequency: 30,
        accuracyRate: 0.98,
        realTimeCoverage: 0.92
      })

      setActiveShipments([
        { id: 'ship-001', status: 'in-transit', location: 'N1 Highway, Johannesburg', eta: '2h 15m', progress: 67 },
        { id: 'ship-002', status: 'loading', location: 'Durban Port', eta: '4h 30m', progress: 23 },
        { id: 'ship-003', status: 'delivered', location: 'Cape Town Warehouse', eta: 'completed', progress: 100 }
      ])

      setAssetLocations([
        { id: 'asset-1', type: 'vehicle', location: 'GPS: -26.2041, 28.0473', status: 'moving', lastUpdate: '2024-01-20T10:30:00Z' },
        { id: 'asset-2', type: 'container', location: 'Port Elizabeth Terminal', status: 'stationary', lastUpdate: '2024-01-20T10:25:00Z' },
        { id: 'asset-3', type: 'package', location: 'Distribution Center A', status: 'processing', lastUpdate: '2024-01-20T10:20:00Z' }
      ])

      setRouteHistory([
        { id: 'route-1', origin: 'Cape Town', destination: 'Johannesburg', distance: 1400, duration: '16h 30m', status: 'completed' },
        { id: 'route-2', origin: 'Durban', destination: 'Pretoria', distance: 580, duration: '7h 15m', status: 'active' },
        { id: 'route-3', origin: 'Port Elizabeth', destination: 'Bloemfontein', distance: 720, duration: '9h 45m', status: 'planned' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const trackShipment = async () => {
    if (!trackingId.trim()) return

    try {
      setSearching(true)
      setError(null)

      const response = await axios.get(`http://localhost:4048/api/tracking/shipment/${trackingId}`)
      setTrackingResult(response.data)
    } catch (err) {
      console.error('Error tracking shipment:', err)
      setError('Shipment not found or tracking system unavailable.')

      // Simulated tracking result
      setTrackingResult({
        id: trackingId,
        status: 'in-transit',
        currentLocation: 'N3 Highway, approaching Johannesburg',
        lastUpdate: '2024-01-20T10:35:00Z',
        eta: '1h 45m',
        progress: 78,
        route: [
          { location: 'Cape Town Depot', timestamp: '2024-01-20T06:00:00Z', status: 'departed' },
          { location: 'Kimberley Transit', timestamp: '2024-01-20T08:30:00Z', status: 'passed' },
          { location: 'N3 Highway', timestamp: '2024-01-20T10:35:00Z', status: 'current' },
          { location: 'Johannesburg Warehouse', timestamp: '2024-01-20T12:20:00Z', status: 'destination' }
        ]
      })
    } finally {
      setSearching(false)
    }
  }

  const stats = trackingMetrics ? [
    { label: 'Active Shipments', value: trackingMetrics.activeShipments.toString(), change: '+3' },
    { label: 'Coverage Area', value: `${trackingMetrics.coverageArea}%`, change: '+2%' },
    { label: 'Accuracy Rate', value: `${(trackingMetrics.accuracyRate * 100).toFixed(0)}%`, change: '+1%' },
    { label: 'Real-time Coverage', value: `${(trackingMetrics.realTimeCoverage * 100).toFixed(0)}%`, change: '+3%' }
  ] : []

  const actions = [
    { label: 'Refresh Tracking', onClick: fetchTrackingMetrics },
    { label: 'View Live Map', onClick: () => console.log('View live map') },
    { label: 'Export Tracking Data', onClick: () => console.log('Export tracking data') }
  ]

  if (loading) {
    return (
      <ServicePanel
        title="Tracking Engine"
        description="Real-time asset and shipment tracking system"
        stats={stats}
        actions={actions}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </ServicePanel>
    )
  }

  return (
    <ServicePanel
      title="Tracking Engine"
      description="Real-time asset and shipment tracking system"
      stats={stats}
      actions={actions}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Tracking Search */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Track Shipment</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter tracking ID (e.g., ship-001)"
              className="flex-1 p-2 border border-border rounded"
            />
            <button
              onClick={trackShipment}
              disabled={searching || !trackingId.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Track'}
            </button>
          </div>
        </div>

        {/* Tracking Result */}
        {trackingResult && (
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Tracking Result</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">{trackingResult.status.replace('-', ' ').toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Location</p>
                <p className="font-medium">{trackingResult.currentLocation}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ETA</p>
                <p className="font-medium">{trackingResult.eta}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Update</p>
                <p className="font-medium">{new Date(trackingResult.lastUpdate).toLocaleString()}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Progress</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${trackingResult.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{trackingResult.progress}% complete</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Route History</h4>
              <div className="space-y-2">
                {trackingResult.route.map((stop, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      stop.status === 'current' ? 'bg-blue-500' :
                      stop.status === 'passed' ? 'bg-green-500' :
                      'bg-gray-300'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{stop.location}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(stop.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      stop.status === 'current' ? 'bg-blue-100 text-blue-800' :
                      stop.status === 'passed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {stop.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Shipments */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Active Shipments</h3>
          <div className="space-y-3">
            {activeShipments.map(shipment => (
              <div key={shipment.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Shipment {shipment.id}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    shipment.status === 'in-transit' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {shipment.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="text-sm">{shipment.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ETA</p>
                    <p className="text-sm">{shipment.eta}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${shipment.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Asset Locations */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Asset Locations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assetLocations.map(asset => (
              <div key={asset.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{asset.type}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    asset.status === 'moving' ? 'bg-green-100 text-green-800' :
                    asset.status === 'stationary' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {asset.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm">{asset.location}</p>
                  <p className="text-xs text-muted-foreground">
                    Updated: {new Date(asset.lastUpdate).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Route History */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Recent Routes</h3>
          <div className="space-y-3">
            {routeHistory.map(route => (
              <div key={route.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{route.origin} → {route.destination}</p>
                    <p className="text-sm text-muted-foreground">{route.distance}km • {route.duration}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    route.status === 'completed' ? 'bg-green-100 text-green-800' :
                    route.status === 'active' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {route.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ServicePanel>
  )
}

export default TrackingEnginePanel