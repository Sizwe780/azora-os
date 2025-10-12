import React from 'react';
import Map from '../components/maps/Map';
import TripInfo from '../components/maps/TripInfo';
import { ModernDashboardLayout } from '../layouts/ModernDashboardLayout';

const LiveTripTrackingPage = () => {
  return (
    <ModernDashboardLayout>
      <div className="h-full flex flex-col md:flex-row">
        <div className="w-full md:w-3/4 h-full">
          <Map />
        </div>
        <div className="w-full md:w-1/4 h-full bg-gray-900 p-4">
          <TripInfo />
        </div>
      </div>
    </ModernDashboardLayout>
  );
};

export default LiveTripTrackingPage;
