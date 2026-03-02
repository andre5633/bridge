from pydantic import BaseModel, ConfigDict
from enum import Enum
from typing import Optional

class AccountType(str, Enum):
    CHECKING = "Corrente"
    SAVINGS = "Poupança"
    CREDIT = "Crédito"
    CASH = "Dinheiro"
    INVESTMENT = "Investimento"

class EntityType(str, Enum):
    PF = "PF"
    PJ = "PJ"

class AccountBase(BaseModel):
    name: str
    type: AccountType
    balance: float
    color: str
    entity_type: Optional[EntityType] = None

class AccountCreate(AccountBase):
    pass

class AccountUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[AccountType] = None
    balance: Optional[float] = None
    color: Optional[str] = None
    entity_type: Optional[EntityType] = None

class AccountResponse(AccountBase):
    id: str
    
    model_config = ConfigDict(from_attributes=True)
