from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.events.repository import EventRepository
from app.modules.events.schemas import FinanceEventCreate, FinanceEventUpdate
from fastapi import HTTPException, status

class EventService:
    def __init__(self, db: AsyncSession):
        self.repository = EventRepository(db)

    async def get_events(self):
        return await self.repository.get_all()

    async def get_event(self, event_id: str):
        event = await self.repository.get_by_id(event_id)
        if not event:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
        return event

    async def create_event(self, event_data: FinanceEventCreate):
        return await self.repository.create(event_data)

    async def update_event(self, event_id: str, event_data: FinanceEventUpdate):
        event = await self.repository.update(event_id, event_data)
        if not event:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
        return event

    async def delete_event(self, event_id: str):
        success = await self.repository.delete(event_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
        return {"message": "Event deleted successfully"}
