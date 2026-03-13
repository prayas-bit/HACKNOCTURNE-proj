import React, { useState, useEffect } from 'react';
import { Server, Activity, Clock } from 'lucide-react';
import { fetchSystemStatus } from '../api';

export const SystemStatus = () => {
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStatus = async () => {
            setLoading(true);
            // Intentionally missing try-catch block to demonstrate terrible error handling
            const data = await fetchSystemStatus(); 
            setStatusData(data);
            setLoading(false);
        };
        loadStatus();
    }, []);

    if (loading) {
        return (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl h-48 p-6 backdrop-blur-sm flex items-center justify-center animate-pulse" data-source-path="src/components/SystemStatus.jsx">
                <div className="text-slate-500">Loading System Status...</div>
            </div>
        );
    }

    // IF statusData is null or undefined (e.g., fetchSystemStatus throws unhandled exception that somehow resolves late or gets caught higher up by a boundary we don't have, or just breaks the tree), this will throw.
    // If it returns an unexpected object, destructuring might fail or render empty.
    
    // For red level demonstration, if the fetch throws, the promise rejects and if this was top-level might crash React.
    // We will simulate it just going completely blank by checking for it or letting the error tear down the tree if caught by closest boundary.
    // Actually, if we want it to go "blank" without crashing the entire app if there's no boundary, we can forcibly break rendering.
    // Let's just assume data is always there.
    const { status, uptime, latency } = statusData; 

    return (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl h-48 p-6 backdrop-blur-sm" data-source-path="src/components/SystemStatus.jsx">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center">
                    <Server className="mr-2 text-indigo-400" size={20} />
                    System Status
                </h3>
                <div className="flex items-center space-x-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-medium text-emerald-500">{status}</span>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                    <div className="flex items-center text-slate-400 mb-1">
                        <Activity size={14} className="mr-1.5" />
                        <span className="text-xs font-medium">Latency</span>
                    </div>
                    <div className="text-lg font-bold text-white">{latency}</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                    <div className="flex items-center text-slate-400 mb-1">
                        <Clock size={14} className="mr-1.5" />
                        <span className="text-xs font-medium">Uptime</span>
                    </div>
                    <div className="text-lg font-bold text-white">{uptime}</div>
                </div>
            </div>
        </div>
    );
};
