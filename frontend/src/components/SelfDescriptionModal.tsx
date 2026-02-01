import React, { useState } from 'react';
import { User, X, Save } from 'lucide-react';

interface SelfDescriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (description: string) => void;
}

import { API_URL } from '../config/api';

const SelfDescriptionModal: React.FC<SelfDescriptionModalProps> = ({ isOpen, onClose, onSave }) => {
    const [description, setDescription] = useState('');
    const [examples] = useState([
        'Kırmızı şapka giyiyorum',
        'Siyah sırt çantalı',
        'Mavi kot ceketli',
        'Beyaz spor ayakkabılı',
        'Kahverengi deri çantalı',
        'Gri sweatshirt'
    ]);

    const handleSave = async () => {
        if (!description.trim()) return;

        try {
            const userId = localStorage.getItem('userId');
            await fetch(`${API_URL}/api/user/self-description`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    description,
                    timestamp: new Date().toISOString()
                })
            });

            onSave(description);
            onClose();
        } catch (error) {
            console.error('Failed to save description:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)', borderRadius: '24px', maxWidth: '500px', width: '100%', padding: '32px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}>
                    <X size={24} color="#71717A" />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={24} color="white" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#18181B', margin: 0 }}>Beni Nasıl Tanırsın?</h2>
                        <p style={{ fontSize: '14px', color: '#71717A', margin: 0 }}>Kendini kısaca tanımla</p>
                    </div>
                </div>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Örnek: Kırmızı şapka giyiyorum"
                    maxLength={100}
                    style={{ width: '100%', height: '120px', padding: '16px', border: '2px solid #E4E4E7', borderRadius: '12px', fontSize: '16px', fontFamily: 'inherit', resize: 'none', marginBottom: '16px', outline: 'none', color: '#000000' }}
                />
                <p style={{ fontSize: '13px', color: '#71717A', marginBottom: '20px', textAlign: 'right' }}>{description.length}/100 karakter</p>
                <div style={{ marginBottom: '24px' }}>
                    <p style={{ fontSize: '13px', color: '#71717A', marginBottom: '12px', fontWeight: 600 }}>Örnekler:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {examples.map((example, index) => (
                            <button key={index} onClick={() => setDescription(example)} style={{ padding: '8px 12px', background: '#F4F4F5', border: '1px solid #E4E4E7', borderRadius: '8px', fontSize: '13px', color: '#52525B', cursor: 'pointer' }}>{example}</button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!description.trim()}
                    style={{ width: '100%', padding: '16px', background: description.trim() ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : '#E4E4E7', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: description.trim() ? 'pointer' : 'not-allowed' }}
                >
                    <Save size={20} /> Kaydet
                </button>
            </div>
        </div>
    );
};

export default SelfDescriptionModal;
