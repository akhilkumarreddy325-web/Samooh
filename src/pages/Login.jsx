import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Lock, Mail, Store, ShieldCheck, Sparkles, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useApp, DEMO_USERS } from '../context/AppContext';

export default function Login() {
  const { theme, t, user, loginWithGoogle, login, switchUser } = useApp();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Google Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGmail, setCustomGmail] = useState('akhilkumarreddy325@gmail.com');

  // Form states for new store registration
  const [regStoreName, setRegStoreName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [notification, setNotification] = useState('');

  const handleGoogleLogin = (gmailAddr = null) => {
    const targetEmail = gmailAddr || customGmail;
    if (!targetEmail) {
      alert('Please enter a valid Gmail address');
      return;
    }
    const loggedUser = loginWithGoogle(targetEmail);
    setShowGoogleModal(false);
    setNotification(`Successfully signed in with Google Account (${loggedUser.email})!`);
    setTimeout(() => {
      navigate('/');
    }, 800);
  };

  const handleEmailLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill in both email and password.');
      return;
    }
    const res = login(email, password);
    setNotification(`Welcome back, ${res.user.ownerName || res.user.storeName}!`);
    setTimeout(() => {
      navigate('/');
    }, 800);
  };

  const handleQuickPersonaSelect = (userKey) => {
    switchUser(userKey);
    setNotification(`Switched active store context to ${DEMO_USERS[userKey].storeName}`);
    setTimeout(() => {
      navigate('/');
    }, 800);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regStoreName || !regEmail || !regPassword) {
      alert('Please fill in required store details.');
      return;
    }
    login(regEmail, regPassword);
    setNotification(`Store "${regStoreName}" registered successfully!`);
    setTimeout(() => {
      navigate('/');
    }, 800);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-center">
        {/* Left Side: Brand Value Proposition */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg flex items-center justify-center">
              <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                theme === 'light' ? 'bg-white' : 'bg-[#0B1020]'
              }`}>
                <Layers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h1 className={`text-3xl font-extrabold tracking-tight flex items-center ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                Samooh <span className="text-indigo-600 text-sm ml-1 font-semibold">AI</span>
              </h1>
              <p className={`text-xs font-medium ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                Group Procurement & Wholesale Arbitrage Core
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className={`text-2xl font-black leading-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
              Empowering Kirana Stores with Collective Wholesale Bargaining Power.
            </h2>
            <p className={`text-xs leading-relaxed ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Sign in with your Gmail account or store credentials to access aggregate demand pools, custom procurement builder, and guaranteed group savings.
            </p>
          </div>

          {/* Value Badges */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Unlock 15-22% Direct Supplier Wholesale Arbitrage</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-600 dark:text-accentBlue font-bold">
              <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span>AI Logistics Cluster Consolidation in Hyderabad</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-600 dark:text-accentPurple font-bold">
              <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span>Official Blockchain Verified Itemized Savings Invoice</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className={`glass-card rounded-3xl p-8 border shadow-2xl transition-all duration-300 ${
          theme === 'light'
            ? 'bg-white/95 border-slate-200 text-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.06)]'
            : 'bg-[#131A2A] border-slate-700/80 text-white'
        }`}>
          {/* Top Tabs */}
          <div className="flex items-center justify-between p-1 rounded-xl bg-slate-100 dark:bg-slate-900 mb-6">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                !isRegister
                  ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                isRegister
                  ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Register Kirana Store
            </button>
          </div>

          {/* Success Banner */}
          {notification && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{notification}</span>
            </div>
          )}

          {!isRegister ? (
            <div className="space-y-5">
              {/* GOOGLE LOGIN BUTTON */}
              <button
                onClick={() => setShowGoogleModal(true)}
                className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-sm transition flex items-center justify-center space-x-3 active:scale-95 cursor-pointer"
              >
                {/* Official Google SVG Logo */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google (Gmail Account)</span>
              </button>

              {/* OR Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t w-full border-slate-200 dark:border-slate-800" />
                <span className={`px-3 text-[10px] uppercase font-bold tracking-wider absolute ${
                  theme === 'light' ? 'bg-white text-slate-400' : 'bg-[#131A2A] text-slate-500'
                }`}>
                  OR USE STORE EMAIL & PASSWORD
                </span>
              </div>

              {/* Standard Login Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Store Email Address
                  </label>
                  <div className="relative">
                    <Mail className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                      theme === 'light' ? 'text-slate-400' : 'text-slate-500'
                    }`} />
                    <input
                      type="email"
                      placeholder="lakshmi@samooh.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-xs transition focus:outline-none ${
                        theme === 'light'
                          ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-500'
                          : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-accentBlue'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                      theme === 'light' ? 'text-slate-400' : 'text-slate-500'
                    }`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full border rounded-xl pl-9 pr-10 py-2.5 text-xs transition focus:outline-none ${
                        theme === 'light'
                          ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-500'
                          : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-accentBlue'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                        theme === 'light' ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 active:scale-95"
                >
                  <span>Sign In to Samooh</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* 1-Click Judge Quick Switcher Badges */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  ⚡ Hackathon Demo 1-Click Persona Switcher:
                </span>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(DEMO_USERS).map((key) => {
                    const u = DEMO_USERS[key];
                    const isActive = user?.email === u.email;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleQuickPersonaSelect(key)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold'
                            : theme === 'light'
                              ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {u.isGoogle ? '🌐 Google Store' : u.storeName.split(' ')[0] + ' Store'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Store Name
                </label>
                <div className="relative">
                  <Store className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                    theme === 'light' ? 'text-slate-400' : 'text-slate-500'
                  }`} />
                  <input
                    type="text"
                    placeholder="Sri Venkateswara Super Mart"
                    value={regStoreName}
                    onChange={(e) => setRegStoreName(e.target.value)}
                    className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-xs transition focus:outline-none ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-500'
                        : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-accentBlue'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Owner Name
                </label>
                <input
                  type="text"
                  placeholder="K. Raghunath"
                  value={regOwnerName}
                  onChange={(e) => setRegOwnerName(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-xs transition focus:outline-none ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-500'
                      : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-accentBlue'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="owner@kirana.in"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-xs transition focus:outline-none ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-500'
                      : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-accentBlue'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Create password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-xs transition focus:outline-none ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-500'
                      : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-accentBlue'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 active:scale-95"
              >
                <span>🚀 Register & Join Hyderabad Cluster</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Interactive Google Gmail Account Sign-In Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
            onClick={() => setShowGoogleModal(false)}
          />
          
          <div className={`relative w-full max-w-md rounded-3xl p-6 border shadow-2xl z-50 transition-all ${
            theme === 'light'
              ? 'bg-white border-slate-200 text-slate-900 shadow-[0_25px_60px_rgba(0,0,0,0.15)]'
              : 'bg-[#131A2A] border-slate-700 text-white'
          }`}>
            {/* Header */}
            <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border shadow-sm">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <h3 className="text-lg font-extrabold tracking-tight">Sign in with Google</h3>
              <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                Choose your Gmail account to continue to Samooh AI
              </p>
            </div>

            {/* Quick Gmail Accounts Selection */}
            <div className="py-4 space-y-2.5">
              <span className={`text-[11px] font-bold uppercase tracking-wider block ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                Select Verified Gmail Account:
              </span>

              <button
                type="button"
                onClick={() => handleGoogleLogin('akhilkumarreddy325@gmail.com')}
                className="w-full p-3 rounded-2xl border text-left flex items-center space-x-3 transition hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 active:scale-98"
              >
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  AK
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold truncate">Akhil Kumar Reddy</h4>
                  <p className={`text-[11px] truncate ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    akhilkumarreddy325@gmail.com
                  </p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </button>

              <button
                type="button"
                onClick={() => handleGoogleLogin('google.partner@gmail.com')}
                className="w-full p-3 rounded-2xl border text-left flex items-center space-x-3 transition hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 active:scale-98"
              >
                <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  GP
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold truncate">Google Partner Store</h4>
                  <p className={`text-[11px] truncate ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    google.partner@gmail.com
                  </p>
                </div>
              </button>

              {/* Enter Custom Gmail */}
              <div className="pt-2">
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Or Enter Any Gmail Address:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={customGmail}
                    onChange={(e) => setCustomGmail(e.target.value)}
                    className={`flex-1 border rounded-xl px-3 py-2 text-xs transition focus:outline-none ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-500'
                        : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-accentBlue'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleGoogleLogin(customGmail)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm active:scale-95"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>

            {/* Cancel Button */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className={`w-full py-2.5 rounded-xl border text-xs font-semibold transition ${
                  theme === 'light'
                    ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
