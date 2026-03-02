import api from './api';
import { Transaction } from '../types';

const mapToFrontend = (tx: any): Transaction => ({
    ...tx,
    date: tx.date ? tx.date.substring(0, 10) : '', // Normalize to YYYY-MM-DD
    accountId: tx.account_id,
    chartAccountId: tx.chart_account_id,
    eventId: tx.event_id,
    paymentDate: tx.payment_date,
    transferGroupId: tx.transfer_group_id,
    createdAt: tx.created_at ? new Date(tx.created_at).getTime() : Date.now()
});

const mapToBackend = (tx: any) => ({
    description: tx.description,
    amount: tx.amount,
    date: tx.date,
    payment_date: tx.paymentDate,
    type: tx.type,
    status: tx.status,
    account_id: tx.accountId,
    chart_account_id: tx.chartAccountId,
    event_id: tx.eventId,
    observation: tx.observation,
    transfer_group_id: tx.transferGroupId
});

export const TransactionService = {
    getAll: async (accountId?: string, eventId?: string): Promise<Transaction[]> => {
        console.log('[TransactionService] Fetching transactions...', { accountId, eventId });
        const response = await api.get('/transactions', {
            params: { account_id: accountId, event_id: eventId }
        });
        return (response.data.data || []).map(mapToFrontend);
    },

    getById: async (id: string): Promise<Transaction> => {
        const response = await api.get(`/transactions/${id}`);
        return mapToFrontend(response.data.data);
    },

    create: async (transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> => {
        const response = await api.post('/transactions', mapToBackend(transaction));
        return mapToFrontend(response.data.data);
    },

    update: async (id: string, transaction: Partial<Transaction>): Promise<Transaction> => {
        const response = await api.put(`/transactions/${id}`, mapToBackend(transaction));
        return mapToFrontend(response.data.data);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/transactions/${id}`);
    }
};
