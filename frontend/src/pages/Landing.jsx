import React from 'react';
import LoginButton from '../components/LoginButton';

const Landing = () => {
    return (
        <div className="min-h-screen">
            {/* Minimal Header */}
            <nav className="bg-white border-b border-border-subtle sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center space-x-4">
                            <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                                <span className="text-2xl">🏙️</span>
                            </div>
                            <div>
                                <span className="text-xl font-black text-primary tracking-tight">InfraLink</span>
                                <span className="block text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] -mt-1">City Infrastructure</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-32">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    {/* Left: Content */}
                    <div className="space-y-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-soft rounded-full border border-action/10">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-action opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-action"></span>
                            </span>
                            <span className="text-[11px] font-black text-action uppercase tracking-widest font-sans">Public Sector Initiative</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-primary tracking-tight leading-[1.05]">
                            Smart Urban <br />
                            <span className="text-action">Infrastructure</span> <br />
                            Management.
                        </h1>

                        <p className="text-xl text-text-muted leading-relaxed font-medium max-w-xl">
                            A predictive, data-driven platform designed to optimize municipal maintenance and empower citizens to build resilient communities together.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 pt-4">
                            <button className="bg-action text-white px-10 py-5 rounded-2xl font-bold tracking-tight shadow-xl shadow-action/20 hover:bg-action/90 hover:-translate-y-1 transition-all">
                                Report Infrastructure Issue
                            </button>
                            <button className="bg-white text-text-primary px-10 py-5 rounded-2xl font-bold tracking-tight border border-border-subtle hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                View Public Dashboard
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex items-center gap-10 pt-12 border-t border-border-subtle opacity-50">
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-primary tracking-tight">4.8k</span>
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Reports Solved</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-primary tracking-tight">12s</span>
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Response Time</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-primary tracking-tight">100%</span>
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Transparency</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Modern Login Card */}
                    <div className="relative">
                        <div className="absolute -inset-4 bg-action/5 rounded-[40px] blur-2xl"></div>
                        <div className="relative bg-white civic-card p-10 max-w-md mx-auto">
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 bg-accent-soft rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <span className="text-3xl">🔐</span>
                                </div>
                                <h2 className="text-2xl font-black text-primary tracking-tight">Command Login</h2>
                                <p className="text-sm text-text-muted font-medium mt-2">Access your personalized portal</p>
                            </div>

                            <div className="space-y-6">
                                <LoginButton />
                            </div>

                            <div className="mt-10 pt-8 border-t border-border-subtle text-center">
                                <p className="text-[11px] text-text-muted font-medium leading-relaxed">
                                    Authorized personnel and registered citizens only. <br />
                                    Compliant with Urban Security Standards &copy; 2026
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-32">
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { title: 'Predictive Analysis', desc: 'AI-driven system to identify infrastructure risks before they escalate.', icon: '📊' },
                        { title: 'Citizen Voice', desc: 'Direct communication channel between urban dwellers and city planners.', icon: '🗣️' },
                        { title: 'Resource Efficiency', desc: 'Optimize budget allocation based on real-world ground intelligence.', icon: '🛠️' }
                    ].map((feature, i) => (
                        <div key={i} className="bg-white/50 backdrop-blur-sm p-8 rounded-[30px] border border-border-subtle hover:border-action/20 hover:bg-white transition-all group">
                            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">{feature.icon}</div>
                            <h3 className="text-lg font-black text-primary mb-2 tracking-tight">{feature.title}</h3>
                            <p className="text-sm text-text-muted leading-relaxed font-medium">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Landing;
