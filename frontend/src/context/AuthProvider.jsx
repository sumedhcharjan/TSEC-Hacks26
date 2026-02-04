
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [role, setRole] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProfile = async (currentUser) => {
            if (!currentUser) {
                setRole(null);
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', currentUser.id)
                    .single();

                if (error) {
                    console.error('Error fetching profile:', error);
                    // Fallback to metadata if profile fetch fails
                    setRole(currentUser.user_metadata?.role || 'citizen');
                } else if (data && data.role) {
                    setRole(data.role);
                } else {
                    // No profile data found
                    setRole(currentUser.user_metadata?.role || 'citizen');
                }
            } catch (err) {
                console.error('Auth Profile error:', err);
                setRole('citizen');
            } finally {
                setLoading(false);
            }
        };

        // Check active sessions
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            fetchProfile(currentUser);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            fetchProfile(currentUser);
        });

        return () => subscription.unsubscribe();
    }, []);

    const value = {
        session,
        user,
        role,
        signOut: () => supabase.auth.signOut(),
    }

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl">🏙️</span>
                        </div>
                    </div>
                    <p className="mt-4 text-sm font-bold text-primary animate-pulse tracking-widest uppercase">Initializing Smart City...</p>
                </div>
            ) : children}
        </AuthContext.Provider>
    )
}

export default AuthProvider
