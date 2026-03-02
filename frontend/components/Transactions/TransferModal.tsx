import React, { useState } from 'react';
import { Account, ChartAccount, Transaction, TransactionType, TransactionStatus } from '../../types';
import { StorageService, generateUUID } from '../../services/storageService';
import { TransactionService } from '../../services/transactionService';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { X, ArrowRightLeft, ArrowDown } from 'lucide-react';

interface TransferProps {
   accounts: Account[];
   chartAccounts: ChartAccount[];
   onClose: () => void;
   onSave: () => void;
}

export const TransferModal: React.FC<TransferProps> = ({ accounts, chartAccounts, onClose, onSave }) => {
   const [from, setFrom] = useState('');
   const [to, setTo] = useState('');
   const [val, setVal] = useState('');
   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
   const [observation, setObservation] = useState('');

   const handleTransfer = async (e: React.FormEvent) => {
      e.preventDefault();
      const amount = parseFloat(val.replace(',', '.'));
      if (!from || !to) return alert("Selecione as contas.");
      if (from === to) return alert("As contas devem ser diferentes.");
      if (isNaN(amount) || amount <= 0) return alert("Valor inválido.");

      try {
         const groupId = generateUUID();
         const transCategory = chartAccounts.find(c => c.name.toLowerCase().includes('transfer')) || chartAccounts[0];
         const fromAcc = accounts.find(a => a.id === from);
         const toAcc = accounts.find(a => a.id === to);
         const commonDesc = observation || `Transferência`;

         // Transaction Out (Expense)
         await TransactionService.create({
            description: `${commonDesc} (Para ${toAcc?.name})`,
            amount,
            date,
            status: TransactionStatus.PAID,
            accountId: from,
            chartAccountId: transCategory.id,
            type: TransactionType.EXPENSE,
            transferGroupId: groupId,
            observation
         });

         // Transaction In (Income)
         await TransactionService.create({
            description: `${commonDesc} (De ${fromAcc?.name})`,
            amount,
            date,
            status: TransactionStatus.PAID,
            accountId: to,
            chartAccountId: transCategory.id,
            type: TransactionType.INCOME,
            transferGroupId: groupId,
            observation
         });

         onSave();
      } catch (error) {
         console.error('Failed to process transfer:', error);
         alert('Erro ao realizar transferência.');
      }
   };

   return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all overflow-y-auto no-scrollbar">
         <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-md overflow-hidden animate-[scaleIn_0.2s_ease-out] border border-gray-100 my-auto">

            <div className="p-8 bg-blue-600 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                     <ArrowRightLeft size={24} strokeWidth={3} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-white leading-none">Transferir</h3>
                     <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mt-1">Entre Contas</p>
                  </div>
               </div>
               <button onClick={onClose} className="text-white/60 hover:text-white"><X size={24} strokeWidth={3} /></button>
            </div>

            <form onSubmit={handleTransfer} className="p-8 space-y-8">
               <div className="text-center">
                  <div className="relative inline-flex items-center justify-center">
                     <span className="text-2xl font-black text-gray-300 mr-2">R$</span>
                     <input type="number" step="0.01" value={val} onChange={e => setVal(e.target.value)}
                        className="text-center text-6xl font-black bg-transparent border-0 outline-none tabular-nums text-gray-900 w-full"
                        placeholder="0,00" required autoFocus />
                  </div>
               </div>

               <div className="space-y-4 relative">
                  <Select label="Origem (Sair de)" value={from} onChange={e => setFrom(e.target.value)} required>
                     <option value="">Escolher conta...</option>
                     {accounts.map(a => <option key={a.id} value={a.id}>{a.name} • R$ {a.balance.toLocaleString()}</option>)}
                  </Select>

                  <div className="flex justify-center -my-2 relative z-10">
                     <div className="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-blue-600">
                        <ArrowDown size={18} strokeWidth={3} />
                     </div>
                  </div>

                  <Select label="Destino (Entrar em)" value={to} onChange={e => setTo(e.target.value)} required>
                     <option value="">Escolher conta...</option>
                     {accounts.map(a => <option key={a.id} value={a.id}>{a.name} • R$ {a.balance.toLocaleString()}</option>)}
                  </Select>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Data</label>
                     <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-black/5" required />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Descrição</label>
                     <input type="text" value={observation} onChange={e => setObservation(e.target.value)} placeholder="Opcional" className="w-full px-4 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-black/5" />
                  </div>
               </div>

               <Button type="submit" className="w-full h-16 text-[11px] font-black uppercase tracking-widest rounded-[24px] bg-blue-600 text-white shadow-xl shadow-blue-100">
                  Confirmar Transferência
               </Button>
            </form>
         </div>
      </div>
   );
};