import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { AlertCircle, CheckCircle, Activity, Database, Server, Eye, BarChart3 } from 'lucide-react';
import axios from 'axios';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  port: number;
  uptime?: string;
  responseTime?: number;
}

const MonitoringDashboard: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const serviceConfigs: ServiceStatus[] = [
    { name: 'AI/ML Engine', status: 'unknown', port: 4055 },
    { name: 'AI Orchestrator', status: 'unknown', port: 4001 },
    { name: 'Neural Context Engine', status: 'unknown', port: 4005 },
    { name: 'Auth Service', status: 'unknown', port: 4004 },
    { name: 'Store Service', status: 'unknown', port: 4002 },
    { name: 'Quantum Microservice', status: 'unknown', port: 5000 },
    { name: 'Shield Service', status: 'unknown', port: 5001 },
    { name: 'PostgreSQL', status: 'unknown', port: 5432 },
    { name: 'Redis', status: 'unknown', port: 6379 },
    { name: 'Prometheus', status: 'unknown', port: 9090 },
    { name: 'Grafana', status: 'unknown', port: 3002 },
    { name: 'Elasticsearch', status: 'unknown', port: 9200 },
    { name: 'Kibana', status: 'unknown', port: 5601 },
  ];

  useEffect(() => {
    checkServiceHealth();
    const interval = setInterval(checkServiceHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkServiceHealth = async () => {
    setLoading(true);
    const updatedServices = await Promise.all(
      serviceConfigs.map(async (service) => {
        try {
          const startTime = Date.now();
          const response = await axios.get(`http://localhost:${service.port}/health`, {
            timeout: 5000
          });
          const responseTime = Date.now() - startTime;

          return {
            ...service,
            status: 'healthy' as const,
            responseTime,
            uptime: response.data?.uptime
          };
        } catch (error) {
          return {
            ...service,
            status: 'unhealthy' as const,
            responseTime: undefined,
            uptime: undefined
          };
        }
      })
    );
    setServices(updatedServices);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unhealthy':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'unhealthy':
        return <Badge variant="destructive">Unhealthy</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const openGrafana = () => {
    window.open('http://localhost:3002', '_blank');
  };

  const openKibana = () => {
    window.open('http://localhost:5601', '_blank');
  };

  const openPrometheus = () => {
    window.open('http://localhost:9090', '_blank');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monitoring Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time health monitoring of Azora OS services</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={openGrafana} variant="outline" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Grafana</span>
          </Button>
          <Button onClick={openKibana} variant="outline" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Kibana</span>
          </Button>
          <Button onClick={openPrometheus} variant="outline" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Prometheus</span>
          </Button>
        </div>
      </div>

      {/* Service Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>Service Health Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading service status...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-gray-500">Port: {service.port}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(service.status)}
                    {service.responseTime && (
                      <p className="text-xs text-gray-500 mt-1">{service.responseTime}ms</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monitoring Infrastructure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Databases</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>PostgreSQL</span>
                {getStatusBadge(services.find(s => s.name === 'PostgreSQL')?.status || 'unknown')}
              </div>
              <div className="flex justify-between items-center">
                <span>Redis</span>
                {getStatusBadge(services.find(s => s.name === 'Redis')?.status || 'unknown')}
              </div>
              <div className="flex justify-between items-center">
                <span>Elasticsearch</span>
                {getStatusBadge(services.find(s => s.name === 'Elasticsearch')?.status || 'unknown')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Monitoring Stack</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Prometheus</span>
                {getStatusBadge(services.find(s => s.name === 'Prometheus')?.status || 'unknown')}
              </div>
              <div className="flex justify-between items-center">
                <span>Grafana</span>
                {getStatusBadge(services.find(s => s.name === 'Grafana')?.status || 'unknown')}
              </div>
              <div className="flex justify-between items-center">
                <span>Kibana</span>
                {getStatusBadge(services.find(s => s.name === 'Kibana')?.status || 'unknown')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={checkServiceHealth} variant="outline">
              Refresh Status
            </Button>
            <Button onClick={() => window.open('/logs', '_blank')} variant="outline">
              View Application Logs
            </Button>
            <Button onClick={() => window.open('/metrics', '_blank')} variant="outline">
              View Metrics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonitoringDashboard;