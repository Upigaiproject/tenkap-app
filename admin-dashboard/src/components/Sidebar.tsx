import React from 'react';
import { LayoutDashboard, Users, Map, Settings, LogOut, Radar } from 'lucide-react';


interface SidebarProps {
    activePage: string;
    onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
        { id: 'users', label: 'Kullanıcılar', icon: Users },
        { id: 'heatmap', label: 'Heat Map', icon: Map },
        { id: 'proximity', label: 'Proximity (God Mode)', icon: Radar },
        { id: 'settings', label: 'Ayarlar', icon: Settings },
    ];

    return (
        <div style={{
            width: '260px',
            height: '100vh',
            background: '#18181B',
            borderRight: '1px solid #27272A',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            color: '#FAFAFA'
        }}>
            {/* Logo */}
            <div style={{
                fontSize: '24px',
                fontWeight: 700,
                marginBottom: '40px',
                background: 'linear-gradient(135deg, #6366F1, #A855F7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
            }}>
                TENKAP Admin
            </div>

            {/* Menu */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {menuItems.map((item) => {
                    const isActive = activePage === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                background: isActive ? '#27272A' : 'transparent',
                                color: isActive ? '#FFFFFF' : '#A1A1AA',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 500,
                                transition: 'all 0.2s',
                                textAlign: 'left'
                            }}
                        >
                            <Icon size={20} />
                            {item.label}
                        </button>
                    );
                })}
            </div>

            {/* User */}
            <div style={{
                paddingTop: '20px',
                borderTop: '1px solid #27272A',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#3F3F46',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    👤
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>Admin</div>
                    <div style={{ fontSize: '12px', color: '#A1A1AA' }}>God Mode</div>
                </div>
                <button style={{ background: 'transparent', border: 'none', color: '#71717A', cursor: 'pointer' }}>
                    <LogOut size={18} />
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
