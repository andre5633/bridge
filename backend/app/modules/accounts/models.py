from sqlalchemy import Column, String, Float, Boolean, Enum as SQLEnum
import enum
from app.core.models import BaseModel

class AccountType(str, enum.Enum):
    CHECKING = "Corrente"
    SAVINGS = "Poupança"
    CREDIT = "Crédito"
    CASH = "Dinheiro"
    INVESTMENT = "Investimento"

class EntityType(str, enum.Enum):
    PF = "PF"
    PJ = "PJ"

class Account(BaseModel):
    __tablename__ = "accounts"

    name = Column(String, nullable=False)
    type = Column(SQLEnum(AccountType), nullable=False, default=AccountType.CHECKING)
    balance = Column(Float, nullable=False, default=0.0)
    color = Column(String, nullable=False, default="#007AFF")
    entity_type = Column(SQLEnum(EntityType), nullable=True)
