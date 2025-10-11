import { subDays } from 'date-fns';

export interface EmployeePerformance {
  id: string;
  name: string;
  avatar: string;
  role: string;
  metrics: {
    commits: number;
    prs: number;
    tasks: number;
    features: number;
  };
  score: number;
  trend: 'up' | 'down' | 'stable';
  anomalies: string[];
}

export interface Anomaly {
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  type: 'Productivity' | 'Attendance' | 'Behavior';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: string;
}

export interface AttendanceData {
  teamAverage: number;
  topPerformers: EmployeePerformance[];
  bottomPerformers: EmployeePerformance[];
  anomalies: Anomaly[];
}

const now = new Date();

export const mockAttendanceData: AttendanceData = {
  teamAverage: 87.2,
  topPerformers: [
    {
      id: '1',
      name: 'Alex "Apex" Johnson',
      avatar: '/avatars/alex.png',
      role: 'Lead Quantum Engineer',
      metrics: { commits: 32, prs: 8, tasks: 15, features: 4 },
      score: 98,
      trend: 'up',
      anomalies: [],
    },
    {
      id: '2',
      name: 'Sarah "Synth" Lee',
      avatar: '/avatars/sarah.png',
      role: 'AI/ML Specialist',
      metrics: { commits: 28, prs: 7, tasks: 13, features: 3 },
      score: 94,
      trend: 'up',
      anomalies: [],
    },
    {
        id: '3',
        name: 'Ben "Binary" Carter',
        avatar: '/avatars/ben.png',
        role: 'Full-Stack Developer',
        metrics: { commits: 25, prs: 6, tasks: 12, features: 3 },
        score: 91,
        trend: 'stable',
        anomalies: [],
    },
  ],
  bottomPerformers: [
    {
      id: '4',
      name: 'Mike "Mismatch" Compliance',
      avatar: '/avatars/mike.png',
      role: 'Junior Backend Dev',
      metrics: { commits: 10, prs: 2, tasks: 5, features: 1 },
      score: 62,
      trend: 'down',
      anomalies: ['Missed daily standup', 'Low commit activity'],
    },
  ],
  anomalies: [
    {
      employeeId: '4',
      employeeName: 'Mike "Mismatch" Compliance',
      employeeAvatar: '/avatars/mike.png',
      type: 'Attendance',
      severity: 'high',
      description: 'Missed daily standup and has significantly lower commit activity this week.',
      timestamp: subDays(now, 1).toISOString(),
    },
    {
        employeeId: '5',
        employeeName: 'Victor "Vector" Vance',
        employeeAvatar: '/avatars/victor.png',
        type: 'Productivity',
        severity: 'medium',
        description: 'Pull request #234 has been open for 3 days without updates.',
        timestamp: subDays(now, 2).toISOString(),
    },
  ],
};
