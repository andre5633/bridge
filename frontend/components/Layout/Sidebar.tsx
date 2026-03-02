
import React from 'react';
import { LayoutDashboard, CalendarDays, LogOut, BarChart3, ArrowRightLeft, Settings as SettingsIcon } from 'lucide-react';
import { ViewState } from '../../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
  userName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onLogout, userName }) => {
  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => {
    const isActive = currentView === view || (view === 'ACCOUNTS' && ['ARTISTS', 'CATEGORIES', 'CHART_OF_ACCOUNTS'].includes(currentView));
    
    return (
      <button
        onClick={() => onChangeView(view)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
          isActive 
            ? 'bg-black text-white shadow-xl' 
            : 'text-gray-400 hover:bg-white hover:text-black hover:shadow-sm'
        }`}
      >
        <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-black'} />
        <span className="font-bold text-[10px] uppercase tracking-widest hidden lg:block text-left">{label}</span>
      </button>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-20 lg:w-64 bg-[#F5F5F7]/90 backdrop-blur-2xl border-r border-white/20 p-6 flex flex-col justify-between z-50">
      <div className="space-y-8 overflow-y-auto no-scrollbar pb-10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-white font-black text-xl shadow-lg shadow-black/10">B</div>
          <span className="font-black text-xl tracking-tighter text-gray-900 hidden lg:block">Bridge</span>
        </div>

        <nav className="space-y-1">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 hidden lg:block">Principal</p>
          <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Painel" />
          <NavItem view="EVENTS" icon={CalendarDays} label="Agenda de Shows" />
          <NavItem view="MOVEMENTS" icon={ArrowRightLeft} label="Movimentações" />
          
          <div className="my-6 border-t border-gray-200/50"></div>
          
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 hidden lg:block">Relatórios</p>
          <NavItem view="DRE" icon={BarChart3} label="DRE / Resultados" />
          
          <div className="my-6 border-t border-gray-200/50"></div>
          
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 hidden lg:block">Sistema</p>
          <NavItem view="ACCOUNTS" icon={SettingsIcon} label="Cadastros" />
        </nav>
      </div>

      <div className="pt-6 border-t border-gray-200/50 bg-[#F5F5F7]/90">
        <div className="mb-4 px-4 hidden lg:block">
           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Usuário</p>
           <p className="text-xs font-bold text-gray-900 truncate">{userName}</p>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <LogOut size={18} />
          <span className="hidden lg:block">Sair</span>
        </button>
      </div>
    </aside>
  );
};
