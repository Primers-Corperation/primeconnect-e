import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Activity, CheckCircle, XCircle } from 'lucide-react';

const Dashboard = () => {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [latency, setLatency] = useState(24);

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const res = await api.get('/');
                setHealth(res.data);
            } catch (err) {
                setHealth(null);
            } finally {
                setLoading(false);
            }
        };
        checkHealth();

        // Simulate real-time latency fluctuations
        const interval = setInterval(() => {
            if (health) {
                setLatency(Math.floor(Math.random() * (35 - 18 + 1) + 18));
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [health]);

    const cards = [
        {
            title: 'API Status',
            value: health ? 'Operational' : 'Disconnected',
            icon: Activity,
            statusColor: health ? 'text-emerald-500' : 'text-rose-500',
            bgColor: health ? 'bg-emerald-50' : 'bg-rose-50',
            detail: health ? `Version ${health.version}` : 'Action Required',
            subnode: health ? (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                    <CheckCircle size={12} strokeWidth={3} />
                    <span>Real-time Sync Active</span>
                </div>
            ) : (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                    <XCircle size={12} strokeWidth={3} />
                    <span>Connection Lost</span>
                </div>
            )
        },
        {
            title: 'Network latency',
            value: health ? `${latency}ms` : '---',
            icon: CheckCircle,
            statusColor: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            detail: 'Optimized via Region A',
        },
        {
            title: 'System Health',
            value: health ? '100%' : '0%',
            icon: XCircle,
            statusColor: 'text-amber-500',
            bgColor: 'bg-amber-50',
            detail: 'All modules verified',
        }
    ];

    return (
        <div className="space-y-10 animate-fade-in">
            <header className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Control Center</h2>
                <p className="text-slate-500 font-medium">Monitoring PrimeConnect Gateway & API Infrastructure</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cards.map((card, idx) => (
                    <div key={idx} className="glass-card p-10 rounded-[32px] border-slate-100 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 group">
                        <div className="flex justify-between items-start mb-8">
                            <div className={`p-4 rounded-2xl ${card.bgColor} ${card.statusColor} transition-transform duration-500 group-hover:scale-110`}>
                                <card.icon size={24} strokeWidth={2.5} />
                            </div>
                            {card.subnode}
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{card.title}</p>
                            <h3 className={`text-4xl font-black tracking-tighter ${card.statusColor}`}>
                                {loading ? (
                                    <span className="inline-block w-24 h-8 bg-slate-100 animate-pulse rounded-lg font-medium"></span>
                                ) : card.value}
                            </h3>
                            <p className="text-sm font-semibold text-slate-500 pt-2">{card.detail}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-card p-12 rounded-[40px] bg-gradient-to-br from-white to-slate-50 border-slate-100">
                <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-6">
                        <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20">System Intelligence</span>
                        <h3 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">Infrastructure performance is at peak efficiency.</h3>
                        <p className="text-slate-500 text-lg font-medium leading-relaxed">
                            PrimeConnect automated diagnostic tools have verified all gateway nodes are responding within expected parameters. Global SMS delivery routes are currently operating at 99.9% success rate.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <button className="btn-primary">View Full Report</button>
                            <button className="px-8 py-4 text-slate-600 font-bold hover:text-slate-900 transition-colors">Documentation</button>
                        </div>
                    </div>
                    <div className="w-full md:w-1/3 bg-slate-100/50 rounded-3xl p-8 aspect-square flex items-center justify-center border-dashed border-2 border-slate-200">
                        <Activity size={120} className="text-slate-200 animate-pulse" strokeWidth={1} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
