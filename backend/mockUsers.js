// Turkish Names Database (Gender-appropriate)
const TURKISH_NAMES = {
    male: [
        'Ahmet', 'Mehmet', 'Mustafa', 'Ali', 'Hüseyin', 'Can', 'Cem', 'Deniz',
        'Emre', 'Kaan', 'Burak', 'Oğuz', 'Serkan', 'Murat', 'Onur', 'Barış'
    ],
    female: [
        'Ayşe', 'Fatma', 'Zeynep', 'Elif', 'Merve', 'Selin', 'Defne', 'Ece',
        'Duygu', 'Bengü', 'Ceren', 'İrem', 'Damla', 'Pınar', 'Aslı', 'Nazlı'
    ]
};

// Interest Tags (High-frequency)
const INTERESTS = [
    'Müzik', 'Kahve', 'Sanat', 'Spor', 'Teknoloji', 'Fotoğraf', 'Seyahat',
    'Kitap', 'Sinema', 'Yoga', 'Koşu', 'DJ', 'Gitar', 'Resim', 'Tasarım',
    'Gastronomi', 'Tarih', 'Dans', 'Tiyatro', 'Podcast'
];

// Location Clusters (Istanbul)
const LOCATION_CLUSTERS = {
    kadikoy: {
        center: [29.0296, 40.9902],
        radius: 1000, // meters
        hotspots: [
            { name: 'Moda Parkı', coords: [29.0265, 40.9868] },
            { name: 'Kadıköy Çarşı', coords: [29.0310, 40.9903] },
            { name: 'Bahariye Caddesi', coords: [29.0288, 40.9889] }
        ]
    },
    besiktas: {
        center: [29.0050, 41.0420],
        radius: 1000,
        hotspots: [
            { name: 'Ortaköy', coords: [29.0274, 41.0550] },
            { name: 'Beşiktaş İskelesi', coords: [29.0059, 41.0422] }
        ]
    },
    taksim: {
        center: [28.9872, 41.0370],
        radius: 1200,
        hotspots: [
            { name: 'İstiklal Caddesi', coords: [28.9779, 41.0334] },
            { name: 'Galata Kulesi', coords: [28.9741, 41.0256] }
        ]
    }
};

// Generate Realistic Fake User
function generateFakeUser(userLocation, options = {}) {
    const {
        maxDistance = 1000, // meters
        minMatchScore = 0.6,
        gender = Math.random() > 0.5 ? 'male' : 'female'
    } = options;

    // Pick random name
    const name = TURKISH_NAMES[gender][Math.floor(Math.random() * TURKISH_NAMES[gender].length)];

    // Age distribution (Skewed towards 24-32, realistic for dating apps)
    const age = Math.floor(normalRandom(27, 4, 22, 38));

    // Pick 3-5 interests
    const interestCount = Math.floor(Math.random() * 3) + 3;
    const interests = [];
    while (interests.length < interestCount) {
        const interest = INTERESTS[Math.floor(Math.random() * INTERESTS.length)];
        if (!interests.includes(interest)) interests.push(interest);
    }

    // Generate location near user (but not too close)
    const distance = Math.random() * maxDistance + 50; // 50m minimum
    const angle = Math.random() * 2 * Math.PI;
    const [userLng, userLat] = userLocation;

    const deltaLat = (distance * Math.cos(angle)) / 111320; // 1 degree lat ≈ 111km
    const deltaLng = (distance * Math.sin(angle)) / (111320 * Math.cos(userLat * Math.PI / 180));

    const fakeLat = userLat + deltaLat;
    const fakeLng = userLng + deltaLng;

    // Generate match score (weighted by shared interests)
    const matchScore = Math.random() * (1 - minMatchScore) + minMatchScore;

    // Bio generation (based on interests)
    const bioTemplates = [
        `${interests[0]} tutkunu. ${interests[1]} seviyorum.`,
        `${interests[0]} ve ${interests[1]} hayatımın vazgeçilmezi.`,
        `Hafta sonları ${interests[0]}, hafta içi ${interests[1]}.`,
    ];
    const bio = bioTemplates[Math.floor(Math.random() * bioTemplates.length)];

    return {
        id: `fake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.charAt(0) + '.', // Privacy: Only initial
        age,
        gender,
        bio,
        interests,
        location: {
            latitude: fakeLat,
            longitude: fakeLng
        },
        distance: Math.round(distance),
        matchScore: Math.round(matchScore * 100) / 100,
        lastSeen: new Date(Date.now() - Math.random() * 600000).toISOString(), // Within last 10min
        isOnline: Math.random() > 0.7
    };
}

// Normal distribution random (for realistic age distribution)
function normalRandom(mean, stdDev, min, max) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();

    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    num = num * stdDev + mean;

    return Math.max(min, Math.min(max, num));
}

module.exports = {
    generateFakeUser,
    LOCATION_CLUSTERS,
    INTERESTS
};
