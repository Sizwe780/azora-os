import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ServicePanel from '../../components/ServicePanel'

const TMSPanel = () => {
  const [tmsMetrics, setTmsMetrics] = useState(null)
  const [activeRoutes, setActiveRoutes] = useState([])
  const [fleetStatus, setFleetStatus] = useState([])
  const [pendingShipments, setPendingShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [optimizing, setOptimizing] = useState(false)

  useEffect(() => {
    fetchTmsMetrics()
  }, [])

  const fetchTmsMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Try to connect to azora-forge TMS endpoints
      const response = await axios.get('http://localhost:4048/api/tms/metrics')
      setTmsMetrics(response.data)

      const routesResponse = await axios.get('http://localhost:4048/api/tms/routes/active')
      setActiveRoutes(routesResponse.data.routes || [])

      const fleetResponse = await axios.get('http://localhost:4048/api/tms/fleet/status')
      setFleetStatus(fleetResponse.data.fleet || [])

      const shipmentsResponse = await axios.get('http://localhost:4048/api/tms/shipments/pending')
      setPendingShipments(shipmentsResponse.data.shipments || [])
    } catch (err) {
      console.error('Error fetching TMS metrics:', err)
      setError('Forge TMS system unavailable. Using simulated data.')

      setTmsMetrics({
        totalRoutes: 247,
        activeRoutes: 89,
        fleetUtilization: 0.76,
        onTimeDelivery: 0.94,
        averageTransitTime: 2.3,
        costEfficiency: 0.87
      })

      setActiveRoutes([
        { id: 'route-1', origin: 'Cape Town', destination: 'Johannesburg', status: 'in-transit', progress: 67, eta: '2h 15m' },
        { id: 'route-2', origin: 'Durban', destination: 'Pretoria', status: 'loading', progress: 23, eta: '4h 30m' },
        { id: 'route-3', origin: 'Port Elizabeth', destination: 'Bloemfontein', status: 'completed', progress: 100, eta: 'completed' }
      ])

      setFleetStatus([
        { id: 'truck-1', type: 'heavy-duty', status: 'active', location: 'N1 Highway', utilization: 0.89 },
        { id: 'truck-2', type: 'medium-duty', status: 'maintenance', location: 'Durban Depot', utilization: 0.0 },
        { id: 'truck-3', type: 'light-duty', status: 'available', location: 'Cape Town Depot', utilization: 0.12 }
      ])

      setPendingShipments([
        { id: 'ship-1', priority: 'high', weight: 2500, destination: 'Johannesburg', deadline: '2024-01-21T08:00:00Z' },
        { id: 'ship-2', priority: 'medium', weight: 1800, destination: 'Durban', deadline: '2024-01-22T14:00:00Z' },
        { id: 'ship-3', priority: 'low', weight: 950, destination: 'Port Elizabeth', deadline: '2024-01-23T10:00:00Z' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const optimizeRoutes = async () => {
    try {
      setOptimizing(true)
      setError(null)

      const response = await axios.post('http://localhost:4048/api/tms/routes/optimize', {
        optimizationCriteria: ['cost', 'time', 'efficiency'],
        constraints: {
          maxTransitTime: 48,
          fuelEfficiency: true,
          loadBalancing: true
        }
      })

      if (response.data.success) {
        await fetchTmsMetrics()
      }
    } catch (err) {
      console.error('Error optimizing routes:', err)
      setError('Failed to optimize routes.')
    } finally {
      setOptimizing(false)
    }
  }

  const dispatchShipment = async (shipmentId) => {
    try {
      const response = await axios.post(`http://localhost:4048/api/tms/shipments/${shipmentId}/dispatch`, {
        autoAssign: true,
        priorityRouting: true
      })

      if (response.data.success) {
        await fetchTmsMetrics()
      }
    } catch (err) {
      console.error('Error dispatching shipment:', err)
      setError('Failed to dispatch shipment.')
    }
  }

  const stats = tmsMetrics ? [
    { label: 'Active Routes', value: tmsMetrics.activeRoutes.toString(), change: '+3' },
    { label: 'Fleet Utilization', value: `${(tmsMetrics.fleetUtilization * 100).toFixed(0)}%`, change: '+5%' },
    { label: 'On-Time Delivery', value: `${(tmsMetrics.onTimeDelivery * 100).toFixed(0)}%`, change: '+2%' },
    { label: 'Cost Efficiency', value: `${(tmsMetrics.costEfficiency * 100).toFixed(0)}%`, change: '+3%' }
  ] : []

  const actions = [
    { label: 'Refresh Status', onClick: fetchTmsMetrics },
    { label: 'Optimize Routes', onClick: optimizeRoutes, disabled: optimizing },
    { label: 'View Fleet Map', onClick: () => console.log('View fleet map') }
  ]

  if (loading) {
    return (
      <ServicePanel
        title="Transportation Management System"
        description="Comprehensive transportation management and optimization"
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
      title="Transportation Management System"
      description="Comprehensive transportation management and optimization"
      stats={stats}
      actions={actions}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Active Routes */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Active Routes</h3>
          <div className="space-y-3">
            {activeRoutes.map(route => (
              <div key={route.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{route.origin} → {route.destination}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      route.status === 'completed' ? 'bg-green-100 text-green-800' :
                      route.status === 'in-transit' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {route.status}
                    </span>
                    <span className="text-sm text-muted-foreground">ETA: {route.eta}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${route.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{route.progress}% complete</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Status */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Fleet Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fleetStatus.map(vehicle => (
              <div key={vehicle.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{vehicle.type}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    vehicle.status === 'active' ? 'bg-green-100 text-green-800' :
                    vehicle.status === 'available' ? 'bg-blue-100 text-blue-800' :
                    vehicle.status === 'maintenance' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {vehicle.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{vehicle.location}</p>
                  <div>
                    <p className="text-sm text-muted-foreground">Utilization</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${vehicle.utilization * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Shipments */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Pending Shipments</h3>
          <div className="space-y-3">
            {pendingShipments.map(shipment => (
              <div key={shipment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">Shipment {shipment.id.split('-')[1]}</p>
                    <p className="text-sm text-muted-foreground">{shipment.weight}kg → {shipment.destination}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    shipment.priority === 'high' ? 'bg-red-100 text-red-800' :
                    shipment.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {shipment.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Due: {new Date(shipment.deadline).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => dispatchShipment(shipment.id)}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
                  >
                    Dispatch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Route Optimization */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Route Optimization</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Max Transit Time (hours)</label>
                <input
                  type="number"
                  defaultValue="48"
                  className="w-full p-2 border border-border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority Criteria</label>
                <select className="w-full p-2 border border-border rounded">
                  <option>Cost Efficiency</option>
                  <option>Time Optimization</option>
                  <option>Load Balancing</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={optimizeRoutes}
                  disabled={optimizing}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                >
                  {optimizing ? 'Optimizing...' : 'Optimize Routes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ServicePanel>
  )
}

export default TMSPanel