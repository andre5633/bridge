from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.transactions.repository import TransactionRepository
from app.modules.chart_of_accounts.repository import ChartAccountRepository
from app.modules.events.repository import EventRepository
from app.modules.reports.schemas import DREItem, DREResponse, AnalyticsResponse, AnalyticsMetric
from app.modules.transactions.models import Transaction
from app.modules.chart_of_accounts.models import ChartAccount
from app.modules.transactions.schemas import TransactionStatus
from typing import List, Dict, Optional
from datetime import datetime

class ReportService:
    def __init__(self, db: AsyncSession):
        self.tx_repo = TransactionRepository(db)
        self.chart_repo = ChartAccountRepository(db)
        self.event_repo = EventRepository(db)

    async def get_dre(self, year: int, artist_id: Optional[str] = None, event_id: Optional[str] = None) -> DREResponse:
        all_charts = await self.chart_repo.get_all()
        all_txs = await self.tx_repo.get_all()
        
        # We need events to match artist_id if necessary
        all_events = await self.event_repo.get_all() if artist_id else []
        artist_event_ids = [str(e.id) for e in all_events if str(e.artist_id) == artist_id] if artist_id else []

        relevant_txs = []
        for t in all_txs:
            # Check artist filter
            if artist_id and (not t.event_id or str(t.event_id) not in artist_event_ids):
                continue
            
            # Check event filter
            if event_id and (not t.event_id or str(t.event_id) != event_id):
                continue
                
            relevant_txs.append(t)
        
        # Filter transactions for the year
        relevant_txs_filtered = [
            t for t in relevant_txs 
            if t.date.year == year or (t.payment_date and t.payment_date.year == year)
        ]
        
        relevant_txs = relevant_txs_filtered

        # Helper to build the DRE tree (recursive)
        def build_node(accounts: List[ChartAccount]) -> List[DREItem]:
            sorted_accs = sorted(accounts, key=lambda a: a.code)
            nodes = []
            
            for acc in sorted_accs:
                # Find children
                prefix = f"{acc.code}."
                children_accs = [
                    c for c in all_charts 
                    if c.code.startswith(prefix) and len(c.code.split('.')) == len(acc.code.split('.')) + 1
                ]
                
                children_nodes = build_node(children_accs)
                
                monthly_planned = [0.0] * 12
                monthly_realized = [0.0] * 12

                if not acc.is_subtotal and not children_nodes:
                    # Leaf node (actual category)
                    # Safely check for timezone-aware dates
                    for t in relevant_txs:
                        if str(t.chart_account_id) == str(acc.id):
                            # Previsto (Competência): Usamos a 'date' independentemente do status
                            if t.date and t.date.year == year:
                                monthly_planned[t.date.month - 1] += t.amount
                            
                            # Realizado (Caixa): Usamos a 'payment_date' SE o status for PAGO
                            if t.status == TransactionStatus.PAID and t.payment_date and t.payment_date.year == year:
                                monthly_realized[t.payment_date.month - 1] += t.amount
                else:
                    # Parent or Subtotal (aggregate from children)
                    for child in children_nodes:
                        for i in range(12):
                            monthly_planned[i] += child.monthly_planned[i]
                            monthly_realized[i] += child.monthly_realized[i]

                nodes.append(DREItem(
                    account_id=str(acc.id),
                    code=acc.code,
                    name=acc.name,
                    is_subtotal=acc.is_subtotal,
                    type=acc.type,
                    monthly_planned=monthly_planned,
                    monthly_realized=monthly_realized,
                    total_planned=sum(monthly_planned),
                    total_realized=sum(monthly_realized),
                    children=children_nodes
                ))
            return nodes

        root_accounts = [acc for acc in all_charts if "." not in acc.code]
        return DREResponse(year=year, tree=build_node(root_accounts))

    async def get_analytics(self, start_date: str, end_date: str) -> AnalyticsResponse:
        all_txs = await self.tx_repo.get_all()
        all_events = await self.event_repo.get_all()
        
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
        
        income_forecast = 0.0
        income_realized = 0.0
        expense_forecast = 0.0
        expense_realized = 0.0
        
        cc_map = {} # event_id -> total amount

        for t in all_txs:
            if not t.date:
                continue
                
            # Safely handle timezone conversions if necessary for the combination
            # Here keeping it simple by just checking the isoformat or dates directly
            try:
                # Assuming naive or easily comparable dates depending on how they are stored
                # Make everything offset-naive just for filtering if start/end are naive strings (YYYY-MM-DD)
                # But since t.date might be offset-aware, we use date()
                t_date_str = t.date.date().isoformat()
            except AttributeError:
                # fallback for string parsing if db returns strings
                t_date_str = str(t.date).split('T')[0][:10] if 'T' in str(t.date) else str(t.date)[:10]

            is_inc = t.type == "Receita"
            
            # Forecast (Competência - uses due date / `date`)
            if start_date[:10] <= t_date_str <= end_date[:10]:
                if is_inc: income_forecast += t.amount
                else: expense_forecast += t.amount
                
            # Realized (Caixa - uses `payment_date` and must be PAID)
            if t.status == TransactionStatus.PAID and t.payment_date:
                try:
                    p_date_str = t.payment_date.date().isoformat()
                except AttributeError:
                    p_date_str = str(t.payment_date).split('T')[0][:10] if 'T' in str(t.payment_date) else str(t.payment_date)[:10]

                if start_date[:10] <= p_date_str <= end_date[:10]:
                    if is_inc: income_realized += t.amount
                    else: expense_realized += t.amount
                    
                    # Event distribution (on realized expenses/income) 
                    # If you only want costs per event, keep `expense_realized` logic or only count `Despesa`
                    # For now, counting everything to cc_map but traditionally it's expenses:
                    if t.event_id and not is_inc:
                        cc_id = str(t.event_id)
                        cc_map[cc_id] = cc_map.get(cc_id, 0.0) + t.amount

        # Build distribution metrics
        dist_metrics = []
        total_cc_val = sum(cc_map.values())
        
        for cc_id, val in cc_map.items():
            event = next((e for e in all_events if str(e.id) == cc_id), None)
            name = event.name if event else "Desconhecido"
            dist_metrics.append(AnalyticsMetric(
                name=name,
                value=val,
                percent=(val / total_cc_val * 100) if total_cc_val > 0 else 0
            ))
            
        dist_metrics.sort(key=lambda x: x.value, reverse=True)

        return AnalyticsResponse(
            income_forecast=income_forecast,
            income_realized=income_realized,
            expense_forecast=expense_forecast,
            expense_realized=expense_realized,
            cost_center_distribution=dist_metrics
        )
