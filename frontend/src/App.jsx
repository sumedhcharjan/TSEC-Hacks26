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
            <div className="min-h-screen bg-background text-text-main font-sans">
                {/* Navigation Bar */}
                <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                                    HackGlobal
                                </span>
                            </div>
                            <div>
                                {user && (
                                    <div className="flex items-center space-x-4">
                                        {role === 'admin' && (
                                            <>
                                                <a href="/admin" className="text-primary hover:text-primary-hover font-medium">
                                                    Admin Dashboard
                                                </a>
                                                <a href="/admin/issues" className="text-primary hover:text-primary-hover font-medium">
                                                    Issues
                                                </a>
                                            </>
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
                </main>
            </div>
        </Router>
    );
}

export default App;
