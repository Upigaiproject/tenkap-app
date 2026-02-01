# TENKAP - Organik Buluşma Platformu 🚀

Tenkap, geleneksel arkadaşlık uygulamalarının yarattığı sosyal damgalamayı ortadan kaldıran, yapay zeka destekli ve konum tabanlı bir tanışma platformudur. "Tesadüf" süsü verilmiş, ancak AI tarafından titizlikle hesaplanmış organik karşılaşmalar kurgular.

## 🏗️ Proje Mimarisi

Bu repo 3 ana bileşenden oluşur:

1.  **`/frontend`**: React 18, TypeScript, Tailwind CSS, Mapbox. (PWA)
2.  **`/backend`**: Node.js, Express, PostgreSQL (PostGIS), Redis.
3.  **`/ai`**: Python, FastAPI, Scikit-learn (Nudge & Eşleşme Motoru).

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v20+)
- Python (v3.10+)
- PostgreSQL (PostGIS eklentisi ile)
- Redis

### 1. Backend Kurulumu
```bash
cd backend
npm install
# PostgreSQL veritabanını oluşturun ve .env dosyasını düzenleyin
# Şema kurulumu:
psql -U postgres -d tenkap -f schema.sql
# Sunucuyu başlatın:
node server.js
```

### 2. Frontend Kurulumu
```bash
cd frontend
npm install
npm run dev
```

### 3. AI Microservice Kurulumu
```bash
cd ai
pip install -r requirements.txt
uvicorn nudge_generator:app --reload --port 8000
```

## 🔐 Çevresel Değişkenler (.env)

`/backend/.env` örneği:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/tenkap
REDIS_URL=redis://localhost:6379
MAPBOX_TOKEN=pk.your_token_here
```

## 📱 Özellikler (MVP)
- **Onboarding**: Telefon doğrulama ve profil oluşturma.
- **Konum Takibi**: Arka planda konum güncelleme ve hareket analizi.
- **Akıllı Nudge**: "Kahve molası", "Keşfet" gibi yapay zeka önerileri.
- **Isı Haritası**: Popüler lokasyonların görselleştirilmesi.

---
**Tenkap Dev Team** | Gemini 3 Pro (Anti-Gravity)
