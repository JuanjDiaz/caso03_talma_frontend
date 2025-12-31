import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    BarChart3,
    FileCheck,
    FileText,
    AlertTriangle,
    Clock,
    CheckCircle2,
    XCircle,
    TrendingUp
} from 'lucide-react';
import MetricCard from './components/MetricCard';
import { DashboardService, DashboardMetrics, ActivityItem } from '../../services/dashboardService';

const HomePage: React.FC = () => {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Prevent browser from restoring scroll position automatically
        if (history.scrollRestoration) {
            history.scrollRestoration = 'manual';
        }

        const loadDashboard = async () => {
            try {
                const [metricsData, activityData] = await Promise.all([
                    DashboardService.getMetrics(),
                    DashboardService.getRecentActivity()
                ]);
                setMetrics(metricsData);
                setActivity(activityData);
            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
                // Force scroll to top after content is fully loaded
                setTimeout(() => window.scrollTo(0, 0), 0);
            }
        };
        loadDashboard();

        return () => {
            // Restore default behavior on unmount (optional, but good practice)
            if (history.scrollRestoration) {
                history.scrollRestoration = 'auto';
            }
        };
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-tivit-red border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-500 text-sm">Cargando tablero...</span>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="w-full max-w-7xl mx-auto space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#212121] pb-6">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-bold text-white mb-2"
                    >
                        Panel de Control Operativo
                    </motion.h1>
                    <p className="text-gray-400 text-sm">
                        Resumen en tiempo real del procesamiento de guías aéreas y estado de integraciones regulatorias.
                    </p>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-2xl font-mono text-white">
                        {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">
                        {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Guías Procesadas (Hoy)"
                    value={metrics?.dailyTotal || 0}
                    subtitle="vs. 132 ayer"
                    icon={FileText}
                    trend="up"
                    trendValue="+9.8%"
                    color="text-blue-400"
                    delay={0.1}
                />
                <MetricCard
                    title="Precisión de Extracción"
                    value={`${metrics?.averageConfidence}%`}
                    subtitle="Promedio últimos 7 días"
                    icon={TrendingUp}
                    trend="up"
                    trendValue="+1.2%"
                    color="text-emerald-400"
                    delay={0.2}
                />
                <MetricCard
                    title="Pendientes de Revisión"
                    value={metrics?.pendingCount || 0}
                    subtitle="Requieren validación manual"
                    icon={AlertTriangle}
                    trend="down"
                    trendValue="-5"
                    color="text-yellow-400"
                    delay={0.3}
                />
                <MetricCard
                    title="Envíos a SUNAT"
                    value={metrics?.sunatAccepted || 0}
                    subtitle={`${metrics?.sunatPending} en cola`}
                    icon={FileCheck}
                    trend="neutral"
                    trendValue="Estable"
                    color="text-purple-400"
                    delay={0.4}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Chart Section (Simulated with CSS) */}
                <motion.div
                    variants={containerVariants}
                    className="lg:col-span-2 bg-[#08080A]/50 border border-[#1B1818] rounded-xl p-6 backdrop-blur-sm"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <BarChart3 size={20} className="text-gray-400" />
                            Volumen de Procesamiento Semanal
                        </h3>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1.5 text-xs text-gray-400">
                                <span className="w-2 h-2 rounded-full bg-tivit-red"></span> Automático
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-gray-400">
                                <span className="w-2 h-2 rounded-full bg-gray-600"></span> Manual
                            </span>
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-4 px-2">
                        {[45, 68, 85, 95, 75, 55, 60].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end gap-1 group cursor-pointer">
                                <div className="relative w-full bg-[#1E1E24] rounded-t-sm hover:bg-[#25252D] transition-all overflow-hidden">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="absolute bottom-0 w-full bg-tivit-red/80 group-hover:bg-tivit-red transition-colors"
                                    />
                                    <div className="h-full w-full" style={{ height: '100%' }}></div>
                                </div>
                                <span className="text-xs text-gray-500 text-center font-mono">
                                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Activity Feed and Status */}
                <div className="space-y-6">
                    {/* SUNAT Integration Status */}
                    <motion.div
                        variants={containerVariants}
                        className="bg-[#08080A]/50 border border-[#1B1818] rounded-xl p-6 backdrop-blur-sm"
                    >
                        <h3 className="text-white font-semibold flex items-center gap-2 mb-6">
                            <Activity size={20} className="text-gray-400" />
                            Estado de Integración
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-[#161616]/50 border border-[#212121]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-200">Aceptados</div>
                                        <div className="text-xs text-gray-500">Respondido satisfactoriamente</div>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-white">{metrics?.sunatAccepted}</span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-[#161616]/50 border border-[#212121]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                                        <Clock size={16} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-200">En Cola</div>
                                        <div className="text-xs text-gray-500">Esperando envío</div>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-white">{metrics?.sunatPending}</span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-[#161616]/50 border border-[#212121]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                        <XCircle size={16} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-200">Rechazados</div>
                                        <div className="text-xs text-gray-500">Requieren corrección</div>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-white">{metrics?.sunatRejected}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Recent Activity Mini List */}
                    <motion.div
                        variants={containerVariants}
                        className="bg-[#08080A]/50 border border-[#1B1818] rounded-xl p-6 backdrop-blur-sm"
                    >
                        <h3 className="text-white font-semibold mb-4">Actividad Reciente</h3>
                        <div className="space-y-4">
                            {activity.map((item, idx) => (
                                <div key={item.id} className="flex gap-3 items-start relative pb-4 last:pb-0">
                                    {idx !== activity.length - 1 && (
                                        <div className="absolute left-[11px] top-8 bottom-0 w-px bg-[#212121]" />
                                    )}
                                    <div className={`
                                        w-6 h-6 rounded-full flex items-center justify-center shrink-0 border z-10 bg-[#08080A]
                                        ${item.status === 'success' ? 'border-emerald-500/30 text-emerald-500' :
                                            item.status === 'error' ? 'border-red-500/30 text-red-500' :
                                                item.status === 'warning' ? 'border-yellow-500/30 text-yellow-500' :
                                                    'border-blue-500/30 text-blue-500'}
                                    `}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'success' ? 'bg-emerald-500' :
                                            item.status === 'error' ? 'bg-red-500' :
                                                item.status === 'warning' ? 'bg-yellow-500' :
                                                    'bg-blue-500'
                                            }`} />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-300 font-medium">{item.action}</div>
                                        <div className="text-xs text-gray-500 hover:text-white transition-colors cursor-pointer">
                                            {item.documentNumber} • {item.user}
                                        </div>
                                        <div className="text-[10px] text-gray-600 mt-1">{item.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default HomePage;
