import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: string;
    delay?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendValue,
    color = "text-tivit-red",
    delay = 0
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="bg-[#08080A]/50 border border-[#1B1818] rounded-xl p-6 backdrop-blur-sm hover:border-white/10 transition-colors"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg bg-[#161616] ${color}`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' :
                            trend === 'down' ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-400'
                        }`}>
                        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'} {trendValue}
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wide">{title}</h3>
                <div className="text-2xl font-bold text-white">{value}</div>
                {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
        </motion.div>
    );
};

export default MetricCard;
