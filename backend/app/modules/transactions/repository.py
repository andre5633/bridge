from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.modules.transactions.models import Transaction
from app.modules.transactions.schemas import TransactionCreate, TransactionUpdate
from typing import List, Optional
from datetime import datetime, timezone

class TransactionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, account_id: Optional[str] = None, event_id: Optional[str] = None) -> List[Transaction]:
        query = select(Transaction).where(Transaction.deleted_at == None)
        if account_id:
            query = query.where(Transaction.account_id == account_id)
        if event_id:
            query = query.where(Transaction.event_id == event_id)
        
        result = await self.db.execute(query.order_by(Transaction.date.desc()))
        return list(result.scalars().all())

    async def get_by_id(self, transaction_id: str) -> Optional[Transaction]:
        result = await self.db.execute(select(Transaction).where(Transaction.id == transaction_id, Transaction.deleted_at == None))
        return result.scalar_one_or_none()

    async def create(self, transaction_data: TransactionCreate) -> Transaction:
        db_transaction = Transaction(**transaction_data.model_dump())
        self.db.add(db_transaction)
        await self.db.commit()
        await self.db.refresh(db_transaction)
        return db_transaction

    async def update(self, transaction_id: str, transaction_data: TransactionUpdate) -> Optional[Transaction]:
        db_transaction = await self.get_by_id(transaction_id)
        if not db_transaction:
            return None
        
        update_data = transaction_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_transaction, key, value)
        
        await self.db.commit()
        await self.db.refresh(db_transaction)
        return db_transaction

    async def delete(self, transaction_id: str) -> bool:
        db_transaction = await self.get_by_id(transaction_id)
        if not db_transaction:
            return False
        
        db_transaction.deleted_at = datetime.now(timezone.utc)
        await self.db.commit()
        return True
