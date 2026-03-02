from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.modules.events.schemas import FinanceEventCreate, FinanceEventUpdate, FinanceEventResponse
from app.modules.events.service import EventService
from app.modules.auth.service import get_current_user
from app.modules.auth.service import get_current_user

router = APIRouter(tags=["Events"])

@router.get("/events", response_model=dict)
async def list_events(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = EventService(db)
    events = await service.get_events()
    return {
        "success": True,
        "data": [FinanceEventResponse.model_validate(e).model_dump() for e in events]
    }

@router.get("/events/{event_id}", response_model=dict)
async def get_event(event_id: str, db: AsyncSession = Depends(get_db)):
    service = EventService(db)
    event = await service.get_event(event_id)
    return {
        "success": True,
        "data": FinanceEventResponse.model_validate(event).model_dump()
    }

@router.post("/events", response_model=dict)
async def create_event(
    event_data: FinanceEventCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = EventService(db)
    event = await service.create_event(event_data)
    return {
        "success": True,
        "data": FinanceEventResponse.model_validate(event).model_dump()
    }

@router.put("/events/{event_id}", response_model=dict)
async def update_event(event_id: str, event_data: FinanceEventUpdate, db: AsyncSession = Depends(get_db)):
    service = EventService(db)
    event = await service.update_event(event_id, event_data)
    return {
        "success": True,
        "data": FinanceEventResponse.model_validate(event).model_dump()
    }

@router.delete("/events/{event_id}", response_model=dict)
async def delete_event(event_id: str, db: AsyncSession = Depends(get_db)):
    service = EventService(db)
    await service.delete_event(event_id)
    return {
        "success": True,
        "data": None
    }
