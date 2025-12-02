import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseKey || !openaiKey) {
  console.error('Missing environment variables. Ensure VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY), and OPENAI_API_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

const filesToIndex = [
  'CLAUDE.md',
  'README.md',
  'DEPLOYMENT.md',
  'SUPABASE_SETUP.md',
  'docs/TENNIS_TOURNAMENT_CREATION.md',
  'docs/TENNIS_TOURNAMENT_UX_AUDIT.md',
  'src/types/supabase.ts',
  'src/types/sport.ts',
  'src/types/tournament.ts',
  'src/types/tennis.ts',
  'src/types/team.ts',
  'supabase/migrations/20251123140000_add_team_structure.sql',
  'src/features/tournament/logic/engine.ts',
  'src/sports/tennis/scoring.ts',
  'src/sports/basketball/scoring.ts',
  'src/features/tournament/store/tournamentStore.ts',
  'src/features/billing/BillingPage.tsx',
  'docs/KNOWLEDGE_BASE.md'
];

async function generateEmbedding(text: string) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text.replace(/\n/g, ' '),
  });
  return response.data[0].embedding;
}

function chunkContent(content: string, filePath: string): string[] {
  const ext = path.extname(filePath);
  
  if (ext === '.md') {
    // Split by headers but keep the header
    return content.split(/(?=^## )/gm).filter(chunk => chunk.trim().length > 0);
  } else if (ext === '.ts' || ext === '.tsx' || ext === '.sql') {
    // For code, split by fixed size to stay within token limits
    const chunkSize = 3000; // ~750 tokens
    const chunks = [];
    for (let i = 0; i < content.length; i += chunkSize) {
      chunks.push(content.slice(i, i + chunkSize));
    }
    return chunks;
  }
  return [content];
}

async function indexFile(filePath: string) {
  console.log(`Processing ${filePath}...`);
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const chunks = chunkContent(content, filePath);

  for (const chunk of chunks) {
    if (chunk.trim().length < 20) continue;

    try {
      const embedding = await generateEmbedding(chunk);
      
      const { error } = await supabase.from('documents').insert({
        content: chunk,
        metadata: { source: filePath },
        embedding,
      });

      if (error) console.error(`Error inserting chunk for ${filePath}:`, error);
    } catch (e) {
      console.error(`Error generating embedding for ${filePath}:`, e);
    }
  }
  console.log(`Indexed ${filePath} (${chunks.length} chunks)`);
}

async function main() {
  console.log('Starting knowledge seeding...');
  
  // Optional: Clear all documents first to avoid duplicates
  // Warning: This deletes ALL knowledge. Uncomment if you want a fresh start.
  // await supabase.from('documents').delete().neq('id', 0); 
  
  for (const file of filesToIndex) {
    await indexFile(file);
  }
  
  console.log('Seeding complete!');
}

main().catch(console.error);
