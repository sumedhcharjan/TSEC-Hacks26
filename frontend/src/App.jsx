import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthProvider';

import Landing from './pages/Landing';
import AdminDashboard from './pages/admin/Dashboard';
import CitizenDashboard from './pages/citizen/Dashboard';
import ContractorDashboard from './pages/contractor/Dashboard';
import AdminIssues from './pages/admin/AdminIssues';
import IssueDetails from './pages/admin/IssueDetails';
import ResourceOptimization from './pages/admin/ResourceOptimization';
import ReportIssue from './pages/citizen/ReportIssue';
import EmergencyRoutes from './pages/admin/EmergencyRoutes';
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
            <div className="min-h-screen relative overflow-x-hidden">
                {/* Global Civic Grid Background */}
                <div className="civic-grid" />

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
                                        InfraLink
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2 sm:space-x-4 text-sm sm:text-base">
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
                                            Dashboard
                                        </Link>
                                    )}
                                    {role === 'contractor' && (
                                        <Link to="/contractor" className="text-secondary hover:text-secondary-hover font-medium transition-colors">
                                            Job Board
                                        </Link>
                                    )}
                                    <LogoutButton />
                                </div>
                            </div>
                        </div>
                    </nav>
                )}

                {/* Main Content Area */}
                <Routes>
                    <Route
                        path="/"
                        element={
                            user ? (
                                !role ? <Navigate to="/dashboard" /> :
                                    role === 'admin' ? <Navigate to="/admin" /> :
                                        role === 'contractor' ? <Navigate to="/contractor" /> :
                                            <Navigate to="/dashboard" />
                            ) : <Landing />
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                {!role ? <div className="p-20 text-center">Loading Profile...</div> :
                                    role === 'citizen' ? <CitizenDashboard /> :
                                        role === 'admin' ? <Navigate to="/admin" /> :
                                            <Navigate to="/contractor" />}
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
                        path="/admin/emergency-routes"
                        element={
                            <ProtectedRoute>
                                {role === 'admin' ? <EmergencyRoutes /> : <Navigate to="/dashboard" />}
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
                    <Route
                        path="/contractor"
                        element={
                            <ProtectedRoute>
                                {role === 'contractor' ? <ContractorDashboard /> :
                                    !role ? <div className="p-20 text-center">Identifying Role...</div> :
                                        <Navigate to="/" />}
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
