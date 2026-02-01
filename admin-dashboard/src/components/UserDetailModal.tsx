import { X, MapPin, Battery, Calendar, User, Phone, Mail, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UserDetailModalProps {
    userId: string | null;
    onClose: () => void;
}

const UserDetailModal = ({ userId, onClose }: UserDetailModalProps) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchUser = async () => {
            try {
                const response = await fetch(`http://localhost:3002/api/admin/users/${userId}`);
                const data = await response.json();
                if (data.success) {
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    if (!userId) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div style={{
                width: '100%',
                maxWidth: '600px',
                background: '#18181B',
                borderRadius: '16px',
                border: '1px solid #3F3F46',
                padding: '24px',
                margin: '24px',
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto'
            }} onClick={e => e.stopPropagation()}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'transparent',
                        border: 'none',
                        color: '#A1A1AA',
                        cursor: 'pointer'
                    }}
                >
                    <X size={24} />
                </button>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#A1A1AA' }}>Yükleniyor...</div>
                ) : user ? (
                    <>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '32px',
                                color: 'white',
                                fontWeight: 700
                            }}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0', color: 'white' }}>{user.name}</h2>
                                <p style={{ color: '#A1A1AA', margin: 0 }}>@{user.username}</p>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    marginTop: '8px',
                                    padding: '4px 12px',
                                    borderRadius: '99px',
                                    background: '#064E3B',
                                    color: '#34D399',
                                    fontSize: '12px',
                                    fontWeight: 600
                                }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34D399' }} />
                                    Active Now
                                </div>
                            </div>
                        </div>

                        {/* Grid Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            {/* Contact Info */}
                            <div style={{ background: '#27272A', padding: '16px', borderRadius: '12px' }}>
                                <h3 style={{ color: '#A1A1AA', fontSize: '13px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <User size={14} /> KİŞİSEL BİLGİLER
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#E4E4E7' }}>
                                        <Mail size={16} color="#71717A" />
                                        <span style={{ fontSize: '14px' }}>{user.email}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#E4E4E7' }}>
                                        <Phone size={16} color="#71717A" />
                                        <span style={{ fontSize: '14px' }}>{user.phone || 'Telefon yok'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#E4E4E7' }}>
                                        <Calendar size={16} color="#71717A" />
                                        <span style={{ fontSize: '14px' }}>{user.registered_at}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status Info */}
                            <div style={{ background: '#27272A', padding: '16px', borderRadius: '12px' }}>
                                <h3 style={{ color: '#A1A1AA', fontSize: '13px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Info size={14} /> DURUM DETAYLARI
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#E4E4E7' }}>
                                        <Battery size={16} color={user.battery > 20 ? '#34D399' : '#EF4444'} />
                                        <span style={{ fontSize: '14px' }}>Batarya %{user.battery}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#E4E4E7' }}>
                                        <Info size={16} color="#71717A" />
                                        <span style={{ fontSize: '14px' }}>Rumuz: {user.username}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location Section */}
                        <div style={{ background: '#27272A', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                            <h3 style={{ color: '#A1A1AA', fontSize: '13px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MapPin size={14} /> SON KONUMU
                            </h3>
                            {user.last_location ? (
                                <div>
                                    <div style={{
                                        height: '200px',
                                        width: '100%',
                                        background: '#18181B',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        marginBottom: '12px',
                                        border: '1px solid #3F3F46',
                                        position: 'relative'
                                    }}>
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            scrolling="no"
                                            marginHeight={0}
                                            marginWidth={0}
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${user.last_location.lng - 0.01}%2C${user.last_location.lat - 0.01}%2C${user.last_location.lng + 0.01}%2C${user.last_location.lat + 0.01}&layer=mapnik&marker=${user.last_location.lat}%2C${user.last_location.lng}`}
                                            style={{ filter: 'invert(90%) hue-rotate(180deg)' }} // Dark mode-ish effect
                                        ></iframe>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <span style={{ color: '#A1A1AA' }}>Kategori: <strong style={{ color: 'white' }}>{user.last_location.category ? user.last_location.category.toUpperCase() : 'BELİRSİZ'}</strong></span>
                                        <span style={{ color: '#71717A' }}>{new Date(user.last_location.timestamp).toLocaleTimeString('tr-TR')}</span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ color: '#71717A', fontSize: '14px', padding: '20px', textAlign: 'center' }}>Konum verisi bulunamadı.</div>
                            )}
                        </div>

                        {/* Self Description */}
                        <div>
                            <h3 style={{ color: '#A1A1AA', fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>BENİ TANI (SELF DESCRIPTION)</h3>
                            <div style={{
                                padding: '16px',
                                background: '#27272A',
                                borderRadius: '12px',
                                color: '#E4E4E7',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                fontStyle: 'italic',
                                borderLeft: '4px solid #6366F1'
                            }}>
                                "{user.self_description}"
                            </div>
                        </div>

                    </>
                ) : (
                    <div style={{ color: '#EF4444', textAlign: 'center' }}>Kullanıcı bulunamadı</div>
                )}
            </div>
        </div>
    );
};

export default UserDetailModal;
