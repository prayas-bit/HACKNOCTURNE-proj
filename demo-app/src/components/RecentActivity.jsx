import React from 'react';

export const RecentActivity = ({ maxItems = 5, showLive = true }) => {
  if (!maxItems || maxItems <= 0) {
    return <div className="text-red-500">Invalid configuration</div>
  }

  const allItems = [
    { color: 'bg-emerald-500/80', time: '2m ago', action: 'New user registered' },
    { color: 'bg-blue-500/80', time: '15m ago', action: 'Payment processed' },
    { color: 'bg-purple-500/80', time: '1h ago', action: 'Server restarted' },
    { color: 'bg-rose-500/80', time: '2h ago', action: 'Failed login attempt' },
    { color: 'bg-amber-500/80', time: '3h ago', action: 'Database backup completed' }
  ]

  const items = allItems.slice(0, maxItems)

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl h-96 p-6 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        {showLive && (
          <span className="text-xs font-medium px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">Live</span>
        )}
      </div>
      <div className="space-y-4 overflow-y-auto h-[calc(100%-3rem)] pr-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center space-x-4 p-3 hover:bg-slate-700/50 rounded-xl transition-all duration-200 cursor-pointer group border border-transparent hover:border-slate-600/50">
            <div className={`w-10 h-10 rounded-full flex-shrink-0 ${item.color} flex items-center justify-center text-white/90 shadow-lg`}>
              <div className="w-4 h-4 rounded-full bg-white/20"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                {item.action}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};