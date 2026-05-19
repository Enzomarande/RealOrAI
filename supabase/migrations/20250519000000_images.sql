-- Real or AI — catalogue d'images
-- Exécuter dans Supabase SQL Editor ou via: supabase db push

create table if not exists public.images (
  id text primary key,
  image_url text not null,
  answer text not null check (answer in ('real', 'ai')),
  difficulty smallint not null check (difficulty between 1 and 5),
  fake_social_stat text not null,
  explanation text,
  source_url text not null,
  generator text not null,
  category text not null check (
    category in (
      'portrait',
      'landscape',
      'urban',
      'product',
      'animal',
      'architecture'
    )
  ),
  elo integer not null default 1000,
  human_error_rate real check (
    human_error_rate is null
    or (human_error_rate >= 0 and human_error_rate <= 1)
  ),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists images_active_difficulty_idx
  on public.images (is_active, difficulty);

alter table public.images enable row level security;

drop policy if exists "Public read active images" on public.images;
create policy "Public read active images"
  on public.images
  for select
  to anon, authenticated
  using (is_active = true);

-- Optionnel : permettre au service role de tout gérer (dashboard / scripts)
-- Les votes futurs iront dans une table votes séparée.

create or replace function public.set_images_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists images_set_updated_at on public.images;
create trigger images_set_updated_at
  before update on public.images
  for each row
  execute function public.set_images_updated_at();
