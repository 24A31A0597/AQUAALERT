import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

interface SensorData {
  distance?: number;
  turbidity?: number;
}

interface DerivedData {
  temperature: number;
  doLevel: number;
  ammonia: number;
  nitrite: number;
  ph: number;
  alkalinity: number;
  hardness: number;
}

const IoTDashboard = () => {
  const [sensorData, setSensorData] = useState<SensorData>({});
  const [derivedData, setDerivedData] = useState<DerivedData | null>(null);
  const [pondStatus, setPondStatus] = useState<string>("Healthy");

  const calculateValues = (turbidity: number) => {
    const temperature = 27 + Math.random() * 3;
    const doLevel = Math.max(3, 8 - turbidity * 0.002);
    const ammonia = turbidity * 0.0005;
    const nitrite = turbidity * 0.0003;
    const ph = 7.5 + Math.random() * 0.5;
    const alkalinity = 120 + turbidity * 0.02;
    const hardness = 150 + turbidity * 0.03;

    let score = 0;
    if (doLevel < 4) score += 2;
    if (ammonia > 0.5) score += 2;
    if (nitrite > 0.3) score += 1;
    if (ph < 7.5 || ph > 8.5) score += 1;

    let status = "Healthy";
    if (score >= 4) status = "Critical";
    else if (score >= 2) status = "Moderate Risk";

    setDerivedData({
      temperature,
      doLevel,
      ammonia,
      nitrite,
      ph,
      alkalinity,
      hardness
    });

    setPondStatus(status);
  };

  useEffect(() => {
    const sensorRef = ref(db, "sensorData");

    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData(data);
        calculateValues(data.turbidity ?? 0);
      }
    });

    return () => unsubscribe();
  }, []);

  const statusColor =
    pondStatus === "Healthy"
      ? "bg-green-100 text-green-700"
      : pondStatus === "Moderate Risk"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-cyan-100">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-800">
        🌊 Farmer Aqua Intelligence Panel
      </h1>

      <div className={`text-center p-4 rounded-xl text-xl font-bold mb-6 ${statusColor}`}>
        Pond Health Status: {pondStatus}
      </div>

      <div className="grid md:grid-cols-3 gap-6">

        <Card title="Water Level" value={`${sensorData.distance?.toFixed(1) ?? "--"} cm`} />

        <Card title="Turbidity" value={`${sensorData.turbidity ?? "--"} NTU`} />

        <Card title="Temperature" value={`${derivedData?.temperature.toFixed(1) ?? "--"} °C`} />

        <Card title="Dissolved Oxygen" value={`${derivedData?.doLevel.toFixed(2) ?? "--"} mg/L`} />

        <Card title="Ammonia" value={`${derivedData?.ammonia.toFixed(2) ?? "--"} ppm`} />

        <Card title="Nitrite" value={`${derivedData?.nitrite.toFixed(2) ?? "--"} ppm`} />

        <Card title="pH Level" value={`${derivedData?.ph.toFixed(2) ?? "--"}`} />

        <Card title="Alkalinity" value={`${derivedData?.alkalinity.toFixed(1) ?? "--"} ppm`} />

        <Card title="Hardness" value={`${derivedData?.hardness.toFixed(1) ?? "--"} ppm`} />

      </div>

      <div className="text-center mt-8">
        <button
          onClick={() => calculateValues(sensorData.turbidity ?? 0)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg transition"
        >
          🔄 Recalculate Pond Health
        </button>
      </div>
    </div>
  );
};

const Card = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition">
    <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
    <p className="text-2xl font-bold text-blue-600">{value}</p>
  </div>
);

export default IoTDashboard;