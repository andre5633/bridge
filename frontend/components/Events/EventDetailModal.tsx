
import React, { useMemo } from 'react';
import { FinanceEvent, Transaction, TransactionType, TransactionStatus, Artist, EventCategory } from '../../types';
import { X, Calendar, ArrowUpCircle, ArrowDownCircle, CheckCircle2, Clock, TrendingUp, DollarSign, Target, PieChart } from 'lucide-react';

interface DetailProps {
   event: FinanceEvent;
   transactions: Transaction[];
   artist?: Artist;
   category?: EventCategory;
   onClose: () => void;
   onUpdate: () => void;
}

export const EventDetailModal: React.FC<DetailProps> = ({ event, transactions, artist, category, onClose }) => {
   const financial = useMemo(() => {
      const revenue = transactions.filter(t => t.type === TransactionType.INCOME);
      const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);

      const totalRevenue = revenue.reduce((a, b) => a + b.amount, 0);
      const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);

      const paidRevenue = revenue.filter(t => t.status === TransactionStatus.PAID).reduce((a, b) => a + b.amount, 0);
      const paidExpenses = expenses.filter(t => t.status === TransactionStatus.PAID).reduce((a, b) => a + b.amount, 0);

      const projectedProfit = event.budget - totalExpenses;
      const realizedProfit = paidRevenue - paidExpenses;

      return {
         totalRevenue,
         totalExpenses,
         paidRevenue,
         paidExpenses,
         projectedProfit,
         realizedProfit,
         pendingRevenue: event.budget - paidRevenue,
         pendingExpenses: totalExpenses - paidExpenses
      };
   }, [event, transactions]);

   const format = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

   return (
      <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
         <div className="bg-white rounded-t-[48px] sm:rounded-[48px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] border border-gray-100">

            {/* Header com Cor do Artista */}
            <div className="p-8 text-white relative overflow-hidden shrink-0" style={{ backgroundColor: artist?.color || '#000' }}>
               <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                  <Target size={180} />
               </div>
               <div className="relative z-10 flex justify-between items-start">
                  <div>
                     <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">{category?.name || 'Show'}</span>
                     <h3 className="text-3xl font-black tracking-tighter">{event.name}</h3>
                     <p className="text-sm font-bold opacity-80 mt-1">
                        {artist?.name} • {(() => {
                           const [y, m, d_] = event.date.split('-').map(Number);
                           return new Date(y, m - 1, d_).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
                        })()}
                     </p>
                  </div>
                  <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                     <X size={24} />
                  </button>
               </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar bg-gray-50/30">

               {/* Painel de Lucratividade */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-[32px] shadow-soft border border-gray-100">
                     <div className="flex items-center gap-2 mb-4 text-blue-600">
                        <DollarSign size={16} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Valor do Contrato</span>
                     </div>
                     <p className="text-2xl font-black text-gray-900">R$ {format(event.budget)}</p>
                     <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between">
                        <span className="text-[9px] font-black text-gray-400 uppercase">A receber</span>
                        <span className="text-[10px] font-black text-blue-500">R$ {format(financial.pendingRevenue)}</span>
                     </div>
                  </div>

                  <div className="bg-white p-6 rounded-[32px] shadow-soft border border-gray-100">
                     <div className="flex items-center gap-2 mb-4 text-rose-500">
                        <PieChart size={16} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Custos Totais</span>
                     </div>
                     <p className="text-2xl font-black text-gray-900">R$ {format(financial.totalExpenses)}</p>
                     <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between">
                        <span className="text-[9px] font-black text-gray-400 uppercase">A pagar</span>
                        <span className="text-[10px] font-black text-rose-500">R$ {format(financial.pendingExpenses)}</span>
                     </div>
                  </div>

                  <div className="bg-black p-6 rounded-[32px] shadow-xl text-white">
                     <div className="flex items-center gap-2 mb-4 text-emerald-400">
                        <TrendingUp size={16} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Lucro Projetado</span>
                     </div>
                     <p className="text-2xl font-black">R$ {format(financial.projectedProfit)}</p>
                     <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
                        <span className="text-[9px] font-black text-gray-500 uppercase">Lucro Real (Hoje)</span>
                        <span className={`text-[10px] font-black ${financial.realizedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                           R$ {format(financial.realizedProfit)}
                        </span>
                     </div>
                  </div>
               </div>

               {/* Listagem de Movimentações */}
               <div className="space-y-4">
                  <div className="flex justify-between items-center px-4">
                     <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Extrato do Evento</h4>
                     <div className="flex gap-4">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[9px] font-black text-gray-400 uppercase">Receitas</span></div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div><span className="text-[9px] font-black text-gray-400 uppercase">Despesas</span></div>
                     </div>
                  </div>

                  <div className="bg-white rounded-[32px] shadow-soft border border-gray-100 overflow-hidden divide-y divide-gray-50">
                     {transactions.length === 0 ? (
                        <div className="p-12 text-center text-gray-300 font-medium">Nenhuma movimentação lançada.</div>
                     ) : (
                        transactions.sort((a, b) => b.date.localeCompare(a.date)).map(t => (
                           <div key={t.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-all">
                              <div className="flex items-center gap-4">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {t.type === TransactionType.INCOME ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-gray-900">{t.description}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                       {(() => {
                                          const [y, m, d_] = t.date.split('-').map(Number);
                                          return new Date(y, m - 1, d_).toLocaleDateString('pt-BR');
                                       })()}
                                    </p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className={`text-sm font-black ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-gray-900'}`}>
                                    {t.type === TransactionType.INCOME ? '+' : '-'} R$ {format(t.amount)}
                                 </p>
                                 <div className="flex justify-end mt-1">
                                    {t.status === TransactionStatus.PAID ? (
                                       <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Liquidado</span>
                                    ) : (
                                       <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pendente</span>
                                    )}
                                 </div>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>

               {event.description && (
                  <div className="bg-white p-8 rounded-[32px] border border-gray-100">
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Informações de Produção</p>
                     <p className="text-sm text-gray-600 font-medium leading-relaxed">{event.description}</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};
