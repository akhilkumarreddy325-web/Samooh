import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Wifi, Rocket, Sparkles, Sun, Moon, Languages, LogOut, User, MapPin, Building, ShieldCheck, Mail, Store, Menu, Truck, ChevronDown, Check } from 'lucide-react';
import { checkHealth, triggerDemoScenario } from '../services/api';
import { useApp } from '../context/AppContext';

export default function TopNav({ onToggleMobileMenu }) {
  const { theme, toggleTheme, lang, setLang, supportedLanguages, t, user, logout, userRole, currentSupplier } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [isLaunchingDemo, setIsLaunchingDemo] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const langDropdownRef = useRef(null);

  const isSupplier = userRole === 'supplier' || location.pathname.startsWith('/supplier');

  const currentLang = (supportedLanguages || []).find(l => l.code === lang) || { name: 'English', nativeName: 'English' };

  useEffect(() => {
    function handleClickOutside(event) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setShowLangDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function monitorHealth() {
      const res = await checkHealth();
      setIsOnline(res.isOnline);
    }
    monitorHealth();
    const interval = setInterval(monitorHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLaunchDemo = async () => {
    setIsLaunchingDemo(true);
    try {
      await triggerDemoScenario();
      window.location.reload();
    } catch (err) {
      alert('Failed to launch scenario: ' + err.message);
    } finally {
      setIsLaunchingDemo(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowProfileModal(false);
    navigate('/login');
  };

  return (
    <header className={`h-14 border-b px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors ${
      theme === 'light'
        ? 'bg-white border-slate-200 text-slate-900'
        : 'bg-[#1E293B] border-slate-700/80 text-white'
    }`}>
      {/* Left Search Bar & Mobile Hamburger Toggle */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex-1 max-w-[180px] sm:max-w-xs md:w-72">
          <Search className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${
            theme === 'light' ? 'text-slate-400' : 'text-slate-500'
          }`} />
          <input 
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full border rounded-md pl-8 pr-2.5 py-1.5 text-xs transition focus:outline-none ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:bg-white'
                : 'bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-slate-600'
            }`}
          />
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center space-x-2 sm:space-x-2.5">

        {/* Quick Nearby Retailers Button for Supplier */}
        {isSupplier && (
          <button
            onClick={() => navigate('/supplier/nearby-retailers')}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-medium transition flex items-center space-x-1.5 shadow-sm"
            title="Open Nearby Retailers Map"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Nearby Retailers</span>
          </button>
        )}

        {/* Language Selector Dropdown */}
        <div className="relative" ref={langDropdownRef}>
          <button
            id="language-selector-button"
            onClick={() => setShowLangDropdown((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition flex items-center space-x-1.5 ${
              showLangDropdown
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-emerald-800 dark:border-emerald-700'
                : theme === 'light'
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Select Language"
            aria-haspopup="true"
            aria-expanded={showLangDropdown}
          >
            <Languages className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('language') || 'Language'}: <span className="font-semibold">{currentLang.nativeName}</span></span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showLangDropdown && (
            <div 
              id="language-dropdown-menu"
              className={`absolute right-0 mt-1.5 w-44 rounded-md border shadow-lg py-1 z-50 animate-fade-in ${
                theme === 'light'
                  ? 'bg-white border-slate-200 text-slate-800 shadow-slate-200/60'
                  : 'bg-[#1E293B] border-slate-700 text-slate-200 shadow-black/40'
              }`}
            >
              <div className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700/60">
                {t('language') || 'Language'}
              </div>
              <div className="py-1">
                {(supportedLanguages || []).map((langItem) => {
                  const isSelected = lang === langItem.code;
                  return (
                    <button
                      key={langItem.code}
                      onClick={() => {
                        setLang(langItem.code);
                        setShowLangDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition ${
                        isSelected
                          ? 'font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="font-medium">{langItem.nativeName}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-1.5 rounded-md border text-xs transition flex items-center justify-center ${
            theme === 'light'
              ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
          title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
        >
          {theme === 'light' ? <Sun className="w-4 h-4 text-slate-600" /> : <Moon className="w-4 h-4 text-slate-300" />}
        </button>

        {/* Notifications Icon */}
        <div className={`relative p-1.5 rounded-md border cursor-pointer transition ${
          theme === 'light'
            ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
        }`}>
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-600" />
        </div>

        {/* Interactive Profile Badge & Dropdown */}
        <div className={`relative border-l pl-2.5 ml-1 ${
          theme === 'light' ? 'border-slate-200' : 'border-slate-700'
        }`}>
          <button
            onClick={() => setShowProfileModal(!showProfileModal)}
            className="flex items-center space-x-2 hover:opacity-90 transition cursor-pointer text-left focus:outline-none"
            title="Account Options"
          >
            {isSupplier ? (
              <div className="w-7 h-7 rounded-md bg-emerald-800 flex items-center justify-center font-semibold text-xs text-white">
                <Truck className="w-3.5 h-3.5" />
              </div>
            ) : user?.avatar ? (
              <img src={user.avatar} alt="User Avatar" className="w-7 h-7 rounded-md border border-slate-300" />
            ) : (
              <div className="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center font-semibold text-xs text-white">
                {user?.storeName ? user.storeName.charAt(0) : 'S'}
              </div>
            )}
            <div className="hidden lg:block">
              <h4 className={`text-xs font-semibold leading-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                {isSupplier ? (currentSupplier?.name || 'Wholesale Supplier') : (user?.storeName || t('retailAdmin'))}
              </h4>
              <span className={`text-[10px] block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                {isSupplier ? (currentSupplier?.contact_person || 'Supplier Partner') : (user?.ownerName || 'Kirana Partner')}
              </span>
            </div>
          </button>

          {/* Clean Profile Dropdown Card */}
          {showProfileModal && (
            <div className={`absolute right-0 top-11 w-80 rounded-lg border p-4 shadow-lg z-50 transition-all ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-[#1E293B] border-slate-700 text-white'
            }`}>
              {/* Profile Card Header */}
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                {isSupplier ? (
                  <div className="w-9 h-9 rounded-md bg-emerald-800 flex items-center justify-center font-bold text-white text-sm">
                    <Truck className="w-4 h-4" />
                  </div>
                ) : user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-md border border-slate-200" />
                ) : (
                  <div className="w-9 h-9 rounded-md bg-slate-800 flex items-center justify-center font-bold text-white text-sm">
                    {user?.storeName ? user.storeName.charAt(0) : 'S'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className={`text-xs font-semibold truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    {isSupplier ? currentSupplier?.name : user?.storeName}
                  </h4>
                  <p className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'} flex items-center mt-0.5`}>
                    <User className="w-3 h-3 mr-1 text-slate-400" />
                    {isSupplier ? currentSupplier?.contact_person : user?.ownerName}
                  </p>
                </div>
              </div>

              {/* Profile Details List */}
              <div className="py-2.5 space-y-2 text-xs">
                <div className="flex items-start space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className={`truncate ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                    {isSupplier ? currentSupplier?.email : user?.email}
                  </span>
                </div>

                <div className="flex items-start space-x-2">
                  <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                    {isSupplier ? `Rating: ${currentSupplier?.rating || 4.9} ★ (${currentSupplier?.status || 'ACTIVE'})` : user?.clusterHub}
                  </span>
                </div>

                <div className="flex items-start space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    {isSupplier ? currentSupplier?.address : user?.address}
                  </span>
                </div>

                {/* Metrics */}
                {isSupplier ? (
                  <div className="pt-2 grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-md border bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800">
                      <span className={`text-[10px] block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Service Radius</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{currentSupplier?.service_radius_km || 50} km</span>
                    </div>
                    <div className="p-2 rounded-md border bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Lead Time</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{currentSupplier?.lead_time_days || 1} Day(s)</span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-md border bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800">
                      <span className={`text-[10px] block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Monthly Budget</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{user?.monthlyBudget || '₹2,50,000'}</span>
                    </div>
                    <div className="p-2 rounded-md border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/40">
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">Total Saved</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-xs">{user?.totalSaved || '₹42,850'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Links inside Profile Dropdown */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                {isSupplier && (
                  <button
                    onClick={() => {
                      setShowProfileModal(false);
                      navigate('/supplier/nearby-retailers');
                    }}
                    className="w-full py-1.5 px-2.5 rounded-md text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 transition"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Nearby Retailers Map</span>
                  </button>
                )}
              </div>

              {/* Retailer Settings Language Selector */}
              {!isSupplier && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center space-x-1.5 font-medium">
                      <Languages className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t('language') || 'Language'}</span>
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{currentLang.nativeName}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-0.5">
                    {(supportedLanguages || []).map((langItem) => (
                      <button
                        key={langItem.code}
                        type="button"
                        onClick={() => setLang(langItem.code)}
                        className={`py-1 px-1.5 rounded text-[11px] font-medium transition text-center border ${
                          lang === langItem.code
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 font-bold'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {langItem.nativeName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons: Log Out */}
              <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full py-1.5 px-3 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition flex items-center justify-center space-x-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
