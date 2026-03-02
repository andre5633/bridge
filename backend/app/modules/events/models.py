from sqlalchemy import Column, String, Float, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.core.models import BaseModel

class FinanceEvent(BaseModel):
    __tablename__ = "finance_events"

    name = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    artist_id = Column(String, ForeignKey("artists.id"), nullable=False)
    category_id = Column(String, ForeignKey("categories.id"), nullable=False)
    budget = Column(Float, nullable=False, default=0.0)
    description = Column(String, nullable=True)

    artist = relationship("Artist", back_populates="events")
    category = relationship("Category", back_populates="events")
