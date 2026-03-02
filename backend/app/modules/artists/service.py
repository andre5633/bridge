from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from fastapi import HTTPException, status

from app.modules.artists.models import Artist
from app.modules.artists.schemas import ArtistCreate, ArtistUpdate
from app.modules.artists.repository import ArtistRepository

class ArtistService:
    def __init__(self, db: AsyncSession):
        self.repository = ArtistRepository(db)

    async def list_artists(self) -> List[Artist]:
        return await self.repository.get_all()

    async def get_artist(self, artist_id: str) -> Artist:
        artist = await self.repository.get_by_id(artist_id)
        if not artist:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Artist not found"
            )
        return artist

    async def create_artist(self, artist_data: ArtistCreate) -> Artist:
        artist = Artist(**artist_data.model_dump())
        return await self.repository.create(artist)

    async def update_artist(self, artist_id: str, artist_data: ArtistUpdate) -> Artist:
        artist = await self.get_artist(artist_id)
        
        update_data = artist_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(artist, key, value)
            
        return await self.repository.update(artist)

    async def delete_artist(self, artist_id: str):
        artist = await self.get_artist(artist_id)
        await self.repository.delete(artist)
