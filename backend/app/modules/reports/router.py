from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.modules.auth.service import get_current_user
from app.modules.reports.service import ReportService
from app.modules.reports.schemas import DREResponse, AnalyticsResponse
from typing import Optional

router = APIRouter(prefix="/reports", tags=["Reports"])

async def get_report_service(db: AsyncSession = Depends(get_db)) -> ReportService:
    return ReportService(db)

@router.get("/dre", response_model=dict)
async def get_dre(
    year: int = Query(..., description="The year to generate the DRE for"),
    artist_id: Optional[str] = Query(None, description="Optional filter by Artist ID"),
    event_id: Optional[str] = Query(None, description="Optional filter by Event (Cost Center) ID"),
    service: ReportService = Depends(get_report_service),
    current_user = Depends(get_current_user)
):
    try:
        report = await service.get_dre(year, artist_id, event_id)
        return {
            "success": True,
            "data": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics", response_model=dict)
async def get_analytics(
    start_date: str = Query(..., description="ISO start date"),
    end_date: str = Query(..., description="ISO end date"),
    service: ReportService = Depends(get_report_service),
    current_user = Depends(get_current_user)
):
    try:
        report = await service.get_analytics(start_date, end_date)
        return {
            "success": True,
            "data": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
