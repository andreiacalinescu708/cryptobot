# 🤖 Crypto Trading Bot - Multi-Tenant

Bot de trading multi-tenant pentru Binance cu 5 strategii de trading, dashboard real-time, autentificare JWT și plăți prin Crypto.com.

## ✨ Funcționalități Noi

### 🔐 Multi-Tenant & Auth
- ✅ **JWT Authentication** - Login/Register cu token securizat
- ✅ **Izolare completă** - Fiecare user = tenant separat, datele nu se amestecă
- ✅ **Criptare API Keys** - AES-256 pentru cheile Binance
- ✅ **Protected Routes** - Pagini accesibile doar după autentificare

### 📊 Baza de Date (PostgreSQL)
```
users                    # Tenanți (fiecare user e un tenant)
├── binance_api_keys     # Chei API criptate per tenant
├── strategy_configs     # Configurare strategie per tenant
├── trades               # Istoric tranzacții per tenant
└── payments             # Plăți/abonamente per tenant
```

### 🎯 Strategii de Trading (5 strategii)
1. **RSI Strategy** - Cumpără RSI < 30, Vinde RSI > 70
2. **MACD Strategy** - Crossover MACD/Signal
3. **EMA Cross Strategy** - Golden Cross / Death Cross
4. **Bollinger Bands Strategy** - Mean reversion
5. **Grid Trading Strategy** - Piețe laterale

## 🏗️ Arhitectură Multi-Tenant

```
┌─────────────────────────────────────────────┐
│           Frontend (React)                  │
│     localhost:3002                          │
└──────────────┬──────────────────────────────┘
               │ JWT Token
               ▼
┌─────────────────────────────────────────────┐
│           Backend (FastAPI)                 │
│     localhost:8000                          │
│                                             │
│  ┌─────────────┐    ┌─────────────────┐    │
│  │  Auth API   │───▶│  Tenant Context │    │
│  │  (JWT)      │    │  (user.id)      │    │
│  └─────────────┘    └────────┬────────┘    │
│                              │              │
│  ┌───────────────────────────▼──────────┐  │
│  │      Database (PostgreSQL)           │  │
│  │   - All tables have tenant_id        │  │
│  │   - Queries filtered by tenant_id    │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## 🚀 Instalare & Rulare

### 1. PostgreSQL Setup

```bash
# Windows (cu PostgreSQL instalat)
psql -U postgres -f backend/setup_db.sql

# Sau manual în pgAdmin:
CREATE DATABASE crypto_trading_bot;
```

### 2. Backend Setup

```bash
cd backend

# Creare virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Instalare dependințe
pip install -r requirements.txt

# Copiază și configurează .env
copy .env.example .env
# Editează .env cu datele tale PostgreSQL

# Creare tabele (automată la primul run)
python -c "from app.main import app; from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"

# Rulare server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup

```bash
cd frontend

# Instalare dependințe
npm install

# Rulare development server
npm run dev -- --port 3002
```

### 4. Accesează Aplicația

- **Frontend**: http://localhost:3002
- **API Docs**: http://localhost:8000/docs

## 📡 API Endpoints

### Auth
- `POST /auth/register` - Creare cont
- `POST /auth/login` - Autentificare
- `GET /auth/me` - Info user curent

### API Keys (Protejat)
- `POST /api-keys/binance` - Salvează chei Binance (criptate)
- `GET /api-keys/binance` - Vezi status chei
- `DELETE /api-keys/binance` - Șterge chei

### Strategy Config (Protejat)
- `POST /strategy-config/` - Salvează strategia selectată
- `GET /strategy-config/` - Vezi config
- `POST /strategy-config/activate` - Activează bot
- `POST /strategy-config/deactivate` - Dezactivează bot
- `GET /strategy-config/my-strategy` - Info completă strategie

### Strategies (Public)
- `GET /strategies/available` - Lista tuturor strategiilor

## 🔒 Securitate Multi-Tenant

### Izolare Date
Fiecare query în backend include automat filtrare pe `tenant_id`:

```python
# Exemplu: Userul cu ID=5 vede DOAR datele lui
db.query(StrategyConfig).filter(StrategyConfig.tenant_id == current_user.id)
```

### Criptare API Keys
```python
# Salvare
api_key_encrypted = encrypt_api_key("actual_api_key")
# DB: "gAAAAABk..." (criptat)

# Citire
decrypted = decrypt_api_key(api_key_encrypted)
# Memory: "actual_api_key"
```

### JWT Flow
```
1. Login → Server returnează JWT token
2. Frontend salvează token în localStorage
3. Fiecare request include header: Authorization: Bearer <token>
4. Server decodează token → obține user_id = tenant_id
5. Toate operațiile sunt filtrate pe tenant_id
```

## 📝 Flux Utilizator

1. **Register/Login** → Primește JWT token
2. **Dashboard** → Selectează strategia din dropdown
3. **Salvează Strategia** → Strategia e salvată în DB per tenant
4. **Setări** → Adaugă Binance API Key (criptat)
5. **Activează Bot** → Botul începe trading pe strategia selectată

## 🛠️ Dezvoltare Ulterioară

- [ ] Integrare completă Binance (ordere reale)
- [ ] WebSocket pentru prețuri real-time
- [ ] Plăți Crypto.com Pay
- [ ] Backtesting strategii
- [ ] Notificări Telegram/Email
- [ ] Deploy pe server (Docker)

## 📄 Licență

MIT
