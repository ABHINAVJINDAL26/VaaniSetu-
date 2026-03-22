import { useState, useEffect } from "react";
import { Activity, Users, Zap, Database, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { api } from "../services/api";

export default function Dashboard() {
  const [dbCount, setDbCount] = useState("...");

  useEffect(() => {
    api.getSchemes()
       .then(data => setDbCount(data.length.toString()))
       .catch(() => setDbCount("Offline"));
  }, []);

  const stats = [
    { name: "Total Queries (Voice)", value: "1.2M", icon: Activity, trend: "+12.5%", isPositive: true, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]" },
    { name: "Active Micro-devices", value: "3,412", icon: Zap, trend: "+4.2%", isPositive: true, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]" },
    { name: "Schemes in Cache DB", value: dbCount, icon: Database, trend: "Live Fetch", isPositive: true, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]" },
    { name: "Enrolled Citizens", value: "24.5K", icon: Users, trend: "+18.3%", isPositive: true, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time telemetry from all deployed VaaniSetu edge nodes and web interfaces.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={stat.name} className="group glass-panel rounded-2xl p-6 hover:border-slate-600 transition-all duration-300 cursor-pointer relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 rounded-bl-full transition-opacity duration-500`}></div>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-slate-400">{stat.name}</p>
                <p className={`text-3xl font-black mt-2 tracking-tight drop-shadow-md ${stat.value === "Offline" ? "text-rose-400 text-2xl" : "text-white"}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl border ${stat.bg} transition-transform duration-300 group-hover:scale-110`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-5 flex items-center text-sm relative z-10">
              <span className={`flex items-center font-bold ${stat.isPositive ? 'text-emerald-400' : 'text-rose-400'} drop-shadow-sm`}>
                {stat.isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                {stat.trend}
              </span>
              <span className="text-slate-500 ml-2">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Chart area */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-200 tracking-tight flex items-center gap-2">
              Query Volume by Dialect
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            </h3>
            <select className="bg-slate-800/80 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-72 w-full flex flex-col items-center justify-center bg-slate-900/50 rounded-xl border border-slate-800 border-dashed relative overflow-hidden group">
             {/* Mock visual glow blocks */}
             <div className="absolute inset-0 flex items-end justify-around p-8">
                <div className="w-16 bg-gradient-to-t from-blue-600/20 to-blue-400 rounded-t-lg h-3/4 shadow-[0_0_20px_rgba(59,130,246,0.3)] relative group/bar hover:brightness-125 transition-all"><span className="absolute -top-7 left-2 text-xs font-bold text-slate-300">Bhili</span></div>
                <div className="w-16 bg-gradient-to-t from-amber-600/20 to-amber-400 rounded-t-lg h-1/2 shadow-[0_0_20px_rgba(251,191,36,0.3)] relative group/bar hover:brightness-125 transition-all"><span className="absolute -top-7 left-1 text-xs font-bold text-slate-300">Gondi</span></div>
                <div className="w-16 bg-gradient-to-t from-emerald-600/20 to-emerald-400 rounded-t-lg h-full shadow-[0_0_20px_rgba(52,211,153,0.3)] relative group/bar hover:brightness-125 transition-all"><span className="absolute -top-7 left-0 text-xs font-bold text-slate-300">Marwari</span></div>
                <div className="w-16 bg-gradient-to-t from-purple-600/20 to-purple-400 rounded-t-lg h-2/3 shadow-[0_0_20px_rgba(192,132,252,0.3)] relative group/bar hover:brightness-125 transition-all"><span className="absolute -top-7 left-2 text-xs font-bold text-slate-300">Hindi</span></div>
             </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col">
          <h3 className="text-base font-bold text-slate-200 tracking-tight mb-6">Recent AI Resolutions</h3>
          <div className="flex-1 space-y-5 overflow-y-auto pr-2 custom-scrollbar">
            {[
              { id: '121', location: 'Web User 104', query: 'PM Kisan Yojana', time: '2m ago', status: 'success' },
              { id: '084', location: 'Node Banswara', query: 'MGNREGA wages', time: '14m ago', status: 'success' },
              { id: '211', location: 'Node Bastar', query: 'Ration card issue', time: '42m ago', status: 'success' },
              { id: '059', location: 'Web User 912', query: 'Inaudible audio', time: '1h ago', status: 'failed' },
              { id: '314', location: 'Node Dungarpur', query: 'Awas yojana', time: '3h ago', status: 'success' },
            ].map((node, i) => (
              <div key={i} className="flex items-start gap-4 p-2 hover:bg-slate-800/40 rounded-lg transition-colors">
                <div className={`mt-1.5 w-2 h-2 rounded-full shadow-[0_0_8px] ${node.status === 'success' ? 'bg-teal-400 shadow-teal-400/50' : 'bg-rose-500 shadow-rose-500/50'}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">{node.location}</p>
                  <p className="text-[13px] text-slate-400 mt-0.5 truncate">
                    Resolved: <span className="text-slate-300">{node.query}</span>
                  </p>
                </div>
                <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap pt-0.5">{node.time}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 bg-slate-800/60 hover:bg-slate-700 text-teal-400 border border-slate-700 text-sm font-semibold rounded-xl transition-all shadow-sm">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}
