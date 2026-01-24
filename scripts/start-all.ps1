Write-Host "Starting Azora Buildspaces..."

# Start Orchestrator
Write-Host "Starting Orchestrator on port 3001..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Azora Sapiens\Documents\azora\services\buildspaces-orchestrator'; npm start"

# Start Python Bridge
Write-Host "Starting Azora Bridge on port 3010..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Azora Sapiens\Documents\azora\apps\azrome\native-host'; python azora-bridge.py"

# Start Frontend
Write-Host "Starting Frontend on port 3000..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Azora Sapiens\Documents\azora\apps\azora-buildspaces'; npm run dev"

Write-Host "Services started. Please check the new windows."
