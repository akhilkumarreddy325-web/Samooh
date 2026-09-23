import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { 
  getUserProfile, 
  getSupplierProfile,
  initializeUserProfile, 
  saveRetailerOnboarding, 
  saveSupplierOnboarding, 
  signOutUser, 
  handleRedirectResult 
} from '../services/authService';
import { formatINR } from '../utils/currency';
import { SAMPLE_WAREHOUSE } from '../data/sampleNetworkLocations';
import translations, { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, getTranslation } from '../i18n';


export const DEMO_USERS = {
  google_partner: {
    id: 'usr_google_01',
    storeName: 'Google Partner Kirana Store',
    ownerName: 'Google Merchant',
    email: 'google.user@gmail.com',
    password: 'google123',
    clusterHub: 'Hyderabad Tech Corridor Cluster #1',
    address: 'Door 101, IT Park Corridor, Gachibowli, Hyderabad (500032)',
    monthlyBudget: '₹3,20,000',
    totalSaved: '₹54,300',
    rating: 4.95,
    avatar: 'https://lh3.googleusercontent.com/a/default-user',
    isGoogle: true
  },
  sri_lakshmi: {
    id: 'usr_001',
    storeName: 'Sri Lakshmi Kirana & General Store',
    ownerName: 'Srinivas Rao',
    email: 'lakshmi@samooh.in',
    password: 'samooh123',
    clusterHub: 'Hyderabad South-West Wholesale Cluster #4',
    address: 'Door No 42, Road No 12, Banjara Hills, Hyderabad (500034)',
    monthlyBudget: '₹2,50,000',
    totalSaved: '₹42,850',
    rating: 4.9,
    avatar: null,
    isGoogle: false
  },
  balaji: {
    id: 'usr_002',
    storeName: 'Balaji Super Market',
    ownerName: 'Venkat Reddy',
    email: 'balaji@samooh.in',
    password: 'balaji123',
    clusterHub: 'Hyderabad Central Hub #2',
    address: 'Plot 18, Commercial Belt, Kukatpally, Hyderabad (500072)',
    monthlyBudget: '₹4,10,000',
    totalSaved: '₹68,400',
    rating: 4.8,
    avatar: null,
    isGoogle: false
  },
  venkatesh: {
    id: 'usr_003',
    storeName: 'Venkateshwara Traders',
    ownerName: 'K. Venkatesh',
    email: 'venkatesh@samooh.in',
    password: 'venky123',
    clusterHub: 'Hyderabad East Wholesale Cluster #7',
    address: 'Shop 5, Main Market Road, Uppal, Hyderabad (500039)',
    monthlyBudget: '₹1,85,000',
    totalSaved: '₹29,120',
    rating: 4.7,
    avatar: null,
    isGoogle: false
  }
};

