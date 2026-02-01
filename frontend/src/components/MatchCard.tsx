import React from 'react';
import { Heart, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Match {
    id: string;
    name: string;
    age: number;
    bio: string;
    interests: string[];
    distance: number;
    matchScore: number;
    location: {
        latitude: number;
        longitude: number;
    };
    isOnline: boolean;
    photos: string[];
}

const MatchCard: React.FC<{ match: Match; onLike: () => void; onPass: () => void }> = ({
    match,
    onLike,
    onPass
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
            {/* Header with Score */}
            <div className="bg-gradient-to-r from-primary to-secondary p-4">
                <div className="flex items-center justify-between text-white">
                    <div>
                        <h3 className="text-2xl font-bold">{match.name}, {match.age}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <MapPin size={14} />
                            <span className="text-sm opacity-90">{match.distance}m mesafede</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold">{Math.round(match.matchScore * 100)}%</div>
                        <div className="text-xs opacity-80">Uyum</div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Online Status */}
                {match.isOnline && (
                    <div className="flex items-center gap-2 mb-4 text-emerald-500">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="font-medium text-sm">Şu an aktif</span>
                    </div>
                )}

                {/* Bio */}
                <p className="text-neutral-600 mb-4 leading-relaxed">{match.bio}</p>

                {/* Interests */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {match.interests.map(interest => (
                        <span
                            key={interest}
                            className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium"
                        >
                            {interest}
                        </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={onPass}
                        className="flex-1 py-4 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-600 hover:border-neutral-300 transition-all active:scale-95"
                    >
                        Sonra
                    </button>
                    <button
                        onClick={onLike}
                        className="flex-1 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Heart size={20} fill="white" />
                        İlgileniyorum
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default MatchCard;
