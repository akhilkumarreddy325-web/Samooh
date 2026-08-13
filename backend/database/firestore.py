import os
import logging
from typing import Optional
from backend.config import settings

logger = logging.getLogger("samooh.firestore")

_db_client = None

def get_firestore_client():
    """
    Initializes and returns the Firebase Firestore client.
    If USE_MOCK_FIRESTORE is True or Firebase initialization fails, returns None,
    triggering the repository layer to use the high-performance in-memory store.
    """
    global _db_client
    if _db_client is not None:
        return _db_client

    if settings.USE_MOCK_FIRESTORE:
        logger.info("USE_MOCK_FIRESTORE is True. Using in-memory Firestore repository.")
        return None

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        if not firebase_admin._apps:
            cred_path = settings.FIREBASE_CREDENTIALS_PATH
            if cred_path and os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred, {"projectId": settings.FIREBASE_PROJECT_ID})
                logger.info(f"Firebase initialized with service account from {cred_path}")
            else:
                # Default app initialization using project ID settings
                firebase_admin.initialize_app(options={"projectId": settings.FIREBASE_PROJECT_ID})
                logger.info(f"Firebase initialized with project ID: {settings.FIREBASE_PROJECT_ID}")

        _db_client = firestore.client()
        return _db_client
    except Exception as e:
        logger.warning(f"Failed to initialize Firestore client: {e}. Falling back to in-memory store.")
        return None
