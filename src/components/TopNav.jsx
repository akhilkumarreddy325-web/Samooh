import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Wifi, Rocket, Sparkles, Sun, Moon, Languages, LogOut, User, MapPin, Building, ShieldCheck, Mail, Store, Menu } from 'lucide-react';
import { checkHealth, triggerDemoScenario } from '../services/api';
import { useApp } from '../context/AppContext';

export default function TopNav({ onToggleMobileMenu }) {
  const { theme, toggleTheme, lang, toggleLanguage, t, user, logout } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [isLaunchingDemo, setIsLaunchingDemo] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

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
      alert('Failed to launch demo scenario: ' + err.message);
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
    <header className={`h-16 border-b px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl transition-colors duration-300 ${
      theme === 'light'
        ? 'bg-white/80 border-slate-200/80 text-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
        : 'bg-[#0B1020]/90 border-slate-800/80 text-slate-100'
    }`}>
      {/* Left Section: Mobile Menu Trigger & Global Search Input */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileMenu}
          className={`p-2 rounded-xl border md:hidden transition ${
            theme === 'light'
              ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              : 'bg-[#131A2A] border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-44 sm:w-64 lg:w-72">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
            theme === 'light' ? 'text-slate-400' : 'text-slate-500'
          }`} />
          <input 
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full border rounded-xl pl-9 pr-3 py-1.5 text-xs transition focus:outline-none ${
              theme === 'light'
                ? 'bg-slate-100/90 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white'
                : 'bg-[#131A2A] border-slate-800 text-slate-200 placeholder-slate-500 focus:border-accentBlue'
            }`}
          />
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center space-x-3">
        {/* Language Switcher Toggle (ENG <-> HINDI) */}
        <button
          onClick={toggleLanguage}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 shadow-sm hover:scale-105 active:scale-95 ${
            lang === 'hi'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400 shadow-amber-500/20'
              : theme === 'light'
                ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                : 'bg-[#131A2A] border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
          title="Switch Language (English / Hindi हिंदी)"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'ENG | हिंदी' : 'हिंदी | ENG'}</span>
        </button>

        {/* Theme Switcher Toggle (LIGHT GLASS <-> DARK GLASS) */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-xl border text-xs font-semibold transition flex items-center justify-center hover:scale-105 active:scale-95 ${
            theme === 'light'
              ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100 shadow-sm'
              : 'bg-[#131A2A] border-slate-800 text-indigo-400 hover:bg-slate-800'
          }`}
          title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
        >
          {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500 fill-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />}
        </button>

        {/* 1-Click Launch Hackathon Demo Button */}
        <button
          onClick={handleLaunchDemo}
          disabled={isLaunchingDemo}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-xs shadow-md hover:shadow-lg hover:opacity-95 transition flex items-center space-x-1.5 active:scale-95"
          title="Launch Parle-G 800g 100% Deterministic Hackathon Demo Scenario"
        >
          <Rocket className={`w-3.5 h-3.5 ${isLaunchingDemo ? 'animate-bounce' : ''}`} />
          <span>{isLaunchingDemo ? t('loadingDemo') : t('launchDemo')}</span>
        </button>

        {/* Live / Mock Mode Indicator */}
        <div 
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
            isOnline 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
          }`}
          title={isOnline ? "Connected to live FastAPI backend" : "Running in Standalone Demo Mode with local mock data store"}
        >
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
          <span className="hidden sm:inline">{isOnline ? t('fastapiConnected') : t('demoMode')}</span>
        </div>

        {/* Notifications Icon */}
        <div className={`relative p-2 rounded-xl border cursor-pointer transition ${
          theme === 'light'
            ? 'bg-slate-100/80 border-slate-200 text-slate-500 hover:text-slate-800'
            : 'bg-[#131A2A] border-slate-800 text-slate-400 hover:text-white'
        }`}>
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500" />
        </div>

        {/* Interactive Profile Badge & Dropdown */}
        <div className={`relative border-l pl-3 ${
          theme === 'light' ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <button
            onClick={() => setShowProfileModal(!showProfileModal)}
            className="flex items-center space-x-2.5 hover:opacity-90 transition cursor-pointer text-left focus:outline-none"
            title="View Store Profile & Account Options"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="User Avatar" className="w-8 h-8 rounded-xl border border-blue-500 shadow-sm" />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                {user?.storeName ? user.storeName.charAt(0) : 'S'}
              </div>
            )}
            <div className="hidden lg:block">
              <h4 className={`text-xs font-bold leading-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                {user?.storeName || t('retailAdmin')}
              </h4>
              <span className={`text-[10px] block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                {user?.ownerName || 'Kirana Partner'}
              </span>
            </div>
          </button>

          {/* Sleek Profile Dropdown Card */}
          {showProfileModal && (
            <div className={`absolute right-0 top-12 w-80 rounded-2xl border p-5 shadow-2xl z-50 transition-all ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.1)]'
                : 'bg-[#131A2A] border-slate-700 text-white'
            }`}>
              {/* Profile Card Header */}
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-2xl border border-blue-500 shadow-md" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-md">
                    {user?.storeName ? user.storeName.charAt(0) : 'S'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className={`text-sm font-bold truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    {user?.storeName}
                  </h4>
                  <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'} flex items-center`}>
                    <User className="w-3 h-3 mr-1 text-blue-500" />
                    {user?.ownerName}
                  </p>
                </div>
              </div>

              {/* Profile Details List */}
              <div className="py-3 space-y-2.5 text-xs">
                <div className="flex items-start space-x-2">
                  <Mail className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className={`truncate ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                    {user?.email}
                  </span>
                </div>

                <div className="flex items-start space-x-2">
                  <Building className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className={`font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>
                    {user?.clusterHub}
                  </span>
                </div>

                <div className="flex items-start space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    {user?.address}
                  </span>
                </div>

                {/* Savings Metric Pills */}
                <div className="pt-2 grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-xl border bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800">
                    <span className={`text-[10px] block ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Monthly Budget</span>
                    <span className="font-bold text-blue-600 dark:text-accentBlue text-xs">{user?.monthlyBudget || '₹2,50,000'}</span>
                  </div>
                  <div className="p-2 rounded-xl border bg-emerald-500/10 border-emerald-500/20">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">Total Saved</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">{user?.totalSaved || '₹42,850'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Log Out & Switch Persona */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center justify-center space-x-2 border border-rose-500/20 active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out & Switch Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
