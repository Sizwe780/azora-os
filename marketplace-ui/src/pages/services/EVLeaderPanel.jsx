import React, { useState, useEffect } from 'react'
import ServicePanel from '../../components/ServicePanel'
import axios from 'axios'

const EVLeaderPanel = () => {
    const [fleetData, setFleetData] = useState({
        totalVehicles: 2847,
        activeVehicles: 2156,
        chargingVehicles: 234,
        maintenanceVehicles: 23,
        energyEfficiency: 94,
        co2Saved: 1200000
    })
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const stats = [
        { label: 'Fleet Size', value: fleetData.totalVehicles.toString(), change: '+7%' },
        { label: 'Active Routes', value: '156', change: '+3%' },
        { label: 'Energy Efficiency', value: `${fleetData.energyEfficiency}%`, change: '+2%' },
        { label: 'CO2 Saved', value: `${(fleetData.co2Saved / 1000).toFixed(0)}K kg`, change: '+12%' }
    ]

    const actions = [
        { label: 'Add Vehicle', onClick: () => console.log('Add vehicle') },
        { label: 'Route Optimization', onClick: () => console.log('Optimize routes') }
    ]

    useEffect(() => {
        const fetchFleetData = async () => {
            try {
                // Try to fetch from Azora Mint service
                const response = await axios.get('http://localhost:4300/api/metrics', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('azora-token')}`
                    }
                })
                // Update fleet data with real metrics
                setFleetData(prev => ({
                    ...prev,
                    energyEfficiency: response.data.energyEfficiency || prev.energyEfficiency,
                    co2Saved: response.data.co2Saved || prev.co2Saved
                }))
            } catch (err) {
                console.log('Using mock data for fleet metrics')
            }

            // Mock vehicle data
            setVehicles([
                { id: 'EV-001', status: 'Active', battery: '78%', location: 'Downtown', time: '2 min ago' },
                { id: 'EV-002', status: 'Charging', battery: '45%', location: 'Station A', time: '5 min ago' },
                { id: 'EV-003', status: 'Maintenance', battery: '12%', location: 'Garage', time: '1 hour ago' }
            ])
            setLoading(false)
        }

        fetchFleetData()
    }, [])

    if (loading) {
        return (
            <ServicePanel
                title="EV Fleet Leadership"
                description="Manage your electric vehicle fleet and optimize operations"
                stats={stats}
                actions={actions}
            >
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </ServicePanel>
        )
    }

    return (
        <ServicePanel
            title="EV Fleet Leadership"
            description="Manage your electric vehicle fleet and optimize operations"
            stats={stats}
            actions={actions}
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <h4 className="font-medium text-green-600 mb-2">Charging Status</h4>
                        <p className="text-2xl font-bold text-green-600">{Math.round((fleetData.chargingVehicles / fleetData.totalVehicles) * 100)}%</p>
                        <p className="text-sm text-green-600">Fleet charged</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <h4 className="font-medium text-blue-600 mb-2">Active Vehicles</h4>
                        <p className="text-2xl font-bold text-blue-600">{fleetData.activeVehicles}</p>
                        <p className="text-sm text-blue-600">On the road</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-600 mb-2">Maintenance Due</h4>
                        <p className="text-2xl font-bold text-yellow-600">{fleetData.maintenanceVehicles}</p>
                        <p className="text-sm text-yellow-600">Vehicles need service</p>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Fleet Overview</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-2 text-foreground font-medium">Vehicle ID</th>
                                    <th className="text-left py-2 text-foreground font-medium">Status</th>
                                    <th className="text-left py-2 text-foreground font-medium">Battery</th>
                                    <th className="text-left py-2 text-foreground font-medium">Location</th>
                                    <th className="text-left py-2 text-foreground font-medium">Last Update</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicles.map((vehicle, index) => (
                                    <tr key={index} className="border-b border-border">
                                        <td className="py-3 text-foreground">{vehicle.id}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${vehicle.status === 'Active' ? 'bg-green-500/10 text-green-500' :
                                                    vehicle.status === 'Charging' ? 'bg-blue-500/10 text-blue-500' :
                                                        'bg-yellow-500/10 text-yellow-500'
                                                }`}>
                                                {vehicle.status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-foreground">{vehicle.battery}</td>
                                        <td className="py-3 text-foreground">{vehicle.location}</td>
                                        <td className="py-3 text-muted-foreground">{vehicle.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ServicePanel>
    )
}

export default EVLeaderPanel