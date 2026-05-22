# Supabase — Real or AI

## 1. Créer le projet

1. [supabase.com](https://supabase.com) → **New project**
2. Récupère **Project URL** et **anon public key** (Settings → API)

## 2. Déployer les migrations (obligatoire pour voir Database → Migrations)

L’onglet **Database → Migrations** reste **vide** tant qu’aucun `supabase db push` n’a tourné. Un simple lien GitHub ne suffit pas toujours.

### Option A — GitHub Actions (recommandé)

1. **Supabase** → ton projet → **Settings → General** : copie le **Project ID** (ref, ex. `abcdefghijklmnop`)
2. **Settings → Database** : note le **Database password** (ou reset)
3. [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) → **Generate new token** (accès au projet)
4. **GitHub** → repo `RealOrAI` → **Settings → Secrets and variables → Actions** → **New repository secret** :
   - `SUPABASE_ACCESS_TOKEN` = token compte
   - `SUPABASE_PROJECT_ID` = Project ID
   - `SUPABASE_DB_PASSWORD` = mot de passe DB
5. **Actions** → workflow **Deploy Supabase migrations** → **Run workflow** (ou push sur `main`)

Quand c’est OK : **Database → Migrations** affiche `20250519000000` et `20250519000001`.

### Option B — SQL Editor (immédiat, sans historique Migrations)

**SQL Editor** → exécute dans l’ordre :

1. `migrations/20250519000000_images.sql`
2. `migrations/20250519000001_seed_images.sql`

Les tables existent, mais l’onglet Migrations peut rester vide (normal si pas passé par le CLI).

### Option C — Intégration GitHub Supabase (branching)

**Project Settings → Integrations → GitHub** : repo `Enzomarande/RealOrAI`, branche **`main`**, **Deploy to production** activé. Si rien ne part, utilise l’option A.

## 3. Configurer l’app

```bash
cp src/config/supabase.env.example.ts src/config/supabase.env.ts
```

Remplace `url` et `anonKey` par tes valeurs. Ce fichier est **gitignored**.

Sans ce fichier, l’app utilise le fallback local (`src/data/images.ts`).

## 4. Cache offline

Les images Supabase sont mises en cache dans AsyncStorage (`roa_images_cache_v1`, TTL 6 h). En cas d’erreur réseau, le cache puis le catalogue local sont utilisés.

## 5. Ajouter des images

**Table Editor** ou SQL :

```sql
insert into public.images (
  id, image_url, answer, difficulty, fake_social_stat, explanation,
  source_url, generator, category, elo, is_active
) values (
  'ai-portrait-new-01',
  'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/deck/....jpg',
  'ai', 3,
  'Texte social factice…',
  'Indice affiché après le vote.',
  'https://lexica.art/',
  'midjourney-v6', 'portrait', 1000, true
);
```

Pour héberger les fichiers : bucket Storage `deck` (public read), puis `image_url` = URL publique.

## 6. Régénérer le seed

Après modification de `src/data/images.ts` :

```bash
node scripts/generate-images-seed.cjs
```

## Prochaines étapes (non implémentées)

- Table `votes` + agrégation `human_error_rate`
- Auth anonyme pour profil cloud
- Edge Function pour leaderboard réel
