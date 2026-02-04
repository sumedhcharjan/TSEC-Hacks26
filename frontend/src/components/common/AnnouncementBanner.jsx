import React, { useState, useEffect } from 'react';
// Removed heroicons dependency to avoid install errors, using emojis instead
import api from '../../services/api';

const AnnouncementBanner = () => {
    const [announcement, setAnnouncement] = useState(null);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const fetchLatestAnnouncement = async () => {
            try {
                const response = await api.get('/announcements');
                console.log("Fetched announcements:", response.data);
                if (response.data && response.data.length > 0) {
                    // Show the single most recent announcement
                    setAnnouncement(response.data[0]);
                }
            } catch (error) {
                console.error("Failed to fetch announcements", error);
            }
        };

        fetchLatestAnnouncement();
    }, []);

    if (!announcement || !visible) return null;

    const getCategoryStyle = (category) => {
        switch (category) {
            case 'Critical': return 'bg-red-600';
            case 'Utility': return 'bg-yellow-600';
            default: return 'bg-blue-600';
        }
    };

    return (
        <div className={`${getCategoryStyle(announcement.category)} text-white px-4 py-3 shadow-lg mb-4 rounded-lg flex items-center justify-between`}>
            <div className="flex items-center gap-3">
                <span className="text-2xl">📢</span>
                <div>
                    <p className="font-bold text-sm uppercase tracking-wide opacity-90">{announcement.category} Update</p>
                    <p className="font-medium text-lg leading-tight">{announcement.message}</p>
                    <p className="text-xs opacity-75 mt-1">{new Date(announcement.created_at).toLocaleString()}</p>
                </div>
            </div>
            <button
                onClick={() => setVisible(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                title="Dismiss"
            >
                <span className="text-xl font-bold">×</span>
            </button>
        </div>
    );
};

export default AnnouncementBanner;
