import React, { useEffect, useState } from 'react';
import { MessageSquare, TrendingUp, AlertCircle, Loader } from 'lucide-react';

interface SMSStats {
    activeVerifications: number;
    totalRateLimited: number;
    averageAttempts: number;
}

const SMSAnalytics: React.FC = () => {
    const [stats, setStats] = useState<SMSStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStats = async () => {
        try {
            // Trying 3002 as per recent config
            const response = await fetch('http://localhost:3002/api/sms/stats');
            if (!response.ok) throw new Error('Failed to fetch stats');
            const data = await response.json();
            setStats(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load SMS analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // Refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (error && !stats) {
        return (
            <div className="p-8 text-red-500">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">SMS Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Active Verifications</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats?.activeVerifications || 0}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Avg. Attempts</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {stats?.averageAttempts ? stats.averageAttempts.toFixed(1) : '0'}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Rate Limited</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats?.totalRateLimited || 0}</p>
                </div>
            </div>
        </div>
    );
};

export default SMSAnalytics;
