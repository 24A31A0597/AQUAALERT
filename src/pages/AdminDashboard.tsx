import { useState, useEffect } from "react";
// @ts-ignore - firebase.js is a JS module
import { ref, set, onValue, push, update } from "firebase/database";
// @ts-ignore - firebase.js is a JS module
import { db } from "../firebase";

const AdminDashboard = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("low");
  const [status, setStatus] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationName, setLocationName] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          setLocationName(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
          setStatus("Location captured");
          setGettingLocation(false);
        },
        () => {
          setStatus("Unable to get location");
          setGettingLocation(false);
        }
      );
    } else {
      setStatus("Geolocation not supported");
      setGettingLocation(false);
    }
  };

  // Listen to alerts list
  useEffect(() => {
    const alertsRef = ref(db, "alerts/official");
    const unsubscribe = onValue(alertsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.entries(data).map(([id, value]: any) => ({ id, ...value }));
        // Sort newest first
        list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setAlerts(list);
      } else {
        setAlerts([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    setStatus(null);
    try {
      const alertsRef = ref(db, "alerts/official");
      const locationData = (latitude && longitude) 
        ? { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
        : null;
      
      await push(alertsRef, {
        title: title.trim() || "Untitled Alert",
        message: message.trim() || "",
        severity,
        timestamp: Date.now(),
        status: "active",
        source: "admin",
        verified: true,
        location: locationData,
        locationName: locationName.trim() || null
      });
      setStatus("Alert sent successfully");
      setTitle("");
      setMessage("");
      setSeverity("low");
      setLatitude("");
      setLongitude("");
      setLocationName("");
    } catch (err) {
      setStatus("Failed to send alert");
      console.error("Error sending alert", err);
    }
  };

  const handleResolve = async (id: string) => {
    setStatus(null);
    try {
      await update(ref(db, `alerts/official/${id}`), { status: "resolved" });
      setStatus("Alert resolved");
    } catch (err) {
      setStatus("Failed to resolve alert");
      console.error("Error resolving alert", err);
    }
  };

  return (
    <div className="bg-gray-100 p-6 mt-16">
      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Aqua Alert – Admin Dashboard
      </h1>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[ 
          { label: "Active Alerts", value: 1, color: "bg-red-100 text-red-600" },
          { label: "IoT Devices", value: "Online", color: "bg-green-100 text-green-600" },
          { label: "Hazard Reports", value: 5, color: "bg-yellow-100 text-yellow-600" },
          { label: "Users", value: 128, color: "bg-blue-100 text-blue-600" },
        ].map((item) => (
          <div key={item.label} className={`p-4 rounded ${item.color}`}>
            <p className="text-sm">{item.label}</p>
            <p className="text-2xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      {/* ALERT CONTROL PANEL */}
      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">🚨 Alert Control Panel</h2>

        <input
          className="w-full border p-3 rounded mb-3"
          placeholder="Alert Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border p-3 rounded mb-3"
          placeholder="Alert Message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <select
          className="w-full border p-3 rounded mb-3"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option value="critical">Critical Severity</option>
          <option value="high">High Severity</option>
          <option value="medium">Medium Severity</option>
          <option value="low">Low Severity</option>
        </select>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <div className="space-y-2">
            <input
              className="w-full border p-3 rounded"
              placeholder="Location name or address"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="border p-3 rounded"
                placeholder="Latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                type="number"
                step="0.0001"
              />
              <input
                className="border p-3 rounded"
                placeholder="Longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                type="number"
                step="0.0001"
              />
            </div>
            <button
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {gettingLocation ? "Getting Location..." : "📍 Use Current Location"}
            </button>
          </div>
        </div>

        <button
          onClick={handleSend}
          className="bg-red-600 text-white px-6 py-3 rounded"
        >
          Send Alert
        </button>

        {status && (
          <p className="mt-3 text-sm text-gray-700">{status}</p>
        )}
      </div>

      {/* ALERT LIST */}
      {alerts.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded shadow mb-8 space-y-6">
          <h2 className="text-xl font-semibold text-blue-900">📢 Alerts</h2>

          {/* Active Alerts */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Active Alerts</h3>
            {alerts.filter(a => a.status === "active").length === 0 && (
              <p className="text-sm text-gray-600">No active alerts.</p>
            )}
            {alerts
              .filter((alert) => alert.status === "active")
              .map((alert) => (
                <div key={alert.id} className="bg-white p-4 rounded shadow flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">{alert.title}</p>
                    {alert.message && <p className="text-sm text-gray-700">{alert.message}</p>}
                    <p className="text-sm text-gray-600">Severity: {alert.severity}</p>
                    <p className="text-sm">Status: <span className="text-green-600 font-bold">{alert.status}</span></p>
                  </div>
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="mt-3 md:mt-0 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    ✓ Resolve Alert
                  </button>
                </div>
              ))}
          </div>

          {/* Resolved Alerts (last 3) */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Recent Resolved Alerts (last 3)</h3>
            {alerts.filter(a => a.status === "resolved").length === 0 && (
              <p className="text-sm text-gray-600">No resolved alerts yet.</p>
            )}
            {alerts
              .filter((alert) => alert.status === "resolved")
              .slice(0, 3)
              .map((alert) => (
                <div key={alert.id} className="bg-white p-4 rounded shadow">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">{alert.title}</p>
                    {alert.message && <p className="text-sm text-gray-700">{alert.message}</p>}
                    <p className="text-sm text-gray-600">Severity: {alert.severity}</p>
                    <p className="text-sm"><span className="text-gray-600 font-bold">resolved</span></p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* LOWER PANELS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* IOT */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-2">🌊 IoT Monitoring</h3>
          <p>Water Level: 2.3 m</p>
          <p>pH: 7.2</p>
          <p>Turbidity: Normal</p>
          <p>Temperature: 26°C</p>
        </div>

        {/* REPORTS */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-2">📍 User Hazard Reports</h3>
          <p>• Flood near river bank</p>
          <p>• Water contamination complaint</p>
          <p>• Drain overflow</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;