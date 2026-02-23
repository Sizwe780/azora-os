"use client"

import { Badge } from "@/components/ui/badge"
import { Radio, Wifi, Bluetooth } from "lucide-react"

interface IotDeviceSimulatorProps {
    board: string
}

export function IotDeviceSimulator({ board }: IotDeviceSimulatorProps) {
    return (
        <div className="h-full p-4">
            <div className="text-center text-muted-foreground py-8">
                <Radio className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">IoT device simulation and cloud connectivity</p>
                <p className="text-xs mt-1">MQTT, HTTP APIs, and device-to-cloud communication</p>
            </div>
        </div>
    )
}
