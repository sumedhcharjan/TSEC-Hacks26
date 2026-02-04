
import React from 'react';
import LoginButton from '../components/LoginButton';

const Landing = () => {
    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 min-h-[80vh] py-12 animate-fadeIn">
            {/* Left Side: Hero Text */}
            <div className="flex-1 text-center md:text-left space-y-6 max-w-2xl">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-text-main leading-tight">
                    Build faster for <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                        Global Hacks
                    </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600">
                    The ultimate boilerplate for your next hackathon project.
                    Authentication, API routes, and UI pre-configured.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                    <div className="flex items-center space-x-2 text-sm text-text-muted">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-success/20 text-success">
                            ✓
                        </span>
                        <span>React + Vite</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-text-muted">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary">
                            ✓
                        </span>
                        <span>Supabase Auth</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-600">
                            ✓
                        </span>
                        <span>Tailwind CSS</span>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex-1 flex justify-center w-full max-w-md transform hover:scale-105 transition-transform duration-300">
                <LoginButton />
            </div>
        </div>
    );
}

export default Landing;
