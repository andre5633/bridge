
import { User, Account, FinanceEvent, Artist, EventCategory, ChartAccount, Transaction } from '../types';
import { ArtistService } from './artistService';
import { CategoryService } from './categoryService';
import { ChartAccountService } from './chartAccountService';
import { EventService } from './eventService';
import { AccountService } from './accountService';
import { TransactionService } from './transactionService';

const KEYS = {
  USER: 'finanza_user',
  ACCOUNTS: 'finanza_accounts',
  EVENTS: 'finanza_events',
  ARTISTS: 'finanza_artists',
  CATEGORIES: 'finanza_categories',
  CHART_ACCOUNTS: 'finanza_chart_accounts',
  TRANSACTIONS: 'finanza_transactions'
};

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const StorageService = {
  saveUser: (user: User) => localStorage.setItem(KEYS.USER, JSON.stringify(user)),
  getUser: (): User | null => {
    const d = localStorage.getItem(KEYS.USER);
    return d ? JSON.parse(d) : null;
  },
  clearUser: () => localStorage.removeItem(KEYS.USER),

  getArtists: async (): Promise<Artist[]> => {
    try {
      console.log('[StorageService] Requesting artists from API...');
      const artists = await ArtistService.getAll();
      localStorage.setItem(KEYS.ARTISTS, JSON.stringify(artists));
      return artists;
    } catch (error) {
      console.error('[StorageService] Error fetching artists from API:', error);
      const d = localStorage.getItem(KEYS.ARTISTS);
      return d ? JSON.parse(d) : [];
    }
  },
  saveArtists: async (a: Artist[]) => {
    localStorage.setItem(KEYS.ARTISTS, JSON.stringify(a));
  },

  getCategories: async (): Promise<EventCategory[]> => {
    try {
      const categories = await CategoryService.getAll();
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
      return categories;
    } catch (error) {
      console.error('[StorageService] Error fetching categories from API:', error);
      const d = localStorage.getItem(KEYS.CATEGORIES);
      return d ? JSON.parse(d) : [];
    }
  },
  saveCategories: async (c: EventCategory[]) => {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(c));
  },

  getAccounts: async (): Promise<Account[]> => {
    try {
      const accounts = await AccountService.getAll();
      localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
      return accounts;
    } catch (error) {
      console.error('[StorageService] Error fetching accounts from API:', error);
      const d = localStorage.getItem(KEYS.ACCOUNTS);
      return d ? JSON.parse(d) : [];
    }
  },
  saveAccounts: async (a: Account[]) => {
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(a));
  },

  getEvents: async (): Promise<FinanceEvent[]> => {
    try {
      const events = await EventService.getAll();
      localStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
      return events;
    } catch (error) {
      console.error('[StorageService] Error fetching events from API:', error);
      const d = localStorage.getItem(KEYS.EVENTS);
      return d ? JSON.parse(d) : [];
    }
  },
  saveEvents: async (e: FinanceEvent[]) => {
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(e));
  },

  getChartOfAccounts: async (): Promise<ChartAccount[]> => {
    try {
      const chart = await ChartAccountService.getAll();
      localStorage.setItem(KEYS.CHART_ACCOUNTS, JSON.stringify(chart));
      return chart;
    } catch (error) {
      console.error('[StorageService] Error fetching chart accounts from API:', error);
      const d = localStorage.getItem(KEYS.CHART_ACCOUNTS);
      return d ? JSON.parse(d) : [];
    }
  },
  saveChartOfAccounts: async (c: ChartAccount[]) => {
    localStorage.setItem(KEYS.CHART_ACCOUNTS, JSON.stringify(c));
  },

  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const transactions = await TransactionService.getAll();
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
      return transactions;
    } catch (error) {
      console.error('[StorageService] Error fetching transactions from API:', error);
      const d = localStorage.getItem(KEYS.TRANSACTIONS);
      return d ? JSON.parse(d) : [];
    }
  },
  saveTransactions: async (t: Transaction[]) => {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(t));
  },
};
