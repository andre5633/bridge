from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.modules.artists.models import Artist

class ArtistRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[Artist]:
        result = await self.db.execute(select(Artist).where(Artist.deleted_at == None))
        return result.scalars().all()

    async def get_by_id(self, artist_id: str) -> Optional[Artist]:
        result = await self.db.execute(select(Artist).where(Artist.id == artist_id, Artist.deleted_at == None))
        return result.scalar_one_or_none()

    async def create(self, artist: Artist) -> Artist:
        self.db.add(artist)
        await self.db.commit()
        await self.db.refresh(artist)
        return artist

    async def update(self, artist: Artist) -> Artist:
        await self.db.commit()
        await self.db.refresh(artist)
        return artist

    async def delete(self, artist: Artist):
        # Soft delete
        # Note: deleted_at is handled in core models if implemented, 
        # but here we follow the pattern
        from datetime import datetime, timezone
        artist.deleted_at = datetime.now(timezone.utc)
        await self.db.commit()
