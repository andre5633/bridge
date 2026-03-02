from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.modules.categories.models import Category

class CategoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[Category]:
        result = await self.db.execute(select(Category).where(Category.deleted_at == None))
        return result.scalars().all()

    async def get_by_id(self, category_id: str) -> Optional[Category]:
        result = await self.db.execute(select(Category).where(Category.id == category_id, Category.deleted_at == None))
        return result.scalar_one_or_none()

    async def create(self, category: Category) -> Category:
        self.db.add(category)
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def update(self, category: Category) -> Category:
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def delete(self, category: Category):
        from datetime import datetime, timezone
        category.deleted_at = datetime.now(timezone.utc)
        await self.db.commit()
