import { motion } from 'framer-motion';

interface ComplexFieldRendererProps {
    value: any;
    depth?: number;
    onChange?: (value: any) => void;
    isAnonymized?: boolean;
}

export default function ComplexFieldRenderer({ value, depth = 0, onChange, isAnonymized = false }: ComplexFieldRendererProps) {
    if (value === null || value === undefined) {
        return <span className="text-zinc-600 italic">Empty</span>;
    }

    // handle primitive value change
    const handlePrimitiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) onChange(e.target.value);
    };

    // masking helper
    const renderMasked = (val: any) => {
        return (
            <span className="text-indigo-300/50 select-none blur-[2px]">
                {'•'.repeat(Math.min(String(val).length, 12) || 8)}
            </span>
        );
    };

    // primitive -> render input or masked span
    if (typeof value !== 'object') {
        if (isAnonymized) return renderMasked(value);

        return (
            <input
                type="text"
                value={value}
                onChange={handlePrimitiveChange}
                className="bg-transparent border-b border-white/5 text-zinc-300 focus:text-white focus:border-red-500/50 focus:outline-none w-full min-w-[50px] transition-colors"
                readOnly={!onChange}
            />
        );
    }

    // Array Handling
    if (Array.isArray(value)) {
        if (value.length === 0) return <span className="text-zinc-600 italic">[]</span>;

        const handleArrayItemChange = (idx: number, newItemValue: any) => {
            if (!onChange) return;
            const newArray = [...value];
            newArray[idx] = newItemValue;
            onChange(newArray);
        };

        // Check if array of objects (Table Candidates)
        const isArrayOfObjects = value.every(item => typeof item === 'object' && item !== null);

        if (isArrayOfObjects) {
            // Get all unique keys for headers
            const keys = Array.from(new Set(value.flatMap(Object.keys)));

            return (
                <div className="overflow-x-auto border border-white/5 rounded-lg bg-zinc-900/20 my-2">
                    <table className="w-full text-left text-xs text-zinc-400">
                        <thead className="bg-white/5 uppercase tracking-wider font-semibold text-zinc-500">
                            <tr>
                                {keys.map(key => (
                                    <th key={key} className="px-4 py-3 border-b border-white/5 whitespace-nowrap">
                                        {key.replace(/_/g, ' ')}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {value.map((row, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                    {keys.map(key => (
                                        <td key={key} className="px-4 py-2 align-top">
                                            <ComplexFieldRenderer
                                                value={row[key]}
                                                depth={depth + 1}
                                                isAnonymized={isAnonymized}
                                                onChange={(newVal) => {
                                                    const newRow = { ...row, [key]: newVal };
                                                    handleArrayItemChange(idx, newRow);
                                                }}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        // Array of primitives (List)
        return (
            <ul className="list-disc list-inside space-y-1 pl-2 my-1">
                {value.map((item, idx) => (
                    <li key={idx} className="text-zinc-300 text-sm flex items-center gap-2">
                        <ComplexFieldRenderer
                            value={item}
                            depth={depth + 1}
                            isAnonymized={isAnonymized}
                            onChange={(newVal) => handleArrayItemChange(idx, newVal)}
                        />
                    </li>
                ))}
            </ul>
        );
    }

    // Object Handling
    const handleObjectKeyChange = (key: string, newVal: any) => {
        if (!onChange) return;
        const newObj = { ...value, [key]: newVal };
        onChange(newObj);
    };

    return (
        <div className={`grid gap-2 ${depth > 0 ? 'pl-3 border-l-2 border-white/5 my-1' : ''}`}>
            {Object.entries(value).map(([key, val]) => (
                <div key={key} className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                        {key.replace(/_/g, ' ')}
                    </span>
                    <div className="text-sm">
                        <ComplexFieldRenderer
                            value={val}
                            depth={depth + 1}
                            isAnonymized={isAnonymized}
                            onChange={(newVal) => handleObjectKeyChange(key, newVal)}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
