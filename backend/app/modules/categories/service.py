from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from fastapi import HTTPException, status

from app.modules.categories.models import Category
from app.modules.categories.schemas import CategoryCreate, CategoryUpdate
from app.modules.categories.repository import CategoryRepository

class CategoryService:
    def __init__(self, db: AsyncSession):
        self.repository = CategoryRepository(db)

    async def list_categories(self) -> List[Category]:
        return await self.repository.get_all()

    async def get_category(self, category_id: str) -> Category:
        category = await self.repository.get_by_id(category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        return category

    async def create_category(self, category_data: CategoryCreate) -> Category:
        category = Category(**category_data.model_dump())
        return await self.repository.create(category)

    async def update_category(self, category_id: str, category_data: CategoryUpdate) -> Category:
        category = await self.get_category(category_id)
        
        update_data = category_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(category, key, value)
            
        return await self.repository.update(category)

    async def delete_category(self, category_id: str):
        category = await self.get_category(category_id)
        await self.repository.delete(category)
