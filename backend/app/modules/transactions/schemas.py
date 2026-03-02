from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from enum import Enum

class TransactionType(str, Enum):
    INCOME = "Receita"
    EXPENSE = "Despesa"
    TRANSFER = "Transferência"

class TransactionStatus(str, Enum):
    PENDING = "Em Aberto"
    PAID = "Pago"

class TransactionBase(BaseModel):
    description: str
    amount: float
    date: datetime
    payment_date: Optional[datetime] = None
    type: TransactionType
    status: TransactionStatus = TransactionStatus.PENDING
    account_id: str
    chart_account_id: str
    event_id: Optional[str] = None
    observation: Optional[str] = None
    transfer_group_id: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[datetime] = None
    payment_date: Optional[datetime] = None
    type: Optional[TransactionType] = None
    status: Optional[TransactionStatus] = None
    account_id: Optional[str] = None
    chart_account_id: Optional[str] = None
    event_id: Optional[str] = None
    observation: Optional[str] = None

class TransactionResponse(TransactionBase):
    id: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
