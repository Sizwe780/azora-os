import React from 'react';

const TripInfo = () => {
  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-4">Trip Details</h2>
      <div className="space-y-4">
        <div>
          <p className="font-semibold">Driver:</p>
          <p>John Doe</p>
        </div>
        <div>
          <p className="font-semibold">Estimated Arrival:</p>
          <p>15:30</p>
        </div>
        <div>
          <p className="font-semibold">Status:</p>
          <p className="text-green-400">On Time</p>
        </div>
        <div>
          <p className="font-semibold">Next Stop:</p>
          <p>123 Main St, Los Angeles</p>
        </div>
      </div>
    </div>
  );
};

export default TripInfo;
