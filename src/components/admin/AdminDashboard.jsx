import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import { redirectToSupport } from '../../utils/support';

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chartMode, setChartMode] = useState('weekly'); // 'weekly' or 'monthly'
    const [activePoint, setActivePoint] = useState(null);

    // Mock trend details for sparklines
    const sparklines = {
        revenue: "M 0,25 Q 15,5 30,20 T 60,10 T 90,30 T 120,5",
        orders: "M 0,20 Q 15,35 30,10 T 60,25 T 90,15 T 120,30",
        materials: "M 0,30 Q 15,20 30,25 T 60,15 T 90,10 T 120,8",
        customers: "M 0,35 Q 15,30 30,20 T 60,18 T 90,12 T 120,5"
    };

    // Chart mock dataset with coordinates for SVG rendering
    const chartData = {
        weekly: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            values: [24000, 32000, 18000, 45000, 38000, 52000, 49000],
            path: "M 50,220 L 150,180 L 250,240 L 350,120 L 450,150 L 550,80 L 650,90",
            fillPath: "M 50,220 L 150,180 L 250,240 L 350,120 L 450,150 L 550,80 L 650,90 L 650,280 L 50,280 Z",
            points: [
                { cx: 50, cy: 220, val: "₹24,000" },
                { cx: 150, cy: 180, val: "₹32,000" },
                { cx: 250, cy: 240, val: "₹18,000" },
                { cx: 350, cy: 120, val: "₹45,000" },
                { cx: 450, cy: 150, val: "₹38,000" },
                { cx: 550, cy: 80, val: "₹52,000" },
                { cx: 650, cy: 90, val: "₹49,000" }
            ]
        },
        monthly: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            values: [120000, 150000, 140000, 210000, 185000, 245000, 260000],
            path: "M 50,230 L 150,200 L 250,210 L 350,140 L 450,165 L 550,110 L 650,95",
            fillPath: "M 50,230 L 150,200 L 250,210 L 350,140 L 450,165 L 550,110 L 650,95 L 650,280 L 50,280 Z",
            points: [
                { cx: 50, cy: 230, val: "₹1.20L" },
                { cx: 150, cy: 200, val: "₹1.50L" },
                { cx: 250, cy: 210, val: "₹1.40L" },
                { cx: 350, cy: 140, val: "₹2.10L" },
                { cx: 450, cy: 165, val: "₹1.85L" },
                { cx: 550, cy: 110, val: "₹2.45L" },
                { cx: 650, cy: 95, val: "₹2.60L" }
            ]
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/admin/stats');
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching admin stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center p-24 space-y-6">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-pulse"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
                    </div>
                    <div className="text-gray-500 font-semibold tracking-wide animate-pulse">
                        Synchronizing Enterprise Metrics...
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-10 font-sans">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            Executive Workspace
                            <span className="text-sm font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
                                v2.5
                            </span>
                        </h1>
                        <p className="text-gray-500 mt-2 text-sm md:text-base font-medium">
                            Real-time platform metrics, supply metrics, and network overview.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchStats}
                            className="bg-white text-gray-700 px-4 py-2.5 rounded-xl border border-gray-200/80 font-bold hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all flex items-center gap-2 cursor-pointer text-sm"
                        >
                            🔄 Refresh Data
                        </button>
                        <div className="bg-white/80 backdrop-blur px-5 py-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full absolute"></span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                Live Node Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Premium Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Revenue"
                        value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
                        icon="💳"
                        color="indigo"
                        growth="+18.2%"
                        sparkPath={sparklines.revenue}
                    />
                    <StatCard
                        title="Pending Orders"
                        value={stats?.pendingOrders || 0}
                        icon="⏳"
                        color="amber"
                        growth="-2.4%"
                        sparkPath={sparklines.orders}
                    />
                    <StatCard
                        title="Active Materials"
                        value={stats?.totalProducts || 0}
                        icon="🧱"
                        color="emerald"
                        growth="+5.6%"
                        sparkPath={sparklines.materials}
                    />
                    <StatCard
                        title="Customer Base"
                        value={stats?.totalUsers || 0}
                        icon="👥"
                        color="blue"
                        growth="+12.8%"
                        sparkPath={sparklines.customers}
                    />
                </div>

                {/* Visual Analytics Chart Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-md flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Sales Analytics</h3>
                                <p className="text-xs text-gray-400 font-medium">Revenue projection and performance mapping</p>
                            </div>
                            <div className="flex bg-gray-100 p-1.5 rounded-xl">
                                <button
                                    onClick={() => { setChartMode('weekly'); setActivePoint(null); }}
                                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-all border-none cursor-pointer ${chartMode === 'weekly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Weekly
                                </button>
                                <button
                                    onClick={() => { setChartMode('monthly'); setActivePoint(null); }}
                                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-all border-none cursor-pointer ${chartMode === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Monthly
                                </button>
                            </div>
                        </div>

                        {/* Interactive SVG Chart Container */}
                        <div className="relative mt-2">
                            <svg className="w-full h-72 overflow-visible" viewBox="0 0 700 300">
                                <defs>
                                    <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                                    </linearGradient>
                                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="50%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#ec4899" />
                                    </linearGradient>
                                </defs>

                                {/* Grid Lines */}
                                <line x1="50" y1="80" x2="650" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="5 5" />
                                <line x1="50" y1="150" x2="650" y2="150" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="5 5" />
                                <line x1="50" y1="220" x2="650" y2="220" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="5 5" />
                                <line x1="50" y1="280" x2="650" y2="280" stroke="#e2e8f0" strokeWidth="1" />

                                {/* Area Fill */}
                                <path
                                    d={chartData[chartMode].fillPath}
                                    fill="url(#chartGlow)"
                                    className="transition-all duration-700 ease-in-out"
                                />

                                {/* Trend Line */}
                                <path
                                    d={chartData[chartMode].path}
                                    fill="none"
                                    stroke="url(#lineGrad)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    className="transition-all duration-700 ease-in-out"
                                />

                                {/* Interactive Data Nodes */}
                                {chartData[chartMode].points.map((pt, idx) => (
                                    <g key={idx} className="cursor-pointer group">
                                        <circle
                                            cx={pt.cx}
                                            cy={pt.cy}
                                            r="6"
                                            className="fill-white stroke-blue-600 stroke-[3] transition-all duration-300 group-hover:r-8 group-hover:stroke-pink-500"
                                            onClick={() => setActivePoint(idx)}
                                        />
                                        <circle
                                            cx={pt.cx}
                                            cy={pt.cy}
                                            r="16"
                                            className="fill-transparent hover:fill-blue-500/10 transition-all duration-300"
                                            onClick={() => setActivePoint(idx)}
                                        />
                                    </g>
                                ))}

                                {/* Labels */}
                                {chartData[chartMode].labels.map((lbl, idx) => (
                                    <text
                                        key={idx}
                                        x={50 + idx * 100}
                                        y="298"
                                        textAnchor="middle"
                                        className="fill-gray-400 font-bold text-xs"
                                    >
                                        {lbl}
                                    </text>
                                ))}
                            </svg>

                            {/* Live Dynamic Tooltip */}
                            {activePoint !== null && (
                                <div
                                    className="absolute bg-slate-900 text-white rounded-xl px-4 py-2 text-xs font-black shadow-xl border border-slate-700 flex flex-col items-center gap-0.5 transition-all duration-300 animate-bounce"
                                    style={{
                                        left: `${(chartData[chartMode].points[activePoint].cx / 700) * 100}%`,
                                        top: `${(chartData[chartMode].points[activePoint].cy / 300) * 100 - 24}%`,
                                        transform: 'translate(-50%, -100%)'
                                    }}
                                >
                                    <span className="text-gray-400 uppercase tracking-widest text-[9px] font-bold">
                                        {chartData[chartMode].labels[activePoint]}
                                    </span>
                                    <span>
                                        {chartData[chartMode].points[activePoint].val}
                                    </span>
                                    <div className="w-2.5 h-2.5 bg-slate-900 border-r border-b border-slate-700 rotate-45 absolute -bottom-1"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Access Control Board */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -mr-40 -mt-40"></div>

                        <div className="relative z-10 space-y-6">
                            <div>
                                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full uppercase tracking-wider">
                                    Administrative Hub
                                </span>
                                <h3 className="text-2xl font-black mt-3">Quick Navigation</h3>
                                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                                    Direct access hooks to control inventory database, orders, and user permissions.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <QuickLink title="Add Material" path="/admin/products" icon="➕" />
                                <QuickLink title="Categories" path="/admin/categories" icon="🏷️" />
                                <QuickLink title="Track Orders" path="/admin/orders" icon="🚛" />
                                <QuickLink title="User Registry" path="/admin/users" icon="👥" />
                            </div>
                        </div>

                        <div className="relative z-10 border-t border-slate-800/80 pt-6 mt-6 flex justify-between items-center">
                            <div>
                                <h4 className="text-sm font-bold">Need Architect Help?</h4>
                                <p className="text-slate-400 text-xs mt-0.5">24/7 technical system support.</p>
                            </div>
                            <button
                                onClick={redirectToSupport}
                                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all border-none cursor-pointer text-xs"
                            >
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>

                {/* System Activity & Health Logs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 border-l-4 border-indigo-600 pl-3">
                            Services Health
                        </h3>
                        <div className="space-y-6">
                            <ActivityRow label="Database Connectivity" status="Optimized" latency="12ms" color="emerald" />
                            <ActivityRow label="Payment Gateway Pipeline" status="Active" latency="48ms" color="emerald" />
                            <ActivityRow label="Inventory Services Engine" status="Synced" latency="2ms" color="blue" />
                            <ActivityRow label="Cloud Resource Cluster" status="Online" latency="18ms" color="emerald" />
                        </div>
                    </div>

                    {/* Animated Progress Meters */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md lg:col-span-2 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-6 border-l-4 border-pink-500 pl-3">
                                Platform Resource Load
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <MetricMeter label="CPU Allocation" value="38%" color="indigo" />
                                <MetricMeter label="RAM Consumption" value="62%" color="pink" />
                                <MetricMeter label="Disk Space Utilized" value="24%" color="emerald" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

// Subcomponent: StatCard
function StatCard({ title, value, icon, color, growth, sparkPath }) {
    const colors = {
        indigo: {
            bg: 'bg-indigo-50/50',
            text: 'text-indigo-600',
            border: 'border-indigo-100',
            gradient: 'from-indigo-500/10 to-transparent'
        },
        amber: {
            bg: 'bg-amber-50/50',
            text: 'text-amber-600',
            border: 'border-amber-100',
            gradient: 'from-amber-500/10 to-transparent'
        },
        emerald: {
            bg: 'bg-emerald-50/50',
            text: 'text-emerald-600',
            border: 'border-emerald-100',
            gradient: 'from-emerald-500/10 to-transparent'
        },
        blue: {
            bg: 'bg-blue-50/50',
            text: 'text-blue-600',
            border: 'border-blue-100',
            gradient: 'from-blue-500/10 to-transparent'
        },
    };

    const isPositive = !growth.startsWith('-');

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className={`absolute inset-0 bg-gradient-to-b ${colors[color].gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            <div className="relative z-10 flex justify-between items-start">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${colors[color].bg} ${colors[color].text} border ${colors[color].border} shadow-inner`}>
                    {icon}
                </div>
                <div className="flex flex-col items-end">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                        {growth}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">vs last week</span>
                </div>
            </div>

            <div className="relative z-10 mt-6 flex justify-between items-end">
                <div>
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                    <h4 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h4>
                </div>
                
                {/* SVG Mini Trend Sparkline */}
                <div className="w-16 h-8 opacity-70 group-hover:opacity-100 transition-all">
                    <svg viewBox="0 0 120 40" className="w-full h-full">
                        <path
                            d={sparkPath}
                            fill="none"
                            stroke={isPositive ? "#10b981" : "#ef4444"}
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}

// Subcomponent: QuickLink
function QuickLink({ title, path, icon }) {
    return (
        <a
            href={path}
            className="flex flex-col items-center justify-center p-4 bg-slate-800/40 hover:bg-slate-800/80 rounded-2xl border border-slate-800 hover:border-slate-700/80 transition-all text-center gap-2 group decoration-none cursor-pointer"
        >
            <span className="text-xl group-hover:scale-125 transition-transform duration-300">{icon}</span>
            <span className="text-xs font-extrabold tracking-wide text-slate-300 group-hover:text-white transition-colors">{title}</span>
        </a>
    );
}

// Subcomponent: ActivityRow
function ActivityRow({ label, status, latency, color }) {
    const statusColors = {
        emerald: 'text-emerald-500 bg-emerald-50 border-emerald-100',
        blue: 'text-blue-500 bg-blue-50 border-blue-100',
    };
    return (
        <div className="flex justify-between items-center p-3 rounded-2xl hover:bg-slate-50 transition-all group">
            <div className="flex flex-col">
                <span className="font-bold text-slate-700 text-sm">{label}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Ping latency: {latency}</span>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${statusColors[color]}`}>
                {status}
            </span>
        </div>
    );
}

// Subcomponent: MetricMeter
function MetricMeter({ label, value, color }) {
    const progressColors = {
        indigo: 'bg-indigo-600 shadow-indigo-600/45',
        pink: 'bg-pink-500 shadow-pink-500/45',
        emerald: 'bg-emerald-500 shadow-emerald-500/45',
    };
    return (
        <div className="space-y-2.5 p-4 bg-slate-50 rounded-2xl border border-gray-100">
            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                <span>{label}</span>
                <span className="text-slate-900 font-black">{value}</span>
            </div>
            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 shadow-sm ${progressColors[color]}`}
                    style={{ width: value }}
                ></div>
            </div>
        </div>
    );
}

export default AdminDashboard;
