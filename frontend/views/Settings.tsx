
import React, { useState, useEffect, useMemo } from 'react';
import { Account, AccountType, Artist, EventCategory, Transaction, FinanceEvent, TransactionType } from '../types';
import { StorageService, generateUUID } from '../services/storageService';
import { ArtistService } from '../services/artistService';
import { CategoryService } from '../services/categoryService';
import { AccountService } from '../services/accountService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Trash2, Wallet, Music, Tags, X, FileText, Edit2, TrendingUp, DollarSign, Star, Briefcase } from 'lucide-react';
import { ChartOfAccounts } from './ChartOfAccounts';
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';

type Tab = 'accounts' | 'chart' | 'artists' | 'categories';

interface SettingsProps {
  initialTab?: Tab;
}

export const Settings: React.FC<SettingsProps> = ({ initialTab = 'accounts' }) => {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [events, setEvents] = useState<FinanceEvent[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ id: string, title: string } | null>(null);

  // Form States
  const [accName, setAccName] = useState('');
  const [accBalance, setAccBalance] = useState('');
  const [artName, setArtName] = useState('');
  const [artColor, setArtColor] = useState('#8B5CF6');
  const [catName, setCatName] = useState('');

  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);
  useEffect(() => { load(); }, []);

  const load = async () => {
    setAccounts(await StorageService.getAccounts());
    setArtists(await StorageService.getArtists());
    setCategories(await StorageService.getCategories());
    setEvents(await StorageService.getEvents());
    setTransactions(await StorageService.getTransactions());
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setAccName('');
    setAccBalance('');
    setArtName('');
    setArtColor('#8B5CF6');
    setCatName('');
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    if (activeTab === 'accounts') {
      setAccName(item.name);
      setAccBalance(item.balance.toString());
    } else if (activeTab === 'artists') {
      setArtName(item.name);
      setArtColor(item.color);
    } else if (activeTab === 'categories') {
      setCatName(item.name);
    }
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Settings] handleSave called for tab:', activeTab);
    if (activeTab === 'accounts') {
      const data = { name: accName, type: AccountType.CHECKING, balance: parseFloat(accBalance) || 0, color: '#007AFF' };
      if (editingId) {
        await AccountService.update(editingId, data);
      } else {
        await AccountService.create(data);
      }
      const accountsData = await AccountService.getAll();
      await StorageService.saveAccounts(accountsData);
    } else if (activeTab === 'artists') {
      const data = { name: artName, color: artColor };
      if (editingId) {
        console.log('[Settings] Updating artist via API:', editingId, data);
        await ArtistService.update(editingId, data);
      } else {
        console.log('[Settings] Creating artist via API:', data);
        await ArtistService.create(data);
      }
      // We also update local storage for compatibility/fallback
      const artistsData = await ArtistService.getAll();
      await StorageService.saveArtists(artistsData);
    } else if (activeTab === 'categories') {
      const data = { name: catName };
      if (editingId) {
        console.log('[Settings] Updating category via API:', editingId, data);
        await CategoryService.update(editingId, data);
      } else {
        console.log('[Settings] Creating category via API:', data);
        await CategoryService.create(data);
      }
      const categoriesData = await CategoryService.getAll();
      await StorageService.saveCategories(categoriesData);
    }
    load();
    resetForm();
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    const { id } = deleteModal;
    if (activeTab === 'accounts') {
      await AccountService.delete(id);
      const accountsData = await AccountService.getAll();
      await StorageService.saveAccounts(accountsData);
    }
    else if (activeTab === 'artists') {
      await ArtistService.delete(id);
      const artistsData = await ArtistService.getAll();
      StorageService.saveArtists(artistsData);
    }
    else if (activeTab === 'categories') {
      await CategoryService.delete(id);
      const categoriesData = await CategoryService.getAll();
      StorageService.saveCategories(categoriesData);
    }
    load();
    setDeleteModal(null);
  };

  // Cálculo de Performance de Artistas
  const artistStats = useMemo(() => {
    return artists.map(artist => {
      const artistEvents = events.filter(e => e.artistId === artist.id);
      const artistTxs = transactions.filter(t => artistEvents.some(e => e.id === t.eventId));

      const revenue = artistTxs.filter(t => t.type === TransactionType.INCOME).reduce((a, b) => a + b.amount, 0);
      const expense = artistTxs.filter(t => t.type === TransactionType.EXPENSE).reduce((a, b) => a + b.amount, 0);
      const profit = revenue - expense;
      const eventCount = artistEvents.length;

      return {
        ...artist,
        eventCount,
        revenue,
        expense,
        profit,
        avgRevenue: eventCount > 0 ? revenue / eventCount : 0,
        avgProfit: eventCount > 0 ? profit / eventCount : 0
      };
    });
  }, [artists, events, transactions]);

  const format = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Cadastros</h2>
          <p className="text-gray-500 font-medium">Gestão de entidades e configurações do sistema.</p>
        </div>
        {activeTab !== 'chart' && (
          <Button onClick={() => setIsFormOpen(true)} className="rounded-2xl h-14 px-8 font-black uppercase text-[10px] tracking-widest shadow-xl">
            <Plus size={18} className="mr-2" /> Adicionar Novo
          </Button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {[
          { id: 'accounts', label: 'Contas', icon: Wallet },
          { id: 'chart', label: 'Plano de Contas', icon: FileText },
          { id: 'artists', label: 'Artistas', icon: Music },
          { id: 'categories', label: 'Tipos de Show', icon: Tags }
        ].map(tab => (
          <button
            key={tab.id} onClick={() => setActiveTab(tab.id as Tab)}
            className={`px-6 py-4 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border transition-all ${activeTab === tab.id ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-gray-400 hover:bg-gray-50 border-gray-100'}`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'chart' ? (
        <ChartOfAccounts />
      ) : activeTab === 'artists' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artistStats.map(art => (
            <div key={art.id} className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-soft hover:shadow-xl transition-all group relative overflow-hidden">
              {/* pointer-events-none adicionado para não bloquear cliques nos botões */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] -mr-8 -mt-8 rotate-12 pointer-events-none" style={{ color: art.color }}>
                <Star size={128} fill="currentColor" />
              </div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0" style={{ backgroundColor: art.color }}>
                    <Music size={24} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-xl text-gray-900 leading-none truncate">{art.name}</h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 block">{art.eventCount} Shows Realizados</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(art); }}
                    className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-black hover:bg-gray-50 rounded-xl transition-all"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteModal({ id: art.id, title: `Excluir Artista: ${art.name}?` }); }}
                    className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Receita Total</p>
                  <p className="text-sm font-black text-gray-900">R$ {format(art.revenue)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Lucro Total</p>
                  <p className={`text-sm font-black ${art.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>R$ {format(art.profit)}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 grid grid-cols-2 gap-4 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><DollarSign size={14} /></div>
                  <div className="min-w-0">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest truncate">Média Receita</p>
                    <p className="text-[10px] font-black text-gray-900">R$ {format(art.avgRevenue)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><TrendingUp size={14} /></div>
                  <div className="min-w-0">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest truncate">Média Lucro</p>
                    <p className="text-[10px] font-black text-gray-900">R$ {format(art.avgProfit)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] shadow-soft border border-gray-100 overflow-hidden min-h-[400px]">
          <div className="grid grid-cols-12 gap-4 p-6 border-b border-gray-50 bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <div className="col-span-8">Identificação</div>
            <div className="col-span-3 text-right">Informações</div>
            <div className="col-span-1"></div>
          </div>

          <div className="divide-y divide-gray-50">
            {activeTab === 'accounts' && accounts.map(acc => (
              <div key={acc.id} className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-gray-50 transition-colors group">
                <div className="col-span-8 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: acc.color }}></div>
                  <span className="font-bold text-gray-900">{acc.name}</span>
                </div>
                <div className="col-span-3 text-right text-xs font-black text-gray-500">R$ {acc.balance.toLocaleString()}</div>
                <div className="col-span-1 text-right flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => handleEdit(acc)} className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-black hover:bg-white rounded-lg"><Edit2 size={16} /></button>
                  <button onClick={() => setDeleteModal({ id: acc.id, title: `Excluir Conta: ${acc.name}?` })} className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
            {activeTab === 'categories' && categories.map(cat => (
              <div key={cat.id} className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-gray-50 transition-colors group">
                <div className="col-span-8 font-bold text-gray-900">{cat.name}</div>
                <div className="col-span-3 text-right text-[9px] font-black uppercase tracking-widest text-gray-400">Ativo</div>
                <div className="col-span-1 text-right flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => handleEdit(cat)} className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-black hover:bg-white rounded-lg"><Edit2 size={16} /></button>
                  <button onClick={() => setDeleteModal({ id: cat.id, title: `Excluir Tipo: ${cat.name}?` })} className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100">
            <div className="p-6 bg-black text-white flex justify-between items-center">
              <h3 className="text-lg font-black">{editingId ? 'Editar' : 'Adicionar'} {activeTab === 'accounts' ? 'Conta' : activeTab === 'artists' ? 'Artista' : 'Tipo'}</h3>
              <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="text-white" size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              {activeTab === 'accounts' && (
                <>
                  <Input label="Nome da Conta" value={accName} onChange={e => setAccName(e.target.value)} required />
                  {!editingId && <Input label="Saldo Inicial" type="number" step="0.01" value={accBalance} onChange={e => setAccBalance(e.target.value)} required />}
                </>
              )}
              {activeTab === 'artists' && (
                <>
                  <Input label="Nome do Artista" value={artName} onChange={e => setArtName(e.target.value)} required />
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Cor de Identidade</label>
                    <input type="color" value={artColor} onChange={e => setArtColor(e.target.value)} className="w-full h-12 rounded-xl bg-gray-50 border-0 cursor-pointer" />
                  </div>
                </>
              )}
              {activeTab === 'categories' && (
                <Input label="Nome do Tipo de Show" value={catName} onChange={e => setCatName(e.target.value)} required />
              )}
              <Button type="submit" className="w-full h-14 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Salvar Cadastro</Button>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <DeleteConfirmationModal
          title={deleteModal.title}
          message="Esta ação é irreversível e pode afetar lançamentos vinculados."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal(null)}
        />
      )}
    </div>
  );
};
