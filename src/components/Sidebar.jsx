import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, MessageSquare, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const navItems = [
        { to: '/', label: 'Control Center', icon: LayoutDashboard },
        { to: '/wallet', label: 'Wallet Metrics', icon: Wallet },
        { to: '/sms', label: 'Message Logs', icon: MessageSquare },
    ];

    return (
        <aside className={`
            fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200/60 transition-transform duration-300 transform 
            md:relative md:translate-x-0 md:block 
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
            <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between md:hidden mb-12">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Main Menu</p>
                    <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <p className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 ml-4">Main Menu</p>

                <div className="space-y-2 flex-1">

                    {navItems.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={onClose}
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

                <div className="mt-auto px-2">
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-4 text-white shadow-xl shadow-indigo-200">
                        <p className="text-xs font-bold opacity-80 uppercase tracking-wider mb-1">Status</p>
                        <p className="text-sm font-semibold mb-3">Enterprise Access</p>
                        <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-white w-3/4 h-full rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
