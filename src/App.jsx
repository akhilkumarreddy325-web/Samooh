import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';

// Route-based code-splitting for instant initial page render
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Opportunities = lazy(() => import('./pages/Opportunities'));
const Insights = lazy(() => import('./pages/Insights'));
const Impact = lazy(() => import('./pages/Impact'));
const CustomDemandBuilder = lazy(() => import('./pages/CustomDemandBuilder'));
const SavingsBill = lazy(() => import('./pages/SavingsBill'));
const OrderProcessing = lazy(() => import('./pages/OrderProcessing'));
const Login = lazy(() => import('./pages/Login'));
const PreviousOrders = lazy(() => import('./pages/PreviousOrders'));

function PageLoader() {
  const { theme } = useApp();
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className={`text-xs font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
          Loading Samooh...
        </span>
      </div>
    </div>
  );
}

function MainLayout() {
  const { theme } = useApp();
  const location = useLocation();
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Standalone Full-Screen Login View
  if (location.pathname === '/login') {
    return (
      <div className={`min-h-screen font-sans transition-colors duration-300 ${
        theme === 'light'
          ? 'bg-slate-100/90 text-slate-900'
          : 'bg-[#0B1020] text-slate-100'
      }`}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </Suspense>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-300 ${
      theme === 'light'
        ? 'bg-slate-100/90 text-slate-900'
        : 'bg-[#0B1020] text-slate-100'
    }`}>
      {/* Left Sidebar Navigation */}
      <Sidebar 
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav 
          isLiveApi={isLiveApi}
          onToggleApi={() => setIsLiveApi(!isLiveApi)}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/builder" element={<CustomDemandBuilder />} />
              <Route path="/orders" element={<PreviousOrders />} />
              <Route path="/processing" element={<OrderProcessing />} />
              <Route path="/invoice" element={<SavingsBill />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/impact" element={<Impact />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </AppProvider>
  );
}
