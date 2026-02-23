"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Thermometer, Droplets, Sun, Move, Activity, Settings } from "lucide-react"

interface SensorDashboardProps {
    board: string
    simulationData: any
}

export function SensorDashboard({ board, simulationData }: SensorDashboardProps) {
    const [sensors, setSensors] = useState([
        { id: 'temp', name: 'Temperature', icon: Thermometer, unit: '°C', value: 25.5, enabled: true },
        { id: 'humidity', name: 'Humidity', icon: Droplets, unit: '%', value: 65.2, enabled: true },
        { id: 'light', name: 'Light Level', icon: Sun, unit: 'lux', value: 450, enabled: true },
        { id: 'motion', name: 'Motion', icon: Move, unit: '', value: 0, enabled: false },
        { id: 'vibration', name: 'Vibration', icon: Activity, unit: '', value: 0, enabled: false }
    ])

    useEffect(() => {
        if (simulationData?.sensors) {
            setSensors(prev => prev.map(sensor => ({
                ...sensor,
                value: simulationData.sensors[sensor.id] || sensor.value
            })))
        }
    }, [simulationData])

    const toggleSensor = (sensorId: string) => {
        setSensors(prev => prev.map(sensor =>
            sensor.id === sensorId ? { ...sensor, enabled: !sensor.enabled } : sensor
        ))
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Sensor Configuration</h3>
                <Badge variant="outline">{board} Board</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {sensors.map(sensor => {
                    const IconComponent = sensor.icon
                    return (
                        <Card key={sensor.id} className={sensor.enabled ? 'border-primary' : ''}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <IconComponent className="w-4 h-4" />
                                        <CardTitle className="text-sm">{sensor.name}</CardTitle>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={sensor.enabled ? "default" : "outline"}
                                        onClick={() => toggleSensor(sensor.id)}
                                    >
                                        {sensor.enabled ? 'Enabled' : 'Disabled'}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {sensor.enabled ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold">
                                                {sensor.value}{sensor.unit}
                                            </span>
                                            <Badge variant="outline" className="text-xs">Active</Badge>
                                        </div>

                                        {sensor.id === 'temp' && (
                                            <Progress
                                                value={((sensor.value - 0) / (50 - 0)) * 100}
                                                className="h-2"
                                            />
                                        )}

                                        {sensor.id === 'humidity' && (
                                            <Progress
                                                value={sensor.value}
                                                className="h-2"
                                            />
                                        )}

                                        {sensor.id === 'light' && (
                                            <Progress
                                                value={(sensor.value / 1000) * 100}
                                                className="h-2"
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-4">
                                        <Settings className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                        <p className="text-xs">Sensor disabled</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Sensor Data Stream</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Real-time sensor data visualization</p>
                        <p className="text-xs mt-1">Charts, graphs, and data export capabilities</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
