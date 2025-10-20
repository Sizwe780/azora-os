
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

import { mockAttendanceData } from '../features/attendance/mockAttendanceData';
import AttendanceHeader from '../components/attendance/AttendanceHeader';
import AnomaliesDashboard from '../components/attendance/AnomaliesDashboard';
import PerformanceList from '../components/attendance/PerformanceList';

export default function AttendancePage() {
  const data = mockAttendanceData;

  return (
    <>
      <Helmet>
        <title>Attendance & Performance | Azora</title>
        <meta name="description" content="Deliverable-based attendance and performance tracking. Monitor team velocity, top performers, and anomalies." />
      </Helmet>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gray-950 min-h-screen text-white">
        <AttendanceHeader teamAverage={data.teamAverage} />

        <AnomaliesDashboard anomalies={data.anomalies} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceList
            title="Top Performers"
            performers={data.topPerformers}
            trend="up"
          />
          <PerformanceList
            title="Needs Attention"
            performers={data.bottomPerformers}
            trend="down"
          />
        </div>
      </div>
    </>
  );
}
