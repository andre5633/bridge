import api from './api';
import { Account } from '../types';

const mapToFrontend = (a: any): Account => ({
    ...a,
    entityType: a.entity_type
});

const mapToBackend = (a: any) => ({
    name: a.name,
    type: a.type,
    balance: a.balance,
    color: a.color,
    entity_type: a.entityType
});

export const AccountService = {
    getAll: async (): Promise<Account[]> => {
        const response = await api.get('/accounts');
        return (response.data.data || []).map(mapToFrontend);
    },

    getById: async (id: string): Promise<Account> => {
        const response = await api.get(`/accounts/${id}`);
        return mapToFrontend(response.data.data);
    },

    create: async (account: Omit<Account, 'id'>): Promise<Account> => {
        const response = await api.post('/accounts', mapToBackend(account));
        return mapToFrontend(response.data.data);
    },

    update: async (id: string, account: Partial<Account>): Promise<Account> => {
        const response = await api.put(`/accounts/${id}`, mapToBackend(account));
        return mapToFrontend(response.data.data);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/accounts/${id}`);
    }
};
