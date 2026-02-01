import React, { useEffect, useState } from 'react';
import { useNFCProximity } from '../hooks/useNFCProximity';
import { useGPSProximity } from '../hooks/useGPSProximity';
import { Radar, Smartphone, MapPin, Zap, ChevronDown } from 'lucide-react';

const ProximityDetector: React.FC = () => {
    const {
        hasNFC,
        isScanning,
        proximityEvents,
        startNFCScanning
    } = useNFCProximity();

    const {
        isTracking,
        startGPSTracking
    } = useGPSProximity();

    const [mode, setMode] = useState<'auto' | 'nfc-only' | 'gps-only'>('auto');
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // Auto-start based on availability
        if (mode === 'auto') {
            if (hasNFC) {
                startNFCScanning();
            }
            startGPSTracking();
        } else if (mode === 'nfc-only' && hasNFC) {
            startNFCScanning();
        } else if (mode === 'gps-only') {
            startGPSTracking();
        }
    }, [mode, hasNFC, startNFCScanning, startGPSTracking]);

    return (
        <div className={`fixed transition-all duration-300 ease-in-out z-50 ${isExpanded ? 'bottom-20 left-4 right-4' : 'bottom-6 right-4'}`}>

            {/* Minimized State (Floating Action Button) */}
            {!isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="bg-purple-600/90 hover:bg-purple-500 backdrop-blur-xl border border-white/20 p-4 rounded-full shadow-2xl animate-bounce-slow flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                >
                    <div className={`relative ${isScanning || isTracking ? 'animate-pulse' : ''}`}>
                        <Radar className="w-6 h-6 text-white" />
                        {(isScanning || isTracking) && (
                            <div className="absolute inset-0 animate-ping">
                                <Radar className="w-6 h-6 text-white opacity-50" />
                            </div>
                        )}
                    </div>
                    {proximityEvents.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold border border-white/20">
                            {proximityEvents.length}
                        </span>
                    )}
                </button>
            )}

            {/* Expanded Card */}
            {isExpanded && (
                <div className="bg-black/80 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl relative animate-in slide-in-from-bottom-10 fade-in duration-300">
                    {/* Minimize Button */}
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="absolute top-4 right-4 text-white/40 hover:text-white p-2"
                    >
                        <ChevronDown className="w-5 h-5" />
                    </button>

                    {/* Status Header */}
                    <div className="flex items-center justify-between mb-4 pr-8">
                        <div className="flex items-center gap-3">
                            <div className={`relative ${isScanning || isTracking ? 'animate-pulse' : ''}`}>
                                <Radar className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm">
                                    God Mode Radar
                                </p>
                                <p className="text-white/60 text-xs">
                                    {hasNFC ? 'NFC + GPS' : 'GPS Active'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mode Selector */}
                    <div className="flex items-center gap-2 mb-4 bg-white/5 p-1 rounded-xl">
                        <select
                            value={mode}
                            onChange={(e) => setMode(e.target.value as any)}
                            className="bg-transparent text-white text-xs px-2 py-1 outline-none w-full"
                        >
                            <option value="auto" className="bg-gray-900">Otomatik (Önerilen)</option>
                            {hasNFC && <option value="nfc-only" className="bg-gray-900">Sadece NFC</option>}
                            <option value="gps-only" className="bg-gray-900">Sadece GPS</option>
                        </select>
                    </div>

                    {/* Active Method Indicator */}
                    <div className="flex gap-2 mb-4">
                        {hasNFC && isScanning && (
                            <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-1.5 rounded-xl flex-1 justify-center">
                                <Smartphone className="w-4 h-4 text-blue-400" />
                                <span className="text-blue-400 text-xs font-medium">NFC</span>
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                            </div>
                        )}

                        {isTracking && (
                            <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1.5 rounded-xl flex-1 justify-center">
                                <MapPin className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 text-xs font-medium">GPS</span>
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            </div>
                        )}
                    </div>

                    {/* Recent Proximity Events */}
                    {proximityEvents.length > 0 ? (
                        <div className="mt-4 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                            <p className="text-white/80 text-xs font-medium mb-2 sticky top-0 bg-black/50 backdrop-blur p-1 z-10 flex items-center gap-2">
                                <Zap className="w-3 h-3 text-yellow-400" />
                                Yakın Zamanlı Tesadüfler
                            </p>
                            {proximityEvents.slice().reverse().slice(0, 5).map((event, index) => (
                                <div
                                    key={index}
                                    className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-3 rounded-xl border border-purple-500/30 transition-all hover:bg-white/5"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white text-sm font-bold tracking-wide">
                                                {event.distance.toFixed(0)}m
                                            </span>
                                            <span className="text-white/40 text-xs">mesafede</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-white/60 text-[10px]">
                                                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="text-white/30 text-[10px] uppercase">
                                                {event.method}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-4 py-6 text-center border-t border-white/5 bg-white/5 rounded-xl">
                            <Radar className="w-8 h-8 text-white/10 mx-auto mb-2" />
                            <p className="text-white/30 text-xs">Henüz kimseyle karşılaşmadın.</p>
                            <p className="text-white/20 text-[10px] mt-1">Hareket etmeye başla...</p>
                        </div>
                    )}

                    {/* Debug Info */}
                    <div className="mt-4 pt-2 border-t border-white/5 text-center">
                        <p className="text-white/20 text-[10px] font-mono">
                            v3.1 HTTPS • Radius: 2km
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProximityDetector;
