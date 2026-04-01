# 🚀 Migration vers Supabase - Guide Complet

## Étape 1: Créer un projet Supabase

1. Allez sur **https://supabase.com** et créez un compte
2. Cliquez sur **New Project**
3. Configurez:
   - **Project Name**: `genidoc-babies`
   - **Database Password**: Choisissez un mot de passe fort
   - **Region**: Choisissez la région la plus proche
4. Attendez que le projet soit créé (3-5 min)

## Étape 2: Récupérer les Credentials

1. Allez dans **Project Settings** → **API**
2. Copiez:
   - **Project URL** → `SUPABASE_URL` dans `.env`
   - **anon public key** → `SUPABASE_ANON_KEY` dans `.env`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` dans `.env`

## Étape 3: Importer le Schéma

1. Dans Supabase, allez à **SQL Editor**
2. Cliquez sur **New Query**
3. Copiez-collez le contenu de `backend/database/supabase-schema.sql`
4. Cliquez sur **Run**

## Étape 4: Configurer les Variables d'Environnement

```bash
# Copier le fichier
cp backend/.env.example backend/.env

# Ajouter vos credentials Supabase (voir Étape 2)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Étape 5: Installer les Dépendances

```bash
cd backend
npm install
```

## Étape 6: Tester l'Authentification

```bash
npm run dev
# Le serveur démarre sur http://localhost:5000
```

### Test d'inscription (signup) :

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "genidoc_nom": "Senhaji",
    "genidoc_prenom": "Anas",
    "genidoc_email": "anas@genidoc.ma",
    "genidoc_password": "Password123!",
    "genidoc_confirm_password": "Password123!",
    "genidoc_role": "ADMIN"
  }'
```

### Test de connexion (login) :

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "genidoc_email": "anas@genidoc.ma",
    "genidoc_password": "Password123!"
  }'
```

## Étape 7: Déployer sur Vercel/Production

### Option A: Vercel Functions (recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

Configurer les variables d'environnement dans Vercel Dashboard:

- **Settings** → **Environment Variables**
- Ajouter `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### Option B: Cloudflare Workers (compatible avec config actuelle)

```bash
# Configurer wrangler
wrangler install

# Ajouter secrets
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY

# Déployer
wrangler deploy
```

## Étape 8: Mettre à Jour le Frontend

### Installer Supabase Client:

```bash
cd frontend
npm install @supabase/supabase-js
# OU ajouter via CDN dans le <head>:
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### Initialiser Supabase dans JavaScript:

```javascript
// frontend/src/public/js/supabase-client.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://your-project.supabase.co";
const supabaseAnonKey = "your_anon_key_here";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Exemple d'utilisation - Login
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

// Exemple d'utilisation - Signup
export async function signup(email, password, metadata = {}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
  if (error) throw error;
  return data;
}
```

### Mettre à Jour `api.js`:

```javascript
// Remplacer les appels manuels par Supabase
const { supabase } = require("./supabase-client.js");

API.login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        genidoc_email: email,
        genidoc_password: password,
      }),
    });
    const data = await response.json();
    localStorage.setItem("token", data.token);
    return data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};
```

## Étape 9: Configurer Supabase Storage (pour uploads fichiers)

### Créer des Buckets:

1. Dans Supabase Dashboard: **Storage** → **Create a new bucket**
2. Créer:
   - `carnet-uploads` - Pour uploads carnets
   - `documents` - Pour documents professionnels
   - `avatars` - Pour photos profil

### Configuration dans le code:

```javascript
// Exemple upload de fichier
const { data, error } = await supabase.storage
  .from("carnet-uploads")
  .upload(`${userId}/${filename}`, file, {
    cacheControl: "3600",
    upsert: true,
  });

if (error) throw error;
return data;
```

## Sécurité: Row Level Security (RLS)

Les politiques RLS sont déjà configurées dans `supabase-schema.sql`. Vérifiez:

```sql
-- Chaque utilisateur ne peut voir que ses propres données
SELECT * FROM genidoc_auth_users WHERE genidoc_user_id = auth.uid()::bigint
```

## Troubleshooting

### Erreur: "SUPABASE_URL is not defined"

→ Vérifiez que `.env` existe et contient `SUPABASE_URL`

### Erreur: "PostgreSQL connection failed"

→ Vérifiez les credentials et que le service Supabase est actif

### JWT Token invalide au frontend

→ Vérifiez que `JWT_SECRET` est identique backend/frontend

---

## Next Steps

- [ ] Créer un compte Supabase
- [ ] Importer le schéma PostgreSQL
- [ ] Configurer variables d'env
- [ ] Tester l'authentification localement
- [ ] Déployer backend sur Vercel/Cloudflare
- [ ] Mettre à jour frontend avec Supabase SDK
- [ ] Configurer Storage pour uploads
- [ ] Tester en production

**Questions?** Consultez la [documentation Supabase](https://supabase.com/docs)
