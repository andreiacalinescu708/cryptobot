from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine, Base
from app.api import strategies, auth, api_keys, strategy_config, dashboard

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
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3002",
        "http://localhost:5173",
        settings.FRONTEND_URL,  # Production frontend URL
    ],
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
