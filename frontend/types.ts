
export interface User {
  id: string;
  name: string;
  email: string;
  token?: string;
}

export enum AccountType {
  CHECKING = 'Corrente',
  SAVINGS = 'Poupança',
  CREDIT = 'Crédito',
  CASH = 'Dinheiro',
  INVESTMENT = 'Investimento'
}

export enum EntityType {
  PF = 'PF',
  PJ = 'PJ'
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string;
  entityType?: EntityType;
}

export interface EventCategory {
  id: string;
  name: string;
}

export interface Artist {
  id: string;
  name: string;
  color: string;
}

export interface FinanceEvent {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  artistId: string;
  categoryId: string;
  budget: number; // Valor orçado/contratado
  description?: string;
}

export enum ChartType {
  REVENUE = 'Receita',
  EXPENSE = 'Despesa'
}

export interface ChartAccount {
  id: string;
  code: string;
  name: string;
  type: ChartType;
  description?: string;
  isSubtotal?: boolean;
}

export enum TransactionType {
  INCOME = 'Receita',
  EXPENSE = 'Despesa',
  TRANSFER = 'Transferência'
}

export enum TransactionStatus {
  PENDING = 'Em Aberto',
  PAID = 'Pago'
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  paymentDate?: string;
  type: TransactionType;
  status: TransactionStatus;
  accountId: string;
  chartAccountId: string;
  eventId?: string;
  observation?: string;
  createdAt: number;
  transferGroupId?: string;
}

export type ViewState = 'LOGIN' | 'DASHBOARD' | 'ACCOUNTS' | 'EVENTS' | 'CHART_OF_ACCOUNTS' | 'MOVEMENTS' | 'DRE' | 'ARTISTS' | 'CATEGORIES';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
