import api from './api';
import { ChartAccount } from '../types';

export const ChartAccountService = {
    getAll: async (): Promise<ChartAccount[]> => {
        console.log('[ChartAccountService] Fetching all chart accounts...');
        const response = await api.get('/chart-of-accounts');
        console.log('[ChartAccountService] Fetched all chart accounts:', response.data);
        return response.data.data;
    },

    getById: async (id: string): Promise<ChartAccount> => {
        console.log('[ChartAccountService] Fetching chart account by ID:', id);
        const response = await api.get(`/chart-of-accounts/${id}`);
        console.log('[ChartAccountService] Fetched chart account by ID:', id, response.data);
        return response.data.data;
    },

    create: async (account: Omit<ChartAccount, 'id'>): Promise<ChartAccount> => {
        console.log('[ChartAccountService] Creating chart account:', account);
        // Map camelCase to snake_case for backend if needed
        const data = {
            ...account,
            is_subtotal: account.isSubtotal
        };
        const response = await api.post('/chart-of-accounts', data);
        console.log('[ChartAccountService] Chart account created successfully:', response.data);
        return response.data.data;
    },

    update: async (id: string, account: Partial<ChartAccount>): Promise<ChartAccount> => {
        console.log('[ChartAccountService] Updating chart account:', id, account);
        const data = {
            ...account,
            is_subtotal: account.isSubtotal
        };
        const response = await api.put(`/chart-of-accounts/${id}`, data);
        console.log('[ChartAccountService] Chart account updated successfully:', response.data);
        return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
        console.log('[ChartAccountService] Deleting chart account:', id);
        await api.delete(`/chart-of-accounts/${id}`);
        console.log('[ChartAccountService] Chart account deleted successfully:', id);
    }
};
