import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  writeBatch, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

/**
 * Executes a Promise with a strict timeout guard to prevent infinite loading.
 * @param {Promise} promise 
 * @param {number} ms 
 * @param {string} opName 
 * @returns {Promise}
 */
export function withTimeout(promise, ms = 6000, opName = 'Network operation') {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${opName} took longer than expected (${ms / 1000}s). Please check your internet connection and retry.`));
    }, ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Maps raw Firebase Auth and Firestore errors into clean, professional user-facing messages.
 */
export function mapAuthError(error) {
  if (!error) return 'An unknown error occurred during sign-in.';
  const code = error.code || '';
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was closed before completing. Please click Continue with Google to try again.';
    case 'auth/cancelled-popup-request':
      return 'The sign-in popup was cancelled. Please try again.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups or use redirect.';
    case 'auth/network-request-failed':
      return 'Unable to reach authentication service. Please check your network connection and retry.';
    case 'auth/unauthorized-domain':
      return 'This web domain is not yet authorized in Firebase Console (Authentication > Settings > Authorized Domains).';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email under a different sign-in provider.';
    case 'auth/operation-not-allowed':
      return 'Google Sign-In provider is not enabled in the Firebase Console.';
    case 'permission-denied':
      return 'Your session expired or the profile could not be saved. Please try signing in again.';
    case 'unavailable':
      return 'Database service is temporarily unavailable. Your information is preserved. Please click Retry.';
    default:
      return error.message || 'Authentication or profile sync could not be completed. Please try again.';
  }
}

/**
 * Signs in using Firebase Google OAuth with desktop popup and mobile/popup-blocked redirect fallback.
 */
export async function signInWithGoogle() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      success: true,
      user: result.user
    };
  } catch (err) {
    if (err.code === 'auth/popup-blocked' || (isMobile && err.code === 'auth/popup-closed-by-user')) {
      console.info('[Samooh Auth] Popup blocked or mobile, falling back to signInWithRedirect...');
      await signInWithRedirect(auth, googleProvider);
      return { success: false, redirecting: true };
    }
    return {
      success: false,
      error: mapAuthError(err),
      rawError: err
    };
  }
}

/**
 * Checks for any returning redirect result on app initialization.
 */
export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      return { success: true, user: result.user };
    }
    return { success: false, user: null };
  } catch (err) {
    console.warn('[Samooh Auth] Redirect result error:', err.message);
    return { success: false, error: mapAuthError(err), rawError: err };
  }
}

/**
 * Retrieves the user profile document from Firestore (`users/{uid}`) with timeout protection.
 */
export async function getUserProfile(uid) {
  if (!uid) return null;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await withTimeout(getDoc(userDocRef), 5000, 'Fetching user profile');
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (err) {
    console.warn(`[Samooh Auth] Error fetching user profile:`, err.message);
    return null;
  }
}

/**
 * Fetches existing supplier profile from `suppliers/{uid}`
 */
export async function getSupplierProfile(uid) {
  if (!uid) return null;
  try {
    const supDocRef = doc(db, 'suppliers', uid);
    const snap = await withTimeout(getDoc(supDocRef), 5000, 'Fetching supplier profile');
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (err) {
    console.warn(`[Samooh Auth] Error fetching supplier profile:`, err.message);
    return null;
  }
}

/**
 * Initializes or updates basic user document in `users/{uid}`.
 */
export async function initializeUserProfile(user, role = null) {
  if (!user || !user.uid) return null;
  const ref = doc(db, 'users', user.uid);
  const existing = await getUserProfile(user.uid);

  const profileData = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || user.email?.split('@')[0] || 'Samooh Partner',
    photoURL: user.photoURL || '',
    role: role || existing?.role || null,
    onboardingCompleted: existing?.onboardingCompleted || false,
    onboardingVersion: 1,
    updatedAt: new Date().toISOString()
  };

  if (!existing) {
    profileData.createdAt = new Date().toISOString();
  }

  try {
    await withTimeout(setDoc(ref, profileData, { merge: true }), 5000, 'User profile init');
  } catch (err) {
    console.warn('[Samooh Auth] Firestore user profile sync error:', err.message);
  }

  return { ...existing, ...profileData };
}

/**
 * Saves Retailer Onboarding data into `retailers/{uid}` and marks `users/{uid}` completed.
 * Guarantees atomic write and throws clear error if persistence fails.
 */
export async function saveRetailerOnboarding(uid, data) {
  // Ensure Firebase Auth state is ready
  if (!auth.currentUser && auth.authStateReady) {
    await auth.authStateReady();
  }
  const activeUid = auth.currentUser?.uid || uid;
  if (!activeUid) throw new Error('User ID is required to complete retailer setup.');

  const nowIso = new Date().toISOString();

  // 1. Structured Retailer Profile Document
  const retailerDoc = {
    id: activeUid,
    retailer_id: activeUid,
    user_id: activeUid,
    name: data.shopName || data.storeName || 'Kirana Store',
    storeName: data.shopName || data.storeName || 'Kirana Store',
    ownerName: data.ownerName || 'Store Owner',
    store_type: data.businessType || 'Kirana Store',
    businessSectorId: data.businessSectorId || 'grocery',
    selectedProductIds: Array.isArray(data.selectedProductIds) ? data.selectedProductIds : [],
    city: data.city || '',
    district: data.district || data.businessLocation?.district || '',
    state: data.state || '',
    area: data.area || '',
    address: data.address || `${data.area || ''}, ${data.city || ''}`,
    pincode: data.pincode || data.businessLocation?.pincode || '',
    businessLocation: data.businessLocation ? {
      address: data.address || data.businessLocation.address || '',
      area: data.area || data.businessLocation.area || data.city || '',
      city: data.city || data.businessLocation.city || '',
      district: data.district || data.businessLocation.district || '',
      state: data.state || data.businessLocation.state || '',
      pincode: data.pincode || data.businessLocation.pincode || '',
      latitude: Number(data.businessLocation.latitude),
      longitude: Number(data.businessLocation.longitude),
      source: data.businessLocation.source || 'onboarding'
    } : null,
    location: data.businessLocation ? {
      latitude: Number(data.businessLocation.latitude),
      longitude: Number(data.businessLocation.longitude),
      accuracy: Number(data.businessLocation.accuracy || 10),
      updatedAt: nowIso,
      sharingEnabled: Boolean(data.locationSharing?.sharingEnabled),
      source: data.businessLocation.source || 'onboarding'
    } : null,
    contact_phone: data.contactPhone || data.phone || '',
    yearsInBusiness: data.yearsInBusiness ? Number(data.yearsInBusiness) : null,
    approxShopSizeSqFt: data.shopSize ? Number(data.shopSize) : null,
    employeeCount: data.employeeCount ? Number(data.employeeCount) : null,
    
    // Step 2: Products Sold in Store
    products_sold: Array.isArray(data.productsSold) ? data.productsSold : [],

    // Step 3 & 4: Initial Demand Profile & Retailer Affordability (NOT supplier MOQ)
    procurement_profile: {
      business_sector_id: data.businessSectorId || 'grocery',
      selected_product_ids: Array.isArray(data.selectedProductIds) ? data.selectedProductIds : [],
      products_needed: Array.isArray(data.productsNeeded) ? data.productsNeeded.map(p => {
        const canonicalId = p.productId || p.canonical_product_id || p.id;
        return {
          productId: canonicalId,
          product_id: canonicalId,
          canonical_product_id: canonicalId,
          product_name: p.name || p.product_name,
          category: p.category || 'General Staples',
          typical_quantity: Number(p.typical_quantity || p.quantity || 0),
          unit: p.unit || 'kg',
          purchase_frequency: p.purchase_frequency || data.purchaseFrequency || 'Weekly',
          approx_budget: Number(p.approx_budget || p.budget || 0)
        };
      }) : [],
      purchase_frequency: data.purchaseFrequency || 'Weekly',
      preferred_delivery_radius_km: Number(data.deliveryRadiusKm || 5.0),
      maximum_procurement_value: Number(data.maxProcurementBudget || 25000),
      maximum_comfortable_quantity: Number(data.maxComfortableQuantity || 200),
      pooled_procurement_enabled: data.participateGroupProcurement !== false
    },

    onboarding_completed: true,
    onboarding_version: 1,
    created_at: nowIso,
    updated_at: nowIso
  };

  // 2. User Document Update
  const userDocUpdate = {
    role: 'retailer',
    onboardingCompleted: true,
    onboardingVersion: 1,
    storeName: retailerDoc.storeName,
    ownerName: retailerDoc.ownerName,
    city: retailerDoc.city,
    district: retailerDoc.district,
    state: retailerDoc.state,
    businessLocation: retailerDoc.businessLocation,
    updatedAt: nowIso
  };

  // Safe Batch Write with Timeout Guard
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'retailers', activeUid), retailerDoc, { merge: true });
    batch.set(doc(db, 'users', activeUid), userDocUpdate, { merge: true });
    await withTimeout(batch.commit(), 6000, 'Saving retailer profile');
  } catch (err) {
    console.error('[Samooh Auth] Firestore retailer persistence error:', {
      code: err.code,
      message: err.message,
      authUid: auth.currentUser?.uid,
      targetDoc: `retailers/${activeUid}`
    });
    throw new Error(mapAuthError(err));
  }

  return { retailer: retailerDoc, user: userDocUpdate };
}

/**
 * Saves Supplier Onboarding data into `suppliers/{uid}`, initializes catalog products,
 * and marks `users/{uid}` completed.
 * Guarantees atomic write and throws clear error if persistence fails.
 */
export async function saveSupplierOnboarding(uid, data) {
  // Ensure Firebase Auth state is ready
  if (!auth.currentUser && auth.authStateReady) {
    await auth.authStateReady();
  }
  const activeUid = auth.currentUser?.uid || uid;
  if (!activeUid) throw new Error('User ID is required to complete supplier setup.');

  const nowIso = new Date().toISOString();

  // 1. Structured Supplier Profile Document
  // 1. Structured Supplier Profile Document
  const supplierDoc = {
    id: activeUid,
    supplier_id: activeUid,
    user_id: activeUid,
    name: data.businessName || data.name || 'Wholesale Supplier',
    contactPerson: data.contactPerson || 'Wholesale Partner',
    business_type: data.businessType || 'Wholesaler',
    businessSectorId: data.businessSectorId || 'grocery',
    selectedProductIds: Array.isArray(data.selectedProductIds) ? data.selectedProductIds : [],
    city: data.city || '',
    state: data.state || '',
    location: data.area || data.city || '',
    address: data.warehouseAddress || data.address || `${data.area || ''}, ${data.city || ''}`,
    pincode: data.pincode || '',
    businessLocation: data.businessLocation || null,
    phone: data.contactPhone || data.phone || '',
    serviceRadiusKm: Number(data.serviceRadiusKm || 50.0),
    leadTimeDays: Number(data.leadTimeDays || 2),
    pickup_available: data.pickupAvailable !== false,
    distribution_area: data.distributionArea || data.city || '',
    categories: Array.isArray(data.productsSupplied) ? data.productsSupplied : [],
    status: 'ACTIVE',
    rating: 4.8,
    onboarding_completed: true,
    onboarding_version: 1,
    created_at: nowIso,
    updated_at: nowIso
  };

  // 2. User Document Update
  const userDocUpdate = {
    role: 'supplier',
    onboardingCompleted: true,
    onboardingVersion: 1,
    name: supplierDoc.name,
    contactPerson: supplierDoc.contactPerson,
    city: supplierDoc.city,
    state: supplierDoc.state,
    businessLocation: supplierDoc.businessLocation,
    updatedAt: nowIso
  };

  // 3. Prepare Supplier Wholesale Products & Tiers (Supplier controls MOQ & pricing)
  // Ensure each product has a supplier-scoped unique ID so it never collides with
  // another supplier's catalog items (which triggers Firestore permission-denied on update).
  const timestampSuffix = Date.now().toString().slice(-6);
  const productDocs = (data.configuredProducts || []).map((p, idx) => {
    const isOwnSupplierProdId = p.id && (p.id.startsWith(`prod_${activeUid.slice(0, 8)}_`) || p.id.startsWith(`prod_${activeUid}_`));
    const prodId = isOwnSupplierProdId ? p.id : `prod_${activeUid.slice(0, 8)}_${idx + 1}_${timestampSuffix}`;
    const canonicalId = p.productId || p.canonical_product_id || p.id;
    return {
      id: prodId,
      supplier_id: activeUid,
      supplierId: activeUid,
      productId: canonicalId,
      product_id: canonicalId,
      canonical_product_id: canonicalId,
      name: p.name || 'Wholesale Commodity',
      category: p.category || 'Grains & Staples',
      unit_of_measure: p.unit || 'kg',
      unit_weight_kg: Number(p.unit_weight_kg || 1.0),
      wholesale_price: Number(p.wholesale_price || p.base_price || 50.0),
      min_wholesale_quantity: Number(p.moq || 100.0), // Supplier MOQ
      available_quantity: Number(p.available_quantity || p.inventory || 1000.0),
      max_order_quantity: Number(p.max_supply_quantity || 5000.0),
      quantity_tiers: Array.isArray(p.quantity_tiers) ? p.quantity_tiers : [],
      discount_pct: Number(p.discount_pct || 0.0),
      service_radius_km: supplierDoc.serviceRadiusKm,
      lead_time_days: supplierDoc.leadTimeDays,
      is_available: true,
      created_at: nowIso,
      updated_at: nowIso
    };
  });

  // Safe Batch Write with Timeout Guard
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'suppliers', activeUid), supplierDoc, { merge: true });
    batch.set(doc(db, 'users', activeUid), userDocUpdate, { merge: true });

    for (const prod of productDocs) {
      batch.set(doc(db, 'products', prod.id), prod, { merge: true });
    }

    await withTimeout(batch.commit(), 6000, 'Saving supplier profile');
  } catch (err) {
    console.error('[Samooh Auth] Firestore supplier persistence error:', {
      code: err.code,
      message: err.message,
      authUid: auth.currentUser?.uid,
      authEmail: auth.currentUser?.email,
      isAnonymous: auth.currentUser?.isAnonymous,
      providerData: auth.currentUser?.providerData?.map(p => ({ providerId: p.providerId, email: p.email, uid: p.uid })),
      targetSupplierDoc: `suppliers/${activeUid}`,
      targetUserDoc: `users/${activeUid}`,
      targetProductDocs: productDocs.map(p => `products/${p.id}`)
    });
    throw new Error(mapAuthError(err));
  }

  return { supplier: supplierDoc, products: productDocs, user: userDocUpdate };
}

/**
 * Sign out of Firebase and clear local storage session tokens.
 */
export async function signOutUser() {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.warn('[Samooh Auth] Firebase sign-out error:', err.message);
  }
}
