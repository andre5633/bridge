from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.core.models import BaseModel

class Artist(BaseModel):
    __tablename__ = "artists"

    name = Column(String, nullable=False)
    color = Column(String, nullable=False, default="#8B5CF6")

    events = relationship("FinanceEvent", back_populates="artist")
