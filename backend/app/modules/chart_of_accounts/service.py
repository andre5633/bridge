from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from fastapi import HTTPException, status

from app.modules.chart_of_accounts.models import ChartAccount
from app.modules.chart_of_accounts.schemas import ChartAccountCreate, ChartAccountUpdate
from app.modules.chart_of_accounts.repository import ChartAccountRepository

class ChartAccountService:
    def __init__(self, db: AsyncSession):
        self.repository = ChartAccountRepository(db)

    async def list_chart_accounts(self) -> List[ChartAccount]:
        return await self.repository.get_all()

    async def get_chart_account(self, chart_account_id: str) -> ChartAccount:
        chart_account = await self.repository.get_by_id(chart_account_id)
        if not chart_account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chart account not found"
            )
        return chart_account

    async def create_chart_account(self, chart_account_data: ChartAccountCreate) -> ChartAccount:
        chart_account = ChartAccount(**chart_account_data.model_dump())
        return await self.repository.create(chart_account)

    async def update_chart_account(self, chart_account_id: str, chart_account_data: ChartAccountUpdate) -> ChartAccount:
        chart_account = await self.get_chart_account(chart_account_id)
        
        update_data = chart_account_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(chart_account, key, value)
            
        return await self.repository.update(chart_account)

    async def delete_chart_account(self, chart_account_id: str):
        chart_account = await self.get_chart_account(chart_account_id)
        await self.repository.delete(chart_account)
