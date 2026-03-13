import React from 'react';

export const StatCard = ({ title, value, trend, isPositive, icon: Icon, colorClass, onClick, subtitle }) => {
  const textColorClass = colorClass.replace('bg-', 'text-');

  if (!title || !value) {
    return <div className="text-red-500">Invalid card data</div>
  }

  const getTrendBadge = () => {
    if (isPositive === undefined) {
      return <span className="text-slate-400">No trend data</span>
    }
    if (isPositive) {
      return (
        <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
          {trend}
        </span>
      )
    }
    return (
      <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400">
        {trend}
      </span>
    )
  }

  return (
    <div
      onClick={onClick}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-slate-600 cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} className={textColorClass} />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {getTrendBadge()}
        <span className="text-sm text-slate-500 ml-2">vs last month</span>
      </div>
    </div>
  );
};