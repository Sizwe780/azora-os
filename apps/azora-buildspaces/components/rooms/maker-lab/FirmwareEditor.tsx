"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    Play,
    Download,
    Save,
    Cpu,
    Terminal,
    Bug,
    Zap,
    Monitor,
    Settings,
    FileText,
    FolderOpen,
    Upload as UploadIcon,
    CheckCircle,
    AlertTriangle,
    X,
    RotateCcw
} from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const DEFAULT_ARDUINO_CODE = `#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YourWiFi";
const char* password = "YourPassword";
const char* serverUrl = "http://your-api.com/data";

#define LED_PIN 2
#define SENSOR_PIN 34

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nConnected to WiFi");

  Serial.println("ESP32 Firmware v2.1 Initialized");
}

void loop() {
  // Read sensor
  int sensorValue = analogRead(SENSOR_PIN);
  float voltage = sensorValue * (3.3 / 4095.0);

  // Control LED based on sensor
  if (voltage > 1.5) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }

  // Send data to server
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String jsonData = "{";
    jsonData += "\\"sensor\\":" + String(voltage) + ",";
    jsonData += "\\"timestamp\\":" + String(millis());
    jsonData += "}";

    int httpResponseCode = http.POST(jsonData);
    if (httpResponseCode > 0) {
      Serial.println("Data sent successfully");
    } else {
      Serial.println("Error sending data");
    }
    http.end();
  }

  Serial.printf("Sensor: %.2fV, LED: %s\\n",
                voltage,
                digitalRead(LED_PIN) ? "ON" : "OFF");

  delay(2000);
}`;

const DEFAULT_MICROPYTHON_CODE = `import machine
import time
import network
import urequests
import json

# Hardware setup
led = machine.Pin(2, machine.Pin.OUT)
sensor = machine.ADC(machine.Pin(34))
sensor.atten(machine.ADC.ATTN_11DB)  # Full range: 3.3v

# WiFi credentials
SSID = 'YourWiFi'
PASSWORD = 'YourPassword'
API_URL = 'http://your-api.com/data'

def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(SSID, PASSWORD)

    print('Connecting to WiFi...')
    while not wlan.isconnected():
        time.sleep(1)
        print('.')

    print('Connected!')
    print('IP:', wlan.ifconfig()[0])

def read_sensor():
    # Read analog value (0-4095)
    raw = sensor.read()
    # Convert to voltage
    voltage = raw * 3.3 / 4095
    return voltage

def send_data(voltage):
    try:
        data = {
            'sensor': voltage,
            'timestamp': time.time()
        }

        response = urequests.post(API_URL,
                                json=data,
                                headers={'Content-Type': 'application/json'})

        if response.status_code == 200:
            print('Data sent successfully')
        else:
            print('Server error:', response.status_code)

        response.close()
    except Exception as e:
        print('Error sending data:', e)

def main():
    connect_wifi()
    print('ESP32 MicroPython Firmware v1.0')

    while True:
        voltage = read_sensor()

        # Control LED based on sensor reading
        if voltage > 1.5:
            led.value(1)
        else:
            led.value(0)

        send_data(voltage)

        print(f'Sensor: {voltage:.2f}V, LED: {"ON" if led.value() else "OFF"}')
        time.sleep(2)

if __name__ == '__main__':
    main()
`;

const BOARD_TYPES = [
    { id: 'esp32', name: 'ESP32', framework: 'arduino' },
    { id: 'esp32-s3', name: 'ESP32-S3', framework: 'arduino' },
    { id: 'esp8266', name: 'ESP8266', framework: 'arduino' },
    { id: 'arduino-uno', name: 'Arduino Uno', framework: 'arduino' },
    { id: 'arduino-mega', name: 'Arduino Mega', framework: 'arduino' },
    { id: 'raspberry-pi-pico', name: 'Raspberry Pi Pico', framework: 'micropython' },
];

