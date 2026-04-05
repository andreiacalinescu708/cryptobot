# 🚀 Deploy pe Railway

Ghid complet pentru deploy-ul aplicației pe Railway.

## 📋 Pre-requisiti

1. Cont Railway: https://railway.app
2. Cont GitHub cu codul push-at
3. Railway CLI (opțional): `npm install -g @railway/cli`

## 🚀 Pasul 1: Creare Proiect Railway

### 1.1 Creare Proiect Nou
1. Loghează-te în Railway: https://railway.app/dashboard
2. Click **"New Project"**
3. Selectează **"Deploy from GitHub repo"**
4. Alege repository-ul tău `crypto-trading-bot`

### 1.2 Adăugare PostgreSQL Database
1. În proiectul Railway, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway va crea automat variabila `DATABASE_URL`

## 🔐 Pasul 2: Environment Variables

În Railway Dashboard → Project → Variables, adaugă:

### Required Variables

```bash
# Security - GENEREAZĂ CHEI PUTERNICE!
SECRET_KEY=your-super-secret-random-key-min-32-chars
ENCRYPTION_KEY=your-encryption-key-32bytes-long!!

# Database (Railway o setează automat pe PostgreSQL)
# DATABASE_URL=postgresql://... (auto-set by Railway)

# Frontend URL (după ce deploy-ezi frontend-ul)
FRONTEND_URL=https://your-frontend-url.vercel.app

# App Settings
DEBUG=False
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Generare Chei Secrete

Rulează în Python pentru a genera chei sigure:

```python
import secrets

# SECRET_KEY (64 caractere)
print("SECRET_KEY:", secrets.token_urlsafe(48))

# ENCRYPTION_KEY (32 bytes = 44 caractere base64)
import base64
key = secrets.token_bytes(32)
print("ENCRYPTION_KEY:", base64.urlsafe_b64encode(key).decode())
```

## 🐳 Pasul 3: Deploy Backend

Railway va detecta automat `Dockerfile` și va face deploy.

### Verificare Deploy
1. Așteaptă să se termine build-ul (vezi logs în Railway)
2. Railway va asigna un URL: `https://your-app.up.railway.app`
3. Testează: `https://your-app.up.railway.app/health`

### Troubleshooting

Dacă ai erori, verifică logs în Railway Dashboard → Deployments → View Logs

## 🌐 Pasul 4: Deploy Frontend (Vercel/Replit)

Frontend-ul React poate fi deploy-at gratuit pe Vercel:

### 4.1 Vercel Deploy

1. Push codul pe GitHub
2. Loghează-te în Vercel: https://vercel.com
3. **"Add New Project"** → Import GitHub repo
4. Setări:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Environment Variables în Vercel:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app
   ```

6. Click **Deploy**

### 4.2 Actualizează CORS în Railway

După ce ai URL-ul frontend-ului, actualizează în Railway:

```
FRONTEND_URL=https://your-frontend.vercel.app
```

## ✅ Verificare Finală

Testează următoarele:

1. ✅ https://your-backend.up.railway.app/health → `{"status": "healthy"}`
2. ✅ Frontend-ul se încarcă
3. ✅ Register/Login funcționează
4. ✅ Selectare strategie + salvare funcționează
5. ✅ Datele sunt izolate între utilizatori

## 🔒 Securitate Production

### Checklist

- [ ] `SECRET_KEY` e generat random și are minim 32 caractere
- [ ] `ENCRYPTION_KEY` e generat random și are 32 bytes
- [ ] `DEBUG=False`
- [ ] PostgreSQL e folosit (nu SQLite)
- [ ] CORS e configurat doar pentru domeniul tău
- [ ] HTTPS e activat (Railway oferă automat)

### Backup Database

Configurează backup automat în Railway:
1. Railway Dashboard → PostgreSQL → Backups
2. Enable "Automated Backups"

## 📝 Comenzi Utile

### Railway CLI

```bash
# Login
railway login

# Link proiect
railway link

# Vezi logs
railway logs

# Vezi variabile
railway variables

# Setează variabilă
railway variables set SECRET_KEY="your-key"
```

## 💰 Costuri

Railway oferă:
- **$5 credit gratuit lunar** (suficient pentru teste)
- PostgreSQL inclus în credit
- Dacă depășești $5, se oprește automat (nu te taxează fără să știi)

## 🆘 Suport

Dacă ai probleme:
1. Railway Docs: https://docs.railway.app
2. Railway Discord: https://discord.gg/railway
3. Verifică logs în Railway Dashboard

---

**Succes cu deploy-ul! 🚀**
