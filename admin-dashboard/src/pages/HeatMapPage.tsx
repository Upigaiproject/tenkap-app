import React from 'react';
import HeatMap from '../components/HeatMap';
import { MapPin, LayoutDashboard } from 'lucide-react';

const HeatMapPage: React.FC = () => {
    return (
        // Main Container - Forced to full viewport height
        <div style={{
            height: '100%', // Changed from 100vh
            width: '100%',  // Changed from 100vw
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f9fafb',
            overflow: 'hidden',
            margin: 0,
            padding: 0
        }}>

            {/* Header */}
            <div style={{
                padding: '16px 24px',
                backgroundColor: 'white',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexShrink: 0 // Don't shrink
            }}>
                <div style={{
                    padding: '8px',
                    backgroundColor: '#9333ea',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <LayoutDashboard color="white" size={24} />
                </div>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#111827' }}>Heat Map Analytics</h1>
                    <p style={{ fontSize: '14px', margin: 0, color: '#6b7280' }}>
                        Canlı: Kullanıcı aktivitesi
                    </p>
                </div>
            </div>

            {/* Map Container - Flex 1 to take remaining space */}
            <div style={{
                flex: 1,
                position: 'relative',
                margin: '16px',
                backgroundColor: '#e5e7eb',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #d1d5db',
                minHeight: '400px' // Fallback height
            }}>
                <HeatMap center={[41.0082, 28.9784]} zoom={11} />
            </div>
        </div>
    );
};

export default HeatMapPage;
