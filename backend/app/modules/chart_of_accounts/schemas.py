from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
import enum

class ChartType(str, enum.Enum):
    REVENUE = "Receita"
    EXPENSE = "Despesa"

class ChartAccountBase(BaseModel):
    code: str
    name: str
    type: ChartType
    description: Optional[str] = None
    is_subtotal: bool = False

class ChartAccountCreate(ChartAccountBase):
    pass

class ChartAccountUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    type: Optional[ChartType] = None
    description: Optional[str] = None
    is_subtotal: Optional[bool] = None

class ChartAccountResponse(ChartAccountBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
