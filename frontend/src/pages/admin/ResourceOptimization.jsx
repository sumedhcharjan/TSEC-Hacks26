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
                toast.error('Failed to load optimization engine data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Set up polling for "real-time" feel
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-text-muted font-medium animate-pulse">Running Optimization Engine Analytics...</p>
            </div>
        );
    }

    const { timeline, alerts, recommendations, summary } = data;

    return (
        <div className="space-y-8 animate-fade-in p-6 max-w-7xl mx-auto">
            <Toaster />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-main flex items-center gap-3">
                        <Activity className="text-primary" size={32} />
                        Resource Optimization Engine
                    </h1>
                    <p className="text-text-muted mt-1">Real-time utility monitoring & AI-driven conservation strategies</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-border">
                    <div className="px-4 py-1 border-r border-border">
                        <p className="text-[10px] uppercase font-bold text-text-muted">Global Health</p>
                        <p className={`text-sm font-bold ${alerts.length > 0 ? 'text-danger' : 'text-success'}`}>
                            {alerts.length > 0 ? 'Action Required' : 'Optimized'}
                        </p>
                    </div>
                    <div className="px-4 py-1">
                        <p className="text-[10px] uppercase font-bold text-text-muted">Active Alerts</p>
                        <p className="text-sm font-bold text-text-main">{alerts.length}</p>
                    </div>
                </div>
            </div>

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-border hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <Zap size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">+2.4% vs Peak</span>
                    </div>
                    <p className="text-sm font-medium text-text-muted">Current Power Load</p>
                    <p className="text-2xl font-bold text-text-main mt-1">{summary.currentEnergy} <span className="text-sm font-normal text-text-light">kW</span></p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-border hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary">
                            <Droplets size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-danger bg-danger/10 px-2 py-0.5 rounded-full">Leak Detected</span>
                    </div>
                    <p className="text-sm font-medium text-text-muted">Current Water Flow</p>
                    <p className="text-2xl font-bold text-text-main mt-1">{summary.currentWater} <span className="text-sm font-normal text-text-light">LPM</span></p>
                </div>

                {/* AI Demand Forecast */}
                <div className="bg-secondary text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold uppercase tracking-widest leading-none">AI Demand Prediction</div>
                        </div>
                        <h3 className="text-xl font-bold">Expect {data.forecast?.expected_next_peak || 'Steady'} kW Peak</h3>
                        <p className="text-white/80 text-sm mt-1 mb-4">
                            Trend is <span className="font-bold underline">{data.forecast?.trend || 'STABLE'}</span>.
                            Confidence: {data.forecast?.confidence || 'HIGH'}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-bold bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
                            <div className={`w-2 h-2 rounded-full ${data.forecast?.trend === 'UPWARD' ? 'bg-warning animate-pulse' : 'bg-success'}`}></div>
                            {data.forecast?.recommendation || 'No immediate load shift required.'}
                        </div>
                    </div>
                </div>

                {/* Efficiency Badge for Demo */}
                <div className="bg-primary text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold uppercase tracking-widest leading-none">Smart Analytics</div>
                        </div>
                        <h3 className="text-xl font-bold">Carbon Impact Offset</h3>
                        <p className="text-white/80 text-sm mt-1 mb-4">You've saved 4.2 tons of CO2 this month through adaptive lighting.</p>
                        <button className="flex items-center gap-2 text-xs font-bold bg-white text-primary px-4 py-2 rounded-lg hover:bg-neutral-100 transition-colors">
                            View Detailed Impact Report <ArrowRight size={14} />
                        </button>
                    </div>
                    {/* Abstract background element */}
                    <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform"></div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Energy Consumption Chart */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-text-main flex items-center gap-2">
                            <Zap className="text-primary" size={18} />
                            Energy Consumption (24h)
                        </h3>
                        <p className="text-xs text-text-muted">Unit: kW/h</p>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timeline}>
                                <defs>
                                    <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0B2F5E" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0B2F5E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(str) => new Date(str).getHours() + ":00"}
                                    interval={11}
                                    tick={{ fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', borderColor: '#eee', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelFormatter={(label) => new Date(label).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                />
                                <Area type="monotone" dataKey="energy" stroke="#0B2F5E" strokeWidth={3} fillOpacity={1} fill="url(#colorEnergy)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Water Consumption Chart */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-text-main flex items-center gap-2">
                            <Droplets className="text-secondary" size={18} />
                            Water Flow Monitoring (24h)
                        </h3>
                        <p className="text-xs text-text-muted">Unit: LPM</p>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timeline}>
                                <defs>
                                    <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3182CE" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3182CE" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(str) => new Date(str).getHours() + ":00"}
                                    interval={11}
                                    tick={{ fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', borderColor: '#eee', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelFormatter={(label) => new Date(label).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                />
                                <Area type="monotone" dataKey="water" stroke="#3182CE" strokeWidth={3} fillOpacity={1} fill="url(#colorWater)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Alerts & Recommendations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Active Alerts List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-text-main flex items-center gap-2 px-2">
                        <AlertTriangle className="text-danger" size={18} />
                        Anomalies Detected ({alerts.length})
                    </h3>
                    <div className="space-y-3">
                        {alerts.length === 0 ? (
                            <div className="bg-success/5 border border-success/10 p-6 rounded-2xl text-center">
                                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3 text-success">
                                    <CheckCircle size={24} />
                                </div>
                                <p className="text-sm font-bold text-success">All systems normal</p>
                                <p className="text-xs text-text-muted mt-1">No anomalies detected in the last analysis window.</p>
                            </div>
                        ) : (
                            alerts.map((alert, idx) => (
                                <div key={idx} className={`p-4 rounded-2xl border transition-all ${alert.severity === 'CRITICAL' ? 'bg-danger/5 border-danger/20 hover:bg-danger/10' : 'bg-warning/5 border-warning/20 hover:bg-warning/10'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full animate-pulse ${alert.severity === 'CRITICAL' ? 'bg-danger' : 'bg-warning'}`}></span>
                                            <span className="text-xs font-bold uppercase tracking-wider">{alert.type.replace('_', ' ')}</span>
                                        </div>
                                        <span className="text-[10px] text-text-light font-mono">
                                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-text-main">{alert.reason}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* AI Recommendation Engine */}
                <div className="lg:col-span-3 space-y-4">
                    <h3 className="font-bold text-text-main flex items-center gap-2 px-2">
                        <Lightbulb className="text-warning" size={18} />
                        Recommendation Engine
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations.map((rec, idx) => (
                            <div key={idx} className="bg-white border border-border p-5 rounded-2xl hover:border-primary/30 transition-all group">
                                <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded uppercase">{rec.target}</span>
                                <h4 className="font-bold text-text-main mt-2 group-hover:text-primary transition-colors">{rec.action}</h4>
                                <p className="text-sm text-text-muted mt-1 mb-4 leading-relaxed">
                                    {rec.suggestion}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                                    <span className="text-xs font-bold text-success">{rec.impact}</span>
                                    <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
                                        Implement <ArrowRight size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceOptimization;
