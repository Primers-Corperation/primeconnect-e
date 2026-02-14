import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWalletBalance } from '../api/wallet';
import { toast } from 'react-toastify';
import { Wallet as WalletIcon, FileText } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const mockChartData = [
    { name: 'Mon', balance: 400 },
    { name: 'Tue', balance: 300 },
    { name: 'Wed', balance: 520 },
    { name: 'Thu', balance: 480 },
    { name: 'Fri', balance: 700 },
    { name: 'Sat', balance: 650 },
    { name: 'Sun', balance: 800 },
];

const Wallet = () => {
    const { user } = useAuth();
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const data = await getWalletBalance(user?._id);
                if (data.status === 'success') {
                    setBalance(data.balance);
                }
            } catch {
                toast.error('Failed to load wallet balance');
            } finally {
                setLoading(false);
            }
        };
        if (user?._id) fetchBalance();
    }, [user]);

    return (
        <div className="space-y-10 animate-fade-in">
            <header className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Finances</h2>
                <p className="text-slate-500 font-medium">Manage your PrimeConnect credits and limits</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Balance Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-indigo-600 via-indigo-700 to-indigo-900 p-10 rounded-[40px] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group min-h-[320px] flex flex-col justify-between">
                        <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform duration-700 group-hover:scale-150 group-hover:rotate-12">
                            <WalletIcon size={160} />
                        </div>

                        <div className="relative z-10 space-y-1">
                            <p className="text-indigo-100/60 font-black uppercase text-[10px] tracking-[0.2em]">Available Balance</p>
                            <h3 className="text-6xl font-black tracking-tighter">
                                {loading ? (
                                    <span className="inline-block w-32 h-14 bg-white/10 animate-pulse rounded-2xl"></span>
                                ) : `$${balance?.toFixed(2) || '0.00'}`}
                            </h3>
                        </div>

                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-xs font-bold border border-white/10">
                                    USD Account
                                </div>
                                <div className="px-4 py-2 bg-indigo-500/30 backdrop-blur-md rounded-xl text-xs font-bold border border-white/10 flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                    Active
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-8 rounded-[32px] border-slate-100 flex items-center gap-6">
                        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                            <FileText size={28} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Billing Policy</p>
                            <p className="text-sm font-semibold text-slate-700">Read-only account view active</p>
                        </div>
                    </div>
                </div>

                {/* Chart Card */}
                <div className="lg:col-span-8">
                    <div className="glass-card rounded-[40px] border-slate-100 h-full p-8 flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Resource Consumption</h3>
                                <p className="text-sm text-slate-500 font-medium">Dynamic credit usage over the last 7 days</p>
                            </div>
                            <div className="flex gap-2">
                                <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-600 outline-none ring-1 ring-slate-200">
                                    <option>Last 7 Days</option>
                                    <option>Last 30 Days</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex-1 w-full min-h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={mockChartData}>
                                    <defs>
                                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="balance"
                                        stroke="#4f46e5"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorBalance)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-[40px] border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Transaction History</h3>
                        <p className="text-sm text-slate-500 font-medium">Detailed statement of operations</p>
                    </div>
                </div>

                <div className="p-20 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 text-slate-300 rounded-full">
                        <FileText size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800">No Statements Generated</h4>
                    <p className="text-slate-500 max-w-sm mx-auto font-medium">
                        Detailed invoices and transaction statements will appear here after your first production activity.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Wallet;
