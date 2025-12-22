import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Droplets, Bell, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const closeLanguageSelector = () => {
    // Notify LanguageSelector to close its dropdown
    window.dispatchEvent(new Event('languageSelector:close'));
  };

  const navigation = [
    { name: t('navigation.home'), href: '/' },
    { name: t('navigation.hazardMap'), href: '/map' },
    { name: t('navigation.reportHazard'), href: '/report' },
    { name: t('navigation.iotDashboard'), href: '/iot' },
    { name: t('navigation.emergencyAlerts'), href: '/alerts', icon: Bell },
    { name: t('navigation.community'), href: '/community' },
    { name: t('navigation.education'), href: '/education' },
  ];

  const isActive = (path: string) => location.pathname === path;

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-2">
            <Droplets className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-lg">{t('header.title')}</span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center space-x-3">
            {navigation.map(item => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => {
                  closeLanguageSelector();
                }}
                className={`px-4 py-2 rounded-md text-base font-medium ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.name}
              </Link>
            ))}

          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center space-x-4">
            <LanguageSelector />

            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={user.role === 'admin' ? '/admin' : '/profile'}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-black"
                >
                  {t('navigation.logout')}
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex space-x-3">
                <Link
                  to="/login"
                  onClick={closeLanguageSelector}
                  className={`px-4 py-2 rounded-md text-base font-medium ${
                    isActive('/login')
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {t('navigation.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={closeLanguageSelector}
                  className={`px-4 py-2 rounded-md text-base font-medium ${
                    isActive('/login')
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {t('navigation.register')}
                </Link>
              </div>
            )}

            {/* MOBILE MENU */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* MOBILE NAV */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 space-y-2">
            {navigation.map(item => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => {
                  setIsMenuOpen(false);
                  closeLanguageSelector();
                }}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;