export const DEMO_SUPPLIERS = {
  deccan: {
    id: 'sup_01',
    name: 'Deccan Wholesale Hub — Medchal',
    contactPerson: 'Rajesh Agarwal',
    email: 'deccan@samooh.in',
    phone: '+91 98480 12345',
    address: SAMPLE_WAREHOUSE.address,
    location: SAMPLE_WAREHOUSE.locality,
    city: SAMPLE_WAREHOUSE.city,
    state: SAMPLE_WAREHOUSE.state,
    pincode: SAMPLE_WAREHOUSE.pincode,
    businessLocation: {
      latitude: SAMPLE_WAREHOUSE.latitude,
      longitude: SAMPLE_WAREHOUSE.longitude,
      locality: SAMPLE_WAREHOUSE.locality,
      city: SAMPLE_WAREHOUSE.city,
      state: SAMPLE_WAREHOUSE.state,
      address: SAMPLE_WAREHOUSE.address,
      pincode: SAMPLE_WAREHOUSE.pincode
    },
    categories: ['Grains'],
    serviceRadiusKm: 60.0,
    leadTimeDays: 2,
    rating: 4.8,
    status: 'ACTIVE'
  },
  telangana_oil: {
    id: 'sup_02',
    name: 'Telangana Oil Mills & Refineries',
    contactPerson: 'K. Sudhakar Rao',
    email: 'telanganaoil@samooh.in',
    phone: '+91 98490 23456',
    address: 'Shed 12, Kattedan Industrial Estate, Hyderabad (500077)',
    location: 'Kattedan Industrial Estate',
    categories: ['Oils'],
    serviceRadiusKm: 50.0,
    leadTimeDays: 1,
    rating: 4.7,
    status: 'ACTIVE'
  },
  spices: {
    id: 'sup_03',
    name: 'South India Spice & Agri Hub',
    contactPerson: 'M. Venkatesh',
    email: 'spices@samooh.in',
    phone: '+91 98491 34567',
    address: 'Gate 3, Malakpet Wholesale Market, Hyderabad (500036)',
    location: 'Malakpet Wholesale Market',
    categories: ['Spices'],
    serviceRadiusKm: 45.0,
    leadTimeDays: 3,
    rating: 4.6,
    status: 'ACTIVE'
  },
  fmcg: {
    id: 'sup_04',
    name: 'FMCG Direct Distribution Ltd',
    contactPerson: 'Anand Sharma',
    email: 'fmcg@samooh.in',
    phone: '+91 98492 45678',
    address: 'Sector 4, Cherlapally Industrial Park, Hyderabad (500051)',
    location: 'Cherlapally Industrial Park',
    categories: ['Beverages', 'Personal Care'],
    serviceRadiusKm: 70.0,
    leadTimeDays: 1,
    rating: 4.9,
    status: 'ACTIVE'
  },
  southern_agro: {
    id: 'sup_05',
    name: 'Southern Agro Mills & Wholesale',
    contactPerson: 'P. Nageswara Rao',
    email: 'southernagro@samooh.in',
    phone: '+91 98493 56789',
    address: 'Medchal Wholesale Agro Complex, Hyderabad (501401)',
    location: 'Medchal Agro Complex',
    categories: ['Grains', 'Oils'],
    serviceRadiusKm: 25.0,
    leadTimeDays: 2,
    rating: 4.5,
    status: 'ACTIVE'
  }
};

export const DEFAULT_ORDERS = [
  {
    id: 'ord_901',
    invoiceNo: 'INV-2026-7712',
    date: '10 Aug 2026',
    userId: 'usr_001',
    storeName: 'Sri Lakshmi Kirana & General Store',
    clusterHub: 'Hyderabad South-West Wholesale Cluster #4',
    status: 'Delivered',
    statusColor: 'emerald',
    itemsCount: 18,
    totalRetailCost: 28400,
    totalWholesaleCost: 23100,
    totalSavings: 5300,
    overallSavingsPct: '18.6',
    finalPayable: 24255,
    items: [
      { id: 'prod_001', name: 'Sona Masoori Rice (25kg Bag)', qty: 8, retailPrice: 1450, wholesalePrice: 1180, lineRetail: 11600, lineWholesale: 9440, lineSavings: 2160, category: 'Grains & Pulses' },
      { id: 'prod_006', name: 'Freedom Sunflower Oil (15L Tin)', qty: 4, retailPrice: 1950, wholesalePrice: 1620, lineRetail: 7800, lineWholesale: 6480, lineSavings: 1320, category: 'Oils & Dairy' },
      { id: 'prod_010', name: 'Guntur Red Chilli Powder (5kg Pack)', qty: 6, retailPrice: 1500, wholesalePrice: 1180, lineRetail: 9000, lineWholesale: 7080, lineSavings: 1920, category: 'Spices & Condiments' }
    ]
  },
  {
    id: 'ord_902',
    invoiceNo: 'INV-2026-8842',
    date: '13 Aug 2026',
    userId: 'usr_google_01',
    storeName: 'Google Partner Kirana Store',
    clusterHub: 'Hyderabad Tech Corridor Cluster #1',
    status: 'In Transit',
    statusColor: 'blue',
    itemsCount: 22,
    totalRetailCost: 39650,
    totalWholesaleCost: 32210,
    totalSavings: 7440,
    overallSavingsPct: '18.8',
    finalPayable: 33821,
    items: [
      { id: 'prod_001', name: 'Sona Masoori Rice (25kg Bag)', qty: 10, retailPrice: 1450, wholesalePrice: 1180, lineRetail: 14500, lineWholesale: 11800, lineSavings: 2700, category: 'Grains & Pulses' },
      { id: 'prod_006', name: 'Freedom Sunflower Oil (15L Tin)', qty: 5, retailPrice: 1950, wholesalePrice: 1620, lineRetail: 9750, lineWholesale: 8100, lineSavings: 1650, category: 'Oils & Dairy' },
      { id: 'prod_010', name: 'Guntur Red Chilli Powder (5kg Pack)', qty: 4, retailPrice: 1750, wholesalePrice: 1390, lineRetail: 7000, lineWholesale: 5560, lineSavings: 1440, category: 'Spices & Condiments' },
      { id: 'prod_018', name: 'Surf Excel Easy Wash Carton (1kg x 20)', qty: 3, retailPrice: 2800, wholesalePrice: 2250, lineRetail: 8400, lineWholesale: 6750, lineSavings: 1650, category: 'Personal Care' }
    ]
  },
  {
    id: 'ord_903',
    invoiceNo: 'INV-2026-6410',
    date: '04 Aug 2026',
    userId: 'usr_002',
    storeName: 'Balaji Super Market',
    clusterHub: 'Hyderabad Central Hub #2',
    status: 'Delivered',
    statusColor: 'emerald',
    itemsCount: 35,
    totalRetailCost: 64200,
    totalWholesaleCost: 51800,
    totalSavings: 12400,
    overallSavingsPct: '19.3',
    finalPayable: 54390,
    items: [
      { id: 'prod_014', name: 'Red Label Tea Master Carton (1kg x 12)', qty: 5, retailPrice: 4800, wholesalePrice: 3950, lineRetail: 24000, lineWholesale: 19750, lineSavings: 4250, category: 'Beverages & Snacks' },
      { id: 'prod_001', name: 'Sona Masoori Rice (25kg Bag)', qty: 20, retailPrice: 1450, wholesalePrice: 1180, lineRetail: 29000, lineWholesale: 23600, lineSavings: 5400, category: 'Grains & Pulses' },
      { id: 'prod_006', name: 'Freedom Sunflower Oil (15L Tin)', qty: 10, retailPrice: 1120, wholesalePrice: 845, lineRetail: 11200, lineWholesale: 8450, lineSavings: 2750, category: 'Oils & Dairy' }
    ]
  }
];

