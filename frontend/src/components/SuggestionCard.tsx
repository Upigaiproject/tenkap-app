import React from 'react';
import { MapPin, Clock, User, TrendingUp, Sparkles, X, Check } from 'lucide-react';

interface Suggestion {
    id: string;
    type: 'location' | 'timing' | 'person' | 'category' | 'proximity';
    location?: { latitude: number; longitude: number; distance: number };
    timing?: { hour: number };
    person?: { userId: string; name: string };
    confidence: number;
    reasoning: string;
    status: string;
    expiresAt?: string;
}

interface SuggestionCardProps {
    suggestion: Suggestion;
    onAccept: () => void;
    onReject: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
    suggestion,
    onAccept,
    onReject
}) => {

    const getIcon = () => {
        switch (suggestion.type) {
            case 'location': case 'proximity': return <MapPin className="w-5 h-5" />;
            case 'timing': return <Clock className="w-5 h-5" />;
            case 'person': return <User className="w-5 h-5" />;
            case 'category': return <TrendingUp className="w-5 h-5" />;
            default: return <Sparkles className="w-5 h-5" />;
        }
    };

    const getGradient = () => {
        const gradients = {
            location: 'from-blue-500 to-cyan-500',
            proximity: 'from-blue-500 to-cyan-500',
            timing: 'from-purple-500 to-pink-500',
            person: 'from-orange-500 to-red-500',
            category: 'from-green-500 to-emerald-500'
        };
        return gradients[suggestion.type] || 'from-gray-500 to-gray-600';
    };

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            marginBottom: '16px',
            animation: 'fadeIn 0.5s ease-out'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        padding: '8px',
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, ${suggestion.type === 'timing' ? '#8B5CF6, #EC4899' : '#3B82F6, #06B6D4'})`, // Fallback for vanilla CSS
                        color: 'white'
                    }}>
                        {getIcon()}
                    </div>
                    <div>
                        <p style={{ color: 'white', fontWeight: 600, fontSize: '14px', margin: 0 }}>
                            {suggestion.type === 'location' && '📍 Yakınında'}
                            {suggestion.type === 'proximity' && '📍 Yakınında'}
                            {suggestion.type === 'timing' && '⏰ Alışkanlık'}
                            {suggestion.type === 'person' && '👤 Benzer Kişi'}
                            {suggestion.type === 'category' && '✨ Sıradaki'}
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 }}>
                            {Math.round(suggestion.confidence * 100)}% Eşleşme
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{ marginBottom: '16px' }}>
                <p style={{ color: 'white', fontSize: '16px', fontWeight: 500, margin: '0 0 8px 0' }}>
                    {suggestion.reasoning}
                </p>

                {/* Helper info */}
                {suggestion.location && (
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} /> {suggestion.location.distance}m mesafe
                    </div>
                )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    onClick={onReject}
                    style={{
                        flex: 1,
                        padding: '10px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: 'rgba(255,255,255,0.7)',
                        cursor: 'pointer'
                    }}
                >
                    Şimdi Değil
                </button>
                <button
                    onClick={onAccept}
                    style={{
                        flex: 1,
                        padding: '10px',
                        background: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'black',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    {suggestion.type === 'location' || suggestion.type === 'proximity' ? '👀 İncele' : '✨ Tamam'}
                </button>
            </div>
        </div>
    );
};

export default SuggestionCard;
