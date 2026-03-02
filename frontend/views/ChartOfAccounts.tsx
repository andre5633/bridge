
import React, { useState, useEffect, useMemo } from 'react';
import { ChartAccount, ChartType } from '../types';
import { StorageService, generateUUID } from '../services/storageService';
import { ChartAccountService } from '../services/chartAccountService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, FolderOpen, GripVertical, ChevronDown, ChevronRight, Calculator, X } from 'lucide-react';
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';

export const ChartOfAccounts: React.FC = () => {
  const [chartAccounts, setChartAccounts] = useState<ChartAccount[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [draggedItem, setDraggedItem] = useState<ChartAccount | null>(null);
  const [deleteModal, setDeleteModal] = useState<ChartAccount | null>(null);

  // Form State
  const [parentId, setParentId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<ChartType>(ChartType.EXPENSE);
  const [isSubtotal, setIsSubtotal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await StorageService.getChartOfAccounts();
      setChartAccounts(data);
      const rootIds = data.filter(a => !a.code.includes('.')).map(a => a.id);
      setExpandedNodes(new Set(rootIds));
    };
    fetchData();
  }, []);

  const filteredAccounts = useMemo(() => {
    // Remove duplicates by ID to be safe
    const seen = new Set();
    const unique = chartAccounts.filter(a => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
    return unique.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  }, [chartAccounts]);

  const getFilteredAccounts = () => filteredAccounts;

  const generateNextCode = (parentCode: string | null) => {
    const currentList = getFilteredAccounts();
    if (!parentCode) {
      const roots = currentList.filter(a => !a.code.includes('.'));
      if (roots.length === 0) return '1';
      const maxRoot = roots.reduce((max, curr) => {
        const num = parseInt(curr.code);
        return isNaN(num) ? max : Math.max(max, num);
      }, 0);
      return (maxRoot + 1).toString();
    } else {
      const prefix = parentCode + '.';
      const siblings = currentList.filter(a =>
        a.code.startsWith(prefix) &&
        a.code.split('.').length === parentCode.split('.').length + 1
      );
      if (siblings.length === 0) return parentCode + '.1';
      const lastSibling = siblings[siblings.length - 1];
      const parts = lastSibling.code.split('.');
      const lastNum = parseInt(parts[parts.length - 1]);
      parts[parts.length - 1] = (lastNum + 1).toString();
      return parts.join('.');
    }
  };

  const handleOpenAddModal = (parentAccount?: ChartAccount) => {
    if (parentAccount) {
      setParentId(parentAccount.id);
      setCode(generateNextCode(parentAccount.code));
      setType(parentAccount.type);
    } else {
      setParentId(null);
      setCode(generateNextCode(null));
      setType(ChartType.REVENUE);
    }
    setName('');
    setIsSubtotal(false);
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[ChartOfAccounts] handleSave called for account:', name);
    const newAccountData: Omit<ChartAccount, 'id'> = {
      code, name, type, isSubtotal
    };

    console.log('[ChartOfAccounts] Creating chart account via API:', newAccountData);
    await ChartAccountService.create(newAccountData);
    const updatedData = await ChartAccountService.getAll();
    setChartAccounts(updatedData);
    StorageService.saveChartOfAccounts(updatedData);

    if (parentId) setExpandedNodes(prev => new Set(prev).add(parentId));
    setIsFormOpen(false);
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    const account = deleteModal;
    console.log('[ChartOfAccounts] Deleting chart account via API:', account.id);

    await ChartAccountService.delete(account.id);
    const updatedData = await ChartAccountService.getAll();
    setChartAccounts(updatedData);
    StorageService.saveChartOfAccounts(updatedData);

    setDeleteModal(null);
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
      return newSet;
    });
  };

  const handleDragStart = (e: React.DragEvent, account: ChartAccount) => {
    e.stopPropagation();
    setDraggedItem(account);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, target: ChartAccount) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem || draggedItem.id === target.id) return;
    const draggedLevel = draggedItem.code.split('.').length;
    const targetLevel = target.code.split('.').length;
    const draggedParent = draggedItem.code.includes('.') ? draggedItem.code.substring(0, draggedItem.code.lastIndexOf('.')) : '';
    const targetParent = target.code.includes('.') ? target.code.substring(0, target.code.lastIndexOf('.')) : '';
    if (draggedLevel === targetLevel && draggedParent === targetParent) {
      const sourceCode = draggedItem.code;
      const targetCode = target.code;
      setChartAccounts(prev => {
        const changes = new Map<string, string>();
        changes.set(draggedItem.id, targetCode);
        changes.set(target.id, sourceCode);
        prev.forEach(acc => {
          if (acc.code.startsWith(sourceCode + '.')) changes.set(acc.id, acc.code.replace(sourceCode, targetCode));
          else if (acc.code.startsWith(targetCode + '.')) changes.set(acc.id, acc.code.replace(targetCode, sourceCode));
        });
        const updated = prev.map(acc => changes.has(acc.id) ? { ...acc, code: changes.get(acc.id)! } : acc);
        StorageService.saveChartOfAccounts(updated);
        return updated;
      });
    }
    setDraggedItem(null);
  };

  const renderRow = (account: ChartAccount, depth: number) => {
    const hasChildren = chartAccounts.some(a => a.code.startsWith(account.code + '.'));
    const isExpanded = expandedNodes.has(account.id);

    return (
      <React.Fragment key={account.id}>
        <div
          draggable onDragStart={(e) => handleDragStart(e, account)}
          onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, account)}
          className={`group flex items-center gap-3 p-3 border-b border-gray-50 transition-all duration-200 ${account.isSubtotal ? 'bg-gray-50/50' : 'hover:bg-gray-50'} ${draggedItem?.id === account.id ? 'opacity-40' : ''}`}
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
        >
          <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"><GripVertical size={14} /></div>
          <button onClick={(e) => toggleExpand(account.id, e)} className={`w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 text-gray-500 transition-colors ${!hasChildren && 'invisible'}`}>{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</button>
          <div className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border min-w-[3.5rem] text-center ${account.isSubtotal ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 shadow-sm'}`}>{account.code}</div>
          <div className="flex-1 flex items-center justify-between min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`truncate text-sm ${depth === 0 || account.isSubtotal ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{account.name}</span>
              {account.isSubtotal && <span className="flex items-center gap-1 text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-sm uppercase tracking-tighter"><Calculator size={10} /> Subtotal</span>}
            </div>
            <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${account.type === ChartType.REVENUE ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>{account.type}</span>
              <div className="flex items-center gap-1 border-l border-gray-200 pl-4">
                {!account.isSubtotal && <button onClick={() => handleOpenAddModal(account)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Adicionar Subconta"><Plus size={16} /></button>}
                <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setDeleteModal(account); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Excluir"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        </div>
        {isExpanded && getFilteredAccounts()
          .filter(a => a.code.startsWith(account.code + '.') && a.code.split('.').length === account.code.split('.').length + 1)
          .map(child => renderRow(child, depth + 1))
        }
      </React.Fragment>
    );
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Plano de Contas Empresarial</h2>
          <p className="text-gray-500 text-sm">Estrutura organizacional de receitas e despesas.</p>
        </div>
        <Button onClick={() => handleOpenAddModal()}>
          <Plus size={18} className="mr-2" />
          Novo Grupo Raiz
        </Button>
      </div>

      <div className="bg-white rounded-[40px] shadow-soft border border-gray-100 overflow-hidden flex-1 flex flex-col min-h-[500px]">
        <div className="bg-gray-50/80 border-b border-gray-100 p-6 flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <div className="w-8"></div>
          <div className="w-16 text-center">Cod.</div>
          <div className="flex-1 pl-4">Nome da Conta / Grupo</div>
          <div className="w-32 text-right pr-12">Natureza / Ações</div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {getFilteredAccounts().filter(a => !a.code.includes('.')).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-4">
              <div className="bg-gray-50 p-6 rounded-full"><FolderOpen size={48} className="opacity-20" /></div>
              <div className="text-center font-medium"><p>Nenhuma conta cadastrada</p></div>
            </div>
          ) : (
            getFilteredAccounts().filter(a => !a.code.includes('.')).map(root => renderRow(root, 0))
          )}
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md transition-opacity" onClick={() => setIsFormOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-[scaleIn_0.2s_ease-out]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-black text-white">
              <div><h3 className="text-lg font-bold">Configurar Conta</h3><p className="text-xs text-white/50">Definição hierárquica.</p></div>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <Input label="Código" value={code} onChange={e => setCode(e.target.value)} required className="font-mono font-bold text-center bg-gray-50" />
                <div className="col-span-3"><Input label="Nome da Conta" placeholder="Ex: Serviços Digitais" value={name} onChange={e => setName(e.target.value)} required autoFocus /></div>
              </div>
              <div className={`p-5 rounded-[24px] border transition-all duration-300 ${isSubtotal ? 'bg-black border-black text-white shadow-xl' : 'bg-emerald-50/50 border-emerald-100 text-emerald-900'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><Calculator size={18} className={isSubtotal ? 'text-emerald-400' : 'text-emerald-600'} /><span className="text-sm font-bold uppercase tracking-tighter">Conta de Subtotal?</span></div>
                  <button type="button" onClick={() => setIsSubtotal(!isSubtotal)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isSubtotal ? 'bg-emerald-500' : 'bg-gray-300'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isSubtotal ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                </div>
                <p className="text-[10px] leading-relaxed opacity-60 uppercase font-black tracking-widest">{isSubtotal ? "Somatório automático." : "Aceita lançamentos diretos."}</p>
              </div>
              {!isSubtotal && (
                <div className="animate-[fadeIn_0.2s_ease-out]">
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Natureza</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setType(ChartType.REVENUE)} className={`flex items-center justify-center gap-2 px-4 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${type === ChartType.REVENUE ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-400'}`}><ArrowUpCircle size={18} /> Receita</button>
                    <button type="button" onClick={() => setType(ChartType.EXPENSE)} className={`flex items-center justify-center gap-2 px-4 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${type === ChartType.EXPENSE ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-400'}`}><ArrowDownCircle size={18} /> Despesa</button>
                  </div>
                </div>
              )}
              <div className="pt-4"><Button type="submit" className="w-full h-14 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Confirmar Conta</Button></div>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <DeleteConfirmationModal
          title="Excluir do Plano?"
          message={`A conta "${deleteModal.name}" e todas as suas ramificações serão removidas permanentemente.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal(null)}
        />
      )}
    </div>
  );
};
