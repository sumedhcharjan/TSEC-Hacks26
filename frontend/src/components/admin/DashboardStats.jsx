import React from 'react';

const StatCard = ({ title, value, subtext, color, icon }) => {
    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg hover:border-gray-600 transition-colors">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</p>
                    <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
                    {subtext && <p className="text-gray-500 text-xs mt-2">{subtext}</p>}
                </div>
                <div className={`p-3 rounded-lg bg-opacity-10 ${color.bg}`}>
                    <span className={`text-xl ${color.text}`}>{icon}</span>
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
