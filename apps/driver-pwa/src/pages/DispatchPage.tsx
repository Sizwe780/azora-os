import React from 'react';
import Card from '../components/atoms/Card';
import Heading from '../components/atoms/Heading';
import TrackingMap from '../../components/TrackingMap';
import Jobs from './Jobs';

export default function DispatchPage() {
  return (
    <div className="p-6 space-y-6">
      <Heading level={1}>Dispatch</Heading>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Heading level={2}>Live driver map</Heading>
          <TrackingMap />
        </Card>
        <Card>
          <Heading level={2}>Jobs</Heading>
          <div className="mt-4">
            <Jobs />
          </div>
        </Card>
      </div>
    </div>
  );
}