# 🔧 Fix: Import Schéma Supabase (UUID compatible)

## Le problème:
```
ERROR: 42846: cannot cast type uuid to bigint
```

## La solution:

Utilise le nouveau schéma **supabase-schema-fixed.sql** qui est compatible Supabase (UUID primaires).

### Étapes:

1. **Supprime le précédent schéma** (optionnel mais recommandé)
   - Supabase Dashboard → SQL Editor
   - Exécute:
   ```sql
   DROP TABLE IF EXISTS genidoc_vaccination_enfant;
   DROP TABLE IF EXISTS genidoc_consultation;
   DROP TABLE IF EXISTS genidoc_vital_enfant;
   DROP TABLE IF EXISTS genidoc_pediatre_enfant;
   DROP TABLE IF EXISTS genidoc_tuteur_profile;
   DROP TABLE IF EXISTS genidoc_pediatre_profile;
   DROP TABLE IF EXISTS genidoc_onboarding;
   DROP TABLE IF EXISTS genidoc_user_organisation;
   DROP TABLE IF EXISTS genidoc_organisation_settings;
   DROP TABLE IF EXISTS genidoc_organisation;
   DROP TABLE IF EXISTS genidoc_enfant;
   DROP TABLE IF EXISTS genidoc_auth_users;
   ```

2. **Importe le schéma correct**
   - Ouvre: [supabase-schema-fixed.sql](../backend/database/supabase-schema-fixed.sql)
   - Copie **tout le contenu**
   - Supabase Dashboard → SQL Editor → New Query
   - Colle
   - Clique **RUN**

3. **Vérifie que ça marche**
   - Vais à: Supabase → Table Editor
   - Tu dois voir 11 tables créées ✓

### Pourquoi le fix?
- Ancien schéma: utilisait BIGSERIAL (incompatible Supabase UUID)
- Nouveau schéma: utilise UUID (standard Supabase) + BIGSERIAL comme fallback

---

**C'est prêt! Une fois importé, ton backend Supabase marche 🚀**
