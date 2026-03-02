import api from './api';
import { EventCategory } from '../types';

export const CategoryService = {
    getAll: async (): Promise<EventCategory[]> => {
        const response = await api.get('/categories');
        console.log('[CategoryService] Fetched all categories:', response.data);
        return response.data.data;
    },

    getById: async (id: string): Promise<EventCategory> => {
        console.log('[CategoryService] Fetching category by ID:', id);
        const response = await api.get(`/categories/${id}`);
        console.log('[CategoryService] Fetched category by ID:', id, response.data);
        return response.data.data;
    },

    create: async (category: Omit<EventCategory, 'id'>): Promise<EventCategory> => {
        console.log('[CategoryService] Creating category:', category);
        const response = await api.post('/categories', category);
        console.log('[CategoryService] Category created successfully:', response.data);
        return response.data.data;
    },

    update: async (id: string, category: Partial<EventCategory>): Promise<EventCategory> => {
        console.log('[CategoryService] Updating category:', id, category);
        const response = await api.put(`/categories/${id}`, category);
        console.log('[CategoryService] Category updated successfully:', response.data);
        return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
        console.log('[CategoryService] Deleting category:', id);
        await api.delete(`/categories/${id}`);
        console.log('[CategoryService] Category deleted successfully:', id);
    }
};
