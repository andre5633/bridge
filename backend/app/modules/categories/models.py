from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.core.models import BaseModel

class Category(BaseModel):
    __tablename__ = "categories"

    name = Column(String, nullable=False)

    events = relationship("FinanceEvent", back_populates="category")
