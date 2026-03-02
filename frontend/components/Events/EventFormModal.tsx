import React, { useState, useEffect } from 'react';
import { FinanceEvent, Artist, EventCategory } from '../../types';
import { StorageService } from '../../services/storageService';
import { EventService } from '../../services/eventService';
import { ArtistService } from '../../services/artistService';
import { CategoryService } from '../../services/categoryService';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { X, Calendar, DollarSign, Music } from 'lucide-react';

interface FormProps {
  event?: FinanceEvent | null;
  initialDate?: string;
  onClose: () => void;
  onSave: () => void;
}

export const EventFormModal: React.FC<FormProps> = ({ event, initialDate, onClose, onSave }) => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);

  const [name, setName] = useState('');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [artistId, setArtistId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [budget, setBudget] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const a = await ArtistService.getAll();
      const c = await CategoryService.getAll();
      setArtists(a);
      setCategories(c);

      if (event) {
        const fullEvent = await EventService.getById(event.id);
        if (fullEvent) {
          setName(fullEvent.name);
          setDate(fullEvent.date);
          setArtistId(fullEvent.artistId);
          setCategoryId(fullEvent.categoryId);
          setBudget(fullEvent.budget.toString());
          setDesc(fullEvent.description || '');
        }
      } else if (a.length > 0) {
        setArtistId(a[0].id);
        if (c.length > 0) setCategoryId(c[0].id);
      }
    };
    loadData();
  }, [event]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistId || !categoryId) return alert("Selecione artista e categoria.");

    const budgetVal = parseFloat(budget.replace(',', '.')) || 0;

    const eventData: Omit<FinanceEvent, 'id'> = {
      name,
      date,
      artistId,
      categoryId,
      budget: budgetVal,
      description: desc
    };

    if (event) {
      await EventService.update(event.id, eventData);
    } else {
      await EventService.create(eventData);
    }

    onSave();
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        <div className="p-6 bg-black flex justify-between items-center">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Music size={20} />
            </div>
            <h3 className="text-lg font-black">{event ? 'Editar Show' : 'Novo Agendamento'}</h3>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Local / Nome do Show</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Rodeio de Barretos" className="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-black/5" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Data</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold outline-none" required />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Valor do Cachet (Budget)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">R$</span>
                <input type="number" step="0.01" value={budget} onChange={e => setBudget(e.target.value)} placeholder="0.00" className="w-full pl-10 pr-5 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-black outline-none" required />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Artista" value={artistId} onChange={e => setArtistId(e.target.value)}>
              {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
            <Select label="Tipo de Show" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Observações</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold h-20 resize-none outline-none" />
          </div>

          <Button type="submit" className="w-full h-16 bg-black text-white font-black uppercase text-[10px] tracking-widest rounded-[24px]">
            {event ? 'Salvar Show' : 'Confirmar Agenda'}
          </Button>
        </form>
      </div>
    </div>
  );
};