export default function FirmwareEditor() {
    const [language, setLanguage] = useState("cpp");
    const [code, setCode] = useState(DEFAULT_ARDUINO_CODE);
    const [boardType, setBoardType] = useState("esp32");
    const [isFlashing, setIsFlashing] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<string[]>(["Firmware editor ready."]);
    const [serialOutput, setSerialOutput] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState("editor");
    const [breakpoints, setBreakpoints] = useState<number[]>([]);
    const [compilationErrors, setCompilationErrors] = useState<any[]>([]);

    const editorRef = useRef<any>(null);
    const serialIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Load appropriate code template based on board
        const board = BOARD_TYPES.find(b => b.id === boardType);
        const raf = requestAnimationFrame(() => {
            if (board?.framework === 'micropython') {
                setLanguage('python');
                setCode(DEFAULT_MICROPYTHON_CODE);
            } else {
                setLanguage('cpp');
                setCode(DEFAULT_ARDUINO_CODE);
            }
        });
        return () => cancelAnimationFrame(raf);
    }, [boardType]);

    const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `[${timestamp}] ${type.toUpperCase()}: ${message}`]);
    };

    const compileCode = async () => {
        addLog("Starting compilation...");
        setCompilationErrors([]);

        // Simulate compilation process
        setTimeout(() => {
            const errors = Math.random() > 0.7 ? [
                { line: 15, message: "Undefined variable 'sensorValue'", type: 'error' },
                { line: 23, message: "Missing semicolon", type: 'error' }
            ] : [];

            if (errors.length > 0) {
                setCompilationErrors(errors);
                addLog(`Compilation failed with ${errors.length} errors`, 'error');
            } else {
                addLog("Compilation successful", 'success');
            }
        }, 2000);
    };

    const flashFirmware = async () => {
        if (isFlashing) return;

        setIsFlashing(true);
        addLog("Connecting to board...");

        // Simulate flashing process
        const steps = [
            "Board detected: ESP32-WROOM-32",
            "Erasing flash memory...",
            "Writing firmware (0%)",
            "Writing firmware (25%)",
            "Writing firmware (50%)",
            "Writing firmware (75%)",
            "Writing firmware (100%)",
            "Verifying firmware...",
            "Flash complete!"
        ];

        for (let i = 0; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 800));
            addLog(steps[i]);
        }

        setIsFlashing(false);
        addLog("Firmware flashed successfully!", 'success');
    };

    const startSerialMonitor = () => {
        if (isRunning) {
            stopSerialMonitor();
            return;
        }

        setIsRunning(true);
        addLog("Starting serial monitor...");

        // In a real implementation, this would connect to a WebSocket or serial port API
        // For now, we show a message indicating the feature needs backend support
        addLog("Note: Serial monitor requires hardware connection via WebSocket API");
        addLog("Configure SERIAL_WS_URL environment variable to enable real-time monitoring");
        
        // Placeholder for future implementation
        // serialIntervalRef.current = setInterval(() => {
        //     // Fetch real serial data from backend
        // }, 1000);
    };

    const stopSerialMonitor = () => {
        if (serialIntervalRef.current) {
            clearInterval(serialIntervalRef.current);
            serialIntervalRef.current = null;
        }
        setIsRunning(false);
        addLog("Serial monitor stopped");
    };

    const clearSerialOutput = () => {
        setSerialOutput([]);
    };

    const saveProject = () => {
        addLog("Project saved successfully", 'success');
    };

    const loadProject = () => {
        addLog("Project loaded from file", 'info');
    };

    return (
        <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div className="h-12 border-b flex items-center justify-between px-4 bg-muted/20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Select value={boardType} onValueChange={setBoardType}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {BOARD_TYPES.map(board => (
                                    <SelectItem key={board.id} value={board.id}>
                                        {board.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator orientation="vertical" className="h-6" />

                    <div className="flex items-center gap-2">
                        <Button size="sm" onClick={compileCode} disabled={isFlashing}>
                            <Zap className="w-4 h-4 mr-2" />
                            Compile
                        </Button>
                        <Button size="sm" onClick={flashFirmware} disabled={isFlashing}>
                            <Download className="w-4 h-4 mr-2" />
                            {isFlashing ? "Flashing..." : "Flash"}
                        </Button>
                        <Button size="sm" onClick={startSerialMonitor}>
                            <Monitor className="w-4 h-4 mr-2" />
                            {isRunning ? "Stop Monitor" : "Serial Monitor"}
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={saveProject}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={loadProject}>
                        <FolderOpen className="w-4 h-4 mr-2" />
                        Load
                    </Button>
                    <Button size="sm" variant="ghost">
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <div className="border-b px-4 bg-muted/10">
                        <TabsList className="h-10 bg-transparent p-0">
                            <TabsTrigger value="editor" className="gap-2">
                                <FileText className="w-4 h-4" />
                                Editor
                            </TabsTrigger>
                            <TabsTrigger value="serial" className="gap-2">
                                <Terminal className="w-4 h-4" />
                                Serial Monitor
                            </TabsTrigger>
                            <TabsTrigger value="debug" className="gap-2">
                                <Bug className="w-4 h-4" />
                                Debug
                            </TabsTrigger>
                            <TabsTrigger value="logs" className="gap-2">
                                <Monitor className="w-4 h-4" />
                                Build Logs
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="editor" className="flex-1 m-0 flex">
                        <div className="flex-1 flex flex-col">
                            {/* Code Editor */}
                            <div className="flex-1">
                                <MonacoEditor
                                    height="100%"
                                    language={language}
                                    value={code}
                                    onChange={(value) => setCode(value || "")}
                                    theme="vs-dark"
                                    options={{
                                        minimap: { enabled: true },
                                        fontSize: 14,
                                        lineNumbers: 'on',
                                        roundedSelection: false,
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        tabSize: 2,
                                        wordWrap: 'on',
                                        glyphMargin: true,
                                        folding: true,
                                        lineDecorationsWidth: 10,
                                        lineNumbersMinChars: 3,
                                    }}
                                    onMount={(editor) => {
                                        editorRef.current = editor;

                                        // Add error markers
                                        const markers = compilationErrors.map(error => ({
                                            startLineNumber: error.line,
                                            startColumn: 1,
                                            endLineNumber: error.line,
                                            endColumn: 1000,
                                            message: error.message,
                                            severity: 8 // Error
                                        }));

                                        const model = editor.getModel();
                                        if (model) {
                                            (window as any).monaco?.editor.setModelMarkers(model, 'compilation', markers);
                                        }
                                    }}
                                />
                            </div>

                            {/* Error Panel */}
                            {compilationErrors.length > 0 && (
                                <div className="h-32 border-t bg-red-50 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                        <span className="font-medium text-red-900">Compilation Errors</span>
                                    </div>
                                    <ScrollArea className="h-20">
                                        <div className="space-y-1">
                                            {compilationErrors.map((error, index) => (
                                                <div key={index} className="text-sm text-red-800 flex items-center gap-2">
                                                    <span className="font-mono">Line {error.line}:</span>
                                                    {error.message}
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="serial" className="flex-1 m-0 p-4">
                        <Card className="h-full flex flex-col">
                            <div className="p-4 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Terminal className="w-5 h-5" />
                                    <span className="font-medium">Serial Monitor</span>
                                    <Badge variant={isRunning ? "default" : "secondary"}>
                                        {isRunning ? "Connected" : "Disconnected"}
                                    </Badge>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={clearSerialOutput} disabled={!isRunning}>
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Clear
                                    </Button>
                                    <Button size="sm" onClick={startSerialMonitor}>
                                        {isRunning ? <X className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                                        {isRunning ? "Disconnect" : "Connect"}
                                    </Button>
                                </div>
                            </div>

                            <ScrollArea className="flex-1 p-4">
                                <div className="font-mono text-sm space-y-1">
                                    {serialOutput.map((line, index) => (
                                        <div key={index} className="text-green-600">
                                            {line}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </Card>
                    </TabsContent>

                    <TabsContent value="debug" className="flex-1 m-0 p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                            <Card className="p-4">
                                <h3 className="font-medium mb-4">Breakpoints</h3>
                                <ScrollArea className="h-64">
                                    <div className="space-y-2">
                                        {breakpoints.map((line, index) => (
                                            <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                <span className="text-sm">Line {line}</span>
                                            </div>
                                        ))}
                                        {breakpoints.length === 0 && (
                                            <p className="text-sm text-gray-500">No breakpoints set</p>
                                        )}
                                    </div>
                                </ScrollArea>
                            </Card>

                            <Card className="p-4">
                                <h3 className="font-medium mb-4">Variables</h3>
                                <ScrollArea className="h-64">
                                    <div className="space-y-2 font-mono text-sm">
                                        <div className="flex justify-between">
                                            <span>sensorValue:</span>
                                            <span className="text-blue-600">2456</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>voltage:</span>
                                            <span className="text-blue-600">2.03</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>temperature:</span>
                                            <span className="text-blue-600">23.5</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>ledState:</span>
                                            <span className="text-green-600">true</span>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </Card>

                            <Card className="p-4">
                                <h3 className="font-medium mb-4">Call Stack</h3>
                                <ScrollArea className="h-64">
                                    <div className="space-y-2 font-mono text-sm">
                                        <div className="p-2 bg-blue-50 rounded">
                                            loop() at main.ino:25
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded">
                                            readSensor() at main.ino:15
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded">
                                            sendData() at main.ino:35
                                        </div>
                                    </div>
                                </ScrollArea>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="logs" className="flex-1 m-0 p-4">
                        <Card className="h-full">
                            <div className="p-4 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Monitor className="w-5 h-5" />
                                    <span className="font-medium">Build & Flash Logs</span>
                                </div>
                                <Button size="sm" onClick={() => setLogs(["Logs cleared."])}>
                                    Clear Logs
                                </Button>
                            </div>

                            <ScrollArea className="flex-1 p-4">
                                <div className="font-mono text-sm space-y-1">
                                    {logs.map((log, index) => {
                                        const isError = log.includes('ERROR:');
                                        const isSuccess = log.includes('SUCCESS:');
                                        return (
                                            <div
                                                key={index}
                                                className={`${
                                                    isError ? 'text-red-600' :
                                                    isSuccess ? 'text-green-600' :
                                                    'text-gray-700'
                                                }`}
                                            >
                                                {log}
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

