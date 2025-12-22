import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  AlertTriangle,
  Activity,
  Users,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle,
  Clock
} from 'lucide-react';
// @ts-ignore - firebase.js is a JS module
import { ref, onValue } from 'firebase/database';
// @ts-ignore - firebase.js is a JS module
import { db } from '../firebase';

import { useTranslation } from 'react-i18next';

// Types for alert items sourced from Firebase
type AlertItem = {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  status: 'active' | 'resolved';
  verified: boolean;
};

type AlertData = AlertItem[];

const Home = () => {
  const [alertData, setAlertData] = useState<AlertData>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const officialAlertsRef = ref(db, 'alerts/official');
    const hazardReportsRef = ref(db, 'hazards/reports');

    const unsubscribeOfficial = onValue(officialAlertsRef, (snapshot) => {
      const officialAlerts: AlertData = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.entries<any>(data).forEach(([id, value]) => {
          if (value.status === 'active') {
            officialAlerts.push({ id, ...value, verified: true });
          }
        });
      }

      const unsubscribeVerified = onValue(hazardReportsRef, (hazardSnapshot) => {
        const verifiedHazards: AlertData = [];
        if (hazardSnapshot.exists()) {
          const hazardData = hazardSnapshot.val();
          Object.entries<any>(hazardData).forEach(([id, value]) => {
            if (value.verified === true) {
              verifiedHazards.push({
                id,
                title: value.title || `${value.hazardType ?? 'Hazard'} - ${value.severity ?? ''}`,
                message: value.description || '',
                severity: value.severity,
                timestamp: value.timestamp,
                status: 'active',
                verified: true
              });
            }
          });
        }

        let combined = [...officialAlerts, ...verifiedHazards];
        combined = combined.filter((a) => a.verified === true);
        combined.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setAlertData(combined);
      });

      // Cleanup nested listener when official alerts listener updates
      return () => unsubscribeVerified();
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeOfficial();
    };
  }, []);

  const features = [
    {
      icon: MapPin,
      title: t('home.features.interactiveMap.title'),
      description: t('home.features.interactiveMap.description'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      to: '/map'
    },
    {
      icon: AlertTriangle,
      title: t('home.features.emergencyReporting.title'),
      description: t('home.features.emergencyReporting.description'),
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      to: '/report'
    },
    {
      icon: Activity,
      title: t('home.features.iotMonitoring.title'),
      description: t('home.features.iotMonitoring.description'),
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      to: '/iot'
    },
    {
      icon: Users,
      title: t('home.features.communityDriven.title'),
      description: t('home.features.communityDriven.description'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      to: '/community'
    }
  ];

  const stats = [
    { label: t('home.stats.activeSensors'), value: '150+', icon: Activity },
    { label: t('home.stats.reportsFiled'), value: '2,847', icon: AlertTriangle },
    { label: t('home.stats.communityMembers'), value: '12,500+', icon: Users },
    { label: t('home.stats.areasMonitored'), value: '45', icon: Globe }
  ];

  const getAlertBgColor = (severity: AlertItem['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-700';
      case 'high':
        return 'bg-orange-600';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
      default:
        return 'bg-green-600';
    }
  };

  const getSeverityLabel = (severity: AlertItem['severity']) => {
    switch (severity) {
      case 'critical':
        return t('home.severity.criticalLabel', 'Critical Alert');
      case 'high':
        return t('home.severity.highLabel', 'High Severity Alert');
      case 'medium':
        return t('home.severity.mediumLabel', 'Medium Severity Alert');
      case 'low':
      default:
        return t('home.severity.lowLabel', 'Low Severity Alert');
    }
  };

  return (
    <div className="min-h-screen">
      {alertData.length > 0 && (
        <div className="space-y-2">
          {alertData.map((alert) => (
            <div
              key={alert.id}
              className={`${getAlertBgColor(alert.severity)} text-white px-4 py-3 text-center font-semibold`}
            >
              <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-left">
                  <p className="uppercase tracking-wide text-xs font-bold">{getSeverityLabel(alert.severity)}</p>
                  <div className="flex items-center gap-2">
                    {alert.verified ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {t('home.alerts.verified', 'VERIFIED')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 gap-1">
                        <Clock className="h-3 w-3" />
                        {t('home.alerts.unverified', 'UNVERIFIED')}
                      </span>
                    )}
                  </div>
                  {alert.message && <p className="text-sm opacity-90">{alert.message}</p>}
                </div>
                <span className="text-xs opacity-80">{t('home.live', 'Live')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                {t('home.hero.title1', 'Protecting Communities Through')}
                <span className="block text-teal-300">{t('home.hero.title2', 'Water Safety Monitoring')}</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
                {t(
                  'home.hero.subtitle',
                  'Advanced sensor networks, community reporting, and emergency response coordination.'
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/map"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <MapPin className="h-5 w-5" />
                  <span>{t('home.hero.cta.map', 'View Hazard Map')}</span>
                </Link>
                <Link
                  to="/report"
                  className="bg-red-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <AlertTriangle className="h-5 w-5" />
                  <span>{t('home.hero.cta.report', 'Report Emergency')}</span>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Animated water waves */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1200 120" className="w-full h-12 fill-blue-50">
              <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z">
                <animate
                  attributeName="d"
                  dur="10s"
                  repeatCount="indefinite"
                  values="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z;
                          M0,60 C300,0 900,120 1200,60 L1200,120 L0,120 Z;
                          M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"
                />
              </path>
            </svg>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label as string}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.features.sectionTitle', 'Comprehensive Water Safety Platform')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t(
                'home.features.sectionSubtitle',
                'Advanced technology meets community action to create the most effective water monitoring system'
              )}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link key={feature.title as string} to={feature.to} className="block h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 ${feature.bgColor} rounded-lg mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Alert Banner */}
      <section className="py-12 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="flex items-center justify-center w-12 h-12 bg-red-500 rounded-full">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{t('home.emergencyBanner.title', '24/7 Emergency Monitoring')}</h3>
                <p className="text-red-100">
                  {t(
                    'home.emergencyBanner.description',
                    'Real-time alerts from INCOIS for tsunamis, floods, and water emergencies'
                  )}
                </p>
              </div>
            </div>
            <Link
              to="/alerts"
              className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center space-x-2"
            >
              <span>{t('home.emergencyBanner.ctaViewAlerts', 'View Alerts')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('home.cta.title', 'Ready to Make Your Community Safer?')}
            </h2>
            <p className="text-xl mb-8 text-teal-100">
              {t(
                'home.cta.subtitle',
                'Join Project Aqua Alert today and be part of the solution for water safety in your area.'
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-teal-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-teal-50 transition-colors shadow-lg hover:shadow-xl"
              >
                {t('home.cta.buttons.getStarted', 'Get Started Today')}
              </Link>
              <Link
                to="/education"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-teal-600 transition-colors"
              >
                {t('home.cta.buttons.learnMore', 'Learn More')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      </div>
    </div>
  );
};

export default Home;