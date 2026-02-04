import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthProvider";
import { Link } from "react-router-dom";

const CitizenDashboard = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch real reports from backend
        const fetchReports = async () => {
            try {
                setLoading(true);
                // Use user-specific endpoint for better performance
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
        switch (status) {
            case 'Resolved': return 'bg-success/20 text-success';
            case 'Pending': return 'bg-accent/20 text-accent';
            default: return 'bg-secondary/20 text-secondary';
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* 1. Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-main">
                        Hello, {user?.user_metadata?.full_name?.split(' ')[0] || 'Citizen'}!
                    </h1>
                    <p className="text-text-muted mt-1">
                        Let's make our city better, one report at a time.
                    </p>
                </div>
                <Link
                    to="/report/new"
                    className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105 hover:shadow-xl flex items-center gap-2"
                >
                    <span>+</span> Report Issue
                </Link>
            </div>

            {/* 2. Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-surface p-6 rounded-xl shadow-sm border border-secondary/10 hover:shadow-md transition-shadow">
                    <p className="text-sm text-text-muted font-medium">Total Reports</p>
                    <p className="text-3xl font-bold text-primary mt-1">{reports.length}</p>
                </div>
                <div className="bg-surface p-6 rounded-xl shadow-sm border border-secondary/10 hover:shadow-md transition-shadow">
                    <p className="text-sm text-text-muted font-medium">Resolved</p>
                    <p className="text-3xl font-bold text-success mt-1">
                        {reports.filter(r => r.status?.toUpperCase() === 'RESOLVED').length}
                    </p>
                </div>
                {/* Gamification Badge */}
                <div className="bg-gradient-to-br from-primary to-secondary p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-white md:col-span-1 col-span-2">
                    <p className="text-xs font-medium opacity-80 uppercase tracking-wider">Impact Score</p>
                    <div className="flex items-end gap-2 mt-1">
                        <p className="text-3xl font-bold">Top 10%</p>
                        <p className="text-sm opacity-80 mb-1">Citizen</p>
                    </div>
                </div>
            </div>

            {/* 3. Recent Activity List */}
            <div className="bg-surface rounded-2xl shadow-sm border border-secondary/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-secondary/10 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-text-main">Your Recent Reports</h2>
                    <button className="text-sm text-primary hover:text-primary-hover font-medium">View All</button>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                            <p className="text-text-muted">Loading your activity...</p>
                        </div>
                    </div>
                ) : reports.length > 0 ? (
                    <div className="divide-y divide-secondary/10">
                        {reports.map((report) => (
                            <div key={report.id} className="p-6 hover:bg-background transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
                                <div className="flex items-start gap-4">
                                    {/* Icon Placeholder */}
                                    <div className="w-12 h-12 rounded-lg bg-background group-hover:scale-110 transition-transform flex items-center justify-center text-2xl shadow-sm">
                                        {report.category?.includes('Road') ? '🛣️' :
                                            report.category?.includes('Water') ? '💧' :
                                                report.category?.includes('Garbage') ? '🗑️' :
                                                    report.category?.includes('Streetlight') ? '💡' : '⚠️'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-text-main">{report.category || 'Unknown Issue'}</p>
                                        <p className="text-sm text-text-muted mt-1">{report.description?.substring(0, 50)}...</p>
                                        <p className="text-xs text-text-muted mt-1">
                                            {new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>

                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                    {report.status}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <p className="text-text-muted">You haven't reported any issues yet.</p>
                        <Link to="/report/new" className="text-primary hover:underline mt-2 inline-block">Start now</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CitizenDashboard;
