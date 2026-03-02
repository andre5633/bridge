from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.modules.chart_of_accounts.schemas import ChartAccountCreate, ChartAccountUpdate, ChartAccountResponse
from app.modules.chart_of_accounts.service import ChartAccountService
from app.modules.auth.service import get_current_user
from app.modules.auth.service import get_current_user

router = APIRouter(prefix="/chart-of-accounts", tags=["Chart of Accounts"])

@router.get("/", response_model=dict)
async def list_chart_accounts(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = ChartAccountService(db)
    chart = await service.list_chart_accounts()
    return {
        "success": True,
        "data": [ChartAccountResponse.model_validate(c).model_dump() for c in chart]
    }

@router.get("/{chart_account_id}", response_model=dict)
async def get_chart_account(chart_account_id: str, db: AsyncSession = Depends(get_db)):
    service = ChartAccountService(db)
    chart = await service.get_chart_account(chart_account_id)
    return {
        "success": True,
        "data": ChartAccountResponse.model_validate(chart).model_dump()
    }

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_chart_account(
    chart_account_data: ChartAccountCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = ChartAccountService(db)
    chart = await service.create_chart_account(chart_account_data)
    return {
        "success": True,
        "data": ChartAccountResponse.model_validate(chart).model_dump()
    }

@router.put("/{chart_account_id}", response_model=dict)
async def update_chart_account(chart_account_id: str, chart_account_data: ChartAccountUpdate, db: AsyncSession = Depends(get_db)):
    service = ChartAccountService(db)
    chart = await service.update_chart_account(chart_account_id, chart_account_data)
    return {
        "success": True,
        "data": ChartAccountResponse.model_validate(chart).model_dump()
    }

@router.delete("/{chart_account_id}", response_model=dict)
async def delete_chart_account(chart_account_id: str, db: AsyncSession = Depends(get_db)):
    service = ChartAccountService(db)
    await service.delete_chart_account(chart_account_id)
    return {
        "success": True,
        "data": None
    }
