import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import { Vehicle, leafletIcon } from '../../features/quantum-tracking/mockQuantum';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  fleet: Vehicle[];
  selectedVehicle: Vehicle | null;
  center: [number, number];
  onSelectVehicle: (vehicle: Vehicle) => void;
}

const MapView: React.FC<MapViewProps> = ({ fleet, selectedVehicle, center, onSelectVehicle }) => {
  return (
    <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-gray-700/50 relative">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', backgroundColor: '#111827' }} zoomControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap &copy; CartoDB' />
        {fleet.map((vehicle) => (
          <Marker key={vehicle.id} position={[vehicle.location.lat, vehicle.location.lng]} icon={leafletIcon} eventHandlers={{ click: () => onSelectVehicle(vehicle) }}>
            <Popup>{vehicle.id}: {vehicle.driver}</Popup>
          </Marker>
        ))}
        {selectedVehicle && (
          <>
            <Polyline positions={selectedVehicle.route.waypoints.map(w => [w.lat, w.lng])} color={selectedVehicle.route.optimal ? '#3b82f6' : '#ef4444'} dashArray={selectedVehicle.route.optimal ? undefined : '5, 5'} />
            <Circle center={[selectedVehicle.location.lat, selectedVehicle.location.lng]} radius={200} color="#3b82f6" fillOpacity={0.2} />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
