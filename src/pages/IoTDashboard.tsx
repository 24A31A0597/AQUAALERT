import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  Zap, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SensorData {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  lastUpdate: string;
  status: 'online' | 'offline' | 'warning';
  parameters: {
    ph: { value: number; threshold: [number, number]; unit: 'pH' };
    temperature: { value: number; threshold: [number, number]; unit: '°C' };
    conductivity: { value: number; threshold: [number, number]; unit: 'µS/cm' };
    salinity: { value: number; threshold: [number, number]; unit: 'ppt' };
    turbidity: { value: number; threshold: [number, number]; unit: 'NTU' };
    dissolvedOxygen: { value: number; threshold: [number, number]; unit: 'mg/L' };
    waterLevel: { value: number; threshold: [number, number]; unit: 'm' };
    orp: { value: number; threshold: [number, number]; unit: 'mV' };
  };
}

const IoTDashboard = () => {
  const { t } = useTranslation();
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock sensor data
  const generateMockData = (): SensorData[] => {
    const locations = [
      { name: 'Central Reservoir', location: 'Downtown District', coordinates: [40.7128, -74.0060] as [number, number] },
      { name: 'North Treatment Plant', location: 'Industrial Zone', coordinates: [40.7589, -73.9851] as [number, number] },
      { name: 'East River Monitor', location: 'Riverside Park', coordinates: [40.7282, -73.7949] as [number, number] },
      { name: 'South Bay Station', location: 'Harbor Area', coordinates: [40.6892, -74.0445] as [number, number] },
      { name: 'West Lake Sensor', location: 'Recreation Area', coordinates: [40.7505, -73.9934] as [number, number] },
      { name: 'Main Distribution Hub', location: 'City Center', coordinates: [40.7614, -73.9776] as [number, number] },
      { name: 'Emergency Backup Site', location: 'Suburban Zone', coordinates: [40.6782, -73.9442] as [number, number] },
      { name: 'Coastal Monitor Alpha', location: 'Beachfront', coordinates: [40.7831, -73.9712] as [number, number] },
      { name: 'Mountain Spring Source', location: 'Highland Area', coordinates: [40.8176, -73.9482] as [number, number] },
      { name: 'Valley Stream Point', location: 'Agricultural District', coordinates: [40.6643, -73.7085] as [number, number] }
    ];

    return locations.map((loc, index) => ({
      id: `sensor-${index + 1}`,
      name: loc.name,
      location: loc.location,
      coordinates: loc.coordinates,
      lastUpdate: new Date(Date.now() - Math.random() * 300000).toISOString(),
      status: Math.random() > 0.1 ? (Math.random() > 0.8 ? 'warning' : 'online') : 'offline',
      parameters: {
        ph: { 
          value: 6.5 + Math.random() * 2, 
          threshold: [6.5, 8.5], 
          unit: 'pH' 
        },
        temperature: { 
          value: 15 + Math.random() * 15, 
          threshold: [10, 25], 
          unit: '°C' 
        },
        conductivity: { 
          value: 200 + Math.random() * 800, 
          threshold: [100, 1000], 
          unit: 'µS/cm' 
        },
        salinity: { 
          value: Math.random() * 35, 
          threshold: [0, 30], 
          unit: 'ppt' 
        },
        turbidity: { 
          value: Math.random() * 10, 
          threshold: [0, 5], 
          unit: 'NTU' 
        },
        dissolvedOxygen: { 
          value: 5 + Math.random() * 10, 
          threshold: [6, 14], 
          unit: 'mg/L' 
        },
        waterLevel: { 
          value: 1 + Math.random() * 4, 
          threshold: [0.5, 4], 
          unit: 'm' 
        },
        orp: { 
          value: 200 + Math.random() * 400, 
          threshold: [200, 500], 
          unit: 'mV' 
        }
      }
    }));
  };

  useEffect(() => {
    setSensors(generateMockData());
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setSensors(generateMockData());
        setLastUpdate(new Date());
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const isOutOfThreshold = (value: number, threshold: [number, number]) => {
    return value < threshold[0] || value > threshold[1];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (value: number, threshold: [number, number]) => {
    if (value < threshold[0]) return TrendingDown;
    if (value > threshold[1]) return TrendingUp;
    return Minus;
  };

  const getParameterIcon = (param: string) => {
    switch (param) {
      case 'temperature': return Thermometer;
      case 'ph': return Droplets;
      case 'conductivity': return Zap;
      case 'dissolvedOxygen': return Activity;
      default: return Activity;
    }
  };

  // Generate mock historical data for charts
  const generateHistoricalData = (currentValue: number) => {
    const data = [];
    for (let i = 23; i >= 0; i--) {
      data.push({
        time: `${i}h ago`,
        value: currentValue + (Math.random() - 0.5) * 2
      });
    }
    return data;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('iotDashboard.title')}</h1>
              <p className="text-lg text-gray-600">
                {t('iotDashboard.subtitle')}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {t('iotDashboard.lastUpdate')} {lastUpdate.toLocaleTimeString()}
              </div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                <span>{t('iotDashboard.autoRefresh')}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { 
              label: t('iotDashboard.stats.onlineSensors'), 
              value: sensors.filter(s => s.status === 'online').length,
              total: sensors.length,
              color: 'text-green-600',
              bgColor: 'bg-green-100'
            },
            { 
              label: t('iotDashboard.stats.warningAlerts'), 
              value: sensors.filter(s => s.status === 'warning').length,
              total: sensors.length,
              color: 'text-yellow-600',
              bgColor: 'bg-yellow-100'
            },
            { 
              label: t('iotDashboard.stats.offlineSensors'), 
              value: sensors.filter(s => s.status === 'offline').length,
              total: sensors.length,
              color: 'text-red-600',
              bgColor: 'bg-red-100'
            },
            { 
              label: t('iotDashboard.stats.criticalAlerts'), 
              value: sensors.reduce((count, sensor) => {
                return count + Object.values(sensor.parameters).filter(param => 
                  isOutOfThreshold(param.value, param.threshold)
                ).length;
              }, 0),
              total: sensors.length * 8,
              color: 'text-red-600',
              bgColor: 'bg-red-100'
            }
          ].map((stat, index) => (
            <div key={stat.label} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                    <span className="text-sm text-gray-500">/{stat.total}</span>
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Activity className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Sensor Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {sensors.map((sensor) => (
            <div key={sensor.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Sensor Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{sensor.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sensor.status)}`}>
                    {t(`iotDashboard.status.${sensor.status}`).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {sensor.location}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {t('iotDashboard.labels.lastUpdate')}: {new Date(sensor.lastUpdate).toLocaleTimeString()}
                </div>
              </div>

              {/* Parameters Grid */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(sensor.parameters).map(([key, param]) => {
                    const isAlert = isOutOfThreshold(param.value, param.threshold);
                    const Icon = getParameterIcon(key);
                    const TrendIcon = getTrendIcon(param.value, param.threshold);

                    return (
                      <div 
                        key={key}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          isAlert 
                            ? 'border-red-200 bg-red-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-1">
                            <Icon className={`h-4 w-4 ${isAlert ? 'text-red-600' : 'text-gray-600'}`} />
                            {isAlert && <AlertTriangle className="h-3 w-3 text-red-600" />}
                          </div>
                          <TrendIcon className={`h-3 w-3 ${isAlert ? 'text-red-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="text-xs font-medium text-gray-600 capitalize mb-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className={`text-lg font-bold ${isAlert ? 'text-red-600' : 'text-gray-900'}`}>
                          {param.value.toFixed(1)}
                          <span className="text-xs font-normal ml-1">{param.unit}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Range: {param.threshold[0]}-{param.threshold[1]} {param.unit}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => setSelectedSensor(selectedSensor === sensor.id ? null : sensor.id)}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  {selectedSensor === sensor.id ? 'Hide Details' : 'View Historical Data'}
                </button>

                {/* Historical Chart */}
                {selectedSensor === sensor.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Temperature Trend (24h)</h4>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={generateHistoricalData(sensor.parameters.temperature.value)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default IoTDashboard;