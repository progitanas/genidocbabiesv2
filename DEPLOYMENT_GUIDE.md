# 🚀 Déploiement Production - Supabase Backend

## ✅ Statut: Prêt pour Production

### 1️⃣ Tu as déjà configuré:

- ✅ Projet Supabase créé
- ✅ Credentials Supabase dans `.env`
- ✅ Backend Express compatible Supabase
- ✅ Routes authentification Supabase

### 2️⃣ À faire MAINTENANT:

#### A. Importer le Schéma SQL (3 min)

1. Va à: https://app.supabase.com/project/yprqmqgopfqwvvmlanri/sql/new
2. Copie tout le contenu de `backend/database/supabase-schema.sql`
3. Clique **RUN**
4. ✅ Schéma importé!

#### B. Déployer le Backend

**Option 1: Vercel (Recommandé)**

```bash
npm i -g vercel
cd backend
vercel
# Sélectionne "Node.js" comme framework
# Configure env vars dans Vercel Dashboard
```

**Option 2: Cloudflare Workers**

```bash
cd backend
wrangler deploy
```

**Option 3: Render/Railway**

```bash
# Pousse sur GitHub
git push

# Connecte le repo à Render.com ou Railway.app
# Configure env vars
# Auto-deploy activé!
```

### 3️⃣ Variables d'Environnement à Configuration en Production:

```env
SUPABASE_URL=https://yprqmqgopfqwvvmlanri.supabase.co
SUPABASE_ANON_KEY=sb_publishable_K2mTTpjpA0f6oaUTWJcK-w_7dP1t3Qx
SUPABASE_SERVICE_ROLE_KEY=<votre_service_role_key>
JWT_SECRET=<votre_secret_jwt>
NODE_ENV=production
PORT=5000
```

### 4️⃣ Tester l'API Localement

```bash
cd backend
npm install
npm run dev:supabase
```

Test d'authentification:

```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "genidoc_nom": "Test",
    "genidoc_prenom": "User",
    "genidoc_email": "test@genidoc.ma",
    "genidoc_password": "Password123!",
    "genidoc_confirm_password": "Password123!",
    "genidoc_role": "ADMIN"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "genidoc_email": "test@genidoc.ma",
    "genidoc_password": "Password123!"
  }'
```

### 5️⃣ Mettre à Jour le Frontend

Mise à jour de `api.js` pour connecter au backend Supabase:

```javascript
// frontend/src/public/js/api-prod.js
const PROD_API_URL = "https://votre-backend-url.vercel.app"; // À remplacer

const API = {
  login: async (email, password) => {
    const response = await fetch(`${PROD_API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        genidoc_email: email,
        genidoc_password: password,
      }),
    });
    const data = await response.json();
    if (data.token) localStorage.setItem("token", data.token);
    return data;
  },

  signup: async (nom, prenom, email, password, role) => {
    const response = await fetch(`${PROD_API_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        genidoc_nom: nom,
        genidoc_prenom: prenom,
        genidoc_email: email,
        genidoc_password: password,
        genidoc_confirm_password: password,
        genidoc_role: role,
      }),
    });
    return await response.json();
  },
};

export default API;
```

### 6️⃣ Checklist Final:

- [ ] Schéma SQL importé dans Supabase
- [ ] Backend déployé (Vercel/Cloudflare/etc)
- [ ] Env vars configurées en production
- [ ] Test login/signup réussi
- [ ] Frontend pointe vers backend de prod
- [ ] Frontend redeployé sur Vercel
- [ ] Tests end-to-end passés

### 📞 Support Supabase

- Docs: https://supabase.com/docs
- Dashboard: https://app.supabase.com/project/yprqmqgopfqwvvmlanri

---

**Status: 🟢 Prêt pour production!**

Prochaines étapes:

1. Importe le schéma SQL
2. Déploie le backend
3. Teste l'authentification
4. Prête à accueillir les utilisateurs! 🎉
