import React, { useState, useEffect } from 'react';
import { Server, Activity, Clock, AlertTriangle, RefreshCw, ChevronDown, Wrench, ShieldAlert, X } from 'lucide-react';
import { fetchSystemStatus } from '../api';

export const SystemStatus = () => {
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // UNCOVERED STATES: The test never interacts with these
    const [errorInfo, setErrorInfo] = useState(null); 
    const [showDetails, setShowDetails] = useState(false); 
    const [isRetrying, setIsRetrying] = useState(false);
    const [showMaintenance, setShowMaintenance] = useState(false);
    const [showIncidents, setShowIncidents] = useState(false);

    // UNCOVERED UTILITY: The test never throws an error, so this 15-line function is completely ignored
    

    const loadStatus = async (isRetry = false) => {
        if (isRetry) setIsRetrying(true); 
        else setLoading(true);
        
        setErrorInfo(null);

        try {
            const data = await fetchSystemStatus(); 
            setStatusData(data);
        } catch (error) {
            // UNCOVERED BLOCK
            console.error("Failed to fetch status", error);
            setErrorInfo(parseApiError(error));
        } finally {
            setLoading(false);
            setIsRetrying(false); 
        }
    };

    useEffect(() => { loadStatus(); }, []);

    // UNCOVERED HANDLERS: Test never clicks these buttons
    const handleRetry = () => loadStatus(true);
    const toggleDetails = () => setShowDetails(!showDetails);
    const toggleMaintenance = () => setShowMaintenance(!showMaintenance);
    const toggleIncidents = () => setShowIncidents(!showIncidents);

    // UNCOVERED UI: Massive error block (adds ~25 lines of untested code)
    if (errorInfo) {
        return (
            <div className="bg-red-900/20 border border-red-700/50 rounded-2xl p-6 backdrop-blur-sm" data-source-path="src/components/SystemStatus.jsx">
                <div className="flex items-center text-red-400 font-bold mb-3">
                    <ShieldAlert className="mr-2" size={24} />
                    <span>Critical System Failure (Error {errorInfo.code})</span>
                </div>
                <div className="bg-red-950/50 rounded-lg p-4 mb-4 border border-red-900/50">
                    <p className="text-sm text-red-300 mb-2 font-medium">{errorInfo.message}</p>
                    <div className="flex justify-between items-center text-xs text-red-500/80 font-mono">
                        <span>Failed at: {errorInfo.timestamp}</span>
                        <span>Region: us-east-1</span>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button onClick={handleRetry} disabled={isRetrying} className="flex-1 flex items-center justify-center py-2.5 bg-red-800/40 hover:bg-red-700/60 rounded-xl text-red-100 transition-all font-medium">
                        <RefreshCw className={`mr-2 ${isRetrying ? 'animate-spin' : ''}`} size={18} />
                        {isRetrying ? 'Reconnecting...' : 'Force Retry'}
                    </button>
                    <button onClick={toggleIncidents} className="flex-1 flex items-center justify-center py-2.5 border border-red-800/50 hover:bg-red-900/40 rounded-xl text-red-200 transition-all font-medium">
                        View Logs
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl h-48 p-6 backdrop-blur-sm flex items-center justify-center animate-pulse" data-source-path="src/components/SystemStatus.jsx">
                <div className="text-slate-500 flex flex-col items-center">
                    <Server className="mb-2 opacity-50" size={24} />
                    <span>Loading System Status...</span>
                </div>
            </div>
        );
    }

    const { status, uptime, latency } = statusData; 
    const isDegraded = latency && parseInt(latency.replace('ms', '')) > 100;

    return (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm" data-source-path="src/components/SystemStatus.jsx">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center">
                    <Server className="mr-2 text-indigo-400" size={20} />
                    System Status
                </h3>
                <div className="flex items-center space-x-3">
                    {/* UNCOVERED UI: Maintenance Toggle Button */}
                    <button onClick={toggleMaintenance} className="text-slate-400 hover:text-amber-400 transition-colors">
                        <Wrench size={16} />
                    </button>
                    <div className="flex items-center space-x-2">
                        <span className="relative flex h-3 w-3">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDegraded ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${isDegraded ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                        </span>
                        <span className={`text-xs font-medium ${isDegraded ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {isDegraded ? 'Degraded Performance' : status}
                        </span>
                    </div>
                </div>
            </div>
            
            {/* UNCOVERED UI: Maintenance Banner (approx 15 lines of untested code) */}
            {showMaintenance && (
                <div className="mb-6 p-4 bg-amber-900/20 border border-amber-700/30 rounded-xl flex items-start justify-between animate-in fade-in">
                    <div>
                        <h4 className="text-amber-400 text-sm font-bold flex items-center mb-1">
                            <Wrench size={14} className="mr-1.5" /> Scheduled Maintenance
                        </h4>
                        <p className="text-amber-200/70 text-xs">Database migrations will occur on Sunday at 02:00 UTC. Expect 15 mins of downtime.</p>
                    </div>
                    <button onClick={toggleMaintenance} className="text-amber-500 hover:text-amber-300"><X size={16}/></button>
                </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-2">
                <div className={`rounded-xl p-4 border transition-colors ${isDegraded ? 'bg-amber-900/20 border-amber-700/30' : 'bg-slate-900/50 border-slate-700/30'}`}>
                    <div className="flex items-center text-slate-400 mb-1">
                        <Activity size={14} className="mr-1.5" />
                        <span className="text-xs font-medium">Latency</span>
                    </div>
                    <div className={`text-lg font-bold ${isDegraded ? 'text-amber-400' : 'text-white'}`}>{latency}</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                    <div className="flex items-center text-slate-400 mb-1">
                        <Clock size={14} className="mr-1.5" />
                        <span className="text-xs font-medium">Uptime</span>
                    </div>
                    <div className="text-lg font-bold text-white">{uptime}</div>
                </div>
            </div>

            <button onClick={toggleDetails} className="w-full flex items-center justify-center py-3 text-xs font-medium text-slate-400 hover:text-white transition-colors mt-2 rounded-lg hover:bg-slate-800">
                {showDetails ? 'Hide Advanced Metrics' : 'View Advanced Metrics'}
                <ChevronDown size={14} className={`ml-1 transform transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>

            {/* UNCOVERED UI: Details panel */}
            {showDetails && (
                <div className="mt-2 p-4 bg-slate-900/80 rounded-xl text-xs text-slate-400 space-y-3 border border-slate-700/30">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span>Region:</span> <span className="text-white font-mono">ap-south-1</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span>Active Nodes:</span> <span className="text-white font-mono">1,243</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span>Database Load:</span> <span className="text-emerald-400 font-mono">42%</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span>Message Queue:</span> <span className="text-white font-mono">Healthy (0ms delay)</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Last Backup:</span> <span className="text-white font-mono">2 hrs ago</span>
                    </div>
                </div>
            )}
        </div>
    );
};