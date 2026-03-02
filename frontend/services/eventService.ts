import api from './api';
import { FinanceEvent } from '../types';

const mapToFrontend = (e: any): FinanceEvent => ({
    ...e,
    date: e.date ? e.date.substring(0, 10) : '',
    artistId: e.artist_id,
    categoryId: e.category_id
});

const mapToBackend = (e: any) => ({
    name: e.name,
    date: e.date,
    artist_id: e.artistId,
    category_id: e.categoryId,
    budget: e.budget,
    description: e.description
});

export const EventService = {
    getAll: async (): Promise<FinanceEvent[]> => {
        const response = await api.get('/events');
        return (response.data.data || []).map(mapToFrontend);
    },

    getById: async (id: string): Promise<FinanceEvent> => {
        const response = await api.get(`/events/${id}`);
        return mapToFrontend(response.data.data);
    },

    create: async (event: Omit<FinanceEvent, 'id'>): Promise<FinanceEvent> => {
        const response = await api.post('/events', mapToBackend(event));
        return mapToFrontend(response.data.data);
    },

    update: async (id: string, event: Partial<FinanceEvent>): Promise<FinanceEvent> => {
        const response = await api.put(`/events/${id}`, mapToBackend(event));
        return mapToFrontend(response.data.data);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/events/${id}`);
    }
};
