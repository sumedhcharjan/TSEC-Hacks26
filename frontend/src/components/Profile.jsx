
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";

const Profile = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);

    useEffect(() => {
        // Example fetch to backend
        fetch('http://localhost:5000/api/example')
            .then(res => res.json())
            .then(setData)
            .catch(console.error);
    }, []);

    console.log(user);
    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="flex-shrink-0">
                    {user?.user_metadata?.avatar_url ? (
                        <img
                            src={user.user_metadata.avatar_url}
                            alt="Profile"
                            className="w-24 h-24 rounded-full border-4 border-indigo-50 shadow-md"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="text-center md:text-left flex-1">
                    <h2 className="text-3xl font-bold text-gray-900">
                        {user?.user_metadata?.full_name || 'Hackathon Participant'}
                    </h2>
                    <p className="text-gray-500 font-medium">{user?.email}</p>
                    <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active Session
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Supabase Auth
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Start Building
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Backend Data Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Backend Connection</h3>
                        <div className={`w-3 h-3 rounded-full ${data ? 'bg-green-500' : 'bg-yellow-400 animate-pulse'}`}></div>
                    </div>

                    {data ? (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 font-mono text-sm text-gray-700 overflow-auto max-h-60">
                            <pre>{JSON.stringify(data, null, 2)}</pre>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                            <svg className="w-8 h-8 animate-spin mb-2" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p>Fetching data...</p>
                        </div>
                    )}
                </div>

                {/* User Metadata Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Metadata</h3>
                    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 font-mono text-sm text-green-400 overflow-auto max-h-60 custom-scrollbar">
                        <pre>{JSON.stringify(user, null, 2)}</pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
