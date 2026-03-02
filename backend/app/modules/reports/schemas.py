from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import date

class DREItem(BaseModel):
    account_id: str
    code: str
    name: str
    is_subtotal: bool
    type: str
    monthly_planned: List[float]
    monthly_realized: List[float]
    total_planned: float
    total_realized: float
    children: List['DREItem'] = []

class DREResponse(BaseModel):
    year: int
    tree: List[DREItem]

class AnalyticsMetric(BaseModel):
    name: str
    value: float
    percent: float

class AnalyticsResponse(BaseModel):
    income_forecast: float
    income_realized: float
    expense_forecast: float
    expense_realized: float
    cost_center_distribution: List[AnalyticsMetric]
