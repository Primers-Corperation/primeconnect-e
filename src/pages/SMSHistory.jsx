import { MessageSquareOff } from 'lucide-react';

const SMSHistory = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            <header className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Message Logs</h2>
                <p className="text-slate-500 font-medium">Review your activation history and received payloads</p>
            </header>

            <div className="glass-card rounded-[40px] border-slate-100 overflow-hidden bg-white/50">
                <div className="p-8 border-b border-slate-100 bg-white">
                    <h3 className="text-lg font-bold text-slate-800">Activation History</h3>
                </div>

                <div className="p-24 flex flex-col items-center justify-center text-center">
                    <div className="relative mb-10">
                        <div className="absolute inset-0 bg-indigo-100 rounded-full scale-150 blur-2xl opacity-50"></div>
                        <div className="relative w-24 h-24 bg-white rounded-[32px] shadow-xl border border-slate-100 flex items-center justify-center">
                            <MessageSquareOff size={40} className="text-slate-300" strokeWidth={1.5} />
                        </div>
                    </div>

                    <div className="space-y-2 max-w-sm">
                        <h4 className="text-2xl font-black text-slate-900">No logs detected yet</h4>
                        <p className="text-slate-500 font-medium">
                            The PrimeConnect gateway is ready and waiting for your first activation request.
                        </p>
                    </div>

                    <div className="mt-10 flex gap-4">
                        <button className="btn-primary">Initiate Activation</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-10 rounded-[32px] bg-slate-900 text-white">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-4">Pro Tip</h4>
                    <p className="text-xl font-bold leading-relaxed mb-6">Use webhooks to receive real-time updates for your SMS activations.</p>
                    <button className="text-indigo-400 font-bold flex items-center gap-2 hover:gap-3 transition-all">
                        <span>Setup Webhooks</span>
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                    </button>
                </div>

                <div className="glass-card p-10 rounded-[32px] bg-indigo-600 text-white">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-200 mb-4">Documentation</h4>
                    <p className="text-xl font-bold leading-relaxed mb-6">Learn how to integrate the PrimeConnect SMS API in your application.</p>
                    <button className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl font-bold transition-all">
                        Explore SDKs
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SMSHistory;
