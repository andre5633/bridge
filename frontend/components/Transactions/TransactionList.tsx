
import React from 'react';
import { Transaction, Account, ChartAccount, TransactionType, TransactionStatus } from '../../types';
import { ArrowUpCircle, ArrowDownCircle, CheckCircle2, Clock, Zap, Edit2, Trash2, Wallet, Calendar, AlertCircle } from 'lucide-react';

interface ListProps {
  transactions: Transaction[];
  accounts: Account[];
  chartAccounts: ChartAccount[];
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onPay: (tx: Transaction) => void;
}

export const TransactionList: React.FC<ListProps> = ({ transactions, accounts, chartAccounts, onEdit, onDelete, onPay }) => {
  const formatDate = (ds: string) => {
    if (!ds || ds.length < 10) return 'Data não informada';
    const [year, month, day] = ds.substring(0, 10).split('-').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return 'Data inválida';
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long' });
  };
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const grouped = transactions.reduce((acc, t) => {
    if (!acc[t.date]) acc[t.date] = [];
    acc[t.date].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  if (transactions.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400 bg-white rounded-[32px] border border-dashed border-gray-200">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar size={24} className="opacity-20" />
        </div>
        <p className="font-medium">Nenhum lançamento encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map(dateKey => (
        <div key={dateKey} className="animate-[fadeIn_0.3s]">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-4 flex items-center gap-2">
            <Calendar size={12} /> {formatDate(dateKey)}
          </h3>
          <div className="bg-white rounded-[32px] shadow-soft border border-gray-100 overflow-hidden">
            {grouped[dateKey].map((t, idx) => {
              const account = accounts.find(a => a.id === t.accountId);
              const chart = chartAccounts.find(c => c.id === t.chartAccountId);
              const isPaid = t.status === TransactionStatus.PAID;
              const isOverdue = !isPaid && t.date < getTodayStr();
              const isIncome = t.type === TransactionType.INCOME;

              return (
                <div key={t.id} className={`group p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-all ${idx !== grouped[dateKey].length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {isIncome ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{t.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[9px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">{chart?.name || 'Geral'}</span>
                      <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-tighter"><Wallet size={10} /> {account?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isPaid && <button onClick={() => onPay(t)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl" title="Liquidar"><Zap size={18} /></button>}
                    <button onClick={() => onEdit(t)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"><Edit2 size={18} /></button>
                    <button onClick={() => onDelete(t)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl"><Trash2 size={18} /></button>
                  </div>
                  <div className="text-right min-w-[120px]">
                    <p className={`text-lg font-black tabular-nums ${isIncome ? 'text-emerald-600' : 'text-gray-900'}`}>{isIncome ? '+ ' : '- '}R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <div className="flex justify-end mt-1">
                      {isPaid ? (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full tracking-tighter"><CheckCircle2 size={10} /> Pago</span>
                      ) : isOverdue ? (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full tracking-tighter"><AlertCircle size={10} /> Vencido</span>
                      ) : (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full tracking-tighter"><Clock size={10} /> Aberto</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
