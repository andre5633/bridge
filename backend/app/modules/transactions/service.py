from app.modules.transactions.repository import TransactionRepository
from app.modules.accounts.repository import AccountRepository
from app.modules.transactions.schemas import TransactionCreate, TransactionUpdate, TransactionResponse, TransactionType, TransactionStatus
from fastapi import HTTPException, status
from typing import List, Optional

class TransactionService:
    def __init__(self, repository: TransactionRepository, account_repo: AccountRepository):
        self.repository = repository
        self.account_repo = account_repo
        
    def _calculate_delta(self, amount: float, tx_type: TransactionType) -> float:
        return amount if tx_type == TransactionType.INCOME else -amount

    async def list_transactions(self, account_id: Optional[str] = None, event_id: Optional[str] = None) -> List[TransactionResponse]:
        transactions = await self.repository.get_all(account_id, event_id)
        return [TransactionResponse.model_validate(t) for t in transactions]

    async def get_transaction(self, transaction_id: str) -> TransactionResponse:
        transaction = await self.repository.get_by_id(transaction_id)
        if not transaction:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
        return TransactionResponse.model_validate(transaction)

    async def create_transaction(self, transaction_data: TransactionCreate) -> TransactionResponse:
        transaction = await self.repository.create(transaction_data)
        
        if transaction.status == TransactionStatus.PAID:
            delta = self._calculate_delta(transaction.amount, transaction.type)
            await self.account_repo.update_balance(transaction.account_id, delta)
            
        return TransactionResponse.model_validate(transaction)

    async def update_transaction(self, transaction_id: str, transaction_data: TransactionUpdate) -> TransactionResponse:
        old_tx = await self.repository.get_by_id(transaction_id)
        if not old_tx:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
            
        # 1. Revert old logic if it was PAID
        if old_tx.status == TransactionStatus.PAID:
            old_delta = self._calculate_delta(old_tx.amount, old_tx.type)
            await self.account_repo.update_balance(old_tx.account_id, -old_delta)
            
        # 2. Update transaction
        transaction = await self.repository.update(transaction_id, transaction_data)
        
        # 3. Apply new logic if it is PAID
        if transaction.status == TransactionStatus.PAID:
            new_delta = self._calculate_delta(transaction.amount, transaction.type)
            await self.account_repo.update_balance(transaction.account_id, new_delta)
            
        return TransactionResponse.model_validate(transaction)

    async def delete_transaction(self, transaction_id: str) -> None:
        old_tx = await self.repository.get_by_id(transaction_id)
        if not old_tx:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
            
        if old_tx.status == TransactionStatus.PAID:
            old_delta = self._calculate_delta(old_tx.amount, old_tx.type)
            await self.account_repo.update_balance(old_tx.account_id, -old_delta)
            
        await self.repository.delete(transaction_id)
