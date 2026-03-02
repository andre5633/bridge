from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class ArtistBase(BaseModel):
    name: str
    color: str = "#8B5CF6"

class ArtistCreate(ArtistBase):
    pass

class ArtistUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None

class ArtistResponse(ArtistBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
