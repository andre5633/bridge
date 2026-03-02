from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.modules.auth.models import User

class AuthRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_email(self, email: str) -> dict | None:
        result = await self.db.execute(select(User).filter(User.email == email))
        user = result.scalars().first()
        if user:
            return {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "hashed_password": user.hashed_password,
                "is_active": user.is_active
            }
        return None
    async def create_user(self, user: User) -> User:
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user
