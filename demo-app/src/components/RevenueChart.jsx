import React from 'react';
import { Activity } from 'lucide-react';

export const RevenueChart = () => {
  return (
    <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-2xl h-96 p-6 backdrop-blur-sm" data-source-path="src/components/RevenueChart.jsx">
      <h3 className="text-lg font-semibold text-white mb-4">Revenue Overview</h3>
      <div className="w-full h-[calc(100%-2rem)] flex items-center justify-center border-2 border-dashed border-slate-700/50 rounded-xl text-slate-500 hover:border-slate-600 transition-colors cursor-pointer group">
        <div className="text-center group-hover:scale-105 transition-transform duration-300">
          <Activity size={48} className="mx-auto mb-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
          <p className="text-sm font-medium">Chart Component Placeholder</p>
          <p className="text-xs text-slate-600 mt-2">Will be replaced with Recharts/Chart.js</p>
        </div>
      </div>
    </div>
  );
};
