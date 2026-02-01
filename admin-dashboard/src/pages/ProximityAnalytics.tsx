import React, { useEffect, useState } from 'react';
import { Zap, Smartphone, MapPin, TrendingUp } from 'lucide-react';

const ProximityAnalytics: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [recentEvents, setRecentEvents] = useState<any[]>([]);

    useEffect(() => {
        fetch('http://localhost:3002/api/proximity/stats')
            .then(r => r.json())
            .then(setStats);

        fetch('http://localhost:3002/api/proximity/recent?minutes=60')
            .then(r => r.json())
            .then(data => setRecentEvents(data.events));
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Proximity Analytics</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <Zap className="w-5 h-5 text-purple-500" />
                        <p className="text-gray-500 text-sm">Total Events</p>
                    </div>
                    <p className="text-3xl font-bold">{stats?.total || 0}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <Smartphone className="w-5 h-5 text-blue-500" />
                        <p className="text-gray-500 text-sm">NFC Detections</p>
                    </div>
                    <p className="text-3xl font-bold">{stats?.nfc || 0}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <MapPin className="w-5 h-5 text-green-500" />
                        <p className="text-gray-500 text-sm">GPS Detections</p>
                    </div>
                    <p className="text-3xl font-bold">{stats?.gps || 0}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                        <p className="text-gray-500 text-sm">Last 24h</p>
                    </div>
                    <p className="text-3xl font-bold">{stats?.last24h || 0}</p>
                </div>
            </div>

            {/* Recent Events */}
            <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold mb-4">Recent Proximity Events</h2>
                <div className="space-y-3">
                    {recentEvents.map((event, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                {event.method === 'nfc' ? (
                                    <Smartphone className="w-5 h-5 text-blue-500" />
                                ) : (
                                    <MapPin className="w-5 h-5 text-green-500" />
                                )}
                                <div>
                                    <p className="font-medium">{event.user1} ↔ {event.user2}</p>
                                    <p className="text-sm text-gray-500">
                                        {event.distance ? `${event.distance.toFixed(1)}m` : 'NFC'}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400">
                                {new Date(event.timestamp).toLocaleString('tr-TR')}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProximityAnalytics;
