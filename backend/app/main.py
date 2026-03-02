from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.config import settings
from app.core.database import get_db

from app.modules.auth.router import router as auth_router
from app.modules.accounts.router import router as accounts_router
from app.modules.artists.router import router as artists_router
from app.modules.categories.router import router as categories_router
from app.modules.chart_of_accounts.router import router as chart_of_accounts_router
from app.modules.events.router import router as events_router
from app.modules.transactions.router import router as transactions_router
from app.modules.reports.router import router as reports_router

app = FastAPI(
    title="Bridge API",
    description="API for Bridge financial system",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. Change in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(accounts_router, prefix="/api/v1")
app.include_router(artists_router, prefix="/api/v1")
app.include_router(categories_router, prefix="/api/v1")
app.include_router(chart_of_accounts_router, prefix="/api/v1")
app.include_router(events_router, prefix="/api/v1")
app.include_router(transactions_router, prefix="/api/v1")
app.include_router(reports_router, prefix="/api/v1")

@app.get("/api/v1/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        # Check database connection
        await db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {str(e)}"
        
    return {
        "success": True,
        "data": {
            "status": "ok",
            "environment": settings.ENVIRONMENT,
            "database": db_status
        }
    }
