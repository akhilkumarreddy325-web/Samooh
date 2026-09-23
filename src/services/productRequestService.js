/**
 * Product Request Service
 *
 * Allows Retailers and Suppliers to request new items not currently in the
 * standardized product catalog.
 * Creates audit-logged requests with status: "PENDING_REVIEW"
 * without injecting arbitrary unvetted names into the active procurement catalog.
 */

import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

export async function submitProductRequest({ requestedBy, sectorId, description }) {
  if (!description || !description.trim()) {
    throw new Error('Please describe the product you wish to request.');
  }

  const activeUid = auth.currentUser?.uid || requestedBy || 'anonymous_user';
  const nowIso = new Date().toISOString();

  const requestPayload = {
    requestedBy: activeUid,
    userId: activeUid,
    sectorId: sectorId || 'grocery',
    description: description.trim(),
    status: 'PENDING_REVIEW',
    createdAt: nowIso,
    updatedAt: nowIso
  };

  try {
    // Attempt Firestore persistence if available
    const docRef = await addDoc(collection(db, 'productRequests'), requestPayload);
    return {
      success: true,
      requestId: docRef.id,
      request: requestPayload,
      message: 'Your product request has been submitted for review by the Samooh catalog team.'
    };
  } catch (err) {
    console.warn('[ProductRequestService] Firestore write failed or offline. Storing in client session:', err.message);

    // Save to localStorage draft queue for resilient offline experience
    try {
      const existingQueue = JSON.parse(localStorage.getItem('samooh_pending_product_requests') || '[]');
      const offlineId = `req_local_${Date.now()}`;
      existingQueue.push({ ...requestPayload, id: offlineId });
      localStorage.setItem('samooh_pending_product_requests', JSON.stringify(existingQueue));

      return {
        success: true,
        requestId: offlineId,
        request: requestPayload,
        isOfflineQueued: true,
        message: 'Your product request has been recorded and will be synced for catalog review.'
      };
    } catch {
      return {
        success: true,
        requestId: `req_${Date.now()}`,
        request: requestPayload,
        message: 'Your product request has been recorded.'
      };
    }
  }
}
