const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export interface AnalyzeEvent {
    type: 'thinking' | 'response' | 'error' | 'warning';
    message?: string;
    documents?: any[];
}

export const AnalyzeService = {
    async uploadFiles(
        files: File[],
        onEvent: (event: AnalyzeEvent) => void
    ): Promise<void> {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        const response = await fetch(`${API_URL}/analyze/upload`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split('\n\n');
            buffer = lines.pop() || ''; // Keep incomplete chunk

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonStr = line.slice(6);
                    try {
                        const data = JSON.parse(jsonStr);
                        onEvent(data);
                    } catch (e) {
                        console.error('Error parsing SSE data:', e);
                    }
                }
            }
        }
    }
};
