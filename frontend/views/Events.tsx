
import React, { useState, useEffect, useMemo } from 'react';
import { FinanceEvent, Transaction, TransactionType, Account, ChartAccount, Artist, EventCategory } from '../types';
import { StorageService } from '../services/storageService';
import { Button } from '../components/ui/Button';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trash2, Edit2, Eye, Star, DollarSign } from 'lucide-react';
import { MovementFormModal } from '../components/Transactions/MovementFormModal';
import { EventFormModal } from '../components/Events/EventFormModal';
import { EventDetailModal } from '../components/Events/EventDetailModal';
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';
import { EventService } from '../services/eventService';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<FinanceEvent[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [chartAccounts, setChartAccounts] = useState<ChartAccount[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);

  const [selectedArtistId, setSelectedArtistId] = useState<string | 'ALL'>('ALL');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<FinanceEvent | null>(null);
  const [detailEvent, setDetailEvent] = useState<FinanceEvent | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [selectedLaunchEventId, setSelectedLaunchEventId] = useState<string | undefined>();
  const [launchType, setLaunchType] = useState<TransactionType>(TransactionType.EXPENSE);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setEvents(await EventService.getAll());
    setTransactions(await StorageService.getTransactions());
    setAccounts(await StorageService.getAccounts());
    setChartAccounts(await StorageService.getChartOfAccounts());
    setArtists(await StorageService.getArtists());
    setCategories(await StorageService.getCategories());
  };

  const filteredEvents = useMemo(() => {
    if (selectedArtistId === 'ALL') return events;
    return events.filter(e => e.artistId === selectedArtistId);
  }, [events, selectedArtistId]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
    return days;
  }, [currentDate]);

  const selectedDateEvents = useMemo(() => filteredEvents.filter(e => e.date === selectedDateStr), [filteredEvents, selectedDateStr]);

  const handleLaunchFromAgenda = (eventId: string, type: TransactionType) => {
    setSelectedLaunchEventId(eventId);
    setLaunchType(type);
    setIsLaunchModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteEventId) return;
    console.log('[Events] Deleting event via API:', deleteEventId);
    await EventService.delete(deleteEventId);

    // Refresh local storage for compatibility
    const updated = await EventService.getAll();
    StorageService.saveEvents(updated);

    loadData();
    setDeleteEventId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">Agenda de Shows</h2>
          <p className="text-gray-500 font-medium">Controle de datas, artistas e resultados financeiros.</p>
        </div>
        <Button onClick={() => { setEditingEvent(null); setIsFormOpen(true); }} className="rounded-2xl px-8 h-14 bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-xl">
          <Plus size={18} className="mr-2" /> Agendar Show
        </Button>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        <button onClick={() => setSelectedArtistId('ALL')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${selectedArtistId === 'ALL' ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}>Todos os Shows</button>
        {artists.map(artist => (
          <button key={artist.id} onClick={() => setSelectedArtistId(artist.id)} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${selectedArtistId === artist.id ? 'bg-white text-gray-900 border-gray-200 shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`} style={selectedArtistId === artist.id ? { borderLeft: `4px solid ${artist.color}` } : {}}>{artist.name}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white rounded-[48px] shadow-soft border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-xl font-black flex items-center gap-3">
              <CalendarIcon className="text-black" size={24} />
              {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-2">
              <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-3 hover:bg-gray-50 rounded-2xl border border-gray-50 text-gray-400"><ChevronLeft size={20} /></button>
              <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-3 hover:bg-gray-50 rounded-2xl border border-gray-50 text-gray-400"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-7 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(d => (
                <div key={d} className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-4 md:gap-6">
              {calendarDays.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="aspect-square"></div>;
                const dayEvents = filteredEvents.filter(e => e.date === day);
                const isSelected = selectedDateStr === day;
                const hasEvents = dayEvents.length > 0;
                const firstArtColor = hasEvents ? artists.find(a => a.id === dayEvents[0].artistId)?.color : null;

                return (
                  <button
                    key={day} onClick={() => setSelectedDateStr(day)}
                    className={`aspect-square rounded-[28px] flex flex-col items-center justify-center relative transition-all border-2 
                      ${isSelected ? 'bg-black border-black text-white shadow-2xl scale-110 z-10' : hasEvents ? 'bg-white border-gray-200 shadow-sm' : 'bg-transparent border-transparent hover:border-gray-100'}
                    `}
                    style={hasEvents && !isSelected ? { boxShadow: `0 10px 30px ${firstArtColor}20`, borderColor: `${firstArtColor}40` } : {}}
                  >
                    <span className={`text-base font-black ${isSelected ? 'text-white' : 'text-gray-900'}`}>{day.split('-')[2]}</span>
                    {hasEvents && !isSelected && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: firstArtColor || '#000' }}></div>
                    )}
                    <div className="mt-1 flex gap-0.5 justify-center h-1">
                      {dayEvents.slice(0, 3).map(e => {
                        const art = artists.find(a => a.id === e.artistId);
                        return <div key={e.id} className="w-1 h-1 rounded-full" style={{ backgroundColor: isSelected ? 'white' : (art?.color || 'black') }}></div>;
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#1C1C1E] text-white p-8 rounded-[48px] shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Compromissos</p>
              <h3 className="text-2xl font-black">
                {(() => {
                  const [y, m, d_] = selectedDateStr.split('-').map(Number);
                  return new Date(y, m - 1, d_).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
                })()}
              </h3>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-10">
              <Star size={120} />
            </div>
          </div>

          <div className="space-y-4">
            {selectedDateEvents.length === 0 ? (
              <div className="bg-white p-12 rounded-[40px] border border-dashed border-gray-200 text-center">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Agenda disponível</p>
              </div>
            ) : (
              selectedDateEvents.map(ev => {
                const artist = artists.find(a => a.id === ev.artistId);
                const cat = categories.find(c => c.id === ev.categoryId);
                const txs = transactions.filter(t => t.eventId === ev.id);
                const realized = txs.filter(t => t.type === TransactionType.INCOME).reduce((a, b) => a + b.amount, 0);
                const expenses = txs.filter(t => t.type === TransactionType.EXPENSE).reduce((a, b) => a + b.amount, 0);
                const progress = Math.min(100, (realized / (ev.budget || 1)) * 100);

                return (
                  <div key={ev.id} className="bg-white p-6 rounded-[40px] shadow-soft border border-gray-50 group hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-gray-100 text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2">{cat?.name}</span>
                        <h4 className="font-bold text-gray-900 text-lg leading-tight">{ev.name}</h4>
                        <p className="text-[10px] font-bold mt-1" style={{ color: artist?.color }}>{artist?.name}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setDetailEvent(ev)} className="p-2.5 text-blue-500 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-all" title="Ver Raio-X"><Eye size={18} /></button>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-end">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Resultado Real</p>
                        <p className={`text-sm font-black ${(realized - expenses) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>R$ {(realized - expenses).toLocaleString()}</p>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => handleLaunchFromAgenda(ev.id, TransactionType.INCOME)} className="flex-1 h-12 flex items-center justify-center bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"><Plus size={18} /></button>
                      <button onClick={() => handleLaunchFromAgenda(ev.id, TransactionType.EXPENSE)} className="flex-1 h-12 flex items-center justify-center bg-rose-600 text-white rounded-2xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"><Plus size={18} /></button>
                      <button onClick={() => { setEditingEvent(ev); setIsFormOpen(true); }} className="p-3 text-gray-400 hover:text-black rounded-2xl border border-gray-50"><Edit2 size={16} /></button>
                      <button onClick={() => setDeleteEventId(ev.id)} className="p-3 text-gray-400 hover:text-rose-500 rounded-2xl border border-gray-50"><Trash2 size={16} /></button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {isFormOpen && <EventFormModal event={editingEvent} initialDate={selectedDateStr} onClose={() => setIsFormOpen(false)} onSave={() => { loadData(); setIsFormOpen(false); }} />}

      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          transactions={transactions.filter(t => t.eventId === detailEvent.id)}
          artist={artists.find(a => a.id === detailEvent.artistId)}
          category={categories.find(c => c.id === detailEvent.categoryId)}
          onClose={() => setDetailEvent(null)}
          onUpdate={loadData}
        />
      )}

      {isLaunchModalOpen && (
        <MovementFormModal initialType={launchType} preSelectedEventId={selectedLaunchEventId} accounts={accounts} events={events} chartAccounts={chartAccounts} onClose={() => setIsLaunchModalOpen(false)} onSave={() => { loadData(); setIsLaunchModalOpen(false); }} />
      )}

      {deleteEventId && <DeleteConfirmationModal title="Excluir Show?" message="O agendamento e o histórico de produção serão removidos." onConfirm={confirmDelete} onCancel={() => setDeleteEventId(null)} />}
    </div>
  );
};
