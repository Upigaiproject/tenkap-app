const fs = require('fs');
const path = require('path');

// Location data
const locations = [
    { lat: 41.0422, lng: 29.0075, district: "Beşiktaş", place: "Starbucks Beşiktaş" },
    { lat: 41.0552, lng: 29.0275, district: "Ortaköy", place: "Ortaköy Sahili" },
    { lat: 41.0323, lng: 28.9838, district: "Cihangir", place: "Kahve 6" },
    { lat: 41.0468, lng: 28.9918, district: "Nişantaşı", place: "City's Nişantaşı" },
    { lat: 41.0778, lng: 29.0238, district: "Etiler", place: "Zorlu Center" },
    { lat: 41.0257, lng: 28.9744, district: "Galata", place: "Galata Kulesi" },
    { lat: 41.0602, lng: 28.9870, district: "Şişli", place: "Cevahir AVM" },
    { lat: 40.9901, lng: 29.0258, district: "Kadıköy", place: "Kadıköy Çarşı" },
    { lat: 40.9837, lng: 29.0325, district: "Moda", place: "Moda Sahili" },
    { lat: 40.9645, lng: 29.0958, district: "Suadiye", place: "Bağdat Caddesi" },
    { lat: 41.0221, lng: 29.0144, district: "Üsküdar", place: "Kız Kulesi" },
    { lat: 40.9857, lng: 29.0458, district: "Acıbadem", place: "Acıbadem Parkı" }
];

const femaleNames = [
    "Elif", "Zeynep", "Ayşe", "Esra", "Selin", "Defne", "Ece", "Nil",
    "Aslı", "Pınar", "Ebru", "Ceren", "Burcu", "İpek", "Damla", "Naz",
    "Derin", "Özge", "Melis", "Yasemin"
];

const maleNames = [
    "Can", "Efe", "Deniz", "Mert", "Kerem", "Berk", "Arda", "Kaan",
    "Emre", "Burak", "Alp", "Onur", "Barış", "Tolga", "Serkan", "Ozan",
    "Çağlar", "Emir", "Eren", "Utku"
];

const bios = [
    "Hafta sonları dağda, hafta içi ofiste 🏔️ Kahve bağımlısıyım ☕",
    "Seyahat etmeyi, yeni yerler keşfetmeyi seviyorum ✈️ Bi kahve içelim?",
    "Deniz > Dağ. Tartışmaya açık değilim 🌊",
    "İyi yemek, güzel sohbet, kaliteli müzik 🎵 Başka ne lazım ki?",
    "Brunch yapılmaz, yaşanır 🥂 Kadıköy'ün en iyi mekanlarını bilirim",
    "Mutfakta deney yapmayı seviyorum. Deneme tahtası arıyorum 👨🍳",
    "Mimarlık & sanat 🎨 Hafta sonu galeri gezmeye ne dersin?",
    "Gitar çalıyorum, şarkı yazıyorum 🎸 Indie rock severim",
    "Fotoğraf çekmeyi seviyorum 📸 En iyi günbatımını gösteririm",
    "Hayat kısa, kahvesi uzun olsun ☕ Moda'da sunset?",
    "Köpeklerle aram iyi 🐕 Seninkiyle tanışalım",
    "Yoga, kitap, sinema. Klasik ama işe yarıyor 🧘♀️",
    "Startup dünyasından birine. Coding & coffee ☕💻",
    "Hukuk okuyorum ⚖️ Tartışmayı severim (ama dostane)",
    "Finans & fitness. Hem mental hem physical 💪📈",
    "Kötü şarkı sözlerini ezberleme yeteneğim var 🎤",
    "Netflix'te ne izleyelim tartışmasını bitirmek için buradayım",
    "Kedilere aşırı ilgi gösteriyorsam özür dilerim 🐱",
    "Plansız gidilenler hep daha eğlenceli oluyor 🎉",
    "Gece 2'de lokma yiyelim mi diye soracak birini arıyorum 🌃"
];

