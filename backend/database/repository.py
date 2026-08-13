import logging
from typing import List, Dict, Any, Optional
from backend.database.firestore import get_firestore_client

logger = logging.getLogger("samooh.repository")

class SamoohRepository:
    """
    Unified Repository Layer supporting live Firebase Firestore and Mock In-Memory DB.
    Collections:
    - retailers
    - products
    - sales
    - suppliers
    - forecasts
    - procurementPools
    - recommendations
    """
    def __init__(self):
        self._mock_db: Dict[str, Dict[str, Dict[str, Any]]] = {
            "retailers": {},
            "products": {},
            "sales": {},
            "suppliers": {},
            "forecasts": {},
            "procurementPools": {},
            "recommendations": {},
        }

    @property
    def db(self):
        return get_firestore_client()

    def get_all(self, collection: str) -> List[Dict[str, Any]]:
        client = self.db
        if client:
            try:
                docs = client.collection(collection).stream()
                return [d.to_dict() for d in docs]
            except Exception as e:
                logger.error(f"Firestore get_all error for {collection}: {e}. Falling back to mock.")
        
        return list(self._mock_db.get(collection, {}).values())

    def get_by_id(self, collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        client = self.db
        if client:
            try:
                doc = client.collection(collection).document(doc_id).get()
                if doc.exists:
                    return doc.to_dict()
                return None
            except Exception as e:
                logger.error(f"Firestore get_by_id error for {collection}/{doc_id}: {e}")
        
        return self._mock_db.get(collection, {}).get(doc_id)

    def set_document(self, collection: str, doc_id: str, data: Dict[str, Any]) -> None:
        # Always update local mock state for instant sub-millisecond retrieval
        if collection not in self._mock_db:
            self._mock_db[collection] = {}
        self._mock_db[collection][doc_id] = data

        client = self.db
        if client:
            try:
                client.collection(collection).document(doc_id).set(data)
            except Exception as e:
                logger.error(f"Firestore set_document error for {collection}/{doc_id}: {e}")

    def save_bulk(self, collection: str, items: List[Dict[str, Any]], id_key: str = "id") -> None:
        if collection not in self._mock_db:
            self._mock_db[collection] = {}

        client = self.db
        batch = client.batch() if client else None

        for item in items:
            doc_id = str(item.get(id_key))
            self._mock_db[collection][doc_id] = item
            if client and batch:
                doc_ref = client.collection(collection).document(doc_id)
                batch.set(doc_ref, item)

        if client and batch:
            try:
                batch.commit()
            except Exception as e:
                logger.error(f"Firestore bulk commit error for {collection}: {e}")

    def clear_collection(self, collection: str) -> None:
        self._mock_db[collection] = {}
        client = self.db
        if client:
            try:
                docs = client.collection(collection).list_documents()
                for doc in docs:
                    doc.delete()
            except Exception as e:
                logger.error(f"Firestore clear collection error for {collection}: {e}")

    def get_sales_by_retailer_and_product(self, retailer_id: str, product_id: str) -> List[Dict[str, Any]]:
        all_sales = self.get_all("sales")
        return [
            s for s in all_sales 
            if s.get("retailer_id") == retailer_id and s.get("product_id") == product_id
        ]


# Singleton repository instance
repo = SamoohRepository()
