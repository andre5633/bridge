import api from './api';

export interface DRENode {
    account_id: string;
    code: string;
    name: string;
    is_subtotal: boolean;
    type: string;
    monthly_planned: number[];
    monthly_realized: number[];
    total_planned: number;
    total_realized: number;
    children: DRENode[];
}

export interface DREResponse {
    year: number;
    tree: DRENode[];
}

export interface AnalyticsMetric {
    name: string;
    value: number;
    percent: number;
}

export interface AnalyticsResponse {
    income_forecast: number;
    income_realized: number;
    expense_forecast: number;
    expense_realized: number;
    cost_center_distribution: AnalyticsMetric[];
}

export const ReportService = {
    getDRE: async (year: number, artistId?: string, eventId?: string): Promise<DREResponse> => {
        console.log('[ReportService] Fetching DRE for year:', year, { artistId, eventId });
        const response = await api.get('/reports/dre', {
            params: {
                year,
                ...(artistId && artistId !== 'ALL' ? { artist_id: artistId } : {}),
                ...(eventId ? { event_id: eventId } : {})
            }
        });
        return response.data.data;
    },

    getAnalytics: async (startDate: string, endDate: string): Promise<AnalyticsResponse> => {
        console.log('[ReportService] Fetching Analytics...', { startDate, endDate });
        const response = await api.get('/reports/analytics', {
            params: { start_date: startDate, end_date: endDate }
        });
        return response.data.data;
    }
};
