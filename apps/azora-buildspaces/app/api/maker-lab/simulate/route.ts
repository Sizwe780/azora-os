import { NextResponse } from "next/server"

interface SimulationResult {
  board: string
  status: "success" | "error"
  readings: {
    sensor: string
    value: number
    unit: string
    status: "normal" | "warning" | "critical"
  }[]
  gpioState: Record<string, boolean>
  memoryUsage: { used: number; total: number }
  cpuFrequency: number
  uptime: number
  logs: string[]
}

const BOARD_SPECS: Record<string, { ram: number; flash: number; cpuMHz: number; pins: number }> = {
  esp32: { ram: 520, flash: 4096, cpuMHz: 240, pins: 34 },
  esp8266: { ram: 80, flash: 1024, cpuMHz: 80, pins: 17 },
  arduino: { ram: 2, flash: 32, cpuMHz: 16, pins: 20 },
  raspberry: { ram: 1024, flash: 32000, cpuMHz: 1400, pins: 40 },
  particle: { ram: 128, flash: 1024, cpuMHz: 120, pins: 24 },
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { board, project } = body

    const specs = BOARD_SPECS[board] || BOARD_SPECS.esp32

    // Simulate sensor readings
    const sensors = [
      { sensor: "Temperature", value: +(20 + Math.random() * 15).toFixed(1), unit: "°C", status: "normal" as const },
      { sensor: "Humidity", value: +(40 + Math.random() * 30).toFixed(1), unit: "%", status: "normal" as const },
      { sensor: "Light", value: Math.floor(200 + Math.random() * 800), unit: "lux", status: "normal" as const },
      { sensor: "Pressure", value: +(1000 + Math.random() * 30).toFixed(1), unit: "hPa", status: "normal" as const },
      { sensor: "CO2", value: Math.floor(400 + Math.random() * 600), unit: "ppm", status: Math.random() > 0.8 ? "warning" as const : "normal" as const },
    ]

    // Simulate GPIO states
    const gpioState: Record<string, boolean> = {}
    for (let i = 0; i < Math.min(8, specs.pins); i++) {
      gpioState[`GPIO${i}`] = Math.random() > 0.5
    }

    // Simulate memory usage
    const memUsed = Math.floor(specs.ram * (0.3 + Math.random() * 0.4))

    const result: SimulationResult = {
      board,
      status: "success",
      readings: sensors,
      gpioState,
      memoryUsage: { used: memUsed, total: specs.ram },
      cpuFrequency: specs.cpuMHz,
      uptime: Math.floor(Math.random() * 86400),
      logs: [
        `[${new Date().toISOString()}] Board initialized: ${board.toUpperCase()}`,
        `[${new Date().toISOString()}] Project loaded: ${project}`,
        `[${new Date().toISOString()}] WiFi connected: 192.168.1.${Math.floor(100 + Math.random() * 155)}`,
        `[${new Date().toISOString()}] Sensors initialized (${sensors.length} active)`,
        `[${new Date().toISOString()}] MQTT broker connected`,
        `[${new Date().toISOString()}] Memory: ${memUsed}KB / ${specs.ram}KB (${Math.floor((memUsed / specs.ram) * 100)}%)`,
        `[${new Date().toISOString()}] Simulation running...`,
      ],
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Simulation error:", error)
    return NextResponse.json({ error: "Simulation failed" }, { status: 500 })
  }
}
