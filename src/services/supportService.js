import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './firebase';

// Optional support phone configuration.
// Set to null when live call center is pending, or set to phone string when officially configured.
export const CONFIGURED_SUPPORT_PHONE = null;

const LOCAL_STORAGE_KEY = 'samooh_support_requests';

/**
 * Saves a support request to Firestore under the 'supportRequests' collection.
 * Uses authenticated retailer UID.
 * Includes local fallback storage if network or offline.
 *
 * @param {Object} params
 * @param {string} params.retailerId - Authenticated retailer UID
 * @param {string} params.retailerName - Store name or owner name
 * @param {string} params.category - Selected issue category (e.g. 'Stock / Quantity', 'Order', etc.)
 * @param {string} params.message - Issue description
 * @returns {Promise<{success: boolean, id: string, doc: Object}>}
 */
export async function submitSupportRequest({ retailerId, retailerName, category, message }) {
  if (!retailerId) {
    throw new Error('Retailer identification is required to submit a support request.');
  }

  const trimmedMessage = (message || '').trim();
  if (!trimmedMessage) {
    throw new Error('Please enter a description of your issue.');
  }

  const selectedCategory = (category || 'Other').trim();
  const nowIso = new Date().toISOString();

  const localRecord = {
    id: `req_${Date.now()}`,
    retailerId,
    retailerName: retailerName || 'Kirana Retailer',
    category: selectedCategory,
    message: trimmedMessage,
    status: 'OPEN',
    createdAt: nowIso,
    updatedAt: nowIso
  };

  let firestoreId = null;

  try {
    const colRef = collection(db, 'supportRequests');
    const docData = {
      retailerId,
      retailerName: retailerName || 'Kirana Retailer',
      category: selectedCategory,
      message: trimmedMessage,
      status: 'OPEN',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(colRef, docData);
    firestoreId = docRef.id;
    localRecord.id = firestoreId;
  } catch (err) {
    console.warn('[SupportService] Firestore save error (caching locally):', err?.message || err);
  }

  // Cache locally for offline resilience and immediate UI update
  try {
    const cached = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    cached.unshift(localRecord);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cached.slice(0, 50)));
  } catch (e) {
    console.warn('[SupportService] LocalStorage cache warning:', e);
  }

  return {
    success: true,
    id: firestoreId || localRecord.id,
    data: localRecord
  };
}

/**
 * Retrieves submitted support requests for the authenticated retailer.
 * Only queries for records belonging to the given retailerId.
 *
 * @param {string} retailerId
 * @returns {Promise<Array<Object>>}
 */
export async function getRetailerSupportRequests(retailerId) {
  if (!retailerId) return [];

  const resultsMap = new Map();

  // 1. Load local cache first
  try {
    const cached = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    cached
      .filter((r) => r.retailerId === retailerId)
      .forEach((r) => resultsMap.set(r.id, r));
  } catch (_) {}

  // 2. Query Firestore if connected
  try {
    const colRef = collection(db, 'supportRequests');
    const q = query(colRef, where('retailerId', '==', retailerId));
    const snapshot = await getDocs(q);

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      let createdStr = new Date().toISOString();
      if (data.createdAt?.toDate) {
        createdStr = data.createdAt.toDate().toISOString();
      } else if (typeof data.createdAt === 'string') {
        createdStr = data.createdAt;
      }

      resultsMap.set(docSnap.id, {
        id: docSnap.id,
        retailerId: data.retailerId,
        retailerName: data.retailerName,
        category: data.category || 'Other',
        message: data.message || '',
        status: data.status || 'OPEN',
        createdAt: createdStr,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : createdStr
      });
    });
  } catch (err) {
    console.warn('[SupportService] Firestore fetch error (falling back to cache):', err?.message || err);
  }

  const items = Array.from(resultsMap.values());
  // Sort descending by createdAt
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return items;
}
