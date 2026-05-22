-- Données initiales du catalogue (démo).
-- Régénérer depuis src/data/images.ts : npm run supabase:seed puis copier vers cette migration si besoin.

insert into public.images (
  id, image_url, answer, difficulty, fake_social_stat, explanation, source_url, generator, category, elo, is_active
) values
  ('real-portrait-01', 'https://source.unsplash.com/featured/900x1600?portrait&sig=11', 'real', 1, 'Cette photo a ete validee comme reelle par 93% des joueurs.', 'Reflets de peau et profondeur de champ typiques d''un capteur photo.', 'https://source.unsplash.com/featured/900x1600?portrait&sig=11', 'unsplash', 'portrait', 1000, true),
  ('real-landscape-02', 'https://source.unsplash.com/featured/900x1600?mountain,landscape&sig=12', 'real', 1, 'Seuls 6% ont cru que ce paysage venait d''un generateur.', 'La diffusion de brume et les details du relief restent physiquement coherents.', 'https://source.unsplash.com/featured/900x1600?mountain,landscape&sig=12', 'unsplash', 'landscape', 1000, true),
  ('real-urban-03', 'https://source.unsplash.com/featured/900x1600?street,city,night&sig=13', 'real', 2, 'Les joueurs de moins de 25 ans se sont trompes 3x plus souvent ici.', 'Les enseignes lumineuses ont des micro-defauts typiques d''une vraie prise de vue.', 'https://source.unsplash.com/featured/900x1600?street,city,night&sig=13', 'unsplash', 'urban', 1000, true),
  ('real-animal-04', 'https://source.unsplash.com/featured/900x1600?wildlife,animal&sig=14', 'real', 2, 'Seulement 18% ont detecte que la texture du pelage etait bien photographique.', 'Le bruit de capteur sur le fond est naturel et non repetitif.', 'https://source.unsplash.com/featured/900x1600?wildlife,animal&sig=14', 'unsplash', 'animal', 1000, true),
  ('real-product-05', 'https://source.unsplash.com/featured/900x1600?watch,product,studio&sig=15', 'real', 3, 'Cette photo produit a trompe 64% des testeurs internes.', 'Les reflets metal suivent une configuration lumiere complexe mais credibles.', 'https://source.unsplash.com/featured/900x1600?watch,product,studio&sig=15', 'unsplash', 'product', 1000, true),
  ('real-architecture-06', 'https://source.unsplash.com/featured/900x1600?architecture,building,modern&sig=16', 'real', 3, 'La perspective de ce batiment a piege 58% des joueurs.', 'Les lignes verticales gardent une petite distorsion optique realiste.', 'https://source.unsplash.com/featured/900x1600?architecture,building,modern&sig=16', 'unsplash', 'architecture', 1000, true),
  ('real-portrait-07', 'https://source.unsplash.com/featured/900x1600?portrait,editorial&sig=17', 'real', 4, 'Seulement 22% ont ose voter REAL sur ce portrait editorial.', 'Les pores et micro-imperfections restent coherents sur toute la peau.', 'https://source.unsplash.com/featured/900x1600?portrait,editorial&sig=17', 'unsplash', 'portrait', 1000, true),
  ('real-urban-08', 'https://source.unsplash.com/featured/900x1600?metro,urban,commute&sig=18', 'real', 4, 'Les details de foule ont ete juges IA par 71% des joueurs.', 'Le flou de mouvement est irregulier, ce qui est rare en generation synthetique.', 'https://source.unsplash.com/featured/900x1600?metro,urban,commute&sig=18', 'unsplash', 'urban', 1000, true),
  ('real-architecture-09', 'https://source.unsplash.com/featured/900x1600?cathedral,architecture&sig=19', 'real', 5, 'Cette photo architecture a trompe 89% des joueurs experimentes.', 'Les surfaces en pierre gardent des irregularites difficiles a reproduire proprement.', 'https://source.unsplash.com/featured/900x1600?cathedral,architecture&sig=19', 'unsplash', 'architecture', 1000, true),
  ('real-product-10', 'https://source.unsplash.com/featured/900x1600?sneakers,product,commercial&sig=20', 'real', 5, 'Photo studio pro: 4 joueurs sur 5 pensent a une IA a tort.', 'Le rendu est tres propre mais conserve un grain materiel realiste.', 'https://source.unsplash.com/featured/900x1600?sneakers,product,commercial&sig=20', 'unsplash', 'product', 1000, true),
  ('ai-portrait-11', 'https://picsum.photos/seed/ai-proxy-011/900/1600', 'ai', 1, 'Seulement 4% ont detecte la texture anormale des cheveux.', 'Le contour des oreilles et des cheveux manque de coherence physique.', 'https://lexica.art/', 'stable-diffusion-xl', 'portrait', 1000, true),
  ('ai-landscape-12', 'https://picsum.photos/seed/ai-proxy-012/900/1600', 'ai', 1, 'Cette image IA evidente est detectee en moins de 2s par 82% des joueurs.', 'Les bords des nuages et la perspective des collines sont artificiels.', 'https://www.adobe.com/products/firefly.html', 'firefly', 'landscape', 1000, true),
  ('ai-animal-13', 'https://picsum.photos/seed/ai-proxy-013/900/1600', 'ai', 2, 'Les details de pelage ont trompe 67% des joueurs.', 'Le poil est trop uniforme et la texture des yeux manque de profondeur.', 'https://civitai.com/images', 'flux-dev', 'animal', 1000, true),
  ('ai-urban-14', 'https://picsum.photos/seed/ai-proxy-014/900/1600', 'ai', 2, 'Cette rue nocturne a piege 74% des testeurs en mobile.', 'Les enseignes ont des formes plausibles mais des lettres incoherentes.', 'https://lexica.art/aperture', 'midjourney-v6', 'urban', 1000, true),
  ('ai-product-15', 'https://picsum.photos/seed/ai-proxy-015/900/1600', 'ai', 3, 'Le rendu premium de ce produit a trompe 79% des joueurs.', 'Les reflets sont trop reguliers, comme calcules par shader.', 'https://civitai.com/images', 'dall-e-3', 'product', 1000, true),
  ('ai-architecture-16', 'https://picsum.photos/seed/ai-proxy-016/900/1600', 'ai', 3, 'Seulement 11% ont vu les motifs repetitifs sur la facade.', 'Les fenetres semblent plausibles mais repetent des motifs identiques.', 'https://lexica.art/', 'stable-diffusion-xl', 'architecture', 1000, true),
  ('ai-portrait-17', 'https://picsum.photos/seed/ai-proxy-017/900/1600', 'ai', 4, 'Les joueurs experts ne detectent l''artefact qu''une fois sur trois.', 'Le regard et la peau sont tres credibles, mais les micro-ombres divergent.', 'https://lexica.art/aperture', 'midjourney-v6', 'portrait', 1000, true),
  ('ai-landscape-18', 'https://picsum.photos/seed/ai-proxy-018/900/1600', 'ai', 4, 'Cette vue aerienne a trompe 91% des joueurs lors de nos tests internes.', 'Le relief semble naturel mais la vegetation a une repetitivite anormale.', 'https://www.adobe.com/products/firefly.html', 'firefly', 'landscape', 1000, true),
  ('ai-product-19', 'https://picsum.photos/seed/ai-proxy-019/900/1600', 'ai', 5, 'Le modele Midjourney v6 a mis 40 secondes a la generer.', 'Les ombres secondaires sont parfaites a premiere vue, mais incoherentes au zoom.', 'https://lexica.art/aperture', 'midjourney-v6', 'product', 1000, true),
  ('ai-architecture-20', 'https://picsum.photos/seed/ai-proxy-020/900/1600', 'ai', 5, 'Cette image finale fait chuter le streak de la plupart des joueurs.', 'La geometrie est quasi parfaite, mais les materiaux changent de texture sans cause.', 'https://civitai.com/images', 'flux-dev', 'architecture', 1000, true)
on conflict (id) do update set
  image_url = excluded.image_url,
  answer = excluded.answer,
  difficulty = excluded.difficulty,
  fake_social_stat = excluded.fake_social_stat,
  explanation = excluded.explanation,
  source_url = excluded.source_url,
  generator = excluded.generator,
  category = excluded.category,
  elo = excluded.elo,
  is_active = excluded.is_active,
  updated_at = now();
