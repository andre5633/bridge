import React, { useState } from 'react';
import { Transaction, TransactionType, TransactionStatus, Account, FinanceEvent, ChartAccount, ChartType } from '../../types';
import { StorageService, generateUUID } from '../../services/storageService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Calendar, Wallet, Layers, Target } from 'lucide-react';

interface FormProps {
  initialType: TransactionType;
  editingTx?: Transaction;
  accounts: Account[];
  events: FinanceEvent[];
  chartAccounts: ChartAccount[];
  onClose: () => void;
  onSave: () => void;
}

export const TransactionFormModal: React.FC<FormProps> = ({ initialType, editingTx, accounts, events, chartAccounts, onClose, onSave }) => {
  const [type, setType] = useState(editingTx?.type || initialType);
  const [amount, setAmount] = useState(editingTx?.amount.toString() || '');
  const [desc, setDesc] = useState(editingTx?.description || '');
  const [date, setDate] = useState(editingTx?.date || new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState(editingTx?.status || TransactionStatus.PAID);
  const [accId, setAccId] = useState(editingTx?.accountId || '');
  const [chartId, setChartId] = useState(editingTx?.chartAccountId || '');
  const [eventId, setEventId] = useState(editingTx?.eventId || '');

  const filteredCharts = chartAccounts.filter(c => (type === TransactionType.INCOME ? ChartType.REVENUE : ChartType.EXPENSE) === c.type && !c.isSubtotal);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accId || !chartId) return alert("Selecione conta e categoria.");
    const val = parseFloat(amount.replace(',', '.'));

    const tx: Transaction = {
      id: editingTx?.id || generateUUID(),
      description: desc, amount: val, date, status, accountId: accId, chartAccountId: chartId,
      eventId: eventId || undefined, type, createdAt: editingTx?.createdAt || Date.now()
    };

    const all = await StorageService.getTransactions();
    const updated = editingTx ? all.map(t => t.id === editingTx.id ? tx : t) : [tx, ...all];
    await StorageService.saveTransactions(updated);

    // Balance update logic on Save
    if (status === TransactionStatus.PAID && !editingTx) {
      const accs = [...accounts];
      const idx = accs.findIndex(a => a.id === accId);
      if (idx >= 0) accs[idx].balance += val * (type === TransactionType.INCOME ? 1 : -1);
      StorageService.saveAccounts(accs);
    }

    onSave();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-10 animate-[scaleIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black tracking-tight">{editingTx ? 'Editar' : 'Novo'} Lançamento</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl">
            <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${type === TransactionType.INCOME ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}>Receita</button>
            <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${type === TransactionType.EXPENSE ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}>Despesa</button>
          </div>

          <div className="relative">
            <span className="absolute left-8 top-1/2 -translate-y-1/2 text-3xl font-bold text-gray-300">R$</span>
            <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full pl-24 pr-8 py-8 text-5xl font-black bg-gray-50 border-0 rounded-[32px] outline-none placeholder:text-gray-200" placeholder="0,00" required autoFocus />
          </div>

          <Input label="Descrição" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Serviços de Design" required />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Vencimento / Data" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full p-3 bg-gray-50 rounded-xl text-sm border-0 focus:ring-2 focus:ring-black/5 transition-all">
                <option value={TransactionStatus.PAID}>Liquidado (Pago)</option>
                <option value={TransactionStatus.PENDING}>Em Aberto (Agendado)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest">Conta</label>
              <select value={accId} onChange={e => setAccId(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl text-sm border-0" required>
                <option value="">Selecionar...</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest">Categoria</label>
              <select value={chartId} onChange={e => setChartId(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl text-sm border-0" required>
                <option value="">Selecionar...</option>
                {filteredCharts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest">Evento Relacionado</label>
            <select value={eventId} onChange={e => setEventId(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl text-sm border-0">
              <option value="">Nenhum Evento</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
            </select>
          </div>

          <Button type="submit" className="w-full h-16 text-lg rounded-[24px] shadow-xl shadow-black/10 mt-4">Confirmar Lançamento</Button>
        </form>
      </div>
    </div>
  );
};