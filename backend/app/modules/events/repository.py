from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.events.models import FinanceEvent
from app.modules.events.schemas import FinanceEventCreate, FinanceEventUpdate
import uuid

class EventRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self):
        result = await self.db.execute(select(FinanceEvent).filter(FinanceEvent.deleted_at == None))
        return result.scalars().all()

    async def get_by_id(self, event_id: str):
        result = await self.db.execute(select(FinanceEvent).filter(FinanceEvent.id == event_id, FinanceEvent.deleted_at == None))
        return result.scalar_one_or_none()

    async def create(self, event_data: FinanceEventCreate):
        db_event = FinanceEvent(**event_data.model_dump(), id=str(uuid.uuid4()))
        self.db.add(db_event)
        await self.db.commit()
        await self.db.refresh(db_event)
        return db_event

    async def update(self, event_id: str, event_data: FinanceEventUpdate):
        db_event = await self.get_by_id(event_id)
        if not db_event:
            return None
        
        for key, value in event_data.model_dump(exclude_unset=True).items():
            setattr(db_event, key, value)
        
        await self.db.commit()
        await self.db.refresh(db_event)
        return db_event

    async def delete(self, event_id: str):
        db_event = await self.get_by_id(event_id)
        if db_event:
            from datetime import datetime
            db_event.deleted_at = datetime.utcnow()
            await self.db.commit()
            return True
        return False
