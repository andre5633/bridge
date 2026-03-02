
import React, { useEffect, useState, useMemo } from 'react';
import { User, Account, Transaction, TransactionType, TransactionStatus, ChartAccount, FinanceEvent, Artist } from '../types';
import { StorageService } from '../services/storageService';
import { GeminiService } from '../services/geminiService';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Calendar, ArrowRight, Wallet, Activity, PieChart, Clock, AlertCircle, Target, Layers, Music } from 'lucide-react';

interface DashboardProps {
  user: User;
  onNavigate: (view: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [welcomeMsg, setWelcomeMsg] = useState('Analisando finanças...');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartAccounts, setChartAccounts] = useState<ChartAccount[]>([]);
  const [costCenters, setCostCenters] = useState<FinanceEvent[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const accs = await StorageService.getAccounts();
        const txs = await StorageService.getTransactions();
        const charts = await StorageService.getChartOfAccounts();
        const cCenters = await StorageService.getEvents();
        const arts = await StorageService.getArtists();

        setAccounts(accs);
        setTransactions(txs);
        setChartAccounts(charts);
        setCostCenters(cCenters);
        setArtists(arts);
        setTotalBalance(accs.reduce((acc, curr) => acc + curr.balance, 0));

        const msg = await GeminiService.getWelcomeInsight(user.name.split(' ')[0]);
        setWelcomeMsg(msg);
      } catch (error) {
        console.error('[Dashboard] Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  // --- Derived Metrics ---

  const currentMonthMetrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let revenue = 0;
    let expense = 0;

    transactions.forEach(t => {
      const [y, m, d_] = t.date.split('-').map(Number);
      const d = new Date(y, m - 1, d_);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        if (t.type === TransactionType.INCOME) revenue += t.amount;
        else expense += t.amount;
      }
    });

    return { revenue, expense, result: revenue - expense };
  }, [transactions]);

  // Substituição de Forecast por Próximos Eventos
  // Shows Recentes (Passados)
  const recentEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return costCenters
      .filter(e => e.date < today)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [costCenters]);

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return costCenters
      .filter(e => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [costCenters]);

  const costCenterMetrics = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach(t => {
      if (t.type === TransactionType.EXPENSE && t.eventId) {
        const current = map.get(t.eventId) || 0;
        map.set(t.eventId, current + t.amount);
      }
    });

    const total = Array.from(map.values()).reduce((a, b) => a + b, 0);

    return Array.from(map.entries())
      .map(([id, value]) => ({
        name: costCenters.find(c => c.id === id)?.name || 'Desconhecido',
        value,
        percent: total > 0 ? (value / total) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions, costCenters]);

  // --- Chart Data Generators ---

  const dailyBalanceData = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dataPoints = [];

    const dailyChanges = Array(daysInMonth + 1).fill(0);

    transactions.forEach(t => {
      const [y, m, d_] = t.date.split('-').map(Number);
      const d = new Date(y, m - 1, d_);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        const day = d.getDate();
        const factor = t.type === TransactionType.INCOME ? 1 : -1;
        dailyChanges[day] += t.amount * factor;
      }
    });

    let currentSum = 0;
    for (let i = 1; i <= daysInMonth; i++) {
      currentSum += dailyChanges[i];
      if (i <= now.getDate()) {
        dataPoints.push({ day: i, value: currentSum });
      }
    }
    return dataPoints;
  }, [transactions]);

  // Histórico focado em Eventos Realizados (Volume e Financeiro)
  const sixMonthEventData = useMemo(() => {
    const result = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      const monthLabel = d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();

      const monthEvents = costCenters.filter(e => {
        const [ey, em, ed_] = e.date.split('-').map(Number);
        const eDate = new Date(ey, em - 1, ed_);
        return eDate.getMonth() === month && eDate.getFullYear() === year;
      });

      let eventRevenue = 0;
      let eventExpense = 0;

      transactions.forEach(t => {
        const [ty, tm, td] = t.date.split('-').map(Number);
        const tDate = new Date(ty, tm - 1, td);
        if (tDate.getMonth() === month && tDate.getFullYear() === year) {
          if (t.type === TransactionType.INCOME) eventRevenue += t.amount;
          else eventExpense += t.amount;
        }
      });

      result.push({
        label: monthLabel,
        count: monthEvents.length,
        income: eventRevenue,
        expense: eventExpense
      });
    }
    return result;
  }, [transactions, costCenters]);

  // --- SVG Chart Components ---

  const AreaChart = ({ data }: { data: { day: number, value: number }[] }) => {
    if (data.length < 2) return <div className="h-full flex items-center justify-center text-gray-300 text-xs">Dados insuficientes neste mês</div>;

    const height = 120;
    const width = 600;
    const padding = 10;

    const minVal = Math.min(...data.map(d => d.value), 0);
    const maxVal = Math.max(...data.map(d => d.value), 100);
    const range = maxVal - minVal || 1;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d.value - minVal) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    const areaPath = `${points} ${width},${height} 0,${height}`;

    return (
      <svg viewBox={`0 0 ${width} ${height + padding}`} className="w-full h-full overflow-visible preserve-3d">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#007AFF" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#007AFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M ${areaPath} Z`} fill="url(#chartGradient)" />
        <path d={`M ${points}`} fill="none" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {data.length > 0 && (
          <circle
            cx={(data.length - 1) / (data.length - 1) * width}
            cy={height - ((data[data.length - 1].value - minVal) / range) * height}
            r="4"
            fill="#007AFF"
            stroke="white"
            strokeWidth="2"
          />
        )}
      </svg>
    );
  };

  const BarChart = ({ data }: { data: { label: string, income: number, expense: number, count: number }[] }) => {
    const dataMax = Math.max(...data.map(d => Math.max(d.income, d.expense)), 0);
    const maxVal = dataMax > 0 ? dataMax : 1;

    return (
      <div className="flex justify-between items-end h-32 gap-2 mt-4">
        {data.map((d, idx) => (
          <div key={idx} className="flex flex-col items-center justify-end h-full gap-1 flex-1 group cursor-default">
            <div className="flex gap-1 flex-1 w-full items-end justify-center">
              <div
                className="w-2 bg-emerald-400 rounded-t-sm relative transition-all hover:bg-emerald-500"
                style={{ height: `${(d.income / maxVal) * 100}%`, minHeight: '4px' }}
                title={`Receita de Shows: R$ ${d.income.toLocaleString()}`}
              ></div>
              <div
                className="w-2 bg-rose-400 rounded-t-sm relative transition-all hover:bg-rose-500"
                style={{ height: `${(d.expense / maxVal) * 100}%`, minHeight: '4px' }}
                title={`Despesa de Shows: R$ ${d.expense.toLocaleString()}`}
              ></div>
            </div>
            <div className="text-[7px] font-black text-gray-300 mb-0.5">{d.count} SHW</div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{d.label}</span>
          </div>
        ))}
      </div>
    );
  };

  const DonutChart = ({ data }: { data: { name: string, percent: number }[] }) => {
    let cumulativePercent = 0;

    if (data.length === 0) {
      return (
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="w-full h-full rounded-full border-4 border-gray-100"></div>
          <span className="absolute text-[10px] text-gray-400">Sem dados</span>
        </div>
      );
    }

    return (
      <div className="relative w-32 h-32 group">
        <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
          {data.map((slice, i) => {
            const startPercent = cumulativePercent;
            const slicePercent = slice.percent;
            cumulativePercent += slicePercent;

            const circumference = 2 * Math.PI * 40;
            const dashArray = `${(slicePercent / 100) * circumference} ${circumference}`;
            const dashOffset = -((startPercent / 100) * circumference);

            const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981'];

            return (
              <circle
                key={i}
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={colors[i % colors.length]}
                strokeWidth="12"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                className="transition-all duration-300 hover:opacity-80"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-xs font-bold text-gray-900">{data.length}</span>
          <span className="text-[8px] text-gray-500 uppercase">Eventos</span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Carregando Painel...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-[fadeIn_0.3s_ease-out]">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Visão Geral</h1>
          <p className="text-gray-500 mt-1 max-w-xl text-lg font-light flex items-center gap-2">
            {welcomeMsg}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Saldo Consolidado</p>
          <div className="flex items-center justify-end gap-2">
            <span className="text-4xl font-bold text-gray-900 tracking-tighter">
              R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* KPI Cards */}
        <div className="col-span-1 md:col-span-3 space-y-4">
          {/* Income KPI */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ArrowUpRight size={48} className="text-emerald-500" />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Receitas (Mês)</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">R$ {currentMonthMetrics.revenue.toLocaleString('pt-BR')}</p>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600 font-medium bg-emerald-50 w-fit px-1.5 py-0.5 rounded">
              <ArrowUpRight size={12} /> Fluxo de Entrada
            </div>
          </div>

          {/* Expense KPI */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ArrowDownRight size={48} className="text-red-500" />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Despesas (Mês)</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">R$ {currentMonthMetrics.expense.toLocaleString('pt-BR')}</p>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-red-600 font-medium bg-red-50 w-fit px-1.5 py-0.5 rounded">
              <ArrowDownRight size={12} /> Fluxo de Saída
            </div>
          </div>

          {/* Net Result KPI */}
          <div className="bg-[#1C1C1E] p-5 rounded-2xl shadow-soft text-white relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Resultado Líquido</p>
            <p className={`text-2xl font-bold tracking-tight ${currentMonthMetrics.result >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {currentMonthMetrics.result >= 0 ? '+' : ''} R$ {currentMonthMetrics.result.toLocaleString('pt-BR')}
            </p>
            <p className="text-[10px] text-gray-500 mt-2">Balanço do mês atual</p>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="col-span-1 md:col-span-9 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Activity size={18} className="text-blue-500" />
                Evolução de Saldo
              </h3>
              <p className="text-xs text-gray-500 mt-1">Variação diária acumulada (Mês Atual)</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
              <Calendar size={12} />
              {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </div>
          </div>

          <div className="flex-1 w-full h-[200px] relative">
            <AreaChart data={dailyBalanceData} />
          </div>
        </div>

        {/* --- Próximos Eventos & Distribution Row --- */}

        {/* Próximos Eventos */}
        <div className="col-span-1 md:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600">
                <Calendar size={16} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Próximos Eventos</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Agenda Imediata</p>
              </div>
            </div>

            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-gray-400">Nenhum show agendado.</p>
                </div>
              ) : (
                upcomingEvents.map(e => {
                  const artist = artists.find(a => a.id === e.artistId);
                  return (
                    <div key={e.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-8 rounded-full" style={{ backgroundColor: artist?.color || '#000' }}></div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-700 truncate max-w-[150px]" title={e.name}>{e.name}</p>
                          <p className="text-[9px] font-black uppercase tracking-tight" style={{ color: artist?.color }}>{artist?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-900">
                          {(() => {
                            const [y, m, d_] = e.date.split('-').map(Number);
                            return new Date(y, m - 1, d_).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase();
                          })()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {upcomingEvents.length > 0 && (
            <div className="pt-4 border-t border-gray-50 mt-4">
              <button
                onClick={() => onNavigate('EVENTS')}
                className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 w-full text-center"
              >
                Abrir agenda completa
              </button>
            </div>
          )}
        </div>

        {/* Shows Recentes */}
        <div className="col-span-1 md:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-emerald-50 p-1.5 rounded-lg text-emerald-600">
              <Clock size={16} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Shows Recentes</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Histórico Próximo</p>
            </div>
          </div>

          <div className="space-y-3">
            {recentEvents.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-gray-400">Nenhum show recente.</p>
              </div>
            ) : (
              recentEvents.map(e => {
                const artist = artists.find(a => a.id === e.artistId);
                return (
                  <div key={e.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 rounded-full bg-gray-200"></div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-700 truncate max-w-[150px]" title={e.name}>{e.name}</p>
                        <p className="text-[9px] font-black uppercase tracking-tight text-gray-400">{artist?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-900">
                        {(() => {
                          const [y, m, d_] = e.date.split('-').map(Number);
                          return new Date(y, m - 1, d_).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase();
                        })()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Events Donut */}
        <div className="col-span-1 md:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="bg-purple-50 p-1.5 rounded-lg text-purple-600">
                  <Target size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Custos por Evento</h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Distribuição</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-4">
              <div className="shrink-0">
                <DonutChart data={costCenterMetrics} />
              </div>
              <div className="flex-1 space-y-2">
                {costCenterMetrics.map((item, idx) => {
                  const colors = ['bg-blue-500', 'bg-violet-500', 'bg-pink-500', 'bg-orange-500', 'bg-emerald-500'];
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${colors[idx % colors.length]}`}></div>
                        <span className="text-gray-600 truncate max-w-[80px]">{item.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{item.percent.toFixed(0)}%</span>
                    </div>
                  );
                })}
                {costCenterMetrics.length === 0 && <p className="text-xs text-gray-400">Sem dados.</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Histórico de Shows Realizados */}
        <div className="col-span-1 md:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 p-1.5 rounded-lg text-gray-600">
                <Music size={16} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Performace de Shows</h3>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Últimos 6 Meses</span>
              </div>
            </div>
          </div>
          <BarChart data={sixMonthEventData} />
        </div>

        {/* --- Bottom Row: Accounts & Recent --- */}

        {/* Accounts Liquidity */}
        <div className="col-span-1 md:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600">
                <Wallet size={16} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Contas PJ</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Disponibilidade</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {accounts.slice(0, 4).map(acc => {
              const maxBalance = Math.max(...accounts.map(a => a.balance), 1);
              const percent = Math.max(0, (acc.balance / maxBalance) * 100);

              return (
                <div key={acc.id} className="group">
                  <div className="flex justify-between items-end mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: acc.color }}></div>
                      <span className="text-xs font-medium text-gray-700">{acc.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900">R$ {acc.balance.toLocaleString('pt-BR', { notation: 'compact' })}</span>
                  </div>
                  <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${percent}%`, backgroundColor: acc.color }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="col-span-1 md:col-span-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 p-1.5 rounded-lg text-gray-600">
                <Layers size={16} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Últimos Lançamentos</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Histórico Financeiro</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('MOVEMENTS')}
              className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-all hover:gap-3"
            >
              Ver extrato <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {transactions.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${t.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {t.type === TransactionType.INCOME ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-black">{t.description}</p>
                    <p className="text-[10px] text-gray-500">
                      {(() => {
                        const [y, m, d_] = t.date.split('-').map(Number);
                        return new Date(y, m - 1, d_).toLocaleDateString('pt-BR');
                      })()}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-bold tabular-nums ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-gray-900'}`}>
                  {t.type === TransactionType.EXPENSE && '- '}R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
            {transactions.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Nenhuma transação recente.</p>}
          </div>
        </div>

      </div >
    </div >
  );
};