const allInterests = [
    "Yoga", "Fitness", "Koşu", "Yüzme", "Bisiklet", "Yürüyüş", "Kamp",
    "Kahve", "Brunch", "Wine", "Mutfak", "Veganlık", "Gastronomi",
    "Sinema", "Müzik", "Konser", "Tiyatro", "Sanat", "Fotoğrafçılık",
    "Müze", "Edebiyat", "Kitap", "Podcast", "Seyahat", "Gezi",
    "Festival", "Sosyalleşme", "Dil öğrenme", "Girişimcilik",
    "Teknoloji", "Tasarım", "Mimarlık", "Yazılım", "Gitar",
    "Piyano", "Resim", "Dans", "Satranç", "Oyun"
];

// Helper functions
const randomItem = (array) => array[Math.floor(Math.random() * array.length)];
const randomItems = (array, count) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const generateMatchScore = () => {
    const rand = Math.random();
    if (rand < 0.1) return +(0.90 + Math.random() * 0.05).toFixed(2);
    if (rand < 0.7) return +(0.70 + Math.random() * 0.15).toFixed(2);
    return +(0.60 + Math.random() * 0.10).toFixed(2);
};

const generateDistance = () => {
    const rand = Math.random();
    if (rand < 0.3) return Math.floor(100 + Math.random() * 400);
    if (rand < 0.7) return Math.floor(500 + Math.random() * 1500);
    return Math.floor(2000 + Math.random() * 3000);
};

const generateGender = () => {
    const rand = Math.random();
    if (rand < 0.48) return "female";
    if (rand < 0.96) return "male";
    return "non-binary";
};

const generateAge = () => Math.floor(22 + Math.random() * 17); // 22-38

const generateTimestamp = () => {
    const now = new Date();
    const hoursAgo = Math.floor(Math.random() * 48); // Last 48 hours
    return new Date(now - hoursAgo * 60 * 60 * 1000).toISOString();
};

// Main generator
const generateFakeUsers = (count = 30) => {
    const users = [];

    for (let i = 0; i < count; i++) {
        const gender = generateGender();
        const namePool = gender === "female" ? femaleNames : maleNames;
        const name = randomItem(namePool);
        const location = randomItem(locations);
        const age = generateAge();
        const photoSeed = Math.floor(Math.random() * 70) + 1;

        const user = {
            id: `fake_user_${Date.now()}_${i}`,
            name: name,
            age: age,
            gender: gender,
            bio: randomItem(bios),
            interests: randomItems(allInterests, 3 + Math.floor(Math.random() * 3)), // 3-5 interests
            photos: [
                `https://i.pravatar.cc/400?img=${photoSeed}`,
                `https://i.pravatar.cc/400?img=${photoSeed + 1}`,
                `https://i.pravatar.cc/400?img=${photoSeed + 2}`
            ],
            location: {
                latitude: location.lat + (Math.random() - 0.5) * 0.01, // Add slight variation
                longitude: location.lng + (Math.random() - 0.5) * 0.01,
                district: location.district,
                place_name: location.place
            },
            match_score: generateMatchScore(),
            distance_meters: generateDistance(),
            last_active: generateTimestamp(),
            is_online: Math.random() < 0.3, // 30% online
            profile_completion: +(0.75 + Math.random() * 0.25).toFixed(2), // 0.75-1.0
            created_at: new Date().toISOString()
        };

        users.push(user);
    }

    return users;
};

// Generate and save
const fakeUsers = generateFakeUsers(30);

// Save to JSON file
const outputPath = path.join(__dirname, '../data/fakeUsers.json');
fs.writeFileSync(outputPath, JSON.stringify(fakeUsers, null, 2), 'utf-8');

console.log(`✅ Generated ${fakeUsers.length} fake users`);
console.log(`📁 Saved to: ${outputPath}`);

// Print sample
console.log('\n📊 Sample User:');
console.log(JSON.stringify(fakeUsers[0], null, 2));

module.exports = { generateFakeUsers, fakeUsers };
