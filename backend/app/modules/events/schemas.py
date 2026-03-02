from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional

class FinanceEventBase(BaseModel):
    name: str
    date: date
    artist_id: str
    category_id: str
    budget: float = 0.0
    description: Optional[str] = None

class FinanceEventCreate(FinanceEventBase):
    pass

class FinanceEventUpdate(BaseModel):
    name: Optional[str] = None
    date: Optional[date] = None
    artist_id: Optional[str] = None
    category_id: Optional[str] = None
    budget: Optional[float] = None
    description: Optional[str] = None

class FinanceEventResponse(FinanceEventBase):
    id: str
    
    model_config = ConfigDict(from_attributes=True)

