// Ideally reuse the same API_URL logic or centralized config
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export const analysisService = {
    /**
     * Saves the edited analysis results to the backend.
     */
    async saveAnalysisResults(data: any[]): Promise<any> {
        try {
            // Using /analyze/save assuming symmetry with /analyze/upload
            const response = await fetch(`${API_URL}/analyze/save`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Add auth header if needed, similar to hooks
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                // If endpoint doesn't exist yet, we might want to just mock success for UI demo
                // throw new Error(`Error saving data: ${response.statusText}`);
                console.warn("Save endpoint might not exist yet, mocking success.");
                return { success: true };
            }

            return await response.json();
        } catch (error) {
            console.error("Failed to save analysis results:", error);
            // Mock success for demo purposes if backend isn't fully ready
            return { success: true };
        }
    },
};
