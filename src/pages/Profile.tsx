import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Bell, 
  Edit3,
  Save,
  X,
  AlertTriangle,
  Activity,
  Calendar,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'locations' | 'notifications' | 'activity'>('profile');

  const [profileData, setProfileData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    location: 'Kakinada, AP',
    bio: 'Environmental enthusiast committed to water safety and community protection.',
    joinedDate: '2023-06-15',
    savedLocations: [
      { id: '1', name: 'Kakinada Beach (Uppada Coast)', address: 'Coastal Area - Prone to cyclones, storm surges, and high tides', coordinates: [16.9891, 82.2475] },
      { id: '2', name: 'Godavari River – Coringa Region', address: 'River / Estuary Zone - Flood risk during monsoon, salinity intrusion', coordinates: [16.7505, 82.3308] },
      { id: '3', name: 'Coringa Mangrove Forest Area', address: 'Ecologically Sensitive Zone - Mangrove protection, water pollution risks', coordinates: [16.7270, 82.2864] }
    ],
    notificationSettings: {
      emergencyAlerts: true,
      hazardReports: true,
      communityUpdates: false,
      weeklyDigest: true,
      emailNotifications: true,
      smsNotifications: false
    }
  });

  const userStats = {
    reportsSubmitted: 12,
    eventsAttended: 8,
    communityRank: 'Water Guardian',
    pointsEarned: 2450
  };

  const recentActivity = [
    {
      id: '1',
      type: 'report',
      title: 'Reported water contamination',
      location: 'Downtown District',
      date: '2025-01-12',
      status: 'resolved'
    },
    {
      id: '2',
      type: 'event',
      title: 'Attended beach cleanup',
      location: 'Coastal Park',
      date: '2025-08-12',
      status: 'completed'
    },
    {
      id: '3',
      type: 'comment',
      title: 'Commented on forum discussion',
      location: 'Community Forum',
      date: '2025-12-12',
      status: 'active'
    }
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'report': return AlertTriangle;
      case 'event': return Calendar;
      case 'comment': return User;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'active': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-100">
                  <User className="h-12 w-12 text-blue-600" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2">
                  <Award className="h-4 w-4" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profileData.name}</h1>
                <p className="text-lg text-gray-600">{userStats.communityRank}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>Joined {new Date(profileData.joinedDate).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{userStats.pointsEarned} points earned</span>
                </div>
              </div>
            </div>
            <div className="mt-6 md:mt-0">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: 'Reports Submitted', value: userStats.reportsSubmitted, icon: AlertTriangle, color: 'text-red-600 bg-red-100' },
            { label: 'Events Attended', value: userStats.eventsAttended, icon: Calendar, color: 'text-green-600 bg-green-100' },
            { label: 'Community Points', value: userStats.pointsEarned, icon: Award, color: 'text-blue-600 bg-blue-100' },
            { label: 'Saved Locations', value: profileData.savedLocations.length, icon: MapPin, color: 'text-purple-600 bg-purple-100' }
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg mb-8"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'profile', label: 'Profile Info', icon: User },
                { key: 'locations', label: 'Saved Locations', icon: MapPin },
                { key: 'notifications', label: 'Notifications', icon: Bell },
                { key: 'activity', label: 'Recent Activity', icon: Activity }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Info Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.location}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.bio}</p>
                  )}
                </div>
                {isEditing && (
                  <div className="flex space-x-4">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Saved Locations Tab */}
            {activeTab === 'locations' && (
              <div className="space-y-4">
                {profileData.savedLocations.map((location) => (
                  <div key={location.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">{location.name}</h3>
                        <p className="text-sm text-gray-600">{location.address}</p>
                      </div>
                    </div>
                    <button className="text-red-600 hover:text-red-700">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
                  + Add New Location
                </button>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                {Object.entries(profileData.notificationSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {key === 'emergencyAlerts' && 'Critical emergency notifications'}
                        {key === 'hazardReports' && 'New hazard reports in your area'}
                        {key === 'communityUpdates' && 'Community forum and event updates'}
                        {key === 'weeklyDigest' && 'Weekly summary of activity'}
                        {key === 'emailNotifications' && 'Receive notifications via email'}
                        {key === 'smsNotifications' && 'Receive notifications via SMS'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          notificationSettings: {
                            ...profileData.notificationSettings,
                            [key]: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <ActivityIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{activity.title}</h3>
                        <p className="text-sm text-gray-600">{activity.location}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;