import React, { useState, useEffect } from 'react';
import { Account, AccountType } from '../types';
import { StorageService, generateUUID } from '../services/storageService';
import { AccountService } from '../services/accountService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Plus, Trash2 } from 'lucide-react';

export const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form States
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<AccountType>(AccountType.CHECKING);
  const [accBalance, setAccBalance] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      const data = await StorageService.getAccounts();
      setAccounts(data);
    };
    fetchAccounts();
  }, []);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newAccountData: Omit<Account, 'id'> = {
        name: accName,
        type: accType,
        balance: parseFloat(accBalance.replace(',', '.')) || 0,
        color: getRandomColor()
      };

      const savedAccount = await AccountService.create(newAccountData);
      const updated = [...accounts, savedAccount];
      setAccounts(updated);
      StorageService.saveAccounts(updated);
      resetForm();
    } catch (error) {
      console.error('Failed to save account:', error);
      alert('Erro ao salvar conta. Tente novamente.');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta conta?")) return;
    try {
      await AccountService.delete(id);
      const updated = accounts.filter(a => a.id !== id);
      setAccounts(updated);
      StorageService.saveAccounts(updated);
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Erro ao excluir conta.');
    }
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setAccName('');
    setAccBalance('');
  };

  const getRandomColor = () => {
    const colors = ['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FF2D55', '#5856D6', '#2c3e50', '#e67e22'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="max-w-7xl mx-auto animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contas Bancárias</h2>
          <p className="text-gray-500">Gerencie suas contas correntes e investimentos PJ.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus size={18} className="mr-2" />
          Nova Conta
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-5">Nome da Conta</div>
          <div className="col-span-3">Tipo</div>
          <div className="col-span-3 text-right">Saldo Atual</div>
          <div className="col-span-1"></div>
        </div>
        {accounts.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Nenhuma conta cadastrada.</div>
        ) : (
          accounts.map((acc) => (
            <div key={acc.id} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-50 items-center hover:bg-gray-50/50 transition-colors">
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ backgroundColor: acc.color }}>
                  {acc.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{acc.name}</span>
                </div>
              </div>
              <div className="col-span-3">
                <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                  {acc.type}
                </span>
              </div>
              <div className="col-span-3 text-right font-medium text-gray-900">
                R$ {acc.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  onClick={() => handleDeleteAccount(acc.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={() => setIsFormOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden animate-[scaleIn_0.2s_ease-out]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Nova Conta Empresarial</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSaveAccount} className="space-y-4">
                <Input
                  label="Nome da Conta"
                  placeholder="Ex: Itaú Empresas"
                  value={accName}
                  onChange={e => setAccName(e.target.value)}
                  required
                />

                <Select
                  label="Tipo de Conta"
                  value={accType}
                  onChange={e => setAccType(e.target.value as AccountType)}
                >
                  {Object.values(AccountType).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>

                <Input
                  label="Saldo Inicial"
                  placeholder="0,00"
                  type="number"
                  step="0.01"
                  value={accBalance}
                  onChange={e => setAccBalance(e.target.value)}
                  required
                />
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)} className="flex-1">Cancelar</Button>
                  <Button type="submit" className="flex-1">Salvar Conta</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};