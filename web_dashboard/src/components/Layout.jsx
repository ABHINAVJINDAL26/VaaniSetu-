import { Home, HardDrive, Database, Activity, Mic } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const location = useLocation();
  
  const navItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Voice Assistant", href: "/voice", icon: Mic },
    { name: "Device Manager", href: "/devices", icon: HardDrive },
    { name: "Knowledge Base", href: "/kb", icon: Database },
    { name: "Analytics", href: "/analytics", icon: Activity },
  ];

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-200">
      {/* Sidebar - Dark Glass */}
      <aside className="w-64 glass-panel border-r border-slate-800/50 flex flex-col transition-all duration-300 z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-teal-400 mr-3 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.4)]">
            <span className="text-slate-950 font-black text-sm">VS</span>
          </div>
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-transparent tracking-tight">VaaniSetu</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? "bg-slate-800/80 text-teal-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-slate-700/50" 
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800/50">
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
              <span className="text-xs font-semibold text-slate-300">API Status</span>
            </div>
            <p className="text-xs text-slate-500">Connected to Edge Core (SQLite)</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 glass-panel border-b border-slate-800/50 flex items-center px-8 z-10 sticky top-0">
          <h2 className="text-lg font-semibold text-slate-100 placeholder-opacity-100">
            {navItems.find(i => i.href === location.pathname)?.name || "Dashboard"}
          </h2>
          <div className="ml-auto flex items-center space-x-5">
            <button className="relative p-2 text-slate-400 hover:text-teal-400 transition-colors">
              <span className="absolute top-1.5 right-1.5 block w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
              <Activity className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 cursor-pointer shadow-[0_0_10px_rgba(59,130,246,0.5)] border border-slate-700"></div>
          </div>
        </header>
        {/* Deep Dark Tech Background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #1e293b 0%, transparent 70%)'}}></div>
        <div className="flex-1 overflow-auto p-8 z-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
