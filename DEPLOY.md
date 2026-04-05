# 🚀 Deploy pe Railway - Ghid Complet

## 📋 Ce ai nevoie

1. Cont Railway: https://railway.app
2. Cont GitHub cu codul push-at
3. $5 credit gratuit (Railway ofera lunar)

---

## 🚀 Pasul 1: Push cod pe GitHub

```bash
cd crypto-trading-bot

# Initializeaza git (daca nu e deja)
git init

# Adauga toate fisierele
git add .

# Commit
git commit -m "Initial commit - Crypto Trading Bot ready for deploy"

# Adauga remote (inlocuieste cu repo-ul tau)
git remote add origin https://github.com/username/crypto-trading-bot.git

# Push
git push -u origin main
```

---

## 🗄️ Pasul 2: Creare Proiect Railway

### 2.1 Nou Proiect
1. Logheaza-te in Railway: https://railway.app/dashboard
2. Click **"New Project"**
3. Selecteaza **"Deploy from GitHub repo"**
4. Alege repository-ul tau `crypto-trading-bot`

### 2.2 Adauga PostgreSQL
1. In proiect, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway va crea automat variabila `DATABASE_URL`

---

## 🔐 Pasul 3: Environment Variables

In Railway Dashboard → Project → Variables, adauga:

### Variabile Obligatorii

```
SECRET_KEY=<genereaza mai jos>
ENCRYPTION_KEY=<genereaza mai jos>
DEBUG=False
ACCESS_TOKEN_EXPIRE_MINUTES=60
FRONTEND_URL=<dupa ce deploy-ezi frontend>
```

### Genereaza chei secrete:

```bash
cd crypto-trading-bot/backend
python generate_keys.py
```

Copiaza outputul in Railway Variables.

---

## 🐳 Pasul 4: Deploy Backend

Railway detecteaza automat `Dockerfile` si face deploy.

### Verifica status:
1. Asteapta build-ul sa termine (vezi logs in Railway)
2. Railway asigneaza URL: `https://your-app.up.railway.app`
3. Testeaza: `https://your-app.up.railway.app/health`

---

## 🌐 Pasul 5: Deploy Frontend (Vercel)

### 5.1 Deploy pe Vercel

1. Logheaza-te: https://vercel.com
2. **"Add New Project"** → Import GitHub repo
3. Setari:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build**: `npm run build`
   - **Output**: `dist`

4. Environment Variable:
   ```
   VITE_API_URL=https://your-backend.up.railway.app
   ```

5. Click **Deploy**

### 5.2 Update Railway CORS

Copiaza URL-ul frontend-ului din Vercel si adauga in Railway:

```
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## ✅ Verificare Finala

Testeaza:
- [ ] Backend health: `https://your-api.up.railway.app/health`
- [ ] Frontend se incarca
- [ ] Register functioneaza
- [ ] Login functioneaza
- [ ] Selectare strategie + salvare functioneaza
- [ ] Datele sunt izolate intre useri

---

## 💰 Costuri

| Serviciu | Cost |
|----------|------|
| Railway | $5/luna (credit gratuit inclus) |
| Vercel | Gratuit |
| **Total** | **Gratuit** pana depasesti $5 |

---

## 🆘 Troubleshooting

### Eroare "Database connection failed"
Verifica ca `DATABASE_URL` e setat in Railway.

### Eroare CORS
Verifica ca `FRONTEND_URL` in Railway contine URL-ul corect de la Vercel.

### Build fails
Verifica logs in Railway Dashboard.

---

**Succes! 🎉**
