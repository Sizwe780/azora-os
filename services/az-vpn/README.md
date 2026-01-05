# Azora VPN (az-vpn)

A secure WireGuard-based VPN service integrated with CoreDNS for the Azora Aethernet.

## Setup

1. **Prerequisites**:
   - Docker and Docker Compose installed.
   - Port `51820/udp` open on your firewall.

2. **Start the Service**:
   ```bash
   docker-compose up -d
   ```

3. **Access the UI**:
   Open your browser and navigate to `http://localhost:5000`.
   - **Username**: `admin`
   - **Password**: `admin`

   From here, you can easily manage clients and view connection status.

4. **Client Configuration**:
   The VPN is configured to automatically generate configurations for the following peers:
   - `phone`
   - `vivobook`

   You can find the generated client configurations (including QR codes) in:
   - `./config/peer_phone/`
   - `./config/peer_vivobook/`

4. **Adding More Peers**:
   To add more peers, update the `PEERS` environment variable in `docker-compose.yml` and restart the service:
   ```bash
   docker-compose up -d
   ```

## DNS Integration

The VPN uses CoreDNS to resolve internal `.world` domains.
- `portal.world` -> `10.0.0.1`
- `citadel.world` -> `10.0.0.2`

Edit `./config/Corefile` to add more internal mappings.

## Files

- `./config/wg0.conf`: WireGuard server configuration.
- `./config/Corefile`: CoreDNS configuration for the Aethernet.
- `docker-compose.yml`: Orchestration for the VPN and DNS services.
