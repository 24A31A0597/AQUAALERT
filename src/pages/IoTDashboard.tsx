import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { Droplets, Waves, Thermometer, Activity, Wifi, WifiOff } from 'lucide-react';

interface SensorData {
  distance?: number;
  turbidity?: number;
  temperature?: number;
  ph?: number;
  timestamp?: number;
}

const IoTDashboard = () => {
  const [sensorData, setSensorData] = useState<SensorData>({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    const sensorRef = ref(db, "sensorData");

    const unsubscribe = onValue(
      sensorRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setSensorData(data);
          setIsConnected(true);
          setLastUpdate(new Date().toLocaleTimeString());
        }
      },
      (error) => {
        console.error("Firebase error:", error);
        setIsConnected(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 🌊 Water Level Logic (Distance from sensor)
  const getWaterLevelStatus = (distance: number) => {
    if (distance < 8) return { text: 'Critical - Flood Risk', color: 'text-red-600 bg-red-100' };
    if (distance < 20) return { text: 'Warning - Rising Level', color: 'text-orange-600 bg-orange-100' };
    return { text: 'Normal', color: 'text-green-600 bg-green-100' };
  };

  // 💧 Turbidity Logic (Real NTU standards)
  const getTurbidityStatus = (value: number) => {
    if (value > 2500) return { text: 'Highly Polluted', color: 'text-red-600 bg-red-100' };
    if (value > 1500) return { text: 'Cloudy - Unsafe', color: 'text-orange-600 bg-orange-100' };
    return { text: 'Safe & Clear', color: 'text-green-600 bg-green-100' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Activity className="w-10 h-10 text-blue-600" />
            Aqua Alert - IoT Dashboard
          </h1>
          <p className="text-gray-600">Real-time water monitoring from ESP32</p>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mt-4 ${
            isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="font-medium">
              {isConnected ? `Connected • ${lastUpdate}` : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Sensor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Water Level */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-blue-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Waves className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Water Level</h3>
                <p className="text-sm text-gray-500">Ultrasonic Sensor</p>
              </div>
            </div>

            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {sensorData.distance !== undefined
                  ? sensorData.distance.toFixed(1)
                  : '--'}
                <span className="text-2xl ml-2">cm</span>
              </div>

              {sensorData.distance !== undefined && (
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  getWaterLevelStatus(sensorData.distance).color
                }`}>
                  {getWaterLevelStatus(sensorData.distance).text}
                </span>
              )}
            </div>
          </div>

          {/* Turbidity */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-teal-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-teal-100 rounded-xl">
                <Droplets className="w-8 h-8 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Turbidity</h3>
                <p className="text-sm text-gray-500">Water Clarity</p>
              </div>
            </div>

            <div className="text-center">
              <div className="text-5xl font-bold text-teal-600 mb-2">
                {sensorData.turbidity !== undefined
                  ? sensorData.turbidity.toFixed(1)
                  : '--'}
                <span className="text-2xl ml-2"> NTU</span>
              </div>

              {sensorData.turbidity !== undefined && (
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  getTurbidityStatus(sensorData.turbidity).color
                }`}>
                  {getTurbidityStatus(sensorData.turbidity).text}
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default IoTDashboard;