from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.modules.auth.schemas import LoginRequest, Token, UserCreate
from app.modules.auth.repository import AuthRepository
from app.modules.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])

async def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    repo = AuthRepository(db)
    return AuthService(repo)

@router.post("/register", response_model=dict)
async def register(
    user_data: UserCreate,
    service: AuthService = Depends(get_auth_service)
):
    user = await service.register(user_data.model_dump())
    return {
        "success": True,
        "data": user
    }

@router.post("/login", response_model=dict)
async def login(
    login_data: LoginRequest,
    service: AuthService = Depends(get_auth_service)
):
    token = await service.authenticate_user(login_data)
    return {
        "success": True,
        "data": token.model_dump()
    }
