import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion } from 'framer-motion';

// Advanced icon for the driver
const driverIcon = new L.Icon({
    iconUrl: '/driver-icon.svg', // Assuming you have a cool SVG icon for the driver
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
    iconUrl: '/destination-icon.svg', // A custom icon for the destination
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});


// Initial positions and route
const initialDriverPosition: [number, number] = [34.0522, -118.2437]; // Los Angeles
const destinationPosition: [number, number] = [34.1522, -118.4437]; // A bit further in LA

// A more complex, realistic-looking route
const initialRoute: [number, number][] = [
  [34.0522, -118.2437],
  [34.055, -118.25],
  [34.06, -118.255],
  [34.07, -118.265],
  [34.08, -118.28],
  [34.09, -118.30],
  [34.10, -118.32],
  [34.11, -118.35],
  [34.12, -118.38],
  [34.13, -118.40],
  [34.14, -118.42],
  [34.1522, -118.4437],
];

const Map = () => {
  const [driverPosition, setDriverPosition] = useState<[number, number]>(initialDriverPosition);
  const [route, setRoute] = useState<[number, number][]>(initialRoute);
  const [routeIndex, setRouteIndex] = useState(0);

  // Simulate live tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setRouteIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % route.length;
        setDriverPosition(route[nextIndex]);
        return nextIndex;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [route]);

  return (
    <MapContainer center={driverPosition} zoom={13} style={{ height: '100%', width: '100%' }} className="map-container-dark">
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      <Polyline positions={route} color="#00cyan" weight={5} opacity={0.8} />

      <Marker position={driverPosition} icon={driverIcon}>
        <Popup>
          <div className="text-white bg-gray-800 p-2 rounded">
            <p className="font-bold">Azora Prime Mover</p>
            <p>Status: En-route</p>
            <p>Speed: 45 mph</p>
          </div>
        </Popup>
      </Marker>
      
      <Marker position={destinationPosition} icon={destinationIcon}>
        <Popup>
            <div className="text-white bg-gray-800 p-2 rounded">
                <p className="font-bold">Destination</p>
                <p>ETA: 15:45</p>
            </div>
        </Popup>
      </Marker>

    </MapContainer>
  );
};

export default Map;
