import React from 'react';

const StatCard = ({ title, value, subtext, color, icon }) => {
    return (
        <div className="civic-card p-8 group hover:-translate-y-1 shadow-xl shadow-primary/5">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">{title}</p>
                    <h3 className="text-4xl font-black text-primary tracking-tight group-hover:text-action transition-colors leading-none">{value}</h3>
                    {subtext && (
                        <div className="mt-4 flex items-center">
                            <span className="text-[9px] font-black text-text-muted bg-gray-50 border border-border-subtle px-2 py-1 rounded-lg uppercase tracking-wider">{subtext}</span>
                        </div>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-accent-soft shrink-0 ml-4`}>
                    <span>{icon}</span>
                </div>
            </div>
        </div>
    );
};

const DashboardStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
                title="Active Hazards"
                value={stats.active || 0}
                subtext="Currently reported issues"
                color={{ bg: 'bg-blue-500', text: 'text-blue-500' }}
                icon="⚡"
            />
            <StatCard
                title="Critical Alerts"
                value={stats.critical || 0}
                subtext="Severity > 70%"
                color={{ bg: 'bg-red-500', text: 'text-red-500' }}
                icon="🚨"
            />
            <StatCard
                title="Pending Review"
                value={stats.pending || 0}
                subtext="Awaiting validation"
                color={{ bg: 'bg-orange-500', text: 'text-orange-500' }}
                icon="⏳"
            />
            <StatCard
                title="Resolved Today"
                value={stats.resolvedToday || 0}
                subtext="Issues fixed in last 24h"
                color={{ bg: 'bg-green-500', text: 'text-green-500' }}
                icon="✅"
            />
        </div>
    );
};

export default DashboardStats;
