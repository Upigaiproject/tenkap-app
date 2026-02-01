import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { Users, MapPin, Activity, Radio } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Pzt', users: 4000 },
    { name: 'Sal', users: 3000 },
    { name: 'Çar', users: 2000 },
    { name: 'Per', users: 2780 },
    { name: 'Cum', users: 1890 },
    { name: 'Cmt', users: 2390 },
    { name: 'Paz', users: 3490 },
];

const Dashboard = () => {
    const [stats, setStats] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:3002/api/admin/stats');
                const data = await response.json();
                if (data.success) {
                    setStats(data.stats);
                    if (data.chartData) setChartData(data.chartData);
                }
            } catch (error) {
                console.error('Stats fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Icon mapping
    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'Users': return Users;
            case 'MapPin': return MapPin;
            case 'Activity': return Activity;
            case 'Radio': return Radio; // Added Mapping
            case 'UserPlus': return Users; // Fallback
            case 'Clock': return Activity; // Fallback
            default: return Users;
        }
    };

    return (
        <div style={{ padding: '32px', color: 'white' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Genel Bakış</h1>
                <p style={{ color: '#A1A1AA' }}>Platform aktivitelerini gerçek zamanlı izle</p>
            </header>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
            }}>
                {loading ? (
                    <div style={{ color: '#A1A1AA' }}>İstatistikler yükleniyor...</div>
                ) : (
                    stats.map((stat, index) => (
                        <StatCard
                            key={index}
                            title={stat.title}
                            value={stat.value}
                            change={stat.change}
                            isPositive={stat.positivity === 'positive'}
                            icon={getIcon(stat.icon)}
                            color={stat.color}
                        />
                    ))
                )}
            </div>

            {/* Chart Section */}
            <div style={{
                background: '#27272A',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #3F3F46'
            }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Haftalık Aktivite</h2>
                <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.length > 0 ? chartData : data}>
                            <XAxis dataKey="name" stroke="#71717A" />
                            <YAxis stroke="#71717A" />
                            <Tooltip
                                contentStyle={{ background: '#18181B', border: '1px solid #3F3F46' }}
                                itemStyle={{ color: '#FAFAFA' }}
                            />
                            <Bar dataKey="users" fill="#6366F1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
