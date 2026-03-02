from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.modules.categories.schemas import CategoryCreate, CategoryUpdate, CategoryResponse
from app.modules.categories.service import CategoryService
from app.modules.auth.service import get_current_user
from app.modules.auth.service import get_current_user

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("/", response_model=dict)
async def list_categories(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = CategoryService(db)
    categories = await service.list_categories()
    return {
        "success": True,
        "data": [CategoryResponse.model_validate(c).model_dump() for c in categories]
    }

@router.get("/{category_id}", response_model=dict)
async def get_category(category_id: str, db: AsyncSession = Depends(get_db)):
    service = CategoryService(db)
    category = await service.get_category(category_id)
    return {
        "success": True,
        "data": CategoryResponse.model_validate(category).model_dump()
    }

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = CategoryService(db)
    category = await service.create_category(category_data)
    return {
        "success": True,
        "data": CategoryResponse.model_validate(category).model_dump()
    }

@router.put("/{category_id}", response_model=dict)
async def update_category(category_id: str, category_data: CategoryUpdate, db: AsyncSession = Depends(get_db)):
    service = CategoryService(db)
    category = await service.update_category(category_id, category_data)
    return {
        "success": True,
        "data": CategoryResponse.model_validate(category).model_dump()
    }

@router.delete("/{category_id}", response_model=dict)
async def delete_category(category_id: str, db: AsyncSession = Depends(get_db)):
    service = CategoryService(db)
    await service.delete_category(category_id)
    return {
        "success": True,
        "data": None
    }
