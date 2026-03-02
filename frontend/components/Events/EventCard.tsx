
import React from 'react';
import { FinanceEvent, Transaction, TransactionType } from '../../types';
import { CalendarDays, ArrowUpRight, ArrowDownRight, Trash2, Edit2 } from 'lucide-react';

interface EventCardProps {
  event: FinanceEvent;
  transactions: Transaction[];
  onLaunch: (type: TransactionType) => void;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, transactions, onLaunch, onEdit, onDelete, onClick }) => {
  const metrics = transactions.reduce((acc, t) => {
    if (t.type === TransactionType.INCOME) acc.income += t.amount;
    else acc.expense += t.amount;
    return acc;
  }, { income: 0, expense: 0 });

  const balance = metrics.income - metrics.expense;

  return (
    <div className="bg-white p-6 rounded-[40px] shadow-soft border border-gray-50 group relative hover:shadow-xl transition-all duration-500 flex flex-col cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 bg-gray-50 text-gray-900 rounded-2xl flex items-center justify-center transition-all group-hover:bg-black group-hover:text-white group-hover:rotate-6">
          <CalendarDays size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 leading-none truncate">{event.name}</h3>
          <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1.5 flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Projeto Ativo
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50/50 p-4 rounded-3xl">
          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Receitas</p>
          <p className="text-sm font-black text-emerald-600">R$ {metrics.income.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50/50 p-4 rounded-3xl">
          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Despesas</p>
          <p className="text-sm font-black text-rose-600">R$ {metrics.expense.toLocaleString()}</p>
        </div>
        <div className="col-span-2 bg-black p-4 rounded-3xl flex justify-between items-center">
          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Saldo do Evento</p>
          <p className={`text-sm font-black ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            R$ {balance.toLocaleString()}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2 mt-auto" onClick={e => e.stopPropagation()}>
        <button 
          onClick={() => onLaunch(TransactionType.INCOME)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors"
        >
          <ArrowUpRight size={14} /> Entrar
        </button>
        <button 
          onClick={() => onLaunch(TransactionType.EXPENSE)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors"
        >
          <ArrowDownRight size={14} /> Sair
        </button>
      </div>

      <div className="absolute top-6 right-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
        <button 
          onClick={onEdit}
          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
        >
          <Edit2 size={16} />
        </button>
        <button 
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
