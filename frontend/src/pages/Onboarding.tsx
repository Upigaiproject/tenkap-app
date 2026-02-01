import { useState } from 'react';
import { Mail, ChevronRight, Loader } from 'lucide-react';
import PhoneVerificationStep from '../components/PhoneVerificationStep';
import { API_URL } from '../config/api';

const Onboarding = ({ onComplete }: { onComplete: () => void }) => {
    const [step, setStep] = useState(1); // 1: Required, 2: Optional, 3: Permissions
    const [loading, setLoading] = useState(false);

    // Required fields
    const [phone, setPhone] = useState('');
    const [username, setUsername] = useState(''); // Added Rumuz
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    const [isPhoneVerified, setIsPhoneVerified] = useState(false);

    // Optional fields
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [bio, setBio] = useState('');

    // Step 2: Complete Registration
    const handleRegister = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone,
                    username, // Added Rumuz
                    firstName,
                    lastName,
                    email,
                    age: age || null,
                    gender: gender || null,
                    bio: bio || null,
                    timestamp: new Date().toISOString()
                })
            });

            const data = await response.json();

            if (data.success) {
                // Save user ID to localStorage
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('userToken', data.token);

                // Move to permissions step
                setStep(3);
            }
        } catch (error) {
            alert('Kayıt başarısız');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Request Permissions
    const requestPermissions = async () => {
        // Location
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                () => console.log('Location granted'),
                () => alert('Konum izni gerekli')
            );
        }

        // Notifications
        if ('Notification' in window) {
            await Notification.requestPermission();
        }

        // Complete onboarding
        onComplete();
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                maxWidth: '480px',
                width: '100%',
                padding: '40px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{
                        fontSize: '48px',
                        marginBottom: '8px'
                    }}>
                        📍
                    </h1>
                    <h2 style={{
                        fontSize: '28px',
                        fontWeight: 700,
                        color: '#18181B',
                        marginBottom: '8px'
                    }}>
                        TENKAP'a Hoşgeldin
                    </h2>
                    <p style={{
                        fontSize: '15px',
                        color: '#71717A'
                    }}>
                        {step === 1 && 'Hemen başlayalım (30 saniye)'}
                        {step === 2 && 'İsteğe bağlı bilgiler'}
                        {step === 3 && 'Son adım: İzinler'}
                    </p>
                </div>

                {/* Progress Bar */}
                <div style={{
                    height: '4px',
                    background: '#E4E4E7',
                    borderRadius: '2px',
                    marginBottom: '32px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                        width: `${(step / 3) * 100}%`,
                        transition: 'width 0.3s ease'
                    }} />
                </div>

                {/* STEP 1: PERSONAL DETAILS */}
                {step === 1 && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        {/* Username (Rumuz) - REQUIRED */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#18181B',
                                marginBottom: '8px'
                            }}>
                                Rumuz *
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Lakabın ne?"
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    border: '2px solid #E4E4E7',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    outline: 'none',
                                    color: '#000000'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                                onBlur={(e) => e.target.style.borderColor = '#E4E4E7'}
                            />
                        </div>

                        {/* Phone Verification Component */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#18181B',
                                marginBottom: '8px'
                            }}>
                                Telefon Doğrulama (Opsiyonel)
                            </label>

                            {!isPhoneVerified ? (
                                <div style={{
                                    border: '2px solid #E4E4E7',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    background: '#FAFAFA'
                                }}>
                                    <PhoneVerificationStep onVerified={(verifiedPhone) => {
                                        setPhone(verifiedPhone);
                                        setIsPhoneVerified(true);
                                    }} />
                                </div>
                            ) : (
                                <div style={{
                                    padding: '16px',
                                    background: '#ECFDF5',
                                    border: '1px solid #10B981',
                                    borderRadius: '12px',
                                    color: '#047857',
                                    fontSize: '15px',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        background: '#10B981',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '14px'
                                    }}>✓</div>
                                    {phone} başarıyla doğrulandı
                                </div>
                            )}
                        </div>

                        {/* First Name */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#18181B',
                                marginBottom: '8px'
                            }}>
                                Ad (Opsiyonel)
                            </label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Adın"
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    border: '2px solid #E4E4E7',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    outline: 'none',
                                    color: '#000000'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                                onBlur={(e) => e.target.style.borderColor = '#E4E4E7'}
                            />
                        </div>

                        {/* Last Name */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#18181B',
                                marginBottom: '8px'
                            }}>
                                Soyad (Opsiyonel)
                            </label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Soyadın"
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    border: '2px solid #E4E4E7',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    outline: 'none',
                                    color: '#000000'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                                onBlur={(e) => e.target.style.borderColor = '#E4E4E7'}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#18181B',
                                marginBottom: '8px'
                            }}>
                                E-posta (Opsiyonel)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={20} color="#71717A" style={{
                                    position: 'absolute',
                                    left: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ornek@email.com"
                                    style={{
                                        width: '100%',
                                        padding: '14px 14px 14px 48px',
                                        border: '2px solid #E4E4E7',
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        outline: 'none',
                                        color: '#000000'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                                    onBlur={(e) => e.target.style.borderColor = '#E4E4E7'}
                                />
                            </div>
                        </div>

                        {/* Continue Button */}
                        <button
                            onClick={() => setStep(2)}
                            disabled={!username}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: username
                                    ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                                    : '#E4E4E7',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: username ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                marginTop: '8px'
                            }}
                        >
                            Devam Et
                            <ChevronRight size={20} />
                        </button>

                        <p style={{
                            fontSize: '12px',
                            color: '#71717A',
                            textAlign: 'center',
                            marginTop: '8px'
                        }}>
                            * Zorunlu alan sadece Rumuz
                        </p>
                    </div>
                )}

                {/* STEP 2: OPTIONAL FIELDS */}
                {step === 2 && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        <p style={{
                            fontSize: '14px',
                            color: '#71717A',
                            textAlign: 'center',
                            marginBottom: '8px'
                        }}>
                            Bu bilgileri daha sonra da ekleyebilirsin
                        </p>

                        {/* Age */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#18181B',
                                marginBottom: '8px'
                            }}>
                                Yaş (opsiyonel)
                            </label>
                            <input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                placeholder="25"
                                min="18"
                                max="99"
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    border: '2px solid #E4E4E7',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    outline: 'none',
                                    color: '#000000'
                                }}
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#18181B',
                                marginBottom: '8px'
                            }}>
                                Cinsiyet (opsiyonel)
                            </label>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '8px'
                            }}>
                                {['Kadın', 'Erkek', 'Diğer'].map(g => (
                                    <button
                                        key={g}
                                        onClick={() => setGender(g)}
                                        style={{
                                            padding: '12px',
                                            background: gender === g ? '#6366F1' : '#F4F4F5',
                                            color: gender === g ? 'white' : '#52525B',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#18181B',
                                marginBottom: '8px'
                            }}>
                                Hakkında (opsiyonel)
                            </label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Kendini kısaca tanımla..."
                                maxLength={150}
                                style={{
                                    width: '100%',
                                    height: '100px',
                                    padding: '14px',
                                    border: '2px solid #E4E4E7',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    resize: 'none',
                                    outline: 'none',
                                    fontFamily: 'inherit',
                                    color: '#000000'
                                }}
                            />
                            <p style={{
                                fontSize: '12px',
                                color: '#71717A',
                                textAlign: 'right',
                                marginTop: '4px'
                            }}>
                                {bio.length}/150
                            </p>
                        </div>

                        {/* Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            marginTop: '8px'
                        }}>
                            <button
                                onClick={handleRegister}
                                style={{
                                    flex: 1,
                                    padding: '16px',
                                    background: 'transparent',
                                    color: '#71717A',
                                    border: '2px solid #E4E4E7',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Atla
                            </button>
                            <button
                                onClick={handleRegister}
                                disabled={loading}
                                style={{
                                    flex: 2,
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    cursor: loading ? 'wait' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                {loading ? <Loader size={20} className="spin" /> : 'Kaydet & Devam'}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: PERMISSIONS */}
                {step === 3 && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 24px',
                            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '40px'
                        }}>
                            📍
                        </div>

                        <h3 style={{
                            fontSize: '24px',
                            fontWeight: 700,
                            color: '#18181B',
                            marginBottom: '12px'
                        }}>
                            Son Bir Adım
                        </h3>

                        <p style={{
                            fontSize: '15px',
                            color: '#71717A',
                            marginBottom: '32px',
                            lineHeight: '1.6'
                        }}>
                            Yakınındaki kişileri bulmak için<br />
                            <strong>konum</strong> ve <strong>bildirim</strong> izni gerekli
                        </p>

                        <button
                            onClick={requestPermissions}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            İzin Ver & Başla
                        </button>

                        <p style={{
                            fontSize: '12px',
                            color: '#71717A',
                            marginTop: '16px',
                            lineHeight: '1.5'
                        }}>
                            🔒 Bilgilerin güvende. İstediğin zaman çıkabilirsin.
                        </p>
                    </div>
                )}
            </div>

            {/* Loading Spinner CSS */}
            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default Onboarding;
