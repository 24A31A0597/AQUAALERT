import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { SuperClustering } from 'react-leaflet-supercluster';
import 'react-leaflet-supercluster/src/styles.css';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Filter,
  AlertTriangle,
  Droplets,
  Thermometer,
  Zap,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle,
  Clock
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// @ts-ignore - firebase.js is a JS module
import { ref, onValue } from 'firebase/database';
// @ts-ignore - firebase.js is a JS module
import { db } from '../firebase';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface HazardReport {
  id: string;
  type: 'contamination' | 'flooding' | 'chemical' | 'temperature' | 'warning' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: [number, number];
  title: string;
  description: string;
  reportedBy: string;
  reportedAt: string;
  status: 'active' | 'investigating' | 'resolved';
  verified: boolean;
}

const HazardMap: React.FC = () => {
  const { t } = useTranslation();
  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [filteredHazards, setFilteredHazards] = useState<HazardReport[]>([]);
  const [filters, setFilters] = useState<{ type: string; severity: string; status: string; dateRange: string; }>({
    type: 'all',
    severity: 'all',
    status: 'all',
    dateRange: '30'
  });
  const [showFilters, setShowFilters] = useState<boolean>(true);

  useEffect(() => {
    const hazardsRef = ref(db, 'hazards/reports');
    const alertsRef = ref(db, 'alerts/official');

    let hazardsList: HazardReport[] = [];
    let alertsList: HazardReport[] = [];
    let hazardsLoaded = false;
    let alertsLoaded = false;

    const updateMap = () => {
      if (hazardsLoaded && alertsLoaded) {
        const combined = [...hazardsList, ...alertsList];
        console.log(`✅ Loaded ${combined.length} total hazards (${hazardsList.length} reports + ${alertsList.length} alerts)`);
        console.table(combined.map(h => ({ id: h.id, title: h.title, severity: h.severity, location: h.location, verified: h.verified })));
        setHazards(combined);
        setFilteredHazards(combined);
      }
    };

    // Fetch user hazard reports
    const unsubscribeHazards = onValue(hazardsRef, (snapshot) => {
      const data = snapshot.val();
      console.log('📥 Raw hazard data from Firebase:', data);
      if (data) {
        hazardsList = Object.entries(data)
          .map(([id, hazard]: [string, any]) => {
            console.log(`🔍 Processing hazard ${id}:`, hazard);
            let lat: number | undefined;
            let lng: number | undefined;

            const loc = hazard.location;
            console.log(`  Location field:`, loc);
            if (Array.isArray(loc) && loc.length === 2) {
              // Assume [lat, lng]
              lat = Number(loc[0]);
              lng = Number(loc[1]);
            } else if (loc && typeof loc === 'object') {
              if (loc.lat !== undefined && loc.lng !== undefined) {
                lat = Number(loc.lat);
                lng = Number(loc.lng);
              } else if (loc.latitude !== undefined && loc.longitude !== undefined) {
                lat = Number(loc.latitude);
                lng = Number(loc.longitude);
              }
            } else if (typeof loc === 'string') {
              const parts = loc.split(',').map((p: string) => Number(p.trim()));
              if (parts.length === 2) {
                lat = parts[0];
                lng = parts[1];
              }
            }

            // Fallback to coordinates field if present
            if ((lat === undefined || lng === undefined) && hazard.coordinates) {
              if (hazard.coordinates.lat !== undefined && hazard.coordinates.lng !== undefined) {
                lat = Number(hazard.coordinates.lat);
                lng = Number(hazard.coordinates.lng);
              }
            }

            // Swap if obviously wrong OR looks like [lng,lat] in India bounds
            if (lat !== undefined && lng !== undefined) {
              const inLatRange = lat >= -90 && lat <= 90;
              const inLngRange = lng >= -180 && lng <= 180;
              const swappedInLatRange = lng >= -90 && lng <= 90;
              const swappedInLngRange = lat >= -180 && lat <= 180;
              // India-specific heuristic: lat in 68..97 and lng in 6..35 suggests swapped [lng,lat]
              const indiaLatBand = 6 <= lng && lng <= 35;
              const indiaLngBand = 68 <= lat && lat <= 97;
              const likelyIndiaSwap = indiaLngBand && indiaLatBand;
              if (((!inLatRange || !inLngRange) || likelyIndiaSwap) && swappedInLatRange && swappedInLngRange) {
                const temp = lat; lat = lng; lng = temp;
              }
            }

            const location: [number, number] = (
              lat !== undefined && lng !== undefined
                ? [lat, lng]
                : [20.5937, 78.9629]
            );

            console.log(`  Final location [${id}]:`, location);

            return {
              id: `hazard-${id}`,
              type: hazard.hazardType || 'other',
              severity: hazard.severity || 'low',
              location,
              title: hazard.title || 'Untitled Report',
              description: hazard.description || '',
              reportedBy: hazard.reporterName || hazard.submittedBy || hazard.userName || 'Anonymous',
              reportedAt: hazard.timestamp || new Date().toISOString(),
              status: hazard.status || 'active',
              verified: hazard.verified || false
            } as HazardReport;
          })
          .filter(hazard => {
            const isValid = (
              hazard.location &&
              hazard.location[0] !== undefined &&
              hazard.location[1] !== undefined &&
              !isNaN(hazard.location[0]) &&
              !isNaN(hazard.location[1])
            );
            if (!isValid) {
              console.log('❌ Filtered out hazard:', hazard.id, hazard.title, 'location:', hazard.location);
            } else {
              console.log('✅ Passed filter:', hazard.id, hazard.title, 'location:', hazard.location);
            }
            return isValid;
          });
        console.log(`✅ Loaded ${hazardsList.length} valid hazard reports`);
      } else {
        hazardsList = [];
      }
      hazardsLoaded = true;
      updateMap();
    });

    // Fetch official admin alerts
    const unsubscribeAlerts = onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      console.log('📥 Raw alert data from Firebase:', data);
      if (data) {
        alertsList = Object.entries(data)
          .map(([id, alert]: [string, any]) => {
            let lat: number | undefined;
            let lng: number | undefined;
            const loc = alert.location;
            if (Array.isArray(loc) && loc.length === 2) {
              lat = Number(loc[0]);
              lng = Number(loc[1]);
            } else if (loc && typeof loc === 'object') {
              if (loc.lat !== undefined && loc.lng !== undefined) {
                lat = Number(loc.lat);
                lng = Number(loc.lng);
              } else if (loc.latitude !== undefined && loc.longitude !== undefined) {
                lat = Number(loc.latitude);
                lng = Number(loc.longitude);
              }
            } else if (typeof loc === 'string') {
              const parts = loc.split(',').map((p: string) => Number(p.trim()));
              if (parts.length === 2) {
                lat = parts[0];
                lng = parts[1];
              }
            }
            if (lat !== undefined && lng !== undefined) {
              const inLatRange = lat >= -90 && lat <= 90;
              const inLngRange = lng >= -180 && lng <= 180;
              const swappedInLatRange = lng >= -90 && lng <= 90;
              const swappedInLngRange = lat >= -180 && lat <= 180;
              const indiaLatBand = 6 <= lng && lng <= 35;
              const indiaLngBand = 68 <= lat && lat <= 97;
              const likelyIndiaSwap = indiaLngBand && indiaLatBand;
              if (((!inLatRange || !inLngRange) || likelyIndiaSwap) && swappedInLatRange && swappedInLngRange) {
                const temp = lat; lat = lng; lng = temp;
              }
            }
            const location: [number, number] = (
              lat !== undefined && lng !== undefined ? [lat, lng] : [20.5937, 78.9629]
            );
            return {
              id: `alert-${id}`,
              type: 'warning',
              severity: alert.severity || 'high',
              location,
              title: alert.title || 'Official Alert',
              description: alert.message || '',
              reportedBy: 'Admin',
              reportedAt: alert.timestamp || new Date().toISOString(),
              status: alert.status || 'active',
              verified: true
            } as HazardReport;
          })
          .filter(alert => (
            alert.location &&
            alert.location[0] !== undefined &&
            alert.location[1] !== undefined &&
            !isNaN(alert.location[0]) &&
            !isNaN(alert.location[1]) &&
            alert.location[0] !== 0 &&
            alert.location[1] !== 0
          ));
      } else {
        alertsList = [];
      }
      alertsLoaded = true;
      updateMap();
    });

    return () => {
      unsubscribeHazards();
      unsubscribeAlerts();
    };
  }, []);

  // Filter hazards based on selected filters
  useEffect(() => {
    let filtered = hazards;

    if (filters.type !== 'all') {
      filtered = filtered.filter(hazard => hazard.type === filters.type);
    }
    if (filters.severity !== 'all') {
      filtered = filtered.filter(hazard => hazard.severity === filters.severity);
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter(hazard => hazard.status === filters.status);
    }

    console.log(`🔍 Filtered ${filtered.length} hazards from ${hazards.length} total`);
    setFilteredHazards(filtered);
  }, [filters, hazards]);

  // Offset overlapping markers slightly so multiple reports at the same coordinates remain visible
  const adjustedHazards = useMemo(() => {
    console.log(`📍 Adjusting ${filteredHazards.length} filtered hazards for display`);
    const groups = new Map<string, HazardReport[]>();
    const keyOf = (loc: [number, number]) => `${loc[0].toFixed(6)},${loc[1].toFixed(6)}`;
    for (const h of filteredHazards) {
      const key = keyOf(h.location);
      const arr = groups.get(key) || [];
      arr.push(h);
      groups.set(key, arr);
    }

    const result: HazardReport[] = [];
    const radiusDeg = 0.0005; // ~55m; small visual offset
    groups.forEach((list) => {
      if (list.length === 1) {
        result.push(list[0]);
      } else {
        const base = list[0].location;
        const n = list.length;
        list.forEach((h, i) => {
          const angle = (2 * Math.PI * i) / n;
          const latOff = radiusDeg * Math.sin(angle);
          const lngOff = radiusDeg * Math.cos(angle);
          const adjusted: HazardReport = {
            ...h,
            location: [base[0] + latOff, base[1] + lngOff]
          };
          result.push(adjusted);
        });
      }
    });
    console.log(`🗺️ Adjusted hazards: ${result.length} ready for display`);
    return result;
  }, [filteredHazards]);

  const getMarkerColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#65a30d';
      default: return '#6b7280';
    }
  };

  const getMarkerIcon = (severity: string, hazardId: string) => {
    const color = getMarkerColor(severity);
    const uniqueId = `shadow-${hazardId}`;
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41" fill="none">
        <defs>
          <filter id="${uniqueId}" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.25" />
          </filter>
        </defs>
        <path filter="url(#${uniqueId})" d="M12.5 0.75C6.262 0.75 1.25 5.762 1.25 12C1.25 19.874 10.982 32.77 12.5 34.71C14.018 32.77 23.75 19.874 23.75 12C23.75 5.762 18.738 0.75 12.5 0.75Z" fill="${color}" stroke="#1F2937" stroke-width="1"/>
        <circle cx="12.5" cy="12" r="5" fill="white" fill-opacity="0.92" stroke="#1F2937" stroke-width="0.6" />
      </svg>`;
    return L.divIcon({
      className: 'severity-drop',
      html: svg,
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contamination': return Droplets;
      case 'flooding': return AlertTriangle;
      case 'chemical': return Zap;
      case 'temperature': return Thermometer;
      case 'warning': return AlertTriangle;
      default: return MapPin;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('hazardMap.title')}</h1>
          <p className="text-lg text-gray-600">
            {t('hazardMap.subtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              {t('hazardMap.filters')}
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              {showFilters ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showFilters ? t('common.close') : t('common.submit')} {t('hazardMap.filters')}</span>
            </button>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('hazardMap.hazardType')}</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t('hazardMap.allTypes')}</option>
                <option value="contamination">{t('hazardMap.types.contamination')}</option>
                <option value="flooding">{t('hazardMap.types.flooding')}</option>
                <option value="chemical">{t('hazardMap.types.chemical')}</option>
                <option value="temperature">{t('hazardMap.types.temperature')}</option>
                <option value="warning">{t('hazardMap.types.warning')}</option>
                <option value="other">{t('hazardMap.types.other')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('hazardMap.severity')}</label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t('hazardMap.allSeverities')}</option>
                <option value="critical">{t('hazardMap.severities.critical')}</option>
                <option value="high">{t('hazardMap.severities.high')}</option>
                <option value="medium">{t('hazardMap.severities.medium')}</option>
                <option value="low">{t('hazardMap.severities.low')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('hazardMap.status')}</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t('hazardMap.allStatuses')}</option>
                <option value="active">{t('hazardMap.statuses.active')}</option>
                <option value="investigating">{t('hazardMap.statuses.investigating')}</option>
                <option value="resolved">{t('hazardMap.statuses.resolved')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('hazardMap.dateRange')}</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1">{t('hazardMap.last24Hours')}</option>
                <option value="7">{t('hazardMap.last7Days')}</option>
                <option value="30">{t('hazardMap.last30Days')}</option>
                <option value="90">{t('hazardMap.last90Days')}</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            {t('hazardMap.showing')} {filteredHazards.length} {t('hazardMap.of')} {hazards.length} {t('hazardMap.reports')}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className="h-96 lg:h-[600px]">
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              <SuperClustering
                pointToLayer={(feature, latlng) => {
                  const isCluster = Boolean(feature.properties && feature.properties.cluster);

                  if (isCluster) {
                    const count = feature.properties?.point_count || 0;
                    
                    // DEBUGGING: FORCE ALL CLUSTERS TO BLUE
                    const color = '#2563eb';
                    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><defs><filter id="clusterShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.25" /></filter></defs><circle cx="20" cy="20" r="18" fill="${color}" filter="url(#clusterShadow)" stroke="#1e40af" stroke-width="2" /><text x="20" y="24" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">${count < 100 ? count : count < 1000 ? (count / 100).toFixed(0) + '00+' : '1000+'}</text></svg>`;
                    return L.marker(latlng, { icon: L.divIcon({ html: svg, className: 'cluster-icon', iconSize: [40, 40] }) });
                  }
                  // Non-cluster: render with severity icon
                  const childIndex = feature.properties?.id || 0;
                  const h = adjustedHazards[childIndex];
                  if (h) {
                    return L.marker(latlng, { icon: getMarkerIcon(h.severity, h.id) });
                  }
                  return L.marker(latlng);
                }}
              >
                {adjustedHazards.map((hazard) => (
                  <Marker key={hazard.id} position={hazard.location} icon={getMarkerIcon(hazard.severity, hazard.id)}>
                    <Popup>
                      <div className="p-2 min-w-64">
                        <div className="flex items-center space-x-2 mb-2">
                          {React.createElement(getTypeIcon(hazard.type), { className: 'h-5 w-5 text-blue-600' })}
                          <h3 className="font-semibold text-gray-900">{hazard.title}</h3>
                        </div>
                        <div className="mb-2 flex gap-2">
                          {hazard.verified ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 gap-1">
                              <CheckCircle className="h-3 w-3" />
                              {t('hazardMap.verified')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 gap-1">
                              <Clock className="h-3 w-3" />
                              {t('hazardMap.unverified')}
                            </span>
                          )}
                          {hazard.reportedBy === 'Admin' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {t('hazardMap.officialAlert')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{hazard.description}</p>
                        <div className="space-y-1 text-xs text-gray-500">
                          <div className="flex justify-between">
                            <span>{t('hazardMap.popupLabels.severity')}</span>
                            <span className={`px-2 py-1 rounded text-white ${
                              hazard.severity === 'critical' ? 'bg-red-600' :
                              hazard.severity === 'high' ? 'bg-orange-600' :
                              hazard.severity === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                            }`}>
                              {t(`hazardMap.severities.${hazard.severity}`).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('hazardMap.popupLabels.status')}</span>
                            <span className="capitalize">{t(`hazardMap.statuses.${hazard.status}`)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('hazardMap.popupLabels.reported')}</span>
                            <span>{formatDate(hazard.reportedAt)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('hazardMap.popupLabels.source')}</span>
                            <span>{hazard.reportedBy}</span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </SuperClustering>

              {/* Render circles separately outside SuperClustering */}
              {adjustedHazards.map((hazard) => (
                <Circle
                  key={`circle-${hazard.id}`}
                  center={hazard.location}
                  radius={hazard.severity === 'critical' ? 1000 : hazard.severity === 'high' ? 750 : hazard.severity === 'medium' ? 500 : 250}
                  color={getMarkerColor(hazard.severity)}
                  fillColor={getMarkerColor(hazard.severity)}
                  fillOpacity={0.1}
                  weight={2}
                />
              ))}
            </MapContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('hazardMap.legend')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">{t('hazardMap.severityLevels')}</h4>
              <div className="space-y-2">
                {[
                  { level: 'critical', description: t('hazardMap.legendItems.critical') },
                  { level: 'high', description: t('hazardMap.legendItems.high') },
                  { level: 'medium', description: t('hazardMap.legendItems.medium') },
                  { level: 'low', description: t('hazardMap.legendItems.low') }
                ].map((item) => (
                  <div key={item.level} className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${
                      item.level === 'critical' ? 'bg-red-600' :
                      item.level === 'high' ? 'bg-orange-600' :
                      item.level === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                    }`}></div>
                    <span className="text-sm font-medium">{t(`hazardMap.severities.${item.level}`)}</span>
                    <span className="text-sm text-gray-600">- {item.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">{t('hazardMap.hazardTypes')}</h4>
              <div className="space-y-2">
                {[
                  { type: 'contamination', icon: Droplets, description: t('hazardMap.legendItems.contaminationDesc') },
                  { type: 'flooding', icon: AlertTriangle, description: t('hazardMap.legendItems.floodingDesc') },
                  { type: 'chemical', icon: Zap, description: t('hazardMap.legendItems.chemicalDesc') },
                  { type: 'temperature', icon: Thermometer, description: t('hazardMap.legendItems.temperatureDesc') }
                ].map((item) => (
                  <div key={item.type} className="flex items-center space-x-3">
                    <item.icon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{t(`hazardMap.types.${item.type}`)}</span>
                    <span className="text-sm text-gray-600">- {item.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HazardMap;
