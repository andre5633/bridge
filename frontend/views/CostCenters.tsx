import React, { useState, useEffect } from 'react';
// Fix: Renamed CostCenter to FinanceEvent
import { FinanceEvent, EventCategory } from '../types';
// Fixed: Changed SEED_ARTISTS to DEFAULT_ARTISTS and added DEFAULT_CATEGORIES
import { StorageService, generateUUID, DEFAULT_ARTISTS, DEFAULT_CATEGORIES } from '../services/storageService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Trash2 } from 'lucide-react';

export const CostCenters: React.FC = () => {
  // Fix: Renamed CostCenter to FinanceEvent
  const [costCenters, setCostCenters] = useState<FinanceEvent[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form States
  const [ccName, setCcName] = useState('');
  const [ccDesc, setCcDesc] = useState('');
  // Fix: Added date state for FinanceEvent
  const [ccDate, setCcDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Fix: Using getEvents instead of getCostCenters
    setCostCenters(StorageService.getEvents());
  }, []);

  const handleSaveCostCenter = (e: React.FormEvent) => {
    e.preventDefault();
    // Fix: Added required 'date', 'artistId', 'categoryId' and 'budget' properties to comply with FinanceEvent type
    const newCC: FinanceEvent = {
      id: generateUUID(),
      name: ccName,
      date: ccDate,
      artistId: DEFAULT_ARTISTS[0].id,
      categoryId: DEFAULT_CATEGORIES[0].id,
      budget: 0,
      description: ccDesc
    };
    const updated = [...costCenters, newCC];
    setCostCenters(updated);
    // Fix: Using saveEvents instead of saveCostCenters
    StorageService.saveEvents(updated);
    resetForm();
  };

  const handleDeleteCostCenter = (id: string) => {
    if(!window.confirm("Tem certeza que deseja excluir este evento?")) return;
    const updated = costCenters.filter(c => c.id !== id);
    setCostCenters(updated);
    // Fix: Using saveEvents instead of saveCostCenters
    StorageService.saveEvents(updated);
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setCcName('');
    setCcDesc('');
    // Fix: Resetting ccDate to today
    setCcDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="max-w-7xl mx-auto animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Eventos</h2>
          <p className="text-gray-500">Organize as despesas da empresa por departamentos ou projetos.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus size={18} className="mr-2" />
          Novo Evento
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
         <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
           <div className="col-span-5">Nome</div>
           <div className="col-span-6">Descrição</div>
           <div className="col-span-1"></div>
         </div>
         {costCenters.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Nenhum evento cadastrado.</div>
          ) : (
            costCenters.map((cc) => (
              <div key={cc.id} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-50 items-center hover:bg-gray-50/50 transition-colors">
                <div className="col-span-5">
                  <div className="font-medium text-gray-900">{cc.name}</div>
                </div>
                <div className="col-span-6 text-sm text-gray-500 truncate">{cc.description || '-'}</div>
                <div className="col-span-1 flex justify-end">
                  <button 
                    onClick={() => handleDeleteCostCenter(cc.id)}
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
              <h3 className="text-lg font-bold text-gray-900">Novo Evento</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSaveCostCenter} className="space-y-4">
                <Input 
                  label="Nome do Evento" 
                  placeholder="Ex: Operacional, Marketing, TI" 
                  value={ccName} 
                  onChange={e => setCcName(e.target.value)} 
                  required 
                />
                {/* Fix: Added date input for FinanceEvent */}
                <Input 
                  label="Data do Evento" 
                  type="date"
                  value={ccDate} 
                  onChange={e => setCcDate(e.target.value)} 
                  required 
                />
                <Input 
                  label="Descrição (Opcional)" 
                  placeholder="Ex: Despesas fixas da sede" 
                  value={ccDesc} 
                  onChange={e => setCcDesc(e.target.value)} 
                />
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)} className="flex-1">Cancelar</Button>
                  <Button type="submit" className="flex-1">Salvar</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};