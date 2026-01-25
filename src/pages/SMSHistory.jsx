import { useState } from 'react';
import { MessageSquareOff, Send, Smartphone, MessageSquare, ShieldCheck, Clock } from 'lucide-react';
import { sendSms } from '../api/sms';
import { toast } from 'react-toastify';

const SMSHistory = () => {
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);

    const handleSend = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!/^234\d{9}$/.test(phone)) {
            toast.error('Invalid format. Use 234 followed by 9 digits (e.g. 2348012345678)');
            return;
        }

        setLoading(true);
        try {
            const data = await sendSms(phone, message);
            if (data.success) {
                toast.success(`Message sent successfully!`);

                // Add to session history
                const newEntry = {
                    id: data.messageId || Math.random().toString(36).substr(2, 9),
                    phone,
                    message: message.length > 40 ? message.substring(0, 40) + '...' : message,
                    time: new Date().toLocaleTimeString(),
                    status: 'Delivered'
                };
                setHistory([newEntry, ...history]);

                setPhone('');
                setMessage('');
            } else {
                toast.error(data.error || 'Failed to send SMS');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Server error while sending SMS');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            <header className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Messaging Hub</h2>
                <p className="text-slate-500 font-medium">Broadcast messages via PrimeConnect Gateway</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Send SMS Card */}
                <div className="lg:col-span-12 xl:col-span-5">
                    <div className="glass-card p-10 rounded-[40px] border-indigo-100 bg-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            <Send size={120} className="rotate-12" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Send New SMS</h3>
                            <p className="text-sm text-slate-500 font-medium mb-8">Direct Termii integration with real-time status.</p>

                            <form onSubmit={handleSend} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Recipient Number</label>
                                    <div className="relative group">
                                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                        <input
                                            type="text"
                                            required
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all font-bold placeholder:font-medium"
                                            placeholder="2348012345678"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold ml-1 italic">Must start with 234 country code</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Message Content</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                            <MessageSquare size={20} />
                                        </div>
                                        <textarea
                                            required
                                            rows="4"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all font-medium resize-none"
                                            placeholder="Enter your message here..."
                                            maxLength="160"
                                        />
                                        <div className="absolute bottom-4 right-4 text-[10px] font-black text-slate-300">
                                            {message.length}/160
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn-primary !py-4 flex items-center justify-center gap-3 group"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span className="font-bold uppercase tracking-wider text-xs">Dispatch Message</span>
                                            <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* History/Info side */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-8">
                    <div className="glass-card rounded-[40px] border-slate-100 overflow-hidden bg-white/50 h-full flex flex-col">
                        <div className="p-8 border-b border-slate-100 bg-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Dispatch History</h3>
                                <p className="text-xs text-slate-500 font-medium">Monitoring your outbound traffic</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <ShieldCheck size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {history.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {history.map((item) => (
                                        <div key={item.id} className="p-6 hover:bg-slate-50/80 transition-colors flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    <MessageSquare size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 leading-tight">+{item.phone}</p>
                                                    <p className="text-xs text-slate-500 font-medium mt-1">{item.message}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1.5 justify-end text-[10px] font-black uppercase text-emerald-500 tracking-wider">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                                    <span>{item.status}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{item.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 h-full flex flex-col items-center justify-center text-center">
                                    <div className="relative mb-8">
                                        <div className="absolute inset-0 bg-indigo-100 rounded-full scale-150 blur-3xl opacity-30"></div>
                                        <div className="relative w-20 h-20 bg-white rounded-[28px] shadow-xl border border-slate-100 flex items-center justify-center">
                                            <MessageSquareOff size={32} className="text-slate-300" strokeWidth={1.5} />
                                        </div>
                                    </div>

                                    <div className="space-y-2 max-w-sm">
                                        <h4 className="text-xl font-bold text-slate-900">Queue is empty</h4>
                                        <p className="text-sm text-slate-500 font-medium">
                                            Outgoing messages will appear here once dispatched.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-slate-50/50 border-t border-slate-100 grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm">
                                    <ShieldCheck size={16} className="text-emerald-500" />
                                </div>
                                <div className="text-[10px]">
                                    <p className="font-black text-slate-400 uppercase tracking-tighter">Gateway</p>
                                    <p className="font-bold text-slate-700">Secured Layer</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm">
                                    <Clock size={16} className="text-indigo-500" />
                                </div>
                                <div className="text-[10px]">
                                    <p className="font-black text-slate-400 uppercase tracking-tighter">Speed</p>
                                    <p className="font-bold text-slate-700">~2ms Latency</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SMSHistory;
