/**
 * Regénère supabase/seed.sql depuis src/data/images.ts
 * Usage: node scripts/generate-images-seed.cjs
 */
const fs = require('fs');
const path = require('path');

const imagesPath = path.join(__dirname, '../src/data/images.ts');
const outPath = path.join(__dirname, '../supabase/seed.sql');
const src = fs.readFileSync(imagesPath, 'utf8');

const re =
  /\{\s*(?:\/\/[^\n]*\n\s*)?id:\s*"([^"]+)"[\s\S]*?imageUrl:\s*"([^"]+)"[\s\S]*?answer:\s*"([^"]+)"[\s\S]*?difficulty:\s*(\d+)[\s\S]*?fakeSocialStat:\s*"((?:[^"\\]|\\.)*)"[\s\S]*?explanation:\s*"((?:[^"\\]|\\.)*)"[\s\S]*?source_url:\s*"([^"]+)"[\s\S]*?generator:\s*"([^"]+)"[\s\S]*?category:\s*"([^"]+)"[\s\S]*?elo:\s*(\d+)/g;

const rows = [];
let m;
while ((m = re.exec(src)) !== null) {
  rows.push({
    id: m[1],
    image_url: m[2],
    answer: m[3],
    difficulty: Number(m[4]),
    fake_social_stat: m[5],
    explanation: m[6],
    source_url: m[7],
    generator: m[8],
    category: m[9],
    elo: Number(m[10]),
  });
}

if (rows.length === 0) {
  console.error('No images parsed from', imagesPath);
  process.exit(1);
}

function esc(s) {
  return s.replace(/'/g, "''");
}

const values = rows
  .map(
    r =>
      `  ('${esc(r.id)}', '${esc(r.image_url)}', '${r.answer}', ${r.difficulty}, '${esc(r.fake_social_stat)}', '${esc(r.explanation)}', '${esc(r.source_url)}', '${r.generator}', '${r.category}', ${r.elo}, true)`,
  )
  .join(',\n');

const sql = `-- Generated from src/data/images.ts — re-run: node scripts/generate-images-seed.cjs

insert into public.images (
  id, image_url, answer, difficulty, fake_social_stat, explanation, source_url, generator, category, elo, is_active
) values
${values}
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
`;

fs.writeFileSync(outPath, sql);
console.log(`Wrote ${rows.length} rows to ${outPath}`);
