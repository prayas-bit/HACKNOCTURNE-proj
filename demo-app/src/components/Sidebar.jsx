import React from 'react';
import { Home, Users, Settings, Activity, FileText } from 'lucide-react';

export const Sidebar = () => {
  const menuItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: Users, label: 'Users' },
    { icon: FileText, label: 'Reports' },
    { icon: Activity, label: 'Analytics' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-all duration-300">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/30">
          <Activity size={18} className="text-white" />
        </div>
        <span className="font-bold text-lg text-white tracking-wide">Nexus Admin</span>
      </div>
      <div className="flex-1 py-6 px-4 space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
              item.active
                ? 'bg-indigo-500/10 text-indigo-400'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} className={`mr-3 transition-transform duration-200 group-hover:scale-110 ${item.active ? 'text-indigo-400' : 'text-slate-400'}`} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
