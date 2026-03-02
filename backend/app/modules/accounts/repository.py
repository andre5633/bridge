from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.modules.accounts.models import Account
from app.modules.accounts.schemas import AccountCreate, AccountUpdate
from typing import List, Optional

class AccountRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[Account]:
        result = await self.db.execute(select(Account).where(Account.deleted_at == None))
        return list(result.scalars().all())

    async def get_by_id(self, account_id: str) -> Optional[Account]:
        result = await self.db.execute(select(Account).where(Account.id == account_id, Account.deleted_at == None))
        return result.scalar_one_or_none()

    async def create(self, account_data: AccountCreate) -> Account:
        db_account = Account(**account_data.model_dump())
        self.db.add(db_account)
        await self.db.commit()
        await self.db.refresh(db_account)
        return db_account

    async def update(self, account_id: str, account_data: AccountUpdate) -> Optional[Account]:
        db_account = await self.get_by_id(account_id)
        if not db_account:
            return None
        
        update_data = account_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_account, key, value)
        
        await self.db.commit()
        await self.db.refresh(db_account)
        return db_account

    async def delete(self, account_id: str) -> bool:
        db_account = await self.get_by_id(account_id)
        if not db_account:
            return False
        
        # Soft delete
        from datetime import datetime, timezone
        db_account.deleted_at = datetime.now(timezone.utc)
        await self.db.commit()
        return True

    async def update_balance(self, account_id: str, delta: float) -> Optional[Account]:
        db_account = await self.get_by_id(account_id)
        if not db_account:
            return None
        
        db_account.balance += delta
        await self.db.commit()
        await self.db.refresh(db_account)
        return db_account
