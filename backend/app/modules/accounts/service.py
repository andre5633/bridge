from app.modules.accounts.repository import AccountRepository
from app.modules.accounts.schemas import AccountCreate, AccountUpdate, AccountResponse
from fastapi import HTTPException, status
from typing import List

class AccountService:
    def __init__(self, repository: AccountRepository):
        self.repository = repository

    async def list_accounts(self) -> List[AccountResponse]:
        accounts = await self.repository.get_all()
        return [AccountResponse.model_validate(a) for a in accounts]

    async def get_account(self, account_id: str) -> AccountResponse:
        account = await self.repository.get_by_id(account_id)
        if not account:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
        return AccountResponse.model_validate(account)

    async def create_account(self, account_data: AccountCreate) -> AccountResponse:
        account = await self.repository.create(account_data)
        return AccountResponse.model_validate(account)

    async def update_account(self, account_id: str, account_data: AccountUpdate) -> AccountResponse:
        account = await self.repository.update(account_id, account_data)
        if not account:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
        return AccountResponse.model_validate(account)

    async def delete_account(self, account_id: str) -> None:
        success = await self.repository.delete(account_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
