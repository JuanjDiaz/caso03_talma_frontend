
export interface DashboardMetrics {
    dailyTotal: number;
    weeklyTotal: number;
    monthlyTotal: number;
    processedCount: number;
    pendingCount: number;
    rejectedCount: number;
    averageConfidence: number;
    sunatPending: number;
    sunatAccepted: number;
    sunatRejected: number;
}

export interface ActivityItem {
    id: string;
    action: string;
    documentNumber: string;
    time: string;
    user: string;
    status: 'success' | 'warning' | 'error' | 'info';
}

export const DashboardService = {
    getMetrics: async (): Promise<DashboardMetrics> => {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    dailyTotal: 145,
                    weeklyTotal: 854,
                    monthlyTotal: 3420,
                    processedCount: 120,
                    pendingCount: 15,
                    rejectedCount: 10,
                    averageConfidence: 94.5,
                    sunatPending: 2,
                    sunatAccepted: 138,
                    sunatRejected: 5
                });
            }, 800);
        });
    },

    getRecentActivity: async (): Promise<ActivityItem[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { id: '1', action: 'Extracción completada', documentNumber: '074-12345678', time: 'Hace 5 min', user: 'Sistema', status: 'success' },
                    { id: '2', action: 'Envío a SUNAT fallido', documentNumber: '074-87654321', time: 'Hace 15 min', user: 'Sistema', status: 'error' },
                    { id: '3', action: 'Revisión manual requerida', documentNumber: '074-11223344', time: 'Hace 30 min', user: 'Admin', status: 'warning' },
                    { id: '4', action: 'Documento subido', documentNumber: '074-99887766', time: 'Hace 1 hora', user: 'JHuerta', status: 'info' },
                ]);
            }, 600);
        });
    }
};
