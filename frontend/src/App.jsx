
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthProvider';

import Landing from './pages/Landing';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './components/Profile';
import LogoutButton from './components/LogoutButton';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/" />;
    return children;
};

function App() {
    const { user, role } = useAuth();

    return (
        <Router>
            <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
                {/* Navigation Bar */}
                <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                                    HackGlobal
                                </span>
                            </div>
                            <div>
                                {user && (
                                    <div className="flex items-center space-x-4">
                                        {role === 'admin' && (
                                            <a href="/admin" className="text-indigo-600 hover:text-indigo-900 font-medium">
                                                Admin Dashboard
                                            </a>
                                        )}
                                        <LogoutButton />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content Area */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Routes>
                        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute>
                                    {role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />}
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
