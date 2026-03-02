
import asyncio
import os
import sys
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, delete

# Add /app to sys.path
sys.path.append("/app")

# Import ALL models to ensure SQLAlchemy mappers are initialized
from app.modules.auth.models import User
from app.modules.accounts.models import Account
from app.modules.artists.models import Artist
from app.modules.categories.models import Category
from app.modules.chart_of_accounts.models import ChartAccount, ChartType
from app.modules.events.models import FinanceEvent
from app.modules.transactions.models import Transaction, TransactionType, TransactionStatus

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://bridge_user:bridge_pass_123@db:5432/bridge_db")

CHART_OF_ACCOUNTS = [
    # RECEITAS (Group 1)
    {"code": "1", "name": "RECEITAS", "type": ChartType.REVENUE, "is_subtotal": True},
    {"code": "1.1", "name": "Faturamento de Shows", "type": ChartType.REVENUE, "is_subtotal": False},
    {"code": "1.2", "name": "Publicidade / Arubas", "type": ChartType.REVENUE, "is_subtotal": False},
    {"code": "1.3", "name": "Direitos Autorais / Ecat", "type": ChartType.REVENUE, "is_subtotal": False},
    {"code": "1.4", "name": "Vendas de Produtos", "type": ChartType.REVENUE, "is_subtotal": False},
    
    # DESPESAS (Group 2)
    {"code": "2", "name": "DESPESAS", "type": ChartType.EXPENSE, "is_subtotal": True},
    {"code": "2.1", "name": "LOGÍSTICA", "type": ChartType.EXPENSE, "is_subtotal": True},
    {"code": "2.1.1", "name": "Passagens Aéreas", "type": ChartType.EXPENSE, "is_subtotal": False},
    {"code": "2.1.2", "name": "Hospedagem", "type": ChartType.EXPENSE, "is_subtotal": False},
    {"code": "2.1.3", "name": "Alimentação e Diárias", "type": ChartType.EXPENSE, "is_subtotal": False},
    {"code": "2.1.4", "name": "Transportes e Vans", "type": ChartType.EXPENSE, "is_subtotal": False},
    {"code": "2.2", "name": "PRODUÇÃO", "type": ChartType.EXPENSE, "is_subtotal": True},
    {"code": "2.2.1", "name": "Cachês da Banda", "type": ChartType.EXPENSE, "is_subtotal": False},
    {"code": "2.2.2", "name": "Cachês Equipe Técnica", "type": ChartType.EXPENSE, "is_subtotal": False},
    {"code": "2.2.3", "name": "Locações e Equipamentos", "type": ChartType.EXPENSE, "is_subtotal": False},
    {"code": "2.3", "name": "MARKETING", "type": ChartType.EXPENSE, "is_subtotal": True},
    {"code": "2.3.1", "name": "Impulsionamento Social", "type": ChartType.EXPENSE, "is_subtotal": False},
    {"code": "2.3.2", "name": "Design e Conteúdo", "type": ChartType.EXPENSE, "is_subtotal": False},
    {"code": "2.4", "name": "ADMINISTRATIVO", "type": ChartType.EXPENSE, "is_subtotal": True},
    {"code": "2.4.1", "name": "Comissões de Escritório", "type": ChartType.EXPENSE, "is_subtotal": False},
    {"code": "2.4.2", "name": "Tarifas Bancárias", "type": ChartType.EXPENSE, "is_subtotal": False},
    {"code": "2.4.3", "name": "Software e Cloud", "type": ChartType.EXPENSE, "is_subtotal": False},
    {"code": "2.4.4", "name": "Impostos e Taxas", "type": ChartType.EXPENSE, "is_subtotal": False},
]

async def seed():
    print(f"Connecting to {DATABASE_URL}")
    engine = create_async_engine(DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        try:
            print("Cleaning existing data...")
            await session.execute(delete(Transaction))
            print("Transactions cleared.")
            
            await session.execute(delete(ChartAccount))
            print("Chart accounts cleared.")
            
            print("Seeding new chart of accounts...")
            for item in CHART_OF_ACCOUNTS:
                new_acc = ChartAccount(
                    id=str(uuid.uuid4()),
                    code=item["code"],
                    name=item["name"],
                    type=item["type"],
                    is_subtotal=item["is_subtotal"]
                )
                session.add(new_acc)
            
            await session.commit()
            print("Seed completed successfully!")
        except Exception as e:
            await session.rollback()
            print(f"Error during seeding: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(seed())
