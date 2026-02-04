import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminIssues = () => {
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const response = await api.get('/admin/reports');
                setIssues(response.data);
            } catch (error) {
                console.error('Error fetching issues:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchIssues();
    }, []);

    const handleExport = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Infrastructure Ledger Report", 14, 22);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Official Document | Generated: ${new Date().toLocaleString()}`, 14, 30);

        const tableColumn = ["ID", "Category", "Geospatial", "Risk", "Status", "Date"];
        const tableRows = [];

        issues.forEach(issue => {
            const issueData = [
                issue.id.slice(0, 8),
                issue.category,
                `${issue.latitude?.toFixed(4)}, ${issue.longitude?.toFixed(4)}`,
                `${issue.risk_score}%`,
                issue.status.toUpperCase(),
                new Date(issue.created_at).toLocaleDateString()
            ];
            tableRows.push(issueData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [10, 37, 64], textColor: [255, 255, 255] },
            styles: { fontSize: 8, font: 'helvetica' }
        });

        doc.save(`civic_ledger_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const getSeverityStyles = (score) => {
        if (score >= 80) return 'bg-red-50 text-red-600 border-red-100';
        if (score >= 50) return 'bg-orange-50 text-orange-600 border-orange-100';
        return 'bg-blue-50 text-action border-blue-100';
    };

    const getStatusStyles = (status) => {
        const s = status?.toUpperCase();
        if (s === 'RESOLVED') return 'bg-status-success/10 text-status-success border-status-success/20';
        if (s === 'IN_PROGRESS' || s === 'REVIEW') return 'bg-status-warning/10 text-status-warning border-status-warning/20';
        return 'bg-accent-soft text-action border-action/20';
    };

    if (loading) return (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-accent-soft border-t-action rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Synchronizing Ledger...</p>
        </div>
    );

    return (
        <div className="min-h-screen pb-20">
            {/* Professional Sub-Header */}
            <div className="bg-white border-b border-border-subtle mb-12">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div>
                            <div className="flex items-center gap-2 text-action font-black text-[10px] uppercase tracking-[0.2em] mb-3">
                                <span className="w-2 h-2 rounded-full bg-action animate-pulse"></span>
                                Data Archive
                            </div>
                            <h1 className="text-4xl font-black text-primary tracking-tight">
                                Infrastructure <span className="text-action">Ledger</span>
                            </h1>
                            <p className="text-text-muted font-bold mt-2 uppercase text-[9px] tracking-[0.2em] opacity-80">
                                Audit and oversight of all registered city incidents
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleExport}
                                className="bg-white text-primary border border-border-subtle px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-sm hover:bg-gray-50 transition-all flex items-center gap-3 active:scale-95"
                            >
                                <span>📄</span> Export Tactical Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="civic-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50/50 border-b border-border-subtle">
                                <tr>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Descriptor</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Geospatial</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Security Tier</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Response Status</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Timestamp</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">Protocol</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                {issues.map((issue) => (
                                    <tr key={issue.id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">
                                                    {issue.category?.includes('Road') ? '🛣️' :
                                                        issue.category?.includes('Water') ? '💧' :
                                                            issue.category?.includes('Light') ? '💡' : '📑'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-primary tracking-tight group-hover:text-action transition-colors">{issue.category}</div>
                                                    <div className="text-[10px] font-bold text-text-muted">
                                                        Ref: {issue.id.slice(0, 8)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-[11px] font-mono font-bold text-primary opacity-80">{issue.latitude?.toFixed(4)}, {issue.longitude?.toFixed(4)}</div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-widest shadow-sm ${getSeverityStyles(issue.risk_score)}`}>
                                                Score: {issue.risk_score}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-widest shadow-sm ${getStatusStyles(issue.status)}`}>
                                                {issue.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-[11px] font-bold text-text-muted">
                                            {new Date(issue.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => navigate(`/admin/issues/${issue.id}`)}
                                                className="text-action font-black text-[10px] uppercase tracking-widest border-b-2 border-transparent hover:border-action transition-all"
                                            >
                                                View Report
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminIssues;
