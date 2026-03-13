import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

export const Header = () => {
  return (
    <header className="h-16 px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        <button className="lg:hidden text-slate-400 hover:text-white mr-4 transition-colors">
          <Menu size={24} />
        </button>
        <div className="relative hidden sm:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search resources..."
            className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-64 transition-all duration-300 focus:w-80"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* DEV TOOLS: Requestly Test Buttons */}
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
          <button 
            onClick={() => {
              window.postMessage({
                type: "FORCE_MOCK_STATE",
                payload: { url: "stats", status: 500, body: { error: "DevTools: Forced 500 Error" } }
              }, "*");
            }}
            className="px-3 py-1 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-slate-700 rounded transition-colors"
          >
            🐛 Inject Bug
          </button>
          <div className="w-px bg-slate-700 my-1 mx-1"></div>
          <button 
            onClick={() => {
              window.postMessage({ type: "CLEAR_MOCK_STATE" }, "*");
            }}
            className="px-3 py-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-slate-700 rounded transition-colors"
          >
            🧹 Clear
          </button>
        </div>

        <button className="relative text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full">
          <Bell size={20} />
          <span className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
          <span className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 border-2 border-slate-800 cursor-pointer shadow-md hover:scale-105 transition-transform flex-shrink-0"></div>
      </div>
    </header>
  );
};
