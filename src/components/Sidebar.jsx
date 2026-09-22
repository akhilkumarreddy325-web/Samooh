import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Sparkles, Store, LineChart, Layers, 
  ShieldCheck, ShoppingBag, FileText, PackageCheck, X, 
  Truck, Building2, Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar({ mobileOpen = false, onCloseMobile }) {
  const { theme, t, userRole, currentSupplier } = useApp();
  const location = useLocation();
  const isSupplier = userRole === 'supplier' || location.pathname.startsWith('/supplier');

  // Retailer Navigation Items
  const retailerNavItems = [
    { labelKey: 'dashboard', path: '/', icon: LayoutDashboard },
    { labelKey: 'opportunities', path: '/opportunities', icon: Sparkles, badge: 'AI' },
    { labelKey: 'customDemand', path: '/builder', icon: ShoppingBag, badge: 'NEW' },
    { labelKey: 'previousOrdersNav', path: '/orders', icon: PackageCheck },
    { labelKey: 'savingsBill', path: '/invoice', icon: FileText },
    { labelKey: 'insights', path: '/insights', icon: Store },
    { labelKey: 'impact', path: '/impact', icon: LineChart },
  ];

  // Supplier Portal Navigation Items
  const supplierNavItems = [
    { labelKey: 'supplierDashboard', path: '/supplier', icon: LayoutDashboard },
    { labelKey: 'supplierOrders', path: '/supplier/orders', icon: PackageCheck, badge: 'LIVE' },
    { labelKey: 'supplierProducts', path: '/supplier/products', icon: Tag },
    { labelKey: 'supplierPricing', path: '/supplier/pricing', icon: FileText, badge: 'MOQ' },
    { labelKey: 'supplierAnalytics', path: '/supplier/analytics', icon: LineChart },
    { labelKey: 'supplierProfile', path: '/supplier/profile', icon: Building2 },
  ];

  const currentNavItems = isSupplier ? supplierNavItems : retailerNavItems;

  const sidebarContent = (
    <aside className={`w-64 border-r flex flex-col justify-between p-4 flex-shrink-0 min-h-screen transition-colors duration-300 ${
      theme === 'light'
        ? 'bg-white/95 border-slate-200/80 backdrop-blur-xl shadow-[4px_0_24px_rgba(0,0,0,0.02)]'
        : 'bg-[#0B1020] border-slate-800/80 text-white'
    }`}>
      <div>
        {/* Brand Logo Header & Mobile Close */}
        <div className="flex items-center justify-between px-3 py-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl p-0.5 shadow-md flex items-center justify-center ${
              isSupplier
                ? 'bg-gradient-to-tr from-amber-500 via-orange-600 to-rose-500'
                : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500'
            }`}>
              <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${
                theme === 'light' ? 'bg-white' : 'bg-[#0B1020]'
              }`}>
                {isSupplier ? (
                  <Truck className="w-5 h-5 text-amber-500" />
                ) : (
                  <Layers className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </div>
            <div>
              <h1 className={`text-xl font-extrabold tracking-tight flex items-center ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                {t('brandName')}{' '}
                <span className={`text-[10px] ml-1.5 px-1.5 py-0.5 rounded font-black tracking-wide ${
                  isSupplier
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    : 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20'
                }`}>
                  {isSupplier ? 'SUPPLIER' : t('brandBadge')}
                </span>
              </h1>
              <p className={`text-[10px] font-medium truncate max-w-[140px] ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {isSupplier ? (currentSupplier?.name || 'Wholesale Portal') : t('brandSubtitle')}
              </p>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          <div className={`px-3 text-[10px] font-bold uppercase tracking-wider mb-2 ${
            theme === 'light' ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {isSupplier ? t('supplierPortal') : t('mainPlatform')}
          </div>
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/' || item.path === '/supplier'}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? isSupplier
                        ? theme === 'light'
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-sm font-bold'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm font-bold'
                        : theme === 'light'
                          ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-sm font-bold'
                          : 'bg-accentBlue/10 text-accentBlue border border-accentBlue/20 shadow-glow-blue font-bold'
                      : theme === 'light'
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{t(item.labelKey)}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                    isSupplier
                      ? 'bg-amber-500/15 text-amber-600 border-amber-500/25'
                      : theme === 'light'
                        ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                        : 'bg-accentPurple/20 text-accentPurple border border-accentPurple/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer Card */}
      <div className={`p-3.5 rounded-xl border text-xs glass-panel ${
        theme === 'light' ? 'bg-white/90 border-slate-200' : 'bg-[#131A2A] border-slate-800'
      }`}>
        <div className="flex items-center space-x-2 font-semibold mb-1">
          <ShieldCheck className={`w-4 h-4 ${isSupplier ? 'text-amber-500' : 'text-emerald-500'}`} />
          <span className={isSupplier ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
            {isSupplier ? 'Wholesale Supply Grid' : t('engineLive')}
          </span>
        </div>
        <p className={`text-[11px] leading-tight ${
          theme === 'light' ? 'text-slate-500' : 'text-slate-400'
        }`}>
          {isSupplier 
            ? `Radius ${currentSupplier?.service_radius_km || currentSupplier?.serviceRadiusKm || 50} km • Active Catalog`
            : `${t('retailersActive')} • Verified Network`}
        </p>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block">
        {sidebarContent}
      </div>

      {/* Mobile Slide-Over Drawer Navigation */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300"
            onClick={onCloseMobile}
          />
          {/* Drawer Sidebar */}
          <div className="relative flex-1 max-w-[280px] w-full h-full shadow-2xl z-50 overflow-y-auto">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
