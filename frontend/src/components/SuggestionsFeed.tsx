// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, Loader } from 'lucide-react';
import SuggestionCard from './SuggestionCard';
import { API_URL } from '../config/api';

interface SuggestionsFeedProps {
    userId: string;
}

const SuggestionsFeed: React.FC<SuggestionsFeedProps> = ({ userId }) => {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            // In dev mode, we might want to trigger generation first if empty
            const response = await fetch(`${API_URL}/api/suggestions/${userId}`);
            const data = await response.json();
            if (data.suggestions) {
                setSuggestions(data.suggestions);
            }
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateSuggestions = async () => {
        setLoading(true);
        try {
            // Manually trigger generation for demo
            await fetch(`${API_URL}/api/suggestions/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    currentLocation: { latitude: 41.0082, longitude: 28.9784 },
                    currentCategory: 'mahalle'
                })
            });
            await fetchSuggestions();
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSuggestions();
        const interval = setInterval(fetchSuggestions, 120000);
        return () => clearInterval(interval);
    }, [userId]);

    if (suggestions.length === 0 && !loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', opacity: 0.7 }}>
                <div style={{ marginBottom: '12px' }}>
                    <Sparkles size={24} color="#F59E0B" style={{ margin: '0 auto' }} />
                </div>
                <p style={{ color: 'white', fontSize: '14px', marginBottom: '16px' }}>Henüz öneri yok.</p>
                <button
                    onClick={generateSuggestions}
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' }}
                >
                    ✨ AI Önerilerini Çalıştır
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '0 4px' }}>
                <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Sparkles size={18} color="#F59E0B" fill="#F59E0B" />
                    Sana Özel
                </h2>
                <button onClick={fetchSuggestions} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7 }}>
                    <RefreshCw size={16} color="white" className={loading ? 'spin' : ''} />
                </button>
            </div>

            <div>
                {suggestions.map(suggestion => (
                    <SuggestionCard
                        key={suggestion.id}
                        suggestion={suggestion}
                        onAccept={() => console.log('Accepted', suggestion.id)}
                        onReject={() => console.log('Rejected', suggestion.id)}
                    />
                ))}
            </div>

            <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};

export default SuggestionsFeed;
