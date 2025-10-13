import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, Truck, MapPin, Users, Target, BarChart3 } from 'lucide-react';
import axios from 'axios';

interface Vehicle {
  id: string;
  location: { lat: number; lng: number };
  status: 'active' | 'inactive' | 'maintenance';
  capacity: number;
  fuel_level: number;
  distance_to_next_pickup: number;
  driver: string;
  model: string;
}

interface ClusteringResult {
  clusters: Array<{
    vehicle_id: string;
    cluster_id: number;
    centroid_distance: number;
  }>;
  centroids: number[][];
  k: number;
  total_vehicles: number;
  cluster_stats: Array<{
    cluster_id: number;
    vehicle_count: number;
    avg_distance: number;
    status_distribution: { [key: string]: number };
  }>;
}

const FleetClustering: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clusteringResult, setClusteringResult] = useState<ClusteringResult | null>(null);
  const [isClustering, setIsClustering] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);

  // Generate mock fleet data
  useEffect(() => {
    const mockVehicles: Vehicle[] = Array.from({ length: 25 }, (_, i) => ({
      id: `VH-${String(i + 1).padStart(3, '0')}`,
      location: {
        lat: -33.9249 + (Math.random() - 0.5) * 0.2,
        lng: 18.4241 + (Math.random() - 0.5) * 0.2
      },
      status: Math.random() > 0.8 ? 'maintenance' : Math.random() > 0.6 ? 'inactive' : 'active',
      capacity: Math.floor(Math.random() * 20) + 5,
      fuel_level: Math.floor(Math.random() * 100),
      distance_to_next_pickup: Math.floor(Math.random() * 50),
      driver: `Driver ${i + 1}`,
      model: ['Azora Prime', 'Azora Lite', 'Azora Pro'][Math.floor(Math.random() * 3)]
    }));
    setVehicles(mockVehicles);
  }, []);

  const performClustering = async () => {
    setIsClustering(true);
    try {
      const response = await axios.post('/api/ai-ml/fleet/cluster', { vehicles });
      const result = response.data;

      // Calculate cluster statistics
      const clusterStats = result.clusters.reduce((acc: any, item: any) => {
        if (!acc[item.cluster_id]) {
          acc[item.cluster_id] = {
            cluster_id: item.cluster_id,
            vehicle_count: 0,
            total_distance: 0,
            vehicles: []
          };
        }
        acc[item.cluster_id].vehicle_count++;
        acc[item.cluster_id].total_distance += item.centroid_distance;
        acc[item.cluster_id].vehicles.push(item.vehicle_id);
        return acc;
      }, {});

      // Convert to array and calculate averages
      const statsArray = Object.values(clusterStats).map((stat: any) => ({
        ...stat,
        avg_distance: stat.total_distance / stat.vehicle_count,
        status_distribution: stat.vehicles.reduce((dist: any, vehicleId: string) => {
          const vehicle = vehicles.find(v => v.id === vehicleId);
          const status = vehicle?.status || 'unknown';
          dist[status] = (dist[status] || 0) + 1;
          return dist;
        }, {})
      }));

      setClusteringResult({
        ...result,
        cluster_stats: statsArray
      });
    } catch (error) {
      console.error('Clustering failed:', error);
    } finally {
      setIsClustering(false);
    }
  };

  const getClusterColor = (clusterId: number) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500',
      'bg-indigo-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'
    ];
    return colors[clusterId % colors.length];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-yellow-400';
      case 'maintenance': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Network className="w-10 h-10 text-indigo-400" />
            AI Fleet Clustering
          </h1>
          <p className="text-gray-300 text-lg">
            Intelligent fleet grouping and optimization using machine learning
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Fleet Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <Truck className="w-6 h-6 text-blue-400" />
              Fleet Overview
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <div className="text-gray-300 text-sm">Total Vehicles</div>
                  <div className="text-white text-2xl font-bold">{vehicles.length}</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <div className="text-gray-300 text-sm">Active</div>
                  <div className="text-green-400 text-2xl font-bold">
                    {vehicles.filter(v => v.status === 'active').length}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-300">Status Distribution</h3>
                {['active', 'inactive', 'maintenance'].map(status => (
                  <div key={status} className="flex justify-between text-sm">
                    <span className={`capitalize ${getStatusColor(status)}`}>
                      {status}
                    </span>
                    <span className="text-white">
                      {vehicles.filter(v => v.status === status).length}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={performClustering}
                disabled={isClustering}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Network className="w-5 h-5" />
                {isClustering ? 'Clustering...' : 'Perform Clustering'}
              </button>
            </div>
          </motion.div>

          {/* Clustering Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-green-400" />
              Clustering Results
            </h2>

            {clusteringResult ? (
              <div className="space-y-6">
                {/* Cluster Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <div className="text-gray-300 text-sm">Clusters Found</div>
                    <div className="text-white text-3xl font-bold">{clusteringResult.k}</div>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <div className="text-gray-300 text-sm">Total Vehicles</div>
                    <div className="text-white text-3xl font-bold">{clusteringResult.total_vehicles}</div>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <div className="text-gray-300 text-sm">Avg per Cluster</div>
                    <div className="text-white text-3xl font-bold">
                      {Math.round(clusteringResult.total_vehicles / clusteringResult.k)}
                    </div>
                  </div>
                </div>

                {/* Cluster Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Cluster Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clusteringResult.cluster_stats.map((stat: any) => (
                      <motion.div
                        key={stat.cluster_id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          selectedCluster === stat.cluster_id
                            ? 'border-white bg-white/10'
                            : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500/50'
                        }`}
                        onClick={() => setSelectedCluster(
                          selectedCluster === stat.cluster_id ? null : stat.cluster_id
                        )}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-4 h-4 rounded-full ${getClusterColor(stat.cluster_id)}`}></div>
                          <span className="text-white font-semibold">Cluster {stat.cluster_id}</span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Vehicles:</span>
                            <span className="text-white font-bold">{stat.vehicle_count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Avg Distance:</span>
                            <span className="text-white">{stat.avg_distance.toFixed(2)} km</span>
                          </div>
                          <div className="text-gray-300 text-xs">Status Distribution:</div>
                          <div className="flex gap-2 text-xs">
                            {Object.entries(stat.status_distribution).map(([status, count]) => (
                              <span key={status} className={`${getStatusColor(status)}`}>
                                {status}: {count as number}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Selected Cluster Details */}
                {selectedCluster !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50"
                  >
                    <h4 className="text-lg font-semibold text-white mb-3">
                      Cluster {selectedCluster} Vehicles
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {clusteringResult.clusters
                        .filter(c => c.cluster_id === selectedCluster)
                        .map(cluster => {
                          const vehicle = vehicles.find(v => v.id === cluster.vehicle_id);
                          return (
                            <div key={cluster.vehicle_id} className="bg-gray-600/30 rounded-lg p-3">
                              <div className="text-white font-medium text-sm">{cluster.vehicle_id}</div>
                              <div className="text-gray-300 text-xs">{vehicle?.model}</div>
                              <div className={`text-xs ${getStatusColor(vehicle?.status || 'unknown')}`}>
                                {vehicle?.status}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Network className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Clustering Performed</h3>
                <p className="text-gray-500">
                  Click "Perform Clustering" to group vehicles using AI algorithms.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Optimization Insights */}
        {clusteringResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-teal-400" />
              Fleet Optimization Insights
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-700/30 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-2">Route Efficiency</h3>
                <p className="text-gray-300 text-sm">
                  Clustering enables {Math.round((1 - clusteringResult.k / clusteringResult.total_vehicles) * 100)}%
                  more efficient route planning by grouping nearby vehicles.
                </p>
              </div>

              <div className="bg-gray-700/30 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-2">Maintenance Planning</h3>
                <p className="text-gray-300 text-sm">
                  {clusteringResult.cluster_stats.filter((s: any) => s.status_distribution.maintenance > 0).length} clusters
                  contain vehicles needing maintenance, enabling coordinated service scheduling.
                </p>
              </div>

              <div className="bg-gray-700/30 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-2">Resource Allocation</h3>
                <p className="text-gray-300 text-sm">
                  Optimal cluster sizes (avg {Math.round(clusteringResult.total_vehicles / clusteringResult.k)} vehicles)
                  allow for efficient driver and fuel resource distribution.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
        >
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <Network className="w-6 h-6 text-pink-400" />
            Clustering AI Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-700/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-white font-medium">K-Means Algorithm</span>
              </div>
              <p className="text-gray-300 text-sm">Unsupervised clustering active</p>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-white font-medium">Adaptive K Selection</span>
              </div>
              <p className="text-gray-300 text-sm">Dynamic cluster count optimization</p>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span className="text-white font-medium">Multi-dimensional</span>
              </div>
              <p className="text-gray-300 text-sm">Location, status, and capacity analysis</p>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
                <span className="text-white font-medium">Real-time Updates</span>
              </div>
              <p className="text-gray-300 text-sm">Continuous fleet optimization</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FleetClustering;