import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Lock, Wifi, WifiOff } from 'lucide-react';
import api from '../api/axios';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        const checkHealth = async () => {
            try {
                await api.get('/');
                setIsOnline(true);
            } catch (err) {
                setIsOnline(false);
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-8 py-4 flex justify-between items-center transition-all">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                    <Lock className="text-white" size={20} />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-600 tracking-tight leading-none">PrimeConnect</h1>
                    <div className="flex items-center gap-1.5 mt-1">
                        {isOnline ? (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase">
                                <Wifi size={10} strokeWidth={3} />
                                <span>Network Stable</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-rose-500 uppercase">
                                <WifiOff size={10} strokeWidth={3} />
                                <span>Gateway Offline</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-900 leading-none">{user?.name || 'User'}</p>
                        <p className="text-xs text-slate-500 mt-1">Enterprise Portal</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-slate-100 rounded-full flex items-center justify-center border border-indigo-200">
                        <User size={20} className="text-indigo-600" />
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 font-medium text-sm group border border-transparent hover:border-red-100"
                    title="Sign Out"
                >
                    <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
                    <span className="hidden sm:inline">Sign Out</span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
