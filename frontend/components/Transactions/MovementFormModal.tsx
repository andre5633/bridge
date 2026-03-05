
import React, { useState } from 'react';
import { Transaction, TransactionType, TransactionStatus, Account, FinanceEvent, ChartAccount, ChartType } from '../../types';
import { StorageService, generateUUID } from '../../services/storageService';
import { TransactionService } from '../../services/transactionService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { X, Check, Info, Hash } from 'lucide-react';

interface FormProps {
  initialType: TransactionType;
  editingTx?: Transaction;
  accounts: Account[];
  events: FinanceEvent[];
  chartAccounts: ChartAccount[];
  onClose: () => void;
  onSave: () => void;
  preSelectedEventId?: string;
}

export const MovementFormModal: React.FC<FormProps> = ({
  initialType, editingTx, accounts, events, chartAccounts, onClose, onSave, preSelectedEventId
}) => {
  const [type, setType] = useState(editingTx?.type || initialType);
  const [amount, setAmount] = useState(editingTx?.amount.toString() || '');
  const [desc, setDesc] = useState(editingTx?.description || '');
  const [date, setDate] = useState(editingTx?.date || new Date().toISOString().split('T')[0]);
  const [paymentDate, setPaymentDate] = useState(editingTx?.paymentDate || new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState(editingTx?.status || TransactionStatus.PAID);
  const [accId, setAccId] = useState(editingTx?.accountId || (accounts.length > 0 ? accounts[0].id : ''));
  const [chartId, setChartId] = useState(editingTx?.chartAccountId || '');
  const [eventId, setEventId] = useState(editingTx?.eventId || preSelectedEventId || '');
  const [installments, setInstallments] = useState('1');

  const isIncome = type === TransactionType.INCOME;
  const filteredCharts = chartAccounts.filter(c =>
    (isIncome ? ChartType.REVENUE : ChartType.EXPENSE) === c.type && !c.isSubtotal
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accId || !chartId) return alert("Selecione a conta e a categoria.");

    const val = parseFloat(amount.replace(',', '.'));
    if (isNaN(val) || val <= 0) return alert("Informe um valor válido.");

    try {
      const instCount = parseInt(installments) || 1;

      if (editingTx) {
        // Update existing
        await TransactionService.update(editingTx.id, {
          description: desc,
          amount: val,
          date: date,
          status,
          paymentDate: status === TransactionStatus.PAID ? (editingTx.paymentDate || date) : undefined,
          accountId: accId,
          chartAccountId: chartId,
          eventId: eventId || undefined,
          type
        });
      } else {
        // Create new (handle installments)
        const instCount = parseInt(installments) || 1;
        const totalVal = val;
        const baseInstallmentValue = Math.round((totalVal / instCount) * 100) / 100;

        for (let i = 0; i < instCount; i++) {
          const currentLabel = instCount > 1 ? ` (${i + 1}/${instCount})` : '';
          const [y, m, d_] = date.split('-').map(Number);
          const baseDate = new Date(y, m - 1, d_);
          baseDate.setMonth(baseDate.getMonth() + i);
          const installmentDate = baseDate.toISOString().split('T')[0];
          const instStatus = i === 0 ? status : TransactionStatus.PENDING;

          const finalAmount = (i === instCount - 1)
            ? Math.round((totalVal - (baseInstallmentValue * (instCount - 1))) * 100) / 100
            : baseInstallmentValue;

          await TransactionService.create({
            description: `${desc}${currentLabel}`,
            amount: finalAmount,
            date: installmentDate,
            status: instStatus,
            paymentDate: instStatus === TransactionStatus.PAID ? installmentDate : undefined,
            accountId: accId,
            chartAccountId: chartId,
            eventId: eventId || undefined,
            type
          });
        }
      }

      onSave();
    } catch (error) {
      console.error('Failed to save transactions:', error);
      alert('Erro ao salvar lançamentos.');
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all overflow-y-auto no-scrollbar">
      <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-md overflow-hidden animate-[scaleIn_0.2s_ease-out] border border-gray-100 my-auto">
        <div className={`p-8 transition-all duration-500 relative ${isIncome ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                {isIncome ? <Check size={24} strokeWidth={3} /> : <Info size={24} strokeWidth={3} />}
              </div>
              <h3 className="text-xl font-black text-white leading-none">
                {editingTx ? 'Editar' : 'Lançar'} {isIncome ? 'Receita' : 'Despesa'}
              </h3>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X size={24} strokeWidth={3} />
            </button>
          </div>
          <div className="flex p-1.5 bg-black/20 rounded-2xl border border-white/10 relative z-10">
            <button type="button" onClick={() => setType(TransactionType.INCOME)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${isIncome ? 'bg-white text-emerald-600' : 'text-white/40 hover:text-white'}`}>Receita</button>
            <button type="button" onClick={() => setType(TransactionType.EXPENSE)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!isIncome ? 'bg-white text-rose-600' : 'text-white/40 hover:text-white'}`}>Despesa</button>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-8">
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <span className="text-2xl font-black text-gray-300 mr-2">R$</span>
              <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
                className={`text-center text-6xl font-black bg-transparent border-0 outline-none tabular-nums ${isIncome ? 'text-emerald-600' : 'text-rose-600'} w-full`}
                placeholder="0,00" required autoFocus />
            </div>
          </div>

          <div className="space-y-5">
            <Input label="Descrição do Lançamento" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Pagamento Fornecedor" className="!rounded-2xl !py-4" required />

            <div className={`grid gap-4 ${status === TransactionStatus.PAID ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <Input label="Vencimento" type="date" value={date} onChange={e => setDate(e.target.value)} className="!rounded-2xl !py-4" required />
              <Select label="Status" value={status} onChange={e => setStatus(e.target.value as any)}>
                <option value={TransactionStatus.PAID}>Liquidado</option>
                <option value={TransactionStatus.PENDING}>Em Aberto</option>
              </Select>
              {status === TransactionStatus.PAID && (
                <Input label="Data Liquidação" type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="!rounded-2xl !py-4" required />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select label="Conta Origem" value={accId} onChange={e => setAccId(e.target.value)} required>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
              <Select label="Categoria" value={chartId} onChange={e => setChartId(e.target.value)} required>
                <option value="">Escolher...</option>
                {filteredCharts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select label="Evento Relacionado" value={eventId} onChange={e => setEventId(e.target.value)}>
                <option value="">Nenhum</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
              </Select>
              {!editingTx && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <Hash size={10} /> Parcelas
                  </label>
                  <input type="number" min="1" max="60" value={installments} onChange={e => setInstallments(e.target.value)} className="w-full px-4 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-black/5" />
                </div>
              )}
            </div>
          </div>

          <Button type="submit" className={`w-full h-16 text-[11px] font-black uppercase tracking-widest rounded-[24px] transition-all shadow-xl ${isIncome ? 'bg-emerald-600 shadow-emerald-100' : 'bg-rose-600 shadow-rose-100'}`}>
            Confirmar Lançamento
          </Button>
        </form>
      </div>
    </div>
  );
};
