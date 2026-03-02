import asyncio
from app.core.database import async_session_maker
from sqlalchemy import select
from app.modules.transactions.models import Transaction
from app.modules.accounts.models import Account
from app.modules.transactions.schemas import TransactionType, TransactionStatus

async def sync():
    async with async_session_maker() as db:
        # Get all paid transactions
        tx_query = select(Transaction).where(Transaction.status == TransactionStatus.PAID, Transaction.deleted_at == None)
        tx_result = await db.execute(tx_query)
        txs = tx_result.scalars().all()
        print(f"Loaded {len(txs)} paid transactions")
        
        deltas = {}
        for t in txs:
            acc_id = str(t.account_id)
            if acc_id not in deltas:
                deltas[acc_id] = 0.0
            
            if t.type == TransactionType.INCOME:
                deltas[acc_id] += t.amount
            elif t.type == TransactionType.EXPENSE:
                deltas[acc_id] -= t.amount
                
        # Update accounts
        acc_query = select(Account).where(Account.deleted_at == None)
        acc_result = await db.execute(acc_query)
        accs = acc_result.scalars().all()
        
        for acc in accs:
            old_balance = acc.balance
            acc_id_str = str(acc.id)
            new_balance = deltas.get(acc_id_str, 0.0)
            acc.balance = new_balance
            print(f"Account {acc.name} ({acc_id_str}) updated: {old_balance} -> {acc.balance}")
            
        await db.commit()
        print("Done sync")

if __name__ == "__main__":
    asyncio.run(sync())