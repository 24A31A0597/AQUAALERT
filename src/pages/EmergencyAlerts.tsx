import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  AlertTriangle, 
  Waves, 
  Cloud, 
  Zap, 
  MapPin,
  Clock,
  Shield,
  Volume2,
  VolumeX,
  Bell,
  ExternalLink
} from 'lucide-react';
// @ts-ignore - firebase.js is a JS module
import { ref, onValue } from 'firebase/database';
// @ts-ignore - firebase.js is a JS module
import { db } from '../firebase';

interface EmergencyAlert {
  id: string;
  type: 'tsunami' | 'flood' | 'storm' | 'chemical' | 'infrastructure';
  severity: 'watch' | 'warning' | 'emergency';
  title: string;
  description: string;
  location: string;
  coordinates: [number, number];
  issuedAt: string;
  expiresAt: string;
  source: string;
  instructions: string[];
  affectedAreas: string[];
  status: 'active' | 'expired' | 'cancelled';
}

const EmergencyAlerts = () => {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'watch' | 'warning' | 'emergency'>('all');

  // Fetch official alerts and verified hazards from Firebase
  useEffect(() => {
    const officialAlertsRef = ref(db, 'alerts/official');
    const hazardReportsRef = ref(db, 'hazards/reports');
    
    const unsubscribeOfficial = onValue(officialAlertsRef, (snapshot) => {
      const officialAlerts: EmergencyAlert[] = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.entries(data).forEach(([id, value]: any) => {
          if (value.status === 'active') {
            officialAlerts.push({
              id,
              type: 'tsunami',
              severity: value.severity === 'high' ? 'emergency' : value.severity === 'medium' ? 'warning' : 'watch',
              title: value.title,
              description: value.message || '',
              location: 'Official Source',
              coordinates: [0, 0],
              issuedAt: new Date(value.timestamp).toISOString(),
              expiresAt: new Date(value.timestamp + 24 * 60 * 60 * 1000).toISOString(),
              source: value.source || 'Admin',
              instructions: ['Follow official instructions', 'Stay alert', 'Monitor updates'],
              affectedAreas: ['Community Area'],
              status: 'active'
            });
          }
        });
      }
      
      // Fetch verified hazards
      onValue(hazardReportsRef, (hazardSnapshot) => {
        const verifiedHazards: EmergencyAlert[] = [];
        if (hazardSnapshot.exists()) {
          const hazardData = hazardSnapshot.val();
          Object.entries(hazardData).forEach(([id, value]: any) => {
            if (value.verified === true) {
              verifiedHazards.push({
                id,
                type: value.hazardType === 'flooding' ? 'flood' : value.hazardType === 'chemical' ? 'chemical' : 'tsunami',
                severity: value.severity === 'high' || value.severity === 'critical' ? 'emergency' : value.severity === 'medium' ? 'warning' : 'watch',
                title: value.title || `${value.hazardType} - Verified`,
                description: value.description || '',
                location: `Lat: ${value.location?.latitude?.toFixed(4)}, Lng: ${value.location?.longitude?.toFixed(4)}`,
                coordinates: [value.location?.latitude || 0, value.location?.longitude || 0],
                issuedAt: new Date(value.timestamp).toISOString(),
                expiresAt: new Date(value.timestamp + 24 * 60 * 60 * 1000).toISOString(),
                source: 'Community Verified Report',
                instructions: ['Exercise caution', 'Avoid the area', 'Report additional information'],
                affectedAreas: ['Nearby area'],
                status: 'active'
              });
            }
          });
        }
        
        // Combine official + verified alerts
        const combined = [...officialAlerts, ...verifiedHazards];
        setAlerts(combined);
      });
    });
    
    return () => unsubscribeOfficial();
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'tsunami': return Waves;
      case 'flood': return Cloud;
      case 'storm': return Zap;
      case 'chemical': return AlertTriangle;
      default: return Shield;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency': return 'bg-red-600 text-white border-red-600';
      case 'warning': return 'bg-orange-500 text-white border-orange-500';
      case 'watch': return 'bg-yellow-500 text-white border-yellow-500';
      default: return 'bg-gray-500 text-white border-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'active') return alert.status === 'active';
    return alert.severity === filter;
  });

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return t('emergencyAlerts.labels.expired');
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return t('emergencyAlerts.labels.timeRemainingHours', { hours, minutes });
    }
    return t('emergencyAlerts.labels.timeRemainingMinutes', { minutes });
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('emergencyAlerts.title')}</h1>
              <p className="text-lg text-gray-600">
                {t('emergencyAlerts.subtitle')}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  soundEnabled 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span>{t('emergencyAlerts.soundEnabled')}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Alert Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { 
              label: t('emergencyAlerts.stats.activeAlerts'), 
              value: alerts.filter(a => a.status === 'active').length,
              color: 'text-red-600',
              bgColor: 'bg-red-100'
            },
            { 
              label: t('emergencyAlerts.stats.emergencyLevel'), 
              value: alerts.filter(a => a.severity === 'emergency' && a.status === 'active').length,
              color: 'text-red-600',
              bgColor: 'bg-red-100'
            },
            { 
              label: t('emergencyAlerts.stats.warnings'), 
              value: alerts.filter(a => a.severity === 'warning' && a.status === 'active').length,
              color: 'text-orange-600',
              bgColor: 'bg-orange-100'
            },
            { 
              label: t('emergencyAlerts.stats.watches'), 
              value: alerts.filter(a => a.severity === 'watch' && a.status === 'active').length,
              color: 'text-yellow-600',
              bgColor: 'bg-yellow-100'
            }
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Bell className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-6"
        >
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: t('emergencyAlerts.filter.all') },
              { key: 'active', label: t('emergencyAlerts.filter.active') },
              { key: 'emergency', label: t('emergencyAlerts.filter.emergency') },
              { key: 'warning', label: t('emergencyAlerts.filter.warning') },
              { key: 'watch', label: t('emergencyAlerts.filter.watch') }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {t('emergencyAlerts.showing')} {filteredAlerts.length} {t('emergencyAlerts.of')} {alerts.length} {t('emergencyAlerts.alerts')}
          </div>
        </motion.div>

        {/* Alerts List */}
        <div className="space-y-6">
          {filteredAlerts.map((alert, index) => {
            const AlertIcon = getAlertIcon(alert.type);
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className={`bg-white rounded-lg shadow-lg overflow-hidden border-l-4 ${
                  alert.severity === 'emergency' ? 'border-red-600' :
                  alert.severity === 'warning' ? 'border-orange-500' :
                  'border-yellow-500'
                }`}
              >
                <div className="p-6">
                  {/* Alert Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        alert.severity === 'emergency' ? 'bg-red-100' :
                        alert.severity === 'warning' ? 'bg-orange-100' :
                        'bg-yellow-100'
                      }`}>
                        <AlertIcon className={`h-6 w-6 ${
                          alert.severity === 'emergency' ? 'text-red-600' :
                          alert.severity === 'warning' ? 'text-orange-600' :
                          'text-yellow-600'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-900">{alert.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getSeverityColor(alert.severity)}`}>
                            {t(`emergencyAlerts.severity.${alert.severity}`)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{alert.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatTimeRemaining(alert.expiresAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                        {t(`emergencyAlerts.status.${alert.status}`)}
                      </span>
                    </div>
                  </div>

                  {/* Alert Description */}
                  <p className="text-gray-700 mb-4 leading-relaxed">{alert.description}</p>

                  {/* Instructions */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{t('emergencyAlerts.labels.instructions')}</h4>
                    <ul className="space-y-1">
                      {alert.instructions.map((instruction, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-red-600 font-bold">•</span>
                          <span className="text-gray-700">{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Affected Areas */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{t('emergencyAlerts.labels.affectedAreas')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {alert.affectedAreas.map((area, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <div>{t('emergencyAlerts.labels.source')} {alert.source}</div>
                      <div>{t('emergencyAlerts.labels.issuedAt')} {new Date(alert.issuedAt).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <ExternalLink className="h-4 w-4" />
                        <span>{t('emergencyAlerts.labels.viewOnMap')}</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <Bell className="h-4 w-4" />
                        <span>{t('emergencyAlerts.labels.setReminder')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredAlerts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center py-12"
          >
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('emergencyAlerts.noAlerts')}</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? t('emergencyAlerts.noAlertsDesc')
                : t('emergencyAlerts.noAlertsFilter', { filter: t(`emergencyAlerts.filter.${filter}`) })}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EmergencyAlerts;