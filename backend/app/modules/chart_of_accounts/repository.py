from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.modules.chart_of_accounts.models import ChartAccount

class ChartAccountRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[ChartAccount]:
        result = await self.db.execute(select(ChartAccount).where(ChartAccount.deleted_at == None))
        return result.scalars().all()

    async def get_by_id(self, chart_account_id: str) -> Optional[ChartAccount]:
        result = await self.db.execute(select(ChartAccount).where(ChartAccount.id == chart_account_id, ChartAccount.deleted_at == None))
        return result.scalar_one_or_none()

    async def create(self, chart_account: ChartAccount) -> ChartAccount:
        self.db.add(chart_account)
        await self.db.commit()
        await self.db.refresh(chart_account)
        return chart_account

    async def update(self, chart_account: ChartAccount) -> ChartAccount:
        await self.db.commit()
        await self.db.refresh(chart_account)
        return chart_account

    async def delete(self, chart_account: ChartAccount):
        from datetime import datetime, timezone
        chart_account.deleted_at = datetime.now(timezone.utc)
        await self.db.commit()
