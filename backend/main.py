import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database.repository import repo
from backend.database.seed_data import seed_demo_data
from services.recommendation import RecommendationEngine

from backend.routers import (
    dashboard,
    retailers,
    products,
    forecasts,
    recommendations,
    demo
)

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("samooh.main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Samooh AI-Powered Group Procurement Platform Backend Core API"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(dashboard.router)
app.include_router(retailers.router)
app.include_router(products.router)
app.include_router(forecasts.router)
app.include_router(recommendations.router)
app.include_router(demo.router)


@app.on_event("startup")
def on_startup():
    """
    On startup event: If repository is empty, automatically seed demo data 
    and run AI recommendation pipeline so the backend is immediately ready.
    """
    logger.info("Initializing Samooh AI Core Backend...")
    existing_retailers = repo.get_all("retailers")
    if not existing_retailers:
        logger.info("Empty database detected. Auto-seeding initial dataset...")
        seed_demo_data()
        rec_engine = RecommendationEngine()
        rec_engine.generate_recommendations()
        logger.info("Auto-seeding and AI recommendation pipeline completed successfully.")
    else:
        logger.info(f"Database ready with {len(existing_retailers)} existing retailers.")


@app.get("/")
def root():
    """
    API Root Health check endpoint.
    """
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "healthy",
        "firebase_project_id": settings.FIREBASE_PROJECT_ID,
        "use_mock_firestore": settings.USE_MOCK_FIRESTORE,
        "docs_url": "/docs",
        "demo_endpoint": "/demo/scenario",
        "endpoints": [
            "/dashboard",
            "/retailers",
            "/products",
            "/forecasts",
            "/recommendations",
            "/impact",
            "/demo/scenario"
        ]
    }
