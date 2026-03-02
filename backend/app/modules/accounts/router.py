from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.modules.accounts.schemas import AccountCreate, AccountUpdate, AccountResponse
from app.modules.accounts.repository import AccountRepository
from app.modules.accounts.service import AccountService
from app.modules.auth.service import get_current_user
from app.modules.auth.service import get_current_user
from typing import List

router = APIRouter(prefix="/accounts", tags=["accounts"])

async def get_account_service(db: AsyncSession = Depends(get_db)) -> AccountService:
    repo = AccountRepository(db)
    return AccountService(repo)

@router.get("/", response_model=dict)
async def list_accounts(
    service: AccountService = Depends(get_account_service),
    current_user: dict = Depends(get_current_user)
):
    accounts = await service.list_accounts()
    return {
        "success": True,
        "data": [AccountResponse.model_validate(a).model_dump() for a in accounts]
    }

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_account(
    account_data: AccountCreate,
    service: AccountService = Depends(get_account_service),
    current_user: dict = Depends(get_current_user)
):
    account = await service.create_account(account_data)
    return {
        "success": True,
        "data": AccountResponse.model_validate(account).model_dump()
    }

@router.get("/{account_id}", response_model=dict)
async def get_account(
    account_id: str,
    service: AccountService = Depends(get_account_service),
    current_user: dict = Depends(get_current_user)
):
    account = await service.get_account(account_id)
    return {
        "success": True,
        "data": AccountResponse.model_validate(account).model_dump()
    }

@router.put("/{account_id}", response_model=dict)
async def update_account(
    account_id: str,
    account_data: AccountUpdate,
    service: AccountService = Depends(get_account_service),
    current_user: dict = Depends(get_current_user)
):
    account = await service.update_account(account_id, account_data)
    return {
        "success": True,
        "data": AccountResponse.model_validate(account).model_dump()
    }

@router.delete("/{account_id}", response_model=dict)
async def delete_account(
    account_id: str,
    service: AccountService = Depends(get_account_service),
    current_user: dict = Depends(get_current_user)
):
    await service.delete_account(account_id)
    return {
        "success": True,
        "data": None
    }
