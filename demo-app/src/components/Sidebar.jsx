import React, { useState } from 'react';
import { Home, Users, Settings, Activity, FileText } from 'lucide-react';

export const Sidebar = ({ collapsed = false, onItemClick }) => {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [showTooltips, setShowTooltips] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard' },
    { icon: Users, label: 'Users' },
    { icon: FileText, label: 'Reports' },
    { icon: Activity, label: 'Analytics' },
    { icon: Settings, label: 'Settings' },
  ];

  const handleClick = (label) => {
    setActiveItem(label)
    if (onItemClick) {
      onItemClick(label)
    }
    if (label === 'Settings') {
      setShowTooltips(prev => !prev)
    }
  }

  return (
    <div className={`h-screen bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/30">
          <Activity size={18} className="text-white" />
        </div>
        {!collapsed && <span className="font-bold text-lg text-white tracking-wide">Nexus Admin</span>}
      </div>
      <div className="flex-1 py-6 px-4 space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleClick(item.label)}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeItem === item.label
                ? 'bg-indigo-500/10 text-indigo-400'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} className={`mr-3 ${activeItem === item.label ? 'text-indigo-400' : 'text-slate-400'}`} />
            {!collapsed && <span className="font-medium">{item.label}</span>}
            {showTooltips && collapsed && (
              <span className="absolute left-16 bg-slate-800 text-white px-2 py-1 rounded text-sm">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};