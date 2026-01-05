#!/bin/bash

# Usage: ./generate-client.sh <client_name> <client_ip>
# Example: ./generate-client.sh phone 10.0.0.2

CLIENT_NAME=$1
CLIENT_IP=$2

if [ -z "$CLIENT_NAME" ] || [ -z "$CLIENT_IP" ]; then
    echo "Usage: $0 <client_name> <client_ip>"
    exit 1
fi

mkdir -p clients/$CLIENT_NAME

# Generate keys
wg genkey | tee clients/$CLIENT_NAME/private.key | wg pubkey > clients/$CLIENT_NAME/public.key

PRIVATE_KEY=$(cat clients/$CLIENT_NAME/private.key)
SERVER_PUB_KEY=$(cat public.key)

# Create client config
cat <<EOF > clients/$CLIENT_NAME/$CLIENT_NAME.conf
[Interface]
PrivateKey = $PRIVATE_KEY
Address = $CLIENT_IP/24
DNS = 10.0.0.1

[Peer]
PublicKey = $SERVER_PUB_KEY
Endpoint = vpn.azora.world:51820
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
EOF

echo "Client config generated at clients/$CLIENT_NAME/$CLIENT_NAME.conf"
echo "Public key for server config: $(cat clients/$CLIENT_NAME/public.key)"
