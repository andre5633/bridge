import api from './api';
import { Artist } from '../types';

export const ArtistService = {
    getAll: async (): Promise<Artist[]> => {
        console.log('[ArtistService] Fetching all artists...');
        const response = await api.get('/artists');
        console.log('[ArtistService] Fetched all artists:', response.data);
        return response.data.data;
    },

    getById: async (id: string): Promise<Artist> => {
        console.log('[ArtistService] Fetching artist by ID:', id);
        const response = await api.get(`/artists/${id}`);
        console.log('[ArtistService] Fetched artist by ID:', id, response.data);
        return response.data.data;
    },

    create: async (artist: Omit<Artist, 'id'>): Promise<Artist> => {
        console.log('[ArtistService] Creating artist:', artist);
        const response = await api.post('/artists', artist);
        console.log('[ArtistService] Artist created successfully:', response.data);
        return response.data.data;
    },

    update: async (id: string, artist: Partial<Artist>): Promise<Artist> => {
        console.log('[ArtistService] Updating artist:', id, artist);
        const response = await api.put(`/artists/${id}`, artist);
        console.log('[ArtistService] Artist updated successfully:', response.data);
        return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
        console.log('[ArtistService] Deleting artist:', id);
        await api.delete(`/artists/${id}`);
        console.log('[ArtistService] Artist deleted successfully:', id);
    }
};
