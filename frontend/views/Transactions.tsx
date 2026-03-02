
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, TransactionStatus, Account, FinanceEvent, ChartAccount } from '../types';
import { StorageService } from '../services/storageService';
import { TransactionService } from '../services/transactionService';
import { Button } from '../components/ui/Button';
import { Plus, Search, ArrowRightLeft, RotateCcw, Calendar } from 'lucide-react';
import { TransactionList } from '../components/Transactions/TransactionList';
import { MovementFormModal } from '../components/Transactions/MovementFormModal';
import { TransferModal } from '../components/Transactions/TransferModal';
import { PaymentModal } from '../components/Transactions/PaymentModal';
import { Select } from '../components/ui/Select';

export const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [events, setEvents] = useState<FinanceEvent[]>([]);
  const [chartAccounts, setChartAccounts] = useState<ChartAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Orchestrator States
  const [formOpen, setFormOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const [editingTx, setEditingTx] = useState<Transaction | undefined>();
  const [payingTx, setPayingTx] = useState<Transaction | null>(null);
  const [defaultType, setDefaultType] = useState<TransactionType>(TransactionType.EXPENSE);

  // Helper to get first and last day of current month
  const getDefaultDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    return { firstDay, lastDay };
  };

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [startDate, setStartDate] = useState(getDefaultDates().firstDay);
  const [endDate, setEndDate] = useState(getDefaultDates().lastDay);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    try {
      const [txs, accs, evts, charts] = await Promise.all([
        TransactionService.getAll(),
        StorageService.getAccounts(),
        StorageService.getEvents(),
        StorageService.getChartOfAccounts()
      ]);
      setTransactions(txs);
      setAccounts(accs);
      setEvents(evts);
      setChartAccounts(charts);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = (t.description || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || (statusFilter === 'PAID' ? t.status === TransactionStatus.PAID : t.status === TransactionStatus.PENDING);
      const matchDate = t.date >= startDate && t.date <= endDate;
      return matchSearch && matchStatus && matchDate;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, search, statusFilter, startDate, endDate]);

  const handleOpenForm = (type: TransactionType, tx?: Transaction) => {
    setDefaultType(type);
    setEditingTx(tx);
    setFormOpen(true);
  };

  const handleDelete = async (tx: Transaction) => {
    if (!confirm("Deseja excluir esta movimentação permanentemente?")) return;
    try {
      await TransactionService.delete(tx.id);
      const data = await StorageService.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      alert('Erro ao excluir movimentação.');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    const defaults = getDefaultDates();
    setStartDate(defaults.firstDay);
    setEndDate(defaults.lastDay);
  };

  return (
    <div className="w-full space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">Movimentações</h2>
          <p className="text-gray-500 font-medium">Controle total do seu fluxo de caixa e eventos.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button onClick={() => setTransferOpen(true)} variant="secondary" className="rounded-2xl border-gray-200 px-6 h-14 font-bold uppercase tracking-widest text-[10px]">
            <ArrowRightLeft size={16} className="mr-2" /> Transferir
          </Button>
          <Button onClick={() => handleOpenForm(TransactionType.INCOME)} className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 h-14 rounded-2xl px-6 font-bold uppercase tracking-widest text-[10px]">
            <Plus size={16} className="mr-2" /> Receita
          </Button>
          <Button onClick={() => handleOpenForm(TransactionType.EXPENSE)} className="bg-rose-600 hover:bg-rose-700 text-white border-0 h-14 rounded-2xl px-6 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-rose-100">
            <Plus size={16} className="mr-2" /> Despesa
          </Button>
        </div>
      </div>

      {/* Toolbar de Filtros Consolidada em Linha Única */}
      <div className="bg-white p-3 rounded-[32px] shadow-soft border border-gray-100 flex flex-col lg:flex-row gap-3 items-center">

        {/* Busca - flex-1 para ocupar o espaço disponível */}
        <div className="relative w-full lg:flex-1">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black" />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-black/5 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full lg:w-44">
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="w-full text-[10px] uppercase tracking-widest h-13 !py-3.5 !rounded-2xl bg-gray-50"
          >
            <option value="ALL">Status</option>
            <option value="PAID">Liquidados</option>
            <option value="PENDING">Em Aberto</option>
          </Select>
        </div>

        {/* Date Range Pill */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3.5 h-13 w-full lg:w-auto border border-transparent focus-within:border-black/5 transition-all">
          <Calendar size={14} className="text-gray-400 shrink-0" />
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="bg-transparent border-0 text-[11px] font-black uppercase outline-none text-gray-600 cursor-pointer w-[105px]"
          />
          <span className="text-gray-300 font-black text-[9px] uppercase px-1">até</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="bg-transparent border-0 text-[11px] font-black uppercase outline-none text-gray-600 cursor-pointer w-[105px]"
          />
        </div>

        {/* Botão Reset Compacto */}
        <button
          onClick={handleResetFilters}
          className="h-13 w-13 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all shrink-0 border border-gray-50"
          title="Limpar Filtros"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Contador de resultados minimalista */}
      <div className="px-4 flex justify-between items-center">
        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
          {filtered.length} lançamentos encontrados no período
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-[32px] border border-gray-100 animate-pulse">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Carregando movimentações...</p>
        </div>
      ) : (
        <TransactionList
          transactions={filtered}
          accounts={accounts}
          chartAccounts={chartAccounts}
          onEdit={(tx) => handleOpenForm(tx.type, tx)}
          onDelete={handleDelete}
          onPay={(tx) => { setPayingTx(tx); setPaymentOpen(true); }}
        />
      )}

      {formOpen && (
        <MovementFormModal
          initialType={defaultType}
          editingTx={editingTx}
          accounts={accounts}
          events={events}
          chartAccounts={chartAccounts}
          onClose={() => setFormOpen(false)}
          onSave={() => { load(); setFormOpen(false); }}
        />
      )}

      {transferOpen && (
        <TransferModal
          accounts={accounts}
          chartAccounts={chartAccounts}
          onClose={() => setTransferOpen(false)}
          onSave={() => { load(); setTransferOpen(false); }}
        />
      )}

      {paymentOpen && payingTx && (
        <PaymentModal
          tx={payingTx}
          accounts={accounts}
          onClose={() => setPaymentOpen(false)}
          onSave={() => { load(); setPaymentOpen(false); }}
        />
      )}
    </div>
  );
};
