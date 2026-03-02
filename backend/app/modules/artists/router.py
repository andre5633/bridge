from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.modules.artists.schemas import ArtistCreate, ArtistUpdate, ArtistResponse
from app.modules.artists.service import ArtistService
from app.modules.auth.service import get_current_user

router = APIRouter(prefix="/artists", tags=["Artists"])

@router.get("/", response_model=dict)
async def list_artists(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = ArtistService(db)
    artists = await service.list_artists()
    return {
        "success": True,
        "data": [ArtistResponse.model_validate(a).model_dump() for a in artists]
    }

@router.get("/{artist_id}", response_model=dict)
async def get_artist(artist_id: str, db: AsyncSession = Depends(get_db)):
    service = ArtistService(db)
    artist = await service.get_artist(artist_id)
    return {
        "success": True,
        "data": ArtistResponse.model_validate(artist).model_dump()
    }

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_artist(
    artist_data: ArtistCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = ArtistService(db)
    artist = await service.create_artist(artist_data)
    return {
        "success": True,
        "data": ArtistResponse.model_validate(artist).model_dump()
    }

@router.put("/{artist_id}", response_model=dict)
async def update_artist(artist_id: str, artist_data: ArtistUpdate, db: AsyncSession = Depends(get_db)):
    service = ArtistService(db)
    artist = await service.update_artist(artist_id, artist_data)
    return {
        "success": True,
        "data": ArtistResponse.model_validate(artist).model_dump()
    }

@router.delete("/{artist_id}", response_model=dict)
async def delete_artist(artist_id: str, db: AsyncSession = Depends(get_db)):
    service = ArtistService(db)
    await service.delete_artist(artist_id)
    return {
        "success": True,
        "data": None
    }
