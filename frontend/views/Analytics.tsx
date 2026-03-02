
import React, { useState, useEffect, useMemo } from 'react';
import { FinanceEvent } from '../types';
import { StorageService } from '../services/storageService';
import { ReportService, AnalyticsResponse } from '../services/reportService';
import { ArrowUpCircle, ArrowDownCircle, CheckCircle2, Clock, Building2, Layers, ChevronRight } from 'lucide-react';

interface HierarchyNode {
  id: string;
  code: string;
  name: string;
  value: number;
  type: string;
  children: HierarchyNode[];
  percentOfTotal: number;
  isSubtotal: boolean;
}

const HierarchyRow: React.FC<{ node: HierarchyNode, depth?: number, expandedNodes: Set<string>, onToggle: (id: string) => void }> = ({ node, depth = 0, expandedNodes, onToggle }) => {
  const isExpanded = expandedNodes.has(node.id);
  const isRevenue = node.type === 'Receita';
  return (
    <>
      <div className={`flex items-center py-2.5 px-3 border-b border-gray-50 transition-colors cursor-pointer group ${node.isSubtotal ? 'bg-black/[0.03] border-l-4 border-l-black/20' : (isRevenue ? 'hover:bg-emerald-50/50' : 'hover:bg-red-50/50')}`} onClick={() => node.children.length > 0 && onToggle(node.id)} style={{ paddingLeft: `${depth * 20 + 12}px` }}>
        <div className="w-5 flex items-center justify-center shrink-0 mr-1 text-gray-400">{node.children.length > 0 && <ChevronRight size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />}</div>
        <div className="flex-1 min-w-0 pr-4"><div className="flex items-center gap-2"><span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${node.isSubtotal ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>{node.code}</span><span className={`text-sm ${node.children.length > 0 || node.isSubtotal ? 'font-bold text-gray-900' : 'text-gray-700 font-medium'} truncate`}>{node.name}</span></div></div>
        <div className="w-32 text-right shrink-0"><span className={`text-sm font-bold tabular-nums block ${node.isSubtotal ? 'text-blue-600' : 'text-gray-900'}`}>R$ {node.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span><div className="w-full bg-gray-100 h-1 mt-1 rounded-full overflow-hidden flex justify-end"><div className={`h-full rounded-full ${node.isSubtotal ? 'bg-blue-500' : (isRevenue ? 'bg-emerald-500' : 'bg-red-500')}`} style={{ width: `${Math.min(node.percentOfTotal, 100)}%` }}></div></div></div>
        <div className="w-16 text-right shrink-0 ml-4"><span className="text-xs font-medium text-gray-500 tabular-nums">{node.percentOfTotal.toFixed(1)}%</span></div>
      </div>
      {isExpanded && node.children.map(child => (<HierarchyRow key={child.id} node={child} depth={depth + 1} expandedNodes={expandedNodes} onToggle={onToggle} />))}
    </>
  );
};

export const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CASHFLOW' | 'RESULTS'>('CASHFLOW');
  const [selectedCostCenter, setSelectedCostCenter] = useState<string>('');
  const [startDate, setStartDate] = useState(() => { const d = new Date(); d.setMonth(d.getMonth() - 1); d.setDate(1); return d.toISOString().split('T')[0]; });
  const [endDate, setEndDate] = useState(() => { const d = new Date(); d.setMonth(d.getMonth() + 2); d.setDate(0); return d.toISOString().split('T')[0]; });

  const [costCenters, setCostCenters] = useState<FinanceEvent[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInit = async () => {
      try {
        const events = await StorageService.getEvents();
        setCostCenters(events);
      } catch (error) {
        console.error('[Analytics] Error loading events:', error);
      }
    };
    loadInit();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await ReportService.getAnalytics(startDate, endDate);
        setAnalyticsData(data);
      } catch (error) {
        console.error('[Analytics] Error loading report:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [startDate, endDate]);

  if (isLoading || !analyticsData) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Gerando Relatórios...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"><div><h2 className="text-2xl font-bold text-gray-900">Analytics PJ</h2><p className="text-gray-500">Fluxo e desempenho por eventos.</p></div><div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto"><div className="relative"><Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><select value={selectedCostCenter} onChange={e => setSelectedCostCenter(e.target.value)} className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none appearance-none cursor-pointer"><option value="">Todos Eventos</option>{costCenters.map(cc => (<option key={cc.id} value={cc.id}>{cc.name}</option>))}</select></div><div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200"><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent text-sm outline-none w-28 cursor-pointer" /><span className="text-gray-300">-</span><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent text-sm outline-none w-28 cursor-pointer" /></div></div></div>
      <div className="border-b border-gray-200"><div className="flex gap-6"><button onClick={() => setActiveTab('CASHFLOW')} className={`pb-3 text-sm font-medium relative ${activeTab === 'CASHFLOW' ? 'text-black' : 'text-gray-500'}`}>Fluxo de Caixa{activeTab === 'CASHFLOW' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-t-full"></div>}</button><button onClick={() => setActiveTab('RESULTS')} className={`pb-3 text-sm font-medium relative ${activeTab === 'RESULTS' ? 'text-black' : 'text-gray-500'}`}>Análise de Resultados{activeTab === 'RESULTS' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-t-full"></div>}</button></div></div>
      <div className="animate-[fadeIn_0.3s]">
        {activeTab === 'CASHFLOW' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><Clock size={18} className="text-blue-500" />Previsto vs Realizado</h3><div className="flex flex-col md:flex-row gap-8"><div className="flex-1"><p className="text-sm font-medium text-gray-700 mb-2">Entradas (Receitas)</p><div className="space-y-3"><div><div className="flex justify-between text-xs mb-1"><span>Previsto</span><span>R$ {analyticsData.income_forecast.toLocaleString('pt-BR')}</span></div><div className="w-full bg-gray-100 h-2 rounded-full"><div className="bg-emerald-200 h-full rounded-full" style={{ width: '100%' }}></div></div></div><div><div className="flex justify-between text-xs mb-1"><span>Realizado</span><span className="font-bold">R$ {analyticsData.income_realized.toLocaleString('pt-BR')}</span></div><div className="w-full bg-gray-100 h-2 rounded-full"><div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(analyticsData.income_realized / (analyticsData.income_forecast || 1)) * 100}%` }}></div></div></div></div></div><div className="flex-1"><p className="text-sm font-medium text-gray-700 mb-2">Saídas (Despesas)</p><div className="space-y-3"><div><div className="flex justify-between text-xs mb-1"><span>Previsto</span><span>R$ {analyticsData.expense_forecast.toLocaleString('pt-BR')}</span></div><div className="w-full bg-gray-100 h-2 rounded-full"><div className="bg-red-200 h-full rounded-full" style={{ width: '100%' }}></div></div></div><div><div className="flex justify-between text-xs mb-1"><span>Realizado</span><span className="font-bold">R$ {analyticsData.expense_realized.toLocaleString('pt-BR')}</span></div><div className="w-full bg-gray-100 h-2 rounded-full"><div className="bg-red-500 h-full rounded-full" style={{ width: `${(analyticsData.expense_realized / (analyticsData.expense_forecast || 1)) * 100}%` }}></div></div></div></div></div></div></div>
          </div>
        )}
        {activeTab === 'RESULTS' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit"><h3 className="font-bold text-gray-900 mb-4">Eventos</h3><div className="space-y-3">{analyticsData.cost_center_distribution.map((item, idx) => (<div key={idx} className="flex justify-between text-sm border-b border-gray-50 pb-2"><span>{item.name}</span><span className="font-bold">R$ {item.value.toLocaleString('pt-BR', { notation: 'compact' })}</span></div>))}</div></div>
            <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[500px] text-center justify-center p-10"><p className="text-gray-400">Plano de Contas Drill-down disponível no modo DRE Gerencial.</p></div>
          </div>
        )}
      </div>
    </div>
  );
};