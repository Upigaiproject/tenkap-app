import { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal } from 'lucide-react';
import UserDetailModal from '../components/UserDetailModal';

interface User {
    id: string;
    name: string;
    email: string;
    status: 'Active' | 'Offline';
    lastActive: string;
    battery: number;
}

const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:3002/api/admin/users');
                const data = await response.json();
                if (data.success) {
                    setUsers(data.users);
                }
            } catch (error) {
                console.error('Users fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return <div style={{ padding: '32px', color: '#A1A1AA' }}>Kullanıcılar yükleniyor...</div>;
    }

    return (
        <div style={{ padding: '32px', color: 'white' }}>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Kullanıcılar</h1>
                    <p style={{ color: '#A1A1AA' }}>Tüm kayıtlı kullanıcıları yönet</p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={20} color="#71717A" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Ara..."
                            style={{
                                background: '#18181B',
                                border: '1px solid #3F3F46',
                                borderRadius: '8px',
                                padding: '10px 12px 10px 40px',
                                color: 'white',
                                outline: 'none',
                                width: '240px'
                            }}
                        />
                    </div>
                    <button style={{
                        padding: '10px',
                        background: '#18181B',
                        border: '1px solid #3F3F46',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: 'white'
                    }}>
                        <Filter size={20} />
                    </button>
                </div>
            </header>

            <div style={{
                background: '#27272A',
                borderRadius: '16px',
                border: '1px solid #3F3F46',
                overflow: 'hidden'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #3F3F46', textAlign: 'left' }}>
                            <th style={{ padding: '16px 24px', color: '#A1A1AA', fontSize: '14px', fontWeight: 500 }}>BAŞLIK</th>
                            <th style={{ padding: '16px 24px', color: '#A1A1AA', fontSize: '14px', fontWeight: 500 }}>DURUM</th>
                            <th style={{ padding: '16px 24px', color: '#A1A1AA', fontSize: '14px', fontWeight: 500 }}>SON GÖRÜLME</th>
                            <th style={{ padding: '16px 24px', color: '#A1A1AA', fontSize: '14px', fontWeight: 500 }}>BATARYA</th>
                            <th style={{ padding: '16px 24px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                onClick={() => setSelectedUserId(user.id)}
                                style={{
                                    borderBottom: '1px solid #3F3F46',
                                    cursor: 'pointer', // Show clickable cursor
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#3F3F46'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#6366F1' }} />
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{user.name}</div>
                                            <div style={{ fontSize: '13px', color: '#A1A1AA' }}>{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '99px',
                                        background: user.status === 'Active' ? '#064E3B' : '#7F1D1D',
                                        color: user.status === 'Active' ? '#34D399' : '#F87171',
                                        fontSize: '12px',
                                        fontWeight: 600
                                    }}>{user.status}</span>
                                </td>
                                <td style={{ padding: '16px 24px', color: '#E4E4E7' }}>{user.lastActive}</td>
                                <td style={{ padding: '16px 24px', color: '#E4E4E7' }}>%{user.battery}</td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <MoreHorizontal size={20} color="#71717A" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {selectedUserId && (
                <UserDetailModal
                    userId={selectedUserId}
                    onClose={() => setSelectedUserId(null)}
                />
            )}
        </div>
    );
};

export default Users;
