import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthProvider';

import Landing from './pages/Landing';
import AdminDashboard from './pages/admin/Dashboard';
import CitizenDashboard from './pages/citizen/Dashboard';
import AdminIssues from './pages/admin/AdminIssues';
import IssueDetails from './pages/admin/IssueDetails';
import ResourceOptimization from './pages/admin/ResourceOptimization';
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
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                        <span className="text-xl">🏙️</span>
                                    </div>
                                    <span className="text-xl font-bold text-primary">
                                        Smart City Platform
                                    </span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    {role === 'admin' && (
                                        <>
                                            <Link to="/admin" className="text-secondary hover:text-secondary-hover font-medium transition-colors">
                                                Dashboard
                                            </Link>
                                            <Link to="/admin/issues" className="text-secondary hover:text-secondary-hover font-medium transition-colors">
                                                Issues
                                            </Link>
                                            <Link to="/admin/optimization" className="text-secondary hover:text-secondary-hover font-medium transition-colors">
                                                Optimization
                                            </Link>
                                        </>
                                    )}
                                    {role === 'citizen' && (
                                        <Link to="/dashboard" className="text-secondary hover:text-secondary-hover font-medium transition-colors">
                                            My Dashboard
                                        </Link>
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
                        path="/admin/optimization"
                        element={
                            <ProtectedRoute>
                                {role === 'admin' ? <ResourceOptimization /> : <Navigate to="/dashboard" />}
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
