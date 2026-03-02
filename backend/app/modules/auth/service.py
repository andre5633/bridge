import jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from app.modules.auth.repository import AuthRepository
from app.modules.auth.schemas import LoginRequest, Token
from app.core.config import settings
from app.core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_email: str = payload.get("sub")
        if user_email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    repo = AuthRepository(db)
    user = await repo.get_user_by_email(user_email)
    if user is None:
        raise credentials_exception
    return user

import bcrypt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        password_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception as e:
        print(f"ERROR: Password verification failed: {e}")
        return False

def get_password_hash(password: str) -> str:
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=60 * 24) # Default 1 day
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

class AuthService:
    def __init__(self, repository: AuthRepository):
        self.repository = repository

    async def register(self, user_data: dict) -> dict:
        from app.modules.auth.models import User as UserModel
        
        # Check if user exists
        existing = await self.repository.get_user_by_email(user_data.get("email"))
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
            
        new_user = UserModel(
            name=user_data.get("name"),
            email=user_data.get("email"),
            hashed_password=get_password_hash(user_data.get("password"))
        )
        saved_user = await self.repository.create_user(new_user)
        return {
            "id": str(saved_user.id),
            "email": saved_user.email,
            "name": saved_user.name
        }

    async def authenticate_user(self, login_data: LoginRequest) -> Token:
        user_dict = await self.repository.get_user_by_email(login_data.email)
        if not user_dict or not user_dict.get("is_active"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Access properties only after full fetch or rely on eager loading, but here scalar_one_or_none handles it
        if not verify_password(login_data.password, user_dict.get("hashed_password")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(data={"sub": user_dict.get("email"), "id": user_dict.get("id")})
        return Token(access_token=access_token, user_name=user_dict.get("name"))
