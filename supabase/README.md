# Supabase — Real or AI

## 1. Créer le projet

1. [supabase.com](https://supabase.com) → **New project**
2. Récupère **Project URL** et **anon public key** (Settings → API)

## 2. Schéma + données

Dans **SQL Editor**, exécute dans l’ordre :

1. `migrations/20250519000000_images.sql` — table `images` + RLS lecture publique
2. `seed.sql` — 20 images du catalogue local

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
