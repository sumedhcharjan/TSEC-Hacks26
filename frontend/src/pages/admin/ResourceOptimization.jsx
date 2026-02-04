import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
    Zap, Droplets, AlertTriangle, Lightbulb, CheckCircle, ArrowRight, Activity
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const ResourceOptimization = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/admin/optimization');
                setData(response.data.data);
            } catch (error) {
                console.error('Failed to fetch resource data:', error);
                toast.error('Optimization Engine: Data Synchronisation Failure');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-10 h-10 border-4 border-accent-soft border-t-action rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] animate-pulse">Running Neural Optimization Analytics...</p>
            </div>
        );
    }

    const { timeline, alerts, recommendations, summary } = data;

    return (
        <div className="min-h-screen pb-20">
            <Toaster position="top-right" />

            {/* Professional Management Header */}
            <div className="bg-white border-b border-border-subtle mb-10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-action font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                            <span className="w-2 h-2 rounded-full bg-action animate-pulse"></span>
                            Resource Management
                        </div>
                        <h1 className="text-4xl font-black text-primary tracking-tight">
                            Optimization <span className="text-action">Engine</span>
                        </h1>
                        <p className="text-text-muted font-medium mt-1 uppercase text-[10px] tracking-widest">Real-time utility oversight & mission-critical conservation</p>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 border border-border-subtle p-2 rounded-2xl shadow-sm">
                        <div className="px-6 py-2 border-r border-border-subtle text-center">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">System Pulse</p>
                            <div className="flex items-center justify-center gap-2">
                                <span className={`w-2 h-2 rounded-full animate-pulse ${alerts.length > 0 ? 'bg-status-danger' : 'bg-status-success'}`}></span>
                                <span className={`text-[11px] font-black uppercase tracking-tight ${alerts.length > 0 ? 'text-status-danger' : 'text-status-success'}`}>
                                    {alerts.length > 0 ? 'Anomaly Detected' : 'Optimal State'}
                                </span>
                            </div>
                        </div>
                        <div className="px-6 py-2 text-center">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Alert Queue</p>
                            <p className="text-lg font-black text-primary leading-none">{alerts.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">

                {/* Tactical Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                    {/* Energy Metric */}
                    <div className="civic-card p-8 group hover:-translate-y-1 transition-all">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 bg-accent-soft rounded-2xl flex items-center justify-center text-action">
                                <Zap size={24} />
                            </div>
                            <span className="text-[9px] font-black text-status-success bg-status-success/10 px-3 py-1 rounded-full border border-status-success/20 uppercase tracking-widest">+2.4% EFFICIENCY</span>
                        </div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Load Balance</p>
                        <h3 className="text-3xl font-black text-primary tracking-tight group-hover:text-action transition-colors">
                            {summary.currentEnergy} <span className="text-sm font-bold text-text-muted">kW</span>
                        </h3>
                    </div>

                    {/* Water Metric */}
                    <div className="civic-card p-8 group hover:-translate-y-1 transition-all">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                                <Droplets size={24} />
                            </div>
                            <span className="text-[9px] font-black text-status-danger bg-status-danger/10 px-3 py-1 rounded-full border border-status-danger/20 uppercase tracking-widest">LEAK ANOMALY</span>
                        </div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Flow Rate</p>
                        <h3 className="text-3xl font-black text-primary tracking-tight group-hover:text-action transition-colors">
                            {summary.currentWater} <span className="text-sm font-bold text-text-muted">LPM</span>
                        </h3>
                    </div>

                    {/* AI Forecasting */}
                    <div className="bg-primary rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20 group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-white/10">Neural Prediction</span>
                            </div>
                            <h3 className="text-2xl font-black tracking-tight mb-2">Peak Suggestion</h3>
                            <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest mb-6">
                                Target: <span className="text-action underline">{data.forecast?.expected_next_peak || '120'} kW</span>
                            </p>
                            <div className="flex items-center gap-3 text-[10px] font-black bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <div className={`w-2 h-2 rounded-full ${data.forecast?.trend === 'UPWARD' ? 'bg-status-warning animate-pulse' : 'bg-status-success'}`}></div>
                                <span className="leading-tight">{data.forecast?.recommendation || 'No immediate load shift required.'}</span>
                            </div>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-action/20 rounded-full blur-[60px] group-hover:scale-150 transition-transform duration-1000"></div>
                    </div>

                    {/* Carbon Offset */}
                    <div className="bg-action rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-action/20 group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-white/10">Impact Matrix</span>
                            </div>
                            <h3 className="text-2xl font-black tracking-tight mb-2">Carbon Offset</h3>
                            <p className="text-white/80 text-[11px] font-bold leading-relaxed mb-6">4.2 tons of CO2 mitigated this cycle through adaptive infrastructure.</p>
                            <button className="flex items-center gap-2 text-[10px] font-black bg-white text-action px-5 py-3 rounded-2xl hover:bg-neutral-50 transition-all uppercase tracking-widest shadow-lg">
                                Analytical Report <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tactical Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Energy Consumption Chronology */}
                    <div className="civic-card p-10">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="font-black text-primary tracking-tight text-xl flex items-center gap-3">
                                    <Zap className="text-action" size={20} />
                                    Energy Chronology
                                </h3>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">24-Hour Operational Window</p>
                            </div>
                            <p className="text-[10px] font-black text-text-muted bg-gray-100 px-3 py-1 rounded-lg">UNIT: kW/h</p>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timeline}>
                                    <defs>
                                        <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1E6FD9" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#1E6FD9" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="timestamp"
                                        tickFormatter={(str) => new Date(str).getHours() + ":00"}
                                        interval={11}
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                                        labelFormatter={(label) => new Date(label).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    />
                                    <Area type="monotone" dataKey="energy" stroke="#1E6FD9" strokeWidth={4} fillOpacity={1} fill="url(#colorEnergy)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Water Flux Monitoring */}
                    <div className="civic-card p-10">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="font-black text-primary tracking-tight text-xl flex items-center gap-3">
                                    <Droplets className="text-blue-500" size={20} />
                                    Water Flux Analysis
                                </h3>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Real-time Distribution Intelligence</p>
                            </div>
                            <p className="text-[10px] font-black text-text-muted bg-gray-100 px-3 py-1 rounded-lg">UNIT: LPM</p>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timeline}>
                                    <defs>
                                        <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="timestamp"
                                        tickFormatter={(str) => new Date(str).getHours() + ":00"}
                                        interval={11}
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                                        labelFormatter={(label) => new Date(label).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    />
                                    <Area type="monotone" dataKey="water" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorWater)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Strategic Intervention Hub */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                    {/* Tactical Anomalies */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="font-black text-primary tracking-tight text-xl flex items-center gap-3 px-2">
                            <AlertTriangle className="text-status-danger" size={20} />
                            Observed Anomalies ({alerts.length})
                        </h3>
                        <div className="space-y-4">
                            {alerts.length === 0 ? (
                                <div className="civic-card p-10 text-center flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-status-success/10 rounded-full flex items-center justify-center text-status-success">
                                        <CheckCircle size={32} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-status-success uppercase tracking-widest">Protocols Verified</p>
                                        <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-widest">No systemic deviations detected.</p>
                                    </div>
                                </div>
                            ) : (
                                alerts.map((alert, idx) => (
                                    <div key={idx} className={`p-6 rounded-[28px] border transition-all hover:scale-[1.02] ${alert.severity === 'CRITICAL' ? 'bg-status-danger/5 border-status-danger/20' : 'bg-status-warning/5 border-status-warning/20'}`}>
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${alert.severity === 'CRITICAL' ? 'bg-status-danger' : 'bg-status-warning'}`}></span>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{alert.type.replace('_', ' ')}</span>
                                            </div>
                                            <span className="text-[9px] font-black text-text-muted font-mono uppercase">
                                                {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm font-black text-primary leading-tight tracking-tight">{alert.reason}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* AI Strategy Engine */}
                    <div className="lg:col-span-3 space-y-6">
                        <h3 className="font-black text-primary tracking-tight text-xl flex items-center gap-3 px-2">
                            <Lightbulb className="text-status-warning" size={20} />
                            Strategic Interventions
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {recommendations.map((rec, idx) => (
                                <div key={idx} className="civic-card p-8 hover:border-action transition-all group flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[9px] font-black text-action bg-accent-soft px-3 py-1 rounded-lg uppercase tracking-widest">{rec.target}</span>
                                        <span className="text-[9px] font-black text-status-success uppercase tracking-widest">{rec.impact}</span>
                                    </div>
                                    <h4 className="text-lg font-black text-primary tracking-tight group-hover:text-action transition-colors mb-3 leading-none">{rec.action}</h4>
                                    <p className="text-[11px] font-bold text-text-muted leading-relaxed mb-8">
                                        {rec.suggestion}
                                    </p>
                                    <button className="mt-auto w-full py-4 bg-gray-50 border border-border-subtle rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-gray-100 hover:border-action transition-all flex items-center justify-center gap-2">
                                        Execute Protocol <ArrowRight size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ResourceOptimization;