const AppContext = createContext();

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('samooh_theme') || 'light');
  const [lang, setLang] = useState(() => localStorage.getItem('samooh_lang') || 'en');
  const [activeInvoice, setActiveInvoice] = useState(null);
  
  // Real Firebase Auth & User Profile State
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(() => {
    return localStorage.getItem('samooh_onboarding_completed') === 'true';
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('samooh_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEMO_USERS.sri_lakshmi;
      }
    }
    return DEMO_USERS.sri_lakshmi;
  });

  const [orderHistory, setOrderHistory] = useState(() => {
    const saved = localStorage.getItem('samooh_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_ORDERS;
      }
    }
    return DEFAULT_ORDERS;
  });

  useEffect(() => {
    localStorage.setItem('samooh_orders', JSON.stringify(orderHistory));
  }, [orderHistory]);

  useEffect(() => {
    localStorage.setItem('samooh_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('samooh_lang', lang);
  }, [lang]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('samooh_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('samooh_user');
    }
  }, [user]);

  const addOrderToHistory = (newInvoice) => {
    const orderObj = {
      id: `ord_${Date.now()}`,
      invoiceNo: newInvoice.invoiceNo || `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: newInvoice.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      userId: user?.id || 'usr_001',
      storeName: newInvoice.storeName || user?.storeName || 'Sri Lakshmi Kirana',
      clusterHub: newInvoice.clusterHub || user?.clusterHub || 'Hyderabad Cluster',
      status: 'In Transit',
      statusColor: 'blue',
      itemsCount: newInvoice.totalItemsCount || (newInvoice.items ? newInvoice.items.length : 1),
      totalRetailCost: newInvoice.totalRetailCost || 0,
      totalWholesaleCost: newInvoice.totalWholesaleCost || 0,
      totalSavings: newInvoice.totalSavings || 0,
      overallSavingsPct: newInvoice.overallSavingsPct || '18.5',
      finalPayable: newInvoice.finalPayable || 0,
      items: newInvoice.items || []
    };

    setOrderHistory(prev => [orderObj, ...prev]);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key) => {
    return getTranslation(lang, key);
  };

  // Listen to Firebase Auth state changes
  useEffect(() => {
    // 1. Check for returning redirect flow (mobile / popup-blocked fallback)
    handleRedirectResult().then((res) => {
      if (res.success && res.user) {
        console.info('[Samooh Auth] Redirect sign-in completed for:', res.user.email);
      }
    }).catch(err => console.warn('[Samooh Auth] Redirect check error:', err));

    // 2. Observe real-time Firebase Auth user state
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setIsAuthLoading(true);
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          const profile = await getUserProfile(fbUser.uid);
          if (profile && profile.onboardingCompleted) {
            setUserProfile(profile);
            setOnboardingCompleted(true);
            localStorage.setItem('samooh_onboarding_completed', 'true');

            const role = profile.role || 'retailer';
            setUserRole(role);
            localStorage.setItem('samooh_role', role);

            if (role === 'supplier') {
              let supDoc = null;
              try {
                supDoc = await getSupplierProfile(fbUser.uid);
              } catch (_) {}
              const supObj = {
                id: fbUser.uid,
                name: supDoc?.name || supDoc?.businessName || profile.name || profile.businessName || fbUser.displayName || 'Wholesale Supplier',
                contactPerson: supDoc?.contactPerson || profile.contactPerson || fbUser.displayName || 'Supplier Partner',
                email: fbUser.email,
                phone: supDoc?.phone || supDoc?.contactPhone || profile.phone || '+91 98480 12345',
                city: supDoc?.city || profile.city || 'Hyderabad',
                location: supDoc?.location || profile.location || 'Hyderabad',
                serviceRadiusKm: supDoc?.serviceRadiusKm || profile.serviceRadiusKm || 50,
                businessLocation: supDoc?.businessLocation || profile.businessLocation || null,
                status: 'ACTIVE'
              };
              setCurrentSupplier(supObj);
            } else {
              const retObj = {
                id: fbUser.uid,
                storeName: profile.storeName || profile.shopName || `${fbUser.displayName || 'Store'} Kirana`,
                ownerName: profile.ownerName || fbUser.displayName || 'Store Owner',
                email: fbUser.email,
                city: profile.city || 'Hyderabad',
                clusterHub: profile.clusterHub || 'Hyderabad Cluster #1',
                address: profile.address || 'Hyderabad',
                monthlyBudget: formatINR(profile.procurement_profile?.maximum_procurement_value || 250000),
                totalSaved: formatINR(0),
                rating: 4.9,
                avatar: fbUser.photoURL || null,
                isGoogle: true
              };
              setUser(retObj);
            }
          } else {
            // New user or incomplete onboarding profile
            setUserProfile(profile || null);
            setOnboardingCompleted(false);
            localStorage.removeItem('samooh_onboarding_completed');
          }
        } catch (err) {
          console.warn('[Samooh Auth] Profile hydration error:', err);
        }
      } else {
        setFirebaseUser(null);
        setUserProfile(null);
        // Do not force clearing demo users if not logged into Firebase, but onboarding is false for non-profiles
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const completeRetailerOnboarding = async (formData) => {
    if (!auth.currentUser && auth.authStateReady) {
      await auth.authStateReady();
    }
    const uid = auth.currentUser?.uid || firebaseUser?.uid;
    if (!uid) {
      throw new Error('You must be signed in with your account to complete onboarding.');
    }
    const result = await saveRetailerOnboarding(uid, formData);
    
    // Update local state
    const updatedUser = {
      id: uid,
      storeName: formData.shopName || formData.storeName,
      ownerName: formData.ownerName,
      email: auth.currentUser?.email || firebaseUser?.email || user?.email || 'owner@kirana.in',
      city: formData.city || '',
      state: formData.state || '',
      clusterHub: `${formData.city || 'Regional'} Kirana Cluster #1`,
      address: formData.address || `${formData.area || ''}, ${formData.city || ''}`,
      pincode: formData.pincode || '',
      businessLocation: formData.businessLocation || null,
      monthlyBudget: formatINR(formData.maxProcurementBudget || 250000),
      totalSaved: formatINR(0),
      rating: 4.9,
      avatar: auth.currentUser?.photoURL || firebaseUser?.photoURL || null,
      isGoogle: !!(auth.currentUser || firebaseUser)
    };
    
    setUser(updatedUser);
    setUserRole('retailer');
    setOnboardingCompleted(true);
    localStorage.setItem('samooh_user', JSON.stringify(updatedUser));
    localStorage.setItem('samooh_role', 'retailer');
    localStorage.setItem('samooh_onboarding_completed', 'true');
    return result;
  };

  const completeSupplierOnboarding = async (formData) => {
    if (!auth.currentUser && auth.authStateReady) {
      await auth.authStateReady();
    }
    const uid = auth.currentUser?.uid || firebaseUser?.uid;
    if (!uid) {
      throw new Error('You must be signed in with your account to complete onboarding.');
    }
    const result = await saveSupplierOnboarding(uid, formData);
    
    // Update local supplier state
    const updatedSupplier = {
      id: uid,
      name: formData.businessName,
      contactPerson: formData.contactPerson,
      email: auth.currentUser?.email || firebaseUser?.email || currentSupplier?.email || 'supplier@wholesale.in',
      phone: formData.contactPhone || '+91 98480 12345',
      address: formData.warehouseAddress || formData.address || `${formData.area || ''}, ${formData.city || ''}`,
      city: formData.city || '',
      state: formData.state || '',
      location: formData.area || formData.city || '',
      pincode: formData.pincode || '',
      businessLocation: formData.businessLocation || null,
      categories: Array.isArray(formData.productsSupplied) ? formData.productsSupplied : [],
      serviceRadiusKm: Number(formData.serviceRadiusKm || 50),
      leadTimeDays: Number(formData.leadTimeDays || 2),
      rating: 4.8,
      status: 'ACTIVE'
    };

    setCurrentSupplier(updatedSupplier);
    setUserRole('supplier');
    setOnboardingCompleted(true);
    localStorage.setItem('samooh_supplier', JSON.stringify(updatedSupplier));
    localStorage.setItem('samooh_role', 'supplier');
    localStorage.setItem('samooh_onboarding_completed', 'true');
    return result;
  };

  const loginWithGoogle = (providedEmail = null) => {
    const rawEmail = (providedEmail || 'akhilkumarreddy325@gmail.com').trim().toLowerCase();
    const email = rawEmail.includes('@') ? rawEmail : `${rawEmail}@gmail.com`;
    const namePart = email.split('@')[0];
    const formattedName = namePart
      .split(/[\._\-]/)
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');

    const googleUser = {
      id: `usr_google_${Date.now()}`,
      storeName: `${formattedName} Kirana & General Store`,
      ownerName: formattedName || 'Google Kirana Partner',
      email: email,
      password: 'google_authenticated',
      clusterHub: 'Hyderabad Tech Corridor Cluster #1',
      address: 'Door 101, Tech Corridor, Gachibowli, Hyderabad (500032)',
      monthlyBudget: '₹3,50,000',
      totalSaved: '₹58,400',
      rating: 4.95,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${namePart}`,
      isGoogle: true
    };
    setUser(googleUser);
    localStorage.setItem('samooh_user', JSON.stringify(googleUser));
    return googleUser;
  };

  const login = (email, password) => {
    const found = Object.values(DEMO_USERS).find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
      setUser(found);
      localStorage.setItem('samooh_user', JSON.stringify(found));
      return { success: true, user: found };
    }
    // Fallback: create dynamic session for any email
    const isG = email.toLowerCase().endsWith('@gmail.com');
    const dynamicUser = {
      id: `usr_${Date.now()}`,
      storeName: email.split('@')[0].toUpperCase() + ' Kirana Store',
      ownerName: email.split('@')[0],
      email: email,
      password: password,
      clusterHub: 'Hyderabad South-West Cluster #4',
      address: 'Plot 12, Main Road, Hyderabad',
      monthlyBudget: '₹2,00,000',
      totalSaved: '₹15,000',
      rating: 4.8,
      avatar: isG ? `https://api.dicebear.com/7.x/bottts/svg?seed=${email.split('@')[0]}` : null,
      isGoogle: isG
    };
    setUser(dynamicUser);
    localStorage.setItem('samooh_user', JSON.stringify(dynamicUser));
    return { success: true, user: dynamicUser };
  };

  const logout = async () => {
    await signOutUser();
    setFirebaseUser(null);
    setUserProfile(null);
    setOnboardingCompleted(false);
    localStorage.removeItem('samooh_onboarding_completed');
    setUser(DEMO_USERS.sri_lakshmi);
  };

  const switchUser = (userKey) => {
    if (DEMO_USERS[userKey]) {
      setUser(DEMO_USERS[userKey]);
    }
  };

  // ==========================================
  // Supplier Portal State & Role Management
  // ==========================================
  const [userRole, setUserRole] = useState(() => localStorage.getItem('samooh_role') || 'retailer');

  const [currentSupplier, setCurrentSupplier] = useState(() => {
    const saved = localStorage.getItem('samooh_supplier');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEMO_SUPPLIERS.deccan;
      }
    }
    return DEMO_SUPPLIERS.deccan;
  });

  useEffect(() => {
    localStorage.setItem('samooh_role', userRole);
  }, [userRole]);

  useEffect(() => {
    if (currentSupplier) {
      localStorage.setItem('samooh_supplier', JSON.stringify(currentSupplier));
    }
  }, [currentSupplier]);

  const switchRole = (newRole) => {
    const role = (newRole === 'supplier') ? 'supplier' : 'retailer';
    setUserRole(role);
    localStorage.setItem('samooh_role', role);
  };

  const switchSupplier = (supKey) => {
    if (DEMO_SUPPLIERS[supKey]) {
      setCurrentSupplier(DEMO_SUPPLIERS[supKey]);
      setUserRole('supplier');
      localStorage.setItem('samooh_role', 'supplier');
    }
  };

  const loginSupplier = (email, password) => {
    const found = Object.values(DEMO_SUPPLIERS).find(
      s => s.email.toLowerCase() === email.toLowerCase()
    );
    if (found) {
      setCurrentSupplier(found);
      setUserRole('supplier');
      return { success: true, supplier: found };
    }
    // Dynamic supplier session
    const dynSupplier = {
      id: `sup_${Date.now()}`,
      name: email.split('@')[0].toUpperCase() + ' Wholesale Hub',
      contactPerson: email.split('@')[0],
      email: email,
      phone: '+91 98480 99999',
      address: 'Hyderabad Wholesale Agro Terminal',
      location: 'Hyderabad',
      categories: ['Grains', 'Oils'],
      serviceRadiusKm: 50.0,
      leadTimeDays: 2,
      rating: 4.8,
      status: 'ACTIVE'
    };
    setCurrentSupplier(dynSupplier);
    setUserRole('supplier');
    return { success: true, supplier: dynSupplier };
  };

  const registerSupplier = (supData) => {
    const newSup = {
      id: `sup_${Date.now()}`,
      name: supData.name,
      contactPerson: supData.contactPerson || supData.name,
      email: supData.email,
      phone: supData.phone || '+91 98480 00000',
      address: supData.address || 'Hyderabad',
      location: supData.location || 'Hyderabad',
      categories: supData.categories || ['Grains'],
      serviceRadiusKm: parseFloat(supData.serviceRadiusKm || 50),
      leadTimeDays: parseInt(supData.leadTimeDays || 2),
      rating: 4.8,
      status: 'ACTIVE'
    };
    setCurrentSupplier(newSup);
    setUserRole('supplier');
    return { success: true, supplier: newSup };
  };

  return (
    <AppContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme, 
      lang, 
      setLang, 
      toggleLanguage, 
      supportedLanguages: SUPPORTED_LANGUAGES,
      t,
      activeInvoice,
      setActiveInvoice,
      user,
      setUser,
      orderHistory,
      addOrderToHistory,
      loginWithGoogle,
      login,
      logout,
      switchUser,
      // Firebase Auth & Onboarding state
      firebaseUser,
      userProfile,
      isAuthLoading,
      onboardingCompleted,
      setOnboardingCompleted,
      completeRetailerOnboarding,
      completeSupplierOnboarding,
      // Supplier Portal exports
      userRole,
      setUserRole,
      switchRole,
      currentSupplier,
      setCurrentSupplier,
      switchSupplier,
      loginSupplier,
      registerSupplier,
      demoSuppliers: DEMO_SUPPLIERS
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
