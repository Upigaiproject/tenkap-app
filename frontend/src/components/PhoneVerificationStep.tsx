import React, { useState } from 'react';
import { Phone, Loader } from 'lucide-react';
import { API_URL } from '../config/api';

const PhoneVerificationStep: React.FC<{ onVerified: (phone: string) => void }> = ({ onVerified }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendCode = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/sms/send-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send code');
            }

            setCodeSent(true);
            // Helpful for dev:
            if (data.mockCode) {
                console.log('DEV: Mock Code received:', data.mockCode);
                alert(`DEV MODE: Your code is ${data.mockCode}`);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/sms/verify-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber, code })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Invalid code');
            }

            onVerified(phoneNumber);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {!codeSent ? (
                <>
                    <div>
                        <label className="block text-white font-medium mb-2">
                            Telefon Numaranız
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="0555 123 45 67"
                                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <p className="text-white/60 text-sm mt-2">
                            Size bir doğrulama kodu göndereceğiz
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleSendCode}
                        disabled={loading || !phoneNumber}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-semibold hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader className="w-5 h-5 animate-spin" />}
                        {loading ? 'Gönderiliyor...' : 'Kod Gönder'}
                    </button>
                </>
            ) : (
                <>
                    <div>
                        <label className="block text-white font-medium mb-2">
                            Doğrulama Kodu
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="6 haneli kod"
                            maxLength={6}
                            className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white text-center text-2xl tracking-widest placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <p className="text-white/60 text-sm mt-2">
                            {phoneNumber} numarasına gönderilen kodu girin
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleVerifyCode}
                        disabled={loading || code.length !== 6}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-semibold hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader className="w-5 h-5 animate-spin" />}
                        {loading ? 'Doğrulanıyor...' : 'Doğrula'}
                    </button>

                    <button
                        onClick={() => {
                            setCodeSent(false);
                            setCode('');
                            setError('');
                        }}
                        className="w-full py-3 text-white/80 hover:text-white transition-colors"
                    >
                        Farklı numara kullan
                    </button>
                </>
            )}
        </div>
    );
};

export default PhoneVerificationStep;
