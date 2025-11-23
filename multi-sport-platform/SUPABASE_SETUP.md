# Supabase Configuration

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create a new project (or use existing)
3. Go to Project Settings → API
4. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - anon/public key → `VITE_SUPABASE_ANON_KEY`

## Local Development

For local development without Supabase, the app will automatically fallback to localStorage.

## Deploying the Schema

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migration
supabase db push
```

Or use the Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `supabase/migrations/20250123000000_tournaments_v2_schema.sql`
3. Run the SQL

## Testing Connection

The client includes a helper to check configuration:

```typescript
import { isSupabaseConfigured } from './lib/supabase';

if (!isSupabaseConfigured()) {
  console.log('Using localStorage fallback');
}
```
