import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { StatCard } from './StatCard';
import { RevenueChart } from './RevenueChart';
import { RecentActivity } from './RecentActivity';
import { SystemStatus } from './SystemStatus';
import { Users, DollarSign, Activity, ShoppingCart, AlertCircle, Loader2 } from 'lucide-react';
import { fetchStats } from '../api';

export const Dashboard = () => {
  const [stats, setStats] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await fetchStats();

        // Map icons back to the data
        const statsWithIcons = data.map((item) => {
          if (item.title === "Total Revenue")
            return { ...item, icon: DollarSign };
          if (item.title === "Active Users") return { ...item, icon: Users };
          if (item.title === "Sales") return { ...item, icon: ShoppingCart };
          return { ...item, icon: Activity };
        });

        setStats(statsWithIcons);
        setError(null);
      } catch (err) {
        console.error("Dashboard cloud sync error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans selection:bg-indigo-500/30">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>

        <Header />

        <main className="flex-1 overflow-y-auto p-8 z-0">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome back, Admin 👋
              </h2>
              <p className="text-slate-400">
                Here's what's happening with your projects today.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 h-32 animate-pulse flex items-center justify-center"
                  >
                    <Loader2
                      className="text-slate-600 animate-spin"
                      size={24}
                    />
                  </div>
                ))
              ) : error ? (
              <div className="col-span-full py-12 px-8 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mb-4 shadow-lg shadow-rose-500/20">
                    <AlertCircle size={24} />
                  </div>
                  {/* Show HTTP status code prominently if it's in the error message */}
                  {error.match(/HTTP (\d{3})/) ? (
                    <>
                      <span className="text-4xl font-black text-rose-500 mb-2 tracking-tight">
                        {error.match(/HTTP (\d{3})/)[0]}
                      </span>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {error.replace(/HTTP \d{3}\s*[-—]?\s*/, '') || 'Server Error'}
                      </h3>
                    </>
                  ) : (
                    <h3 className="text-lg font-semibold text-white mb-1">Could not fetch statistics</h3>
                  )}
                  <p className="text-rose-400 text-sm max-w-xs mt-1">{error}</p>
                  <p className="text-slate-500 text-xs mt-2">Injected via Coverage Heatmap</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-slate-700"
                  >
                    Try Reconnecting
                  </button>
                </div>
              ) : (
                stats.map((stat, index) => <StatCard key={index} {...stat} />)
              )}
            </div>

            {/* Placeholder for content below */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <RevenueChart />
              <div className="flex flex-col gap-6">
                <SystemStatus />
                <RecentActivity />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
