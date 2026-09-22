import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Lock, Mail, Store, ShieldCheck, ArrowRight, Eye, EyeOff, CheckCircle2, Building2, AlertCircle, Loader2 } from 'lucide-react';
import { useApp, DEMO_USERS, DEMO_SUPPLIERS } from '../context/AppContext';
import { signInWithGoogle, getUserProfile } from '../services/authService';

export default function Login() {
  const { 
    user, login, switchUser,
    switchRole, loginSupplier, registerSupplier, switchSupplier 
  } = useApp();
  const navigate = useNavigate();

  // Role toggle: 'retailer' | 'supplier'
  const [portalType, setPortalType] = useState('retailer');
  const [isRegister, setIsRegister] = useState(false);
  
  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Real Google Auth Loading & Error State
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [notification, setNotification] = useState('');

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setAuthError('');
    setNotification('');

    try {
      const res = await signInWithGoogle();
      if (res.redirecting) {
        setNotification('Redirecting to Google Sign-In...');
        return;
      }
      if (!res.success) {
        setAuthError(res.error || 'Google sign-in could not be completed.');
        setIsGoogleLoading(false);
        return;
      }

      const fbUser = res.user;
      setNotification(`Authenticated as ${fbUser.displayName || fbUser.email}. Verifying account...`);

      // Query Firestore users/{uid}
      const profile = await getUserProfile(fbUser.uid);

      if (profile && profile.onboardingCompleted) {
        const role = profile.role || 'retailer';
        setNotification(`Welcome back, ${profile.storeName || profile.name || fbUser.displayName}!`);
        setTimeout(() => {
          if (role === 'supplier') {
            navigate('/supplier');
          } else {
            navigate('/');
          }
        }, 600);
      } else {
        // Incomplete profile -> Route to Onboarding
        setNotification('Welcome to Samooh! Taking you to business setup...');
        setTimeout(() => {
          navigate('/onboarding');
        }, 600);
      }
    } catch (err) {
      setAuthError(err.message || 'An unexpected error occurred during Google Sign-in.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill in both email and password.');
      return;
    }

    if (portalType === 'supplier') {
      const res = loginSupplier(email, password);
      setNotification(`Welcome back, ${res.supplier.name}`);
      setTimeout(() => {
        navigate('/supplier');
      }, 800);
    } else {
      const res = login(email, password);
      switchRole('retailer');
      setNotification(`Welcome back, ${res.user.ownerName || res.user.storeName}`);
      setTimeout(() => {
        navigate('/');
      }, 800);
    }
  };

  const handleQuickPersonaSelect = (userKey) => {
    switchUser(userKey);
    switchRole('retailer');
    setNotification(`Switched active store context to ${DEMO_USERS[userKey].storeName}`);
    setTimeout(() => {
      navigate('/');
    }, 800);
  };

  const handleQuickSupplierSelect = (supKey) => {
    switchSupplier(supKey);
    setNotification(`Switched to ${DEMO_SUPPLIERS[supKey].name}`);
    setTimeout(() => {
      navigate('/supplier');
    }, 800);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (portalType === 'supplier') {
      if (!regSupplierName || !regSupEmail || !regSupPassword) {
        alert('Please fill in required supplier details.');
        return;
      }
      registerSupplier({
        name: regSupplierName,
        contactPerson: regContactPerson,
        email: regSupEmail,
        phone: regSupPhone,
        address: regAddress,
        serviceRadiusKm: regRadius
      });
      setNotification(`Wholesale Supplier "${regSupplierName}" registered successfully`);
      setTimeout(() => {
        navigate('/supplier');
      }, 800);
    } else {
      if (!regStoreName || !regEmail || !regPassword) {
        alert('Please fill in required store details.');
        return;
      }
      login(regEmail, regPassword);
      switchRole('retailer');
      setNotification(`Store "${regStoreName}" registered successfully`);
      setTimeout(() => {
        navigate('/');
      }, 800);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-center">
        {/* Left Side: Brand Value Proposition */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-md bg-emerald-800 text-white flex items-center justify-center shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Samooh
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                B2B Wholesale Procurement Platform
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold leading-tight text-slate-900 dark:text-white">
              Collective procurement for Kirana stores and wholesale distributors.
            </h2>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Sign in to manage aggregated demand pools, configure supplier commercial terms, validate MOQ requirements, and optimize freight logistics.
            </p>
          </div>

          {/* Value Badges */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>Direct wholesale supplier pricing & tier discounts</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>Automated freight consolidation & cluster planning</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>Itemized procurement invoices and transparent margins</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-6 shadow-sm">
          {/* Top Level Role Selector: Retailer vs Supplier */}
          <div className="grid grid-cols-2 p-1 rounded-md bg-slate-100 dark:bg-slate-900 mb-4 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { setPortalType('retailer'); setIsRegister(false); }}
              className={`py-1.5 px-3 rounded text-xs font-medium transition flex items-center justify-center space-x-1.5 ${
                portalType === 'retailer'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Kirana Retailer</span>
            </button>
            <button
              type="button"
              onClick={() => { setPortalType('supplier'); setIsRegister(false); }}
              className={`py-1.5 px-3 rounded text-xs font-medium transition flex items-center justify-center space-x-1.5 ${
                portalType === 'supplier'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Wholesale Supplier</span>
            </button>
          </div>

          {/* Sub Tabs: Sign In vs Register */}
          <div className="flex items-center justify-between p-1 rounded-md bg-slate-100 dark:bg-slate-900/60 mb-5">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-1 rounded text-xs font-medium transition ${
                !isRegister
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-1 rounded text-xs font-medium transition ${
                isRegister
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              {portalType === 'supplier' ? 'Register Supplier' : 'Register Store'}
            </button>
          </div>

          {/* Notification Banner */}
          {notification && (
            <div className="mb-4 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {/* Auth Error Banner */}
          {authError && (
            <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{authError}</span>
              </div>
            </div>
          )}

          {/* VIEW A: SUPPLIER PORTAL LOGIN */}
          {portalType === 'supplier' && !isRegister && (
            <div className="space-y-4">
              {/* GOOGLE LOGIN BUTTON FOR SUPPLIERS */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-2.5 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-sm transition flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 text-emerald-800 animate-spin" />
                    <span>Signing in with Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* OR Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t w-full border-slate-200 dark:border-slate-700" />
                <span className="px-2 text-[10px] uppercase font-medium bg-white dark:bg-slate-800 text-slate-400 absolute">
                  Or supplier credentials
                </span>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
                    Supplier Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="deccan@samooh.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-9 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
                >
                  <span>Sign In to Supplier Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Quick Supplier Accounts */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[11px] font-medium text-slate-500 block">
                  Quick Access Hub Accounts:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(DEMO_SUPPLIERS).map(([key, sup]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleQuickSupplierSelect(key)}
                      className="text-xs px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                    >
                      {sup.name.split(' ')[0]} Hub
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW B: SUPPLIER REGISTRATION */}
          {portalType === 'supplier' && isRegister && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Company / Business Name</label>
                <input
                  required
                  placeholder="e.g. Hyderabad Agro Wholesale Complex"
                  value={regSupplierName}
                  onChange={(e) => setRegSupplierName(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Contact Person</label>
                  <input
                    required
                    placeholder="Suresh Kumar"
                    value={regContactPerson}
                    onChange={(e) => setRegContactPerson(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Contact Phone</label>
                  <input
                    placeholder="+91 98480 12345"
                    value={regSupPhone}
                    onChange={(e) => setRegSupPhone(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Business Email</label>
                <input
                  type="email"
                  required
                  placeholder="contact@wholesalehub.in"
                  value={regSupEmail}
                  onChange={(e) => setRegSupEmail(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Warehouse Address</label>
                  <input
                    placeholder="Kukatpally Phase 2, Hyderabad"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Coverage Radius (km)</label>
                  <input
                    type="number"
                    value={regRadius}
                    onChange={(e) => setRegRadius(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Create secure password"
                  value={regSupPassword}
                  onChange={(e) => setRegSupPassword(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
              >
                <span>Register as Wholesale Supplier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* VIEW C: RETAILER LOGIN */}
          {portalType === 'retailer' && !isRegister && (
            <div className="space-y-4">
              {/* GOOGLE LOGIN BUTTON */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-2.5 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-sm transition flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 text-emerald-800 animate-spin" />
                    <span>Signing in with Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* OR Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t w-full border-slate-200 dark:border-slate-700" />
                <span className="px-2 text-[10px] uppercase font-medium bg-white dark:bg-slate-800 text-slate-400 absolute">
                  Or store credentials
                </span>
              </div>

              {/* Standard Login Form */}
              <form onSubmit={handleEmailLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
                    Store Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="lakshmi@samooh.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-9 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
                >
                  <span>Sign In to Samooh</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Quick Store Selector */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[11px] font-medium text-slate-500 block">
                  Quick Access Store Accounts:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(DEMO_USERS).map((key) => {
                    const u = DEMO_USERS[key];
                    const isActive = user?.email === u.email;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleQuickPersonaSelect(key)}
                        className={`text-xs px-2.5 py-1 rounded border transition ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {u.isGoogle ? 'Google Account' : u.storeName.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* VIEW D: RETAILER REGISTRATION */}
          {portalType === 'retailer' && isRegister && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Store Name
                </label>
                <div className="relative">
                  <Store className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Sri Venkateswara Super Mart"
                    value={regStoreName}
                    onChange={(e) => setRegStoreName(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Owner Name
                </label>
                <input
                  type="text"
                  placeholder="K. Raghunath"
                  value={regOwnerName}
                  onChange={(e) => setRegOwnerName(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="owner@kirana.in"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Create password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
              >
                <span>Register Store</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
