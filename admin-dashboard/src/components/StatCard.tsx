import React from 'react';
// import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    change: string;
    isPositive: boolean;
    icon: any; // LucideIcon;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon: Icon, color }) => {
    return (
        <div style={{
            background: '#27272A',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            border: '1px solid #3F3F46'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: `${color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: color
                }}>
                    <Icon size={20} />
                </div>
                <div style={{
                    padding: '4px 8px',
                    borderRadius: '99px',
                    background: isPositive ? '#064E3B' : '#7F1D1D',
                    color: isPositive ? '#34D399' : '#F87171',
                    fontSize: '12px',
                    fontWeight: 600
                }}>
                    {change}
                </div>
            </div>

            <div>
                <div style={{ fontSize: '14px', color: '#A1A1AA', marginBottom: '8px' }}>{title}</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#FAFAFA' }}>{value}</div>
            </div>
        </div>
    );
};

export default StatCard;
