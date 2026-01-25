import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, MessageSquare } from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { to: '/', label: 'Control Center', icon: LayoutDashboard },
        { to: '/wallet', label: 'Wallet Metrics', icon: Wallet },
        { to: '/sms', label: 'Message Logs', icon: MessageSquare },
    ];

    return (
        <aside className="w-72 bg-white border-r border-slate-200/60 hidden md:block transition-all">
            <div className="p-6 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-4">Main Menu</p>
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[14px] font-semibold transition-all duration-300 group ${isActive
                                ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'}`}>
                                    <Icon size={18} strokeWidth={2.5} />
                                </div>
                                <span>{label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>

            <div className="absolute bottom-10 left-0 w-full px-6">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-4 text-white shadow-xl shadow-indigo-200">
                    <p className="text-xs font-bold opacity-80 uppercase tracking-wider mb-1">Status</p>
                    <p className="text-sm font-semibold mb-3">Enterprise Access</p>
                    <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-white w-3/4 h-full rounded-full"></div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
