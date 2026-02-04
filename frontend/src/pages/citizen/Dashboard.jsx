import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthProvider";
import { Link } from "react-router-dom";
import AnnouncementsFeed from "../../components/citizen/AnnouncementsFeed";

const CitizenDashboard = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/citizen/user/${user.id}`);
                setReports(response.data);
            } catch (error) {
                console.error('Failed to fetch reports:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchReports();
        }
    }, [user]);

    const getStatusColor = (status) => {
        const statusUpper = status?.toUpperCase();
        if (statusUpper === 'RESOLVED') return 'bg-success-light text-success border-success/20';
        if (statusUpper === 'IN_PROGRESS') return 'bg-warning-light text-warning border-warning/20';
        return 'bg-accent text-secondary border-secondary/20';
    };

    const getCategoryIcon = (category) => {
        if (category?.includes('Road')) return '🛣️';
        if (category?.includes('Water')) return '💧';
        if (category?.includes('Garbage')) return '🗑️';
        if (category?.includes('Streetlight')) return '💡';
        return '⚠️';
    };

    return (
        <div className="min-h-screen bg-surface">
            {/* Header */}
            <div className="bg-primary text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold">Welcome, {user?.email?.split('@')[0]}</h1>
                    <p className="mt-2 text-white/80">Track your reported issues and their resolution status</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Top Section: Action Bar & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Action Bar (Spans full width on mobile, 2 cols on large) */}
                    <div className="lg:col-span-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl p-6 shadow-sm border border-border">
                        <div>
                            <h2 className="text-xl font-semibold text-text-main">Your Dashboard</h2>
                            <p className="text-sm text-text-muted mt-1">Manage and track your infrastructure reports</p>
                        </div>
                        <Link
                            to="/report/new"
                            className="bg-secondary hover:bg-secondary-hover text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            <span className="text-lg">+</span>
                            Report New Issue
                        </Link>
                    </div>

                    {/* Community Stats Card */}
                    <div className="bg-gradient-to-br from-secondary to-primary text-white rounded-xl p-6 shadow-md flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/80">Community Impact</p>
                            <p className="text-3xl font-bold mt-2">Top 10%</p>
                            <p className="text-xs text-white/70 mt-1">Active Contributor</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🏆</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid: Announcements & Reports */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Announcements Feed */}
                    <AnnouncementsFeed />

                    {/* Right Column: Reports List (Spans 2 cols) */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-border flex flex-col">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-lg font-semibold text-text-main">Your Recent Reports</h2>
                            <div className="flex gap-4 text-sm text-text-muted">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-success"></span> Resolved
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-warning"></span> In Progress
                                </span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 border-4 border-accent border-t-secondary rounded-full animate-spin"></div>
                                    <p className="text-text-muted">Loading your reports...</p>
                                </div>
                            </div>
                        ) : reports.length > 0 ? (
                            <div className="divide-y divide-border">
                                {reports.map((report) => (
                                    <div key={report.id} className="p-6 hover:bg-surface transition-colors">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center text-2xl flex-shrink-0">
                                                    {getCategoryIcon(report.category)}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-text-main">{report.category || 'Unknown Issue'}</h3>
                                                    <p className="text-sm text-text-muted mt-1 line-clamp-1">
                                                        {report.description?.substring(0, 100)}...
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-text-light">
                                                        <span>📍 {report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}</span>
                                                        <span>•</span>
                                                        <span>{new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(report.status)}`}>
                                                {report.status?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">📝</span>
                                </div>
                                <p className="text-text-muted mb-4">You haven't reported any issues yet</p>
                                <Link to="/report/new" className="text-secondary hover:text-secondary-hover font-medium">
                                    Report your first issue →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CitizenDashboard;
