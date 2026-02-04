import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthProvider';

import Landing from './pages/Landing';
import AdminDashboard from './pages/admin/Dashboard';
import CitizenDashboard from './pages/citizen/Dashboard';
import AdminIssues from './pages/admin/AdminIssues';
import IssueDetails from './pages/admin/IssueDetails';
import ReportIssue from './pages/citizen/ReportIssue';
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
            <div className="min-h-screen">
                {/* Navigation Bar - Only show when logged in */}
                {user && (
                    <nav className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-border">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between h-16 items-center">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="text-lg sm:text-xl">🏙️</span>
                                    </div>
                                    <span className="text-lg sm:text-xl font-bold text-primary whitespace-nowrap">
                                        Smart City <span className="hidden sm:inline">Platform</span>
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2 sm:space-x-4 text-sm sm:text-base">
                                    {role === 'admin' && (
                                        <>
                                            <a href="/admin" className="text-secondary hover:text-secondary-hover font-medium transition-colors">
                                                Dashboard
                                            </a>
                                            <a href="/admin/issues" className="text-secondary hover:text-secondary-hover font-medium transition-colors">
                                                Issues
                                            </a>
                                        </>
                                    )}
                                    {role === 'citizen' && (
                                        <a href="/dashboard" className="text-secondary hover:text-secondary-hover font-medium transition-colors">
                                            Dashboard
                                        </a>
                                    )}
                                    <LogoutButton />
                                </div>
                            </div>
                        </div>
                    </nav>
                )}

                {/* Main Content Area - No wrapper constraints */}
                <Routes>
                    <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <CitizenDashboard />
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
                    <Route
                        path="/admin/issues"
                        element={
                            <ProtectedRoute>
                                {role === 'admin' ? <AdminIssues /> : <Navigate to="/dashboard" />}
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/issues/:id"
                        element={
                            <ProtectedRoute>
                                {role === 'admin' ? <IssueDetails /> : <Navigate to="/dashboard" />}
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/report/new"
                        element={
                            <ProtectedRoute>
                                <ReportIssue />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
