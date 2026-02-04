import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AnnouncementsFeed = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await api.get('/announcements');
                setAnnouncements(response.data);
            } catch (error) {
                console.error("Failed to fetch announcements", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    const getCategoryStyles = (category) => {
        switch (category) {
            case 'Critical': return 'border-red-500 bg-red-50 text-red-700';
            case 'Utility': return 'border-yellow-500 bg-yellow-50 text-yellow-700';
            case 'Event': return 'border-purple-500 bg-purple-50 text-purple-700';
            default: return 'border-blue-500 bg-blue-50 text-blue-700';
        }
    };

    const getIcon = (category) => {
        switch (category) {
            case 'Critical': return '🚨';
            case 'Utility': return '🔧';
            case 'Event': return '🎉';
            default: return '📢';
        }
    };

    if (loading) return <div className="p-4 text-center text-gray-400">Loading announcements...</div>;
    if (announcements.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden col-span-1 md:col-span-3 lg:col-span-1">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <span>📢</span> Official Announcements
                </h3>
                <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                    {announcements.length} Updates
                </span>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-4 space-y-3">
                {announcements.map((announcement) => (
                    <div
                        key={announcement.id}
                        className={`p-4 rounded-lg border-l-4 ${getCategoryStyles(announcement.category)} shadow-sm transition-all hover:shadow-md`}
                    >
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-sm tracking-wide uppercase flex items-center gap-2 opacity-90">
                                {getIcon(announcement.category)} {announcement.category}
                            </h4>
                            <span className="text-[10px] font-mono opacity-70">
                                {new Date(announcement.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <h5 className="font-bold text-lg mt-1 leading-tight">{announcement.title}</h5>
                        <p className="text-sm mt-2 opacity-90 leading-relaxed whitespace-pre-line">
                            {announcement.message}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AnnouncementsFeed;
