from sqlalchemy import Column, String, Float, DateTime, Enum as SQLEnum, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
import enum
from datetime import datetime, timezone
from app.core.models import BaseModel

class TransactionType(str, enum.Enum):
    INCOME = "Receita"
    EXPENSE = "Despesa"
    TRANSFER = "Transferência"

class TransactionStatus(str, enum.Enum):
    PENDING = "Em Aberto"
    PAID = "Pago"

class Transaction(BaseModel):
    __tablename__ = "transactions"

    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    payment_date = Column(DateTime(timezone=True), nullable=True)
    type = Column(SQLEnum(TransactionType), nullable=False)
    status = Column(SQLEnum(TransactionStatus), nullable=False, default=TransactionStatus.PENDING)
    
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)
    chart_account_id = Column(String, ForeignKey("chart_accounts.id"), nullable=False)
    event_id = Column(String, ForeignKey("finance_events.id"), nullable=True)
    
    observation = Column(String, nullable=True)
    transfer_group_id = Column(String, nullable=True) # For identifying both sides of a transfer
    
    # Relationships
    account = relationship("Account")
    chart_account = relationship("ChartAccount")
    event = relationship("FinanceEvent")
