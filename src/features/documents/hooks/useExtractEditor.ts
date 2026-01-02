import { useState, useEffect, useCallback } from 'react';
import { analysisService } from '../services/analysisService';
import { formatLabel } from '@/lib/utils';
import CryptoJS from 'crypto-js';

export function useExtractEditor(initialResults: any[]) {
    const [editableResults, setEditableResults] = useState<any[]>([]);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    useEffect(() => {
        if (initialResults) {
            const initializedResults = initialResults.map(item => {
                let fields: { label: string; value: any; section?: string }[] = [];
                if (Array.isArray(item.fields)) {
                    fields = item.fields.map((f: any) => ({
                        ...f,
                        label: formatLabel(f.label)
                    }));
                } else if (item.fields && typeof item.fields === 'object') {
                    fields = Object.entries(item.fields).map(([key, value]) => ({
                        label: formatLabel(key),
                        value: value
                    }));
                } else if (item && typeof item === 'object') {
                    fields = Object.entries(item)
                        .filter(([key]) => !['fileName', 'detectedType', 'confidence', 'id', 'fields', 'isEncrypted', 'isAnonymized', 'document_index', 'document_name'].includes(key))
                        .map(([key, value]) => ({
                            label: formatLabel(key),
                            value: value
                        }));
                }
                const isEncrypted = item.isEncrypted || false;
                return {
                    ...item,
                    fields,
                    isAnonymized: isEncrypted,
                    isEncrypted
                };
            });
            setEditableResults(initializedResults);
        }
    }, [initialResults]);

    const handleValueChange = useCallback((docIndex: number, fieldIndex: number, newValue: any) => {
        setEditableResults(prev => {
            const next = [...prev];
            if (next[docIndex].isEncrypted) return prev;

            const newFields = [...next[docIndex].fields];
            newFields[fieldIndex] = { ...newFields[fieldIndex], value: newValue };
            next[docIndex] = { ...next[docIndex], fields: newFields };
            return next;
        });
        setSaveStatus('idle');
    }, []);

    const handleDeleteField = useCallback((docIndex: number, fieldIndex: number) => {
        setEditableResults(prev => {
            const next = [...prev];
            if (next[docIndex].isEncrypted) return prev;

            const newFields: any[] = next[docIndex].fields.filter((_: any, i: number) => i !== fieldIndex);
            next[docIndex] = { ...next[docIndex], fields: newFields };
            return next;
        });
        setSaveStatus('idle');
    }, []);

    const handleTitleChange = useCallback((docIndex: number, newTitle: string) => {
        setEditableResults(prev => {
            const next = [...prev];
            next[docIndex] = { ...next[docIndex], fileName: newTitle, document_name: newTitle };
            return next;
        });
        setSaveStatus('idle');
    }, []);

    const handleEncryptDocument = useCallback((docIndex: number, password: string) => {
        return new Promise<void>((resolve, reject) => {
            const doc = editableResults[docIndex];
            if (!doc || doc.isEncrypted) {
                resolve();
                return;
            }

            try {
                console.group(`🔐 Encrypting Document: ${doc.fileName} `);
                // console.log("Original Data:", JSON.parse(JSON.stringify(doc.fields)));

                const encryptedFields = doc.fields.map((field: any) => {
                    // Stringify if object/array to preserve data
                    let valToEncrypt = field.value;
                    if (typeof field.value === 'object' && field.value !== null) {
                        valToEncrypt = JSON.stringify(field.value);
                    }
                    const encryptedValue = CryptoJS.AES.encrypt(String(valToEncrypt), password).toString();
                    return {
                        ...field,
                        value: encryptedValue
                    };
                });

                // console.log("Encrypted Data:", JSON.parse(JSON.stringify(encryptedFields)));
                console.groupEnd();

                setEditableResults(prev => {
                    const next = [...prev];
                    next[docIndex] = {
                        ...next[docIndex],
                        fields: encryptedFields,
                        isEncrypted: true,
                        isAnonymized: true
                    };
                    return next;
                });
                resolve();
            } catch (e) {
                console.error("Encryption Failed:", e);
                reject(e);
            }
        });
    }, [editableResults]);

    const handleDecryptDocument = useCallback((docIndex: number, password: string) => {
        return new Promise<void>((resolve, reject) => {
            const doc = editableResults[docIndex];
            if (!doc || !doc.isEncrypted) {
                resolve();
                return;
            }

            try {
                console.group(`🔓 Decrypting Document: ${doc.fileName} `);
                // console.log("Encrypted Data:", JSON.parse(JSON.stringify(doc.fields)));

                // Dry run decryption
                const decryptedFields = doc.fields.map((field: any) => {
                    const bytes = CryptoJS.AES.decrypt(field.value, password);
                    const val = bytes.toString(CryptoJS.enc.Utf8);

                    if (field.value && !val) {
                        console.warn(`Failed to decrypt field: ${field.label} `);
                        throw new Error("Incorrect password");
                    }

                    // Try to restore object structure
                    let finalVal = val;
                    try {
                        if (val.startsWith('{') || val.startsWith('[')) {
                            finalVal = JSON.parse(val);
                        }
                    } catch (e) {
                        // Keep as string if parse fails
                    }

                    return { ...field, value: finalVal };
                });

                // console.log("Decrypted Data:", JSON.parse(JSON.stringify(decryptedFields)));
                console.groupEnd();

                setEditableResults(prev => {
                    const next = [...prev];
                    next[docIndex] = {
                        ...next[docIndex],
                        fields: decryptedFields,
                        isEncrypted: false,
                        isAnonymized: false
                    };
                    return next;
                });
                resolve();
            } catch (error: any) {
                console.error("Decryption Failed:", error.message);
                reject(error);
            }
        });
    }, [editableResults]);

    const handleGlobalEncryption = useCallback((password: string, shouldEncrypt: boolean) => {
        return new Promise<void>((resolve, reject) => {
            try {
                console.group(shouldEncrypt ? "🔐 Global Encryption" : "🔓 Global Decryption");

                if (!shouldEncrypt) {
                    for (const doc of editableResults) {
                        if (doc.isEncrypted) {
                            for (const field of doc.fields) {
                                const bytes = CryptoJS.AES.decrypt(field.value, password);
                                const val = bytes.toString(CryptoJS.enc.Utf8);
                                if (field.value && !val) {
                                    console.error("Global Decryption Check Failed: Incorrect password");
                                    console.groupEnd();
                                    throw new Error("Incorrect password for one or more documents");
                                }
                            }
                        }
                    }
                }

                setEditableResults(prev => {
                    return prev.map(doc => {
                        if (shouldEncrypt) {
                            if (doc.isEncrypted) return doc;

                            // console.log(`Encrypting ${ doc.fileName }...`);
                            const encryptedFields = doc.fields.map((field: any) => {
                                let valToEncrypt = field.value;
                                if (typeof field.value === 'object' && field.value !== null) {
                                    valToEncrypt = JSON.stringify(field.value);
                                }
                                return {
                                    ...field,
                                    value: CryptoJS.AES.encrypt(String(valToEncrypt), password).toString()
                                };
                            });
                            return { ...doc, fields: encryptedFields, isEncrypted: true, isAnonymized: true };
                        } else {
                            if (!doc.isEncrypted) return doc;

                            // console.log(`Decrypting ${ doc.fileName }...`);
                            const decryptedFields = doc.fields.map((field: any) => {
                                const bytes = CryptoJS.AES.decrypt(field.value, password);
                                let val = bytes.toString(CryptoJS.enc.Utf8);
                                try {
                                    if (val.startsWith('{') || val.startsWith('[')) {
                                        val = JSON.parse(val);
                                    }
                                } catch (e) { }
                                return { ...field, value: val };
                            });
                            return { ...doc, fields: decryptedFields, isEncrypted: false, isAnonymized: false };
                        }
                    });
                });

                // console.log("Global operation completed successfully.");
                console.groupEnd();
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }, [editableResults]);

    const handleSave = useCallback(async (onSuccess?: () => void) => {
        setSaveStatus('saving');
        try {
            await analysisService.saveAnalysisResults(editableResults);
            setSaveStatus('success');
            setTimeout(() => {
                setSaveStatus('idle');
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (error) {
            console.error("Save failed:", error);
            setSaveStatus('error');
            setTimeout(() => {
                setSaveStatus('idle');
            }, 3000);
        }
    }, [editableResults]);

    return {
        editableResults,
        saveStatus,
        handleValueChange,
        handleDeleteField,
        handleEncryptDocument,
        handleDecryptDocument,
        handleGlobalEncryption,
        handleTitleChange,
        handleSave
    };
}
