from sqlalchemy import Column, String, Boolean, Enum as SQLEnum
import enum
from app.core.models import BaseModel

class ChartType(str, enum.Enum):
    REVENUE = "Receita"
    EXPENSE = "Despesa"

class ChartAccount(BaseModel):
    __tablename__ = "chart_accounts"

    code = Column(String, nullable=False)
    name = Column(String, nullable=False)
    type = Column(SQLEnum(ChartType), nullable=False)
    description = Column(String, nullable=True)
    is_subtotal = Column(Boolean, nullable=False, default=False)
