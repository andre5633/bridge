from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.modules.transactions.schemas import TransactionCreate, TransactionUpdate, TransactionResponse
from app.modules.transactions.repository import TransactionRepository
from app.modules.transactions.service import TransactionService
from app.modules.auth.service import get_current_user
from app.modules.auth.service import get_current_user
from typing import List, Optional

router = APIRouter(prefix="/transactions", tags=["transactions"])

from app.modules.accounts.repository import AccountRepository

async def get_transaction_service(db: AsyncSession = Depends(get_db)) -> TransactionService:
    repo = TransactionRepository(db)
    account_repo = AccountRepository(db)
    return TransactionService(repo, account_repo)

@router.get("/", response_model=dict)
async def list_transactions(
    account_id: Optional[str] = Query(None),
    event_id: Optional[str] = Query(None),
    service: TransactionService = Depends(get_transaction_service),
    current_user: dict = Depends(get_current_user)
):
    transactions = await service.list_transactions(account_id, event_id)
    return {
        "success": True,
        "data": [TransactionResponse.model_validate(t).model_dump() for t in transactions]
    }

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction_data: TransactionCreate,
    service: TransactionService = Depends(get_transaction_service),
    current_user: dict = Depends(get_current_user)
):
    transaction = await service.create_transaction(transaction_data)
    return {
        "success": True,
        "data": TransactionResponse.model_validate(transaction).model_dump()
    }

@router.get("/{transaction_id}", response_model=dict)
async def get_transaction(
    transaction_id: str,
    service: TransactionService = Depends(get_transaction_service),
    current_user: dict = Depends(get_current_user)
):
    transaction = await service.get_transaction(transaction_id)
    return {
        "success": True,
        "data": TransactionResponse.model_validate(transaction).model_dump()
    }

@router.put("/{transaction_id}", response_model=dict)
async def update_transaction(
    transaction_id: str,
    transaction_data: TransactionUpdate,
    service: TransactionService = Depends(get_transaction_service),
    current_user: dict = Depends(get_current_user)
):
    transaction = await service.update_transaction(transaction_id, transaction_data)
    return {
        "success": True,
        "data": TransactionResponse.model_validate(transaction).model_dump()
    }

@router.delete("/{transaction_id}", response_model=dict)
async def delete_transaction(
    transaction_id: str,
    service: TransactionService = Depends(get_transaction_service),
    current_user: dict = Depends(get_current_user)
):
    await service.delete_transaction(transaction_id)
    return {
        "success": True,
        "data": None
    }
