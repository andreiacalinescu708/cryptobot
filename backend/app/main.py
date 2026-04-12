from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine, Base
from app.api import strategies, auth, api_keys, strategy_config, dashboard, verify_email, admin

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Crypto Trading Bot API",
    description="API pentru crypto trading bot multi-tenant cu suport pentru 5 strategii de trading",
    version="1.0.0"
)

from app.core.config import get_settings

settings = get_settings()

# CORS pentru frontend React
import os

# Lista tuturor originurilor permise
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3002",
    "http://localhost:5173",
    "https://frontend-rho-lyart-66.vercel.app",  # Alias principal
]

# Adaugă FRONTEND_URL din env dacă există
if settings.FRONTEND_URL:
    ALLOWED_ORIGINS.append(settings.FRONTEND_URL)

# Adaugă toate originile Vercel pentru acest proiect
vercel_origins = os.getenv("VERCEL_ORIGINS", "").split(",")
ALLOWED_ORIGINS.extend([o.strip() for o in vercel_origins if o.strip()])

# Remove duplicates while preserving order
ALLOWED_ORIGINS = list(dict.fromkeys(ALLOWED_ORIGINS))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(strategies.router)
app.include_router(api_keys.router)
app.include_router(strategy_config.router)
app.include_router(dashboard.router)
app.include_router(verify_email.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {
        "message": "Crypto Trading Bot API",
        "version": "1.0.0",
        "docs": "/docs",
        "features": [
            "Multi-tenant (fiecare user = tenant separat)",
            "Auth cu JWT",
            "5 strategii de trading",
            "Criptare API keys (AES-256)",
            "Izolare date per tenant"
        ]
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
