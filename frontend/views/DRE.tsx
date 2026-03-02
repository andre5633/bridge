
import React, { useState, useEffect, useMemo } from 'react';
import { FinanceEvent, Artist } from '../types';
import { StorageService } from '../services/storageService';
import { ReportService, DRENode } from '../services/reportService';
import { ChevronDown, ChevronRight, Filter, Calendar, Building2, Layers, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export const DRE: React.FC = () => {
  const [viewMode, setViewMode] = useState<'SUMMARY' | 'DETAILED'>('SUMMARY');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedArtistId, setSelectedArtistId] = useState<string | 'ALL'>('ALL');
  const [selectedCostCenter, setSelectedCostCenter] = useState<string>('');
  const [summaryBasis, setSummaryBasis] = useState<'COMPETENCE' | 'CASH'>('CASH');
  const [dreTree, setDreTree] = useState<DRENode[]>([]);
  const [costCenters, setCostCenters] = useState<FinanceEvent[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [summaryTotals, setSummaryTotals] = useState({ revenue: 0, expense: 0, result: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInit = async () => {
      try {
        const [evs, arts] = await Promise.all([
          StorageService.getEvents(),
          StorageService.getArtists()
        ]);
        setCostCenters(evs);
        setArtists(arts);
      } catch (error) {
        console.error('[DRE] Error init data:', error);
      }
    };
    loadInit();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const report = await ReportService.getDRE(selectedYear, selectedArtistId, selectedCostCenter);
        setDreTree(report.tree);
      } catch (error) {
        console.error('[DRE] Error loading report:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedYear, selectedArtistId, selectedCostCenter]);

  // Note: Local filtering for Artist and CostCenter is still applied to the tree structure
  // In a more complex app, these would be filter parameters in the API call.
  // For now, we'll keep the simplified logic of fetching the full year DRE and letting the 
  // backend handle the heavy aggregation, but keep the UI filters as they are if possible.
  // However, since the backend already does the recursive sum, if we filter children on frontend
  // the parent sums won't update.
  // TODO: Add filters to the backend reports router.

  useEffect(() => {
    calculateSummaryTotals();
  }, [dreTree, summaryBasis]);

  const calculateSummaryTotals = () => {
    let rev = 0; let exp = 0;

    const sumNodes = (nodes: DRENode[]) => {
      nodes.forEach(node => {
        if (!node.is_subtotal) {
          const val = summaryBasis === 'CASH' ? node.total_realized : node.total_planned;
          if (node.type === 'Receita') rev += val; else exp += val;
        }
        if (node.children && node.children.length > 0) {
          sumNodes(node.children);
        }
      });
    };

    sumNodes(dreTree);
    setSummaryTotals({ revenue: rev, expense: exp, result: rev - exp });
  };

  const formatMoney = (val: number) => val.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

  const exportCSV = () => {
    const rows: string[][] = [];
    // Header
    const header = ['Código', 'Nome', 'Tipo'];
    months.forEach(m => {
      header.push(`${m} - Previsto`);
      header.push(`${m} - Realizado`);
    });
    header.push('Total Previsto', 'Total Realizado');
    rows.push(header);

    const flatten = (nodes: DRENode[]) => {
      nodes.forEach(node => {
        const row = [node.code, node.name, node.type];
        node.monthly_planned.forEach((p, i) => {
          row.push(p.toString());
          row.push(node.monthly_realized[i].toString());
        });
        row.push(node.total_planned.toString());
        row.push(node.total_realized.toString());
        rows.push(row);
        if (node.children.length > 0) flatten(node.children);
      });
    };

    flatten(dreTree);

    const csvContent = "data:text/csv;charset=utf-8,"
      + rows.map(e => e.join(";")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DRE_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCostCenters = useMemo(() => {
    if (selectedArtistId === 'ALL') return costCenters;
    return costCenters.filter(cc => cc.artistId === selectedArtistId);
  }, [costCenters, selectedArtistId]);

  const SummaryCard = () => {
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
    const renderSummaryItem = (node: DRENode) => {
      const isExpanded = !collapsedGroups.has(node.account_id);
      const totalVal = summaryBasis === 'CASH' ? node.total_realized : node.total_planned;
      if (totalVal === 0 && node.children.length === 0 && node.total_planned === 0) return null;
      return (
        <div key={node.account_id} className={`${node.is_subtotal ? 'bg-black/5 rounded-xl my-2' : 'border-b border-gray-50 last:border-0'}`}>
          <div className="flex justify-between items-center py-3 px-3 hover:bg-black/5 transition-colors cursor-pointer" onClick={() => { const n = new Set(collapsedGroups); if (n.has(node.account_id)) n.delete(node.account_id); else n.add(node.account_id); setCollapsedGroups(n); }}>
            <div className="flex items-center gap-3">{node.children.length > 0 ? <ChevronRight size={12} className={`text-gray-400 ${isExpanded ? 'rotate-90' : ''}`} /> : <span className="w-3"></span>}<span className={`text-sm ${node.children.length > 0 || node.is_subtotal ? 'font-bold text-gray-900' : 'text-gray-500'}`}>{node.name}</span></div>
            <span className={`text-sm font-bold tabular-nums ${node.is_subtotal ? 'text-blue-600' : 'text-gray-900'}`}>R$ {formatMoney(totalVal)}</span>
          </div>
          {node.children.length > 0 && isExpanded && <div className="pl-6 border-l border-gray-100 ml-4">{node.children.map(renderSummaryItem)}</div>}
        </div>
      );
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-[fadeIn_0.3s]">
        <div className="flex flex-col h-full"><div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-200"><div className="bg-emerald-50 text-emerald-700 p-2 rounded-lg"><ArrowUpCircle size={20} /></div><div><h3 className="font-bold text-gray-900">Receitas</h3><p className="text-xs text-gray-500">Geração de Caixa</p></div><div className="ml-auto text-right"><span className="block text-lg font-bold text-emerald-600">R$ {formatMoney(summaryTotals.revenue)}</span></div></div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1">{dreTree.filter(n => n.type === 'Receita').map(renderSummaryItem)}</div>
        </div>
        <div className="flex flex-col h-full"><div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-200"><div className="bg-red-50 text-red-700 p-2 rounded-lg"><ArrowDownCircle size={20} /></div><div><h3 className="font-bold text-gray-900">Despesas</h3><p className="text-xs text-gray-500">Utilização de Caixa</p></div><div className="ml-auto text-right"><span className="block text-lg font-bold text-red-600">- R$ {formatMoney(summaryTotals.expense)}</span></div></div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1">{dreTree.filter(n => n.type === 'Despesa').map(renderSummaryItem)}</div>
        </div>
        <div className="col-span-1 lg:col-span-2 mt-4"><div className="bg-[#1C1C1E] rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center text-white"><div className="text-center md:text-left"><h4 className="text-gray-400 font-medium text-xs uppercase tracking-widest">Lucro / Prejuízo Líquido</h4><p className="text-xs text-gray-500">Considerando base {summaryBasis === 'CASH' ? 'Caixa' : 'Competência'}</p></div><div className={`text-4xl md:text-5xl font-bold tracking-tight ${summaryTotals.result >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>R$ {formatMoney(summaryTotals.result)}</div></div></div>
      </div>
    );
  };

  const DetailedMatrix = () => {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    useEffect(() => { setExpandedIds(new Set(dreTree.map(n => n.account_id))); }, [dreTree]);
    const renderMatrixRow = (node: DRENode, depth: number) => {
      const isExp = expandedIds.has(node.account_id);
      return (
        <React.Fragment key={node.account_id}>
          <tr className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${node.is_subtotal ? 'bg-blue-50/30' : ''}`}>
            <td className="py-3 px-4 sticky left-0 z-10 border-r border-gray-100 bg-white shadow-sm"><div style={{ paddingLeft: `${depth * 20}px` }} className="flex items-center gap-2 w-[280px]">{node.children.length > 0 ? <button onClick={() => { const n = new Set(expandedIds); if (n.has(node.account_id)) n.delete(node.account_id); else n.add(node.account_id); setExpandedIds(n); }}><ChevronRight size={12} className={`transition-transform ${isExp ? 'rotate-90' : ''}`} /></button> : <span className="w-5"></span>}<span className={`truncate text-xs ${node.is_subtotal ? 'font-bold text-blue-700' : 'font-medium text-gray-700'}`}>{node.code} - {node.name}</span></div></td>
            {months.map((_, mIdx) => (<React.Fragment key={mIdx}><td className="py-3 px-2 text-right text-[11px] border-r border-gray-50 text-gray-400 tabular-nums">{formatMoney(node.monthly_planned[mIdx])}</td><td className="py-3 px-2 text-right text-[11px] font-bold border-r border-gray-50 text-gray-700 tabular-nums">{formatMoney(node.monthly_realized[mIdx])}</td></React.Fragment>))}
          </tr>
          {node.children.length > 0 && isExp && node.children.map(child => renderMatrixRow(child, depth + 1))}
        </React.Fragment>
      );
    };
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"><div className="overflow-x-auto"><table className="w-max border-collapse"><thead><tr className="bg-gray-50/50 border-b border-gray-200"><th className="py-3 px-4 sticky left-0 bg-gray-50 z-20 w-[300px] border-r border-gray-200 text-left text-xs font-bold text-gray-400 uppercase">Plano de Contas</th>{months.map(m => (<th key={m} colSpan={2} className="py-2 text-center border-r border-gray-200/60 text-xs font-bold text-gray-500 uppercase">{m}</th>))}</tr></thead><tbody>{dreTree.map(node => renderMatrixRow(node, 0))}</tbody></table></div></div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Calculando Demonstrativos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">DRE Gerencial PJ</h2>
          <p className="text-gray-500 text-sm">Demonstrativo de Resultados do Exercício.</p>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => { setSelectedArtistId('ALL'); setSelectedCostCenter(''); }}
          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${selectedArtistId === 'ALL' ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}
        >
          Todos os Artistas
        </button>
        {artists.map(artist => (
          <button
            key={artist.id}
            onClick={() => { setSelectedArtistId(artist.id); setSelectedCostCenter(''); }}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${selectedArtistId === artist.id ? 'bg-white text-gray-900 border-gray-200 shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}
            style={selectedArtistId === artist.id ? { borderLeft: `4px solid ${artist.color}` } : {}}
          >
            {artist.name}
          </button>
        ))}
      </div>

      <div className="bg-white p-2 md:p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="pl-9 pr-4 py-2 bg-transparent rounded-xl text-sm outline-none appearance-none cursor-pointer">
              {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - 1 + i).map(y => (<option key={y} value={y}>{y}</option>))}
            </select>
          </div>
          <div className="relative">
            <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select value={selectedCostCenter} onChange={e => setSelectedCostCenter(e.target.value)} className="pl-9 pr-8 py-2 bg-transparent rounded-xl text-sm outline-none appearance-none cursor-pointer">
              <option value="">{selectedArtistId === 'ALL' ? 'Todos Eventos' : `Eventos do Artista`}</option>
              {filteredCostCenters.map(cc => (<option key={cc.id} value={cc.id}>{cc.name}</option>))}
            </select>
          </div>
          {viewMode === 'SUMMARY' && (
            <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-lg">
              <button onClick={() => setSummaryBasis('COMPETENCE')} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${summaryBasis === 'COMPETENCE' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>Competência</button>
              <button onClick={() => setSummaryBasis('CASH')} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${summaryBasis === 'CASH' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>Caixa</button>
            </div>
          )}
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setViewMode('SUMMARY')} className={`px-4 py-1.5 text-xs font-bold uppercase rounded-lg transition-all ${viewMode === 'SUMMARY' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}><Layers size={14} className="inline mr-2" />Resumido</button>
          <button onClick={() => setViewMode('DETAILED')} className={`px-4 py-1.5 text-xs font-bold uppercase rounded-lg transition-all ${viewMode === 'DETAILED' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}><Filter size={14} className="inline mr-2" />Detalhado</button>
        </div>
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold uppercase hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          <ArrowUpCircle size={14} className="rotate-180" />
          Exportar CSV
        </button>
      </div>
      <div className="flex-1">{viewMode === 'SUMMARY' ? <SummaryCard /> : <DetailedMatrix />}</div>
    </div>
  );
};
