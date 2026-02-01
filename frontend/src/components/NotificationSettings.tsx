import React, { useState } from 'react';
import { X, Bell, BellOff } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationSettingsProps {
    onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onClose }) => {
    const { permission, requestPermission, preferences, updatePreference } = useNotifications();
    const [loading, setLoading] = useState(false);

    const handleEnableNotifications = async () => {
        setLoading(true);
        try {
            const granted = await requestPermission();

            if (granted) {
                // Hook handles the enable implementation
            } else if (Notification.permission === 'denied') {
                alert('⚠️ Bildirimler tarayıcı ayarlarından engellenmiş.\n\nLütfen adres çubuğundaki kilit simgesine 🔒 tıklayıp "Bildirimler"e izin verin.');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const updateTypePreference = async (type: string, key: string, value: any) => {
        const currentTypes = preferences?.types || {};
        const newTypes = {
            ...currentTypes,
            [type]: {
                ...currentTypes[type],
                [key]: value
            }
        };
        updatePreference('types', newTypes);
    };

    if (!preferences && permission.granted) {
        return <div className="p-6 text-center text-white">Yükleniyor...</div>;
    }

    const notificationTypes = [
        { id: 'proximity', label: '📍 Yakınlık', desc: 'Yakınınızda biri var' },
        { id: 'suggestion', label: '💡 Öneriler', desc: '100m ileride...' },
        { id: 'match', label: '💫 Eşleşme', desc: 'Yeni bir eşleşme' },
        { id: 'reminder', label: '🔔 Hatırlatıcı', desc: '26\'da kahve?' }
    ];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[3000] flex items-center justify-center p-4">
            <div className="bg-white text-gray-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Bildirimler</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Permission Status */}
                    <div className={`rounded-xl p-4 mb-6 border ${permission.denied ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {permission.granted ? (
                                    preferences?.enabled ? (
                                        <Bell className="w-6 h-6 text-green-500" />
                                    ) : (
                                        <BellOff className="w-6 h-6 text-red-500" />
                                    )
                                ) : permission.denied ? (
                                    <BellOff className="w-6 h-6 text-red-500" />
                                ) : (
                                    <BellOff className="w-6 h-6 text-gray-400" />
                                )}
                                <div>
                                    <p className="font-semibold">
                                        {permission.granted
                                            ? (preferences?.enabled ? 'Bildirimler Açık' : 'Bildirimler Kapalı')
                                            : permission.denied ? 'Engellendi' : 'Bildirimler Kapalı'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {permission.granted
                                            ? (preferences?.enabled ? 'Her şey yolunda' : 'Sessiz modundasınız 🔕')
                                            : permission.denied
                                                ? 'Tarayıcı ayarlarından izin verin 🔒'
                                                : 'Kaçırma, aç!'}
                                    </p>
                                </div>
                            </div>

                            {!permission.granted && (
                                <button
                                    onClick={handleEnableNotifications}
                                    disabled={loading}
                                    className={`px-4 py-2 text-white text-sm rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${permission.denied
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : 'bg-purple-600 hover:bg-purple-700'
                                        }`}
                                >
                                    {loading ? '...' : permission.denied ? 'Nasıl Açılır?' : 'Aç'}
                                </button>
                            )}

                            {permission.granted && preferences && (
                                <button
                                    onClick={() => updatePreference('enabled', !preferences.enabled)}
                                    className={`px-4 py-2 text-white text-sm rounded-xl font-semibold transition-colors ${preferences.enabled
                                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                        : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                        }`}
                                >
                                    {preferences.enabled ? 'Sessize Al' : 'Sesi Aç'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Global Settings */}
                    {permission.granted && preferences && (
                        <>
                            {/* Quiet Hours */}
                            <div className="mb-6">
                                <h3 className="font-semibold mb-3 text-gray-700 text-sm uppercase tracking-wider">Sessiz Saatler</h3>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 block mb-1">Başlangıç</label>
                                        <input
                                            type="time"
                                            value={preferences.quietHours?.start || '22:00'}
                                            onChange={(e) => updatePreference('quietHours', {
                                                ...preferences.quietHours,
                                                start: e.target.value
                                            })}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 block mb-1">Bitiş</label>
                                        <input
                                            type="time"
                                            value={preferences.quietHours?.end || '08:00'}
                                            onChange={(e) => updatePreference('quietHours', {
                                                ...preferences.quietHours,
                                                end: e.target.value
                                            })}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Notification Types */}
                            <div>
                                <h3 className="font-semibold mb-3 text-gray-700 text-sm uppercase tracking-wider">Tercihler</h3>
                                <div className="space-y-4">
                                    {notificationTypes.map(type => {
                                        const typePrefs = preferences.types?.[type.id] || {};

                                        return (
                                            <div key={type.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <p className="font-medium text-sm">{type.label}</p>
                                                        <p className="text-xs text-gray-500">{type.desc}</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={typePrefs.enabled !== false}
                                                            onChange={(e) => updateTypePreference(type.id, 'enabled', e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                                    </label>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;
