# 🚀 Guide de déploiement GeniDoc Backend sur Vercel

Ce guide explique comment déployer le backend Express avec Supabase sur Vercel.

## Prérequis

1. **Vercel CLI** - Installer via npm:
```bash
npm install -g vercel
```

2. **Compte Vercel** - Créer un compte sur https://vercel.com

3. **Variables d'environnement** - Avoir les 4 variables suivantes:
   - `SUPABASE_URL` - URL de votre projet Supabase
   - `SUPABASE_ANON_KEY` - Clé publique Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` - Clé de rôle de service Supabase
   - `JWT_SECRET` - Clé secrète JWT pour les tokens

## Déploiement

### Option 1: Vercel CLI (Recommandé)

```bash
# 1. Se connecter à Vercel
vercel login

# 2. Se placer dans le dossier du projet
cd genidocbabies-main

# 3. Initialiser le projet Vercel (si première fois)
vercel

# 4. Déployer en production (depuis la racine du projet)
vercel --prod
```

**Lors du premier déploiement:**
- **Framework Preset?** → Sélectionnez "Other" ou "Node.js"
- **Root directory?** → Laissez vide ou tapez `.`
- **Build command?** → Laissez vide ou tapez `npm install`
- **Output directory?** → Laissez vide

### Option 2: Dashboard Vercel

1. Aller sur https://vercel.com/dashboard
2. Cliquer sur "New Project"
3. Sélectionner le repository GitHub `progitanas/genidocbabiesv2`
4. **Framework**: Sélectionner "Other" ou "Node.js"
5. **Root Directory**: Sélectionner `./backend` (important!)
6. **Environment Variables**: Ajouter les 4 variables:
   - `SUPABASE_URL` = `https://yprqmqgopfqwvvmlanri.supabase.co`
   - `SUPABASE_ANON_KEY` = (coller votre clé)
   - `SUPABASE_SERVICE_ROLE_KEY` = (coller votre clé)
   - `JWT_SECRET` = (votre secret JWT)
7. Cliquer sur "Deploy"

## Configuration automatique

Le fichier `vercel.json` configure automatiquement:
- **Node.js runtime**: v18.x
- **Build command**: `npm install`
- **Routes**: Tous les appels `/api/*` vont au serveur Express

## Vérifier le déploiement

```bash
# 1. Attendre le déploiement (2-3 minutes)
# 2. Récupérer l'URL de votre API
vercel --prod --token=YOUR_VERCEL_TOKEN

# 3. Tester l'API
curl https://genidoc-api.vercel.app/health

# Vous devriez voir:
# {"ok":true,"message":"GeniDoc API running"}
```

## ⚠️ Variables d'environnement

Les variables d'environnement doivent être ajoutées:

1. **Via CLI**:
```bash
vercel env add SUPABASE_URL https://yprqmqgopfqwvvmlanri.supabase.co
vercel env add SUPABASE_ANON_KEY "your_anon_key"
vercel env add SUPABASE_SERVICE_ROLE_KEY "your_service_role_key"
vercel env add JWT_SECRET "your_jwt_secret"
```

2. **Via Dashboard**:
   - Aller sur Vercel Dashboard
   - Sélectionner le projet `genidoc-api`
   - Settings → Environment Variables
   - Ajouter les 4 variables

## 🔗 Mise à jour du frontend

Après le déploiement, mettre à jour le frontend:

**Fichier**: `frontend/src/public/js/api.js` (ligne 11)
```javascript
const BACKEND_API_URL = 'https://genidoc-api.vercel.app';
```

Puis push le changement:
```bash
git add -A
git commit -m "Update backend API URL after Vercel deployment"
git push
```

Le frontend sur Vercel se redéploiera automatiquement.

## 🧪 Tests après déploiement

### Test 1: Health Check
```bash
curl https://genidoc-api.vercel.app/health
```

### Test 2: Signup
```bash
curl -X POST https://genidoc-api.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "genidoc_nom": "Test",
    "genidoc_prenom": "User",
    "genidoc_email": "test@example.com",
    "genidoc_password": "Password123!",
    "genidoc_confirm_password": "Password123!",
    "genidoc_role": "pediatre"
  }'
```

### Test 3: Check CORS
Aller sur https://www.genidochayat.ma et ouvrir la console:
```javascript
fetch('https://genidoc-api.vercel.app/health')
  .then(r => r.json())
  .then(d => console.log('✅ API réachable:', d))
  .catch(e => console.error('❌ Erreur:', e.message))
```

## 🚨 Dépannage

### Erreur: "Cannot find module"
- Vérifier que tous les `require()` utilisent les chemins relatifs corrects
- Vérifier que `package.json` est à la racine du projet

### Erreur: "CORS policy blocked"
- Vérifier que les domaines sont dans `corsOptions` dans `app-supabase.js`:
  - `https://www.genidochayat.ma`
  - `https://genidochayat.ma`

### Erreur: "Supabase connection failed"
- Vérifier que les variables d'environnement sont définies
- Vérifier que `SUPABASE_URL` et `SUPABASE_ANON_KEY` sont corrects

### Build timeout
- Aumentar le timeout dans `vercel.json`
- Vérifier que `package-lock.json` n'est pas versionné (peut ralentir le build)

## 📊 Monitoring

Sur le Dashboard Vercel:
- Voir les logs en temps réel
- Vérifier les erreurs de déploiement
- Monitorer les performances et l'utilisation

## Redéploiement

Pour redéployer après des changements:

```bash
# Via CLI
vercel --prod

# Via Git push (si auto-deploy configuré)
git push origin main
```

---

**URL de votre API**: https://genidoc-api.vercel.app
**Environment**: Production
