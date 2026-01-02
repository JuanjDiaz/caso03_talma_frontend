import { useState } from "react";

// Ideally this comes from a config file. Assuming localhost:8000 for local backend development
// or relying on Vite proxy.
const API_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface AnalysisResult {
    fileName: string;
    detectedType: string;
    confidence: number;
    fields: { label: string; value: string; section?: string }[];
}

interface UseDocumentsReturn {
    status: "idle" | "uploading" | "analyzing" | "success" | "error";
    files: File[];
    results: AnalysisResult[] | null;
    error: string | null;
    thinking: string;
    uploadProgress: number; // Kept for future use if we implement XHR upload progress
    handleUpload: (files: File[]) => Promise<void>;
    resetUpload: () => void;
    removeFile: (fileName: string) => void;
}

export function useDocuments(): UseDocumentsReturn {
    const [status, setStatus] = useState<"idle" | "uploading" | "analyzing" | "success" | "error">("idle");
    const [files, setFiles] = useState<File[]>([]);
    const [results, setResults] = useState<AnalysisResult[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [thinking, setThinking] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleUpload = async (selectedFiles: File[]) => {
        if (!selectedFiles || selectedFiles.length === 0) return;

        setFiles(selectedFiles);
        setStatus("analyzing"); // Switch immediately to analyzing as per new flow
        setThinking("");
        setResults(null);
        setError(null);
        setUploadProgress(0);

        const controller = new AbortController();
        // 2 minute timeout for long analysis
        const timeoutId = setTimeout(() => controller.abort(), 120000);

        try {
            const formData = new FormData();
            selectedFiles.forEach((file) => formData.append("files", file));

            // Using /analyze/upload based on demo pattern and likelihood of prefix
            const apiUrl = `${API_URL}/analyze/upload`;

            // Retrieve token logic mirrors axios interceptor
            const authStorage = localStorage.getItem('auth-storage');
            let token = localStorage.getItem('token');

            if (authStorage && !token) {
                try {
                    const parsedStorage = JSON.parse(authStorage);
                    token = parsedStorage.state?.token;
                } catch (e) {
                    console.error("Error parsing auth-storage", e);
                }
            }

            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(apiUrl, {
                method: "POST",
                body: formData,
                headers: headers, // Added headers
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Server Error: ${response.status} ${response.statusText}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error("Response body is missing");

            const decoder = new TextDecoder();
            let buffer = "";
            let fullResponse = "";

            while (true) {
                const { value, done } = await reader.read();

                const chunk = decoder.decode(value || new Uint8Array(), { stream: !done });
                buffer += chunk;
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith("data:")) {
                        const content = trimmedLine.slice(5).trim();
                        if (content === "[DONE]") continue;

                        try {
                            if (content.startsWith("{")) {
                                const data = JSON.parse(content);
                                if (data.error) throw new Error(data.error);
                                if (data.thinking) {
                                    setThinking(prev => prev + data.thinking);
                                }

                                if (data.response) {
                                    if (typeof data.response === 'object') {
                                        // Handle case where response is the object itself
                                        fullResponse = JSON.stringify(data.response);
                                    } else {
                                        fullResponse += data.response;
                                    }
                                }

                                if (!data.thinking && !data.response && data.content) {
                                    fullResponse += (typeof data.content === 'object' ? JSON.stringify(data.content) : data.content);
                                }
                            } else {
                                // Raw text - check if it's a status message or actual data
                                if (content.startsWith("[") || content.includes("Análisis completado")) {
                                    // Treat as status update in thinking if appropriate
                                    setThinking(prev => prev + "\n" + content + "\n");
                                } else {
                                    // Raw text - might be a chunk of the response
                                    fullResponse += content;
                                }
                            }
                        } catch (e) {
                            console.warn("SSE Parse Error:", e, "Content:", content);
                        }
                    }
                }
                if (done) break;
            }

            // If anything remains in the buffer that didn't end with \n
            if (buffer.trim().startsWith("data:")) {
                const content = buffer.trim().slice(5).trim();
                try {
                    const data = JSON.parse(content);
                    if (data.response) {
                        fullResponse += typeof data.response === 'object' ? JSON.stringify(data.response) : data.response;
                    }
                } catch (e) { }
            }

            // Final processing of accumulated response
            if (fullResponse.trim()) {
                // Attempt to parse fullResponse as JSON if it's the final structured result
                try {
                    const parsed = JSON.parse(fullResponse);

                    // Normalize to AnalysisResult[]
                    let finalResults: AnalysisResult[] = [];

                    if (Array.isArray(parsed)) {
                        finalResults = parsed.map((item: any) => ({
                            fileName: item.fileName || item.filename || item.document_name || "Document",
                            detectedType: item.detectedType || item.type || "Document",
                            confidence: item.confidence ?? 0.95,
                            fields: Array.isArray(item.fields)
                                ? item.fields
                                : Object.entries(item.fields || {}).map(([k, v]) => ({ label: k.replace(/_/g, ' '), value: v }))
                        }));
                    } else if (parsed.documents) {
                        finalResults = parsed.documents.map((doc: any, idx: number) => ({
                            fileName: doc.document_name || doc.filename || `Document ${idx + 1}`,
                            detectedType: doc.type || "Document",
                            confidence: doc.confidence ?? (doc.validation_status === 'valid' ? 1.0 : 0.8),
                            fields: Array.isArray(doc.fields)
                                ? doc.fields
                                : Object.entries(doc.fields || {}).map(([k, v]) => ({
                                    label: k.replace(/_/g, ' '),
                                    value: v
                                }))
                        }));
                    } else if (parsed.fields || typeof parsed === 'object') {
                        // Single multi-field object
                        finalResults = [{
                            fileName: parsed.fileName || parsed.document_name || "Result",
                            detectedType: parsed.type || "Document",
                            confidence: 1.0,
                            fields: Array.isArray(parsed.fields)
                                ? parsed.fields
                                : Object.entries(parsed.fields || parsed).map(([k, v]) => ({
                                    label: k.replace(/_/g, ' '),
                                    value: v
                                }))
                        }];
                    }

                    setResults(finalResults);
                } catch (e) {
                    console.error("Failed to parse full response JSON:", e);
                    // Fallback: Parse markdown/text
                    const structured = parseMarkdownResponse(fullResponse);
                    setResults([structured]);
                }
            } else {
                // If we got 'Thinking' but no final response, maybe the thinking IS the response?
                // Or explicitly errored.
                if (thinking && !results) {
                    // Verify if we should error or show thinking as result
                }
                if (!results) throw new Error("No analysis results received.");
            }

            setStatus("success");

        } catch (err: any) {
            console.error("Upload/Analysis Error:", err);
            if (err.name === 'AbortError') {
                setError("Request timed out. The analysis took too long.");
            } else {
                setError(err.message || "Failed to analyze documents.");
            }
            setStatus("error");
        }
    };

    const resetUpload = () => {
        setFiles([]);
        setResults(null);
        setError(null);
        setStatus("idle");
        setThinking("");
        setUploadProgress(0);
    };

    const removeFile = (fileName: string) => {
        setFiles(prev => prev.filter(f => f.name !== fileName));
    };

    return {
        status,
        files,
        results,
        error,
        thinking,
        uploadProgress,
        handleUpload,
        resetUpload,
        removeFile
    };
}


// Helper from demo project
function parseMarkdownResponse(text: string): AnalysisResult {
    const fields: { label: string; value: string; section?: string }[] = [];
    let currentSection = "";

    const lines = text.split('\n');
    let fileName = "Analysis Result";

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('#')) {
            currentSection = trimmed.replace(/^#+\s*/, '').replace(/\*+/g, '').trim();
            continue;
        }

        const keyValMatch = trimmed.match(/^-\s*\*\*(.*?)\*\*[:?]?\s*(.*)/);
        if (keyValMatch) {
            const key = keyValMatch[1].trim();
            const value = keyValMatch[2].trim();
            fields.push({ label: key, value: value || "See details", section: currentSection });
        }
    }

    if (fields.length === 0) {
        return {
            fileName: "Analysis Result",
            detectedType: "Text",
            confidence: 1.0,
            fields: [{ label: "Summary", value: text }]
        };
    }

    return {
        fileName,
        detectedType: "Document",
        confidence: 0.95,
        fields
    };
}
