import React from 'react';
import LoginButton from '../components/LoginButton';

const Landing = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-secondary">
            {/* Navigation Bar */}
            <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                <span className="text-2xl">🏙️</span>
                            </div>
                            <span className="text-white font-semibold text-lg">Smart City Platform</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Content */}
                    <div className="text-white space-y-6">
                        <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-2">
                            Powered by AI & Citizen Collaboration
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                            Smart Urban Infrastructure Platform
                        </h1>

                        <p className="text-xl text-white/90 leading-relaxed">
                            A predictive and citizen-driven approach to managing city infrastructure.
                            Report issues, track progress, and help build a better community.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button className="bg-white text-primary px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                                Report an Issue
                            </button>
                            <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold border-2 border-white/30 hover:bg-white/20 transition-all">
                                Learn More
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                            <div>
                                <div className="text-3xl font-bold">2.5K+</div>
                                <div className="text-white/70 text-sm">Issues Resolved</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold">1.2K+</div>
                                <div className="text-white/70 text-sm">Active Citizens</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold">98%</div>
                                <div className="text-white/70 text-sm">Satisfaction Rate</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Login Card */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-text-main mb-2">Welcome Back</h2>
                                <p className="text-text-muted">Sign in to access your dashboard</p>
                            </div>
                            <LoginButton />
                            <div className="mt-6 pt-6 border-t border-border">
                                <p className="text-sm text-text-muted text-center">
                                    By signing in, you agree to our Terms of Service and Privacy Policy
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-2xl">⚡</span>
                        </div>
                        <h3 className="text-white font-semibold text-lg mb-2">Real-Time Tracking</h3>
                        <p className="text-white/70">Monitor issue status and resolution progress in real-time</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-2xl">🤖</span>
                        </div>
                        <h3 className="text-white font-semibold text-lg mb-2">AI-Powered Priority</h3>
                        <p className="text-white/70">Intelligent risk scoring for efficient resource allocation</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-2xl">👥</span>
                        </div>
                        <h3 className="text-white font-semibold text-lg mb-2">Citizen Engagement</h3>
                        <p className="text-white/70">Empower communities to actively participate in city development</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
