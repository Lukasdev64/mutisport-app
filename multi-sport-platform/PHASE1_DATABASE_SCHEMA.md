# Backend Integration - Phase 1: Database Schema

## Objective

Migrate from localStorage-based tournament storage to a normalized Supabase database with proper schema, RLS policies, and real-time capabilities.

## Changes in This Branch

### 1. Database Schema Migration

**File**: `supabase/migrations/20250123000000_tournaments_v2_schema.sql`

**What's New**:
- Normalized relational schema (tournaments, players, matches, rounds)
- Hybrid authentication (anonymous with edit tokens OR authenticated users)
- Row-Level Security (RLS) policies
- Proper indexes for performance
- Database-level constraints

**Key Tables**:
```sql
tournaments (
  id, name, location, tournament_date, format, sport, status,
  unique_url_code, edit_token_hash, owner_id, is_public
)

tournament_players (many-to-many relationship)
players (normalized player data)
matches (with scheduling fields)
rounds (proper round management)
```

### 2. TypeScript Types Update

**Next Steps** (will be in Phase 2):
- Update `src/types/tournament.ts` to match schema
- Add Supabase client configuration
- Migrate stores from localStorage to Supabase

## Benefits

✅ **Performance**: Indexed queries instead of JSONB blob parsing
✅ **Security**: RLS policies + edit tokens for anonymous access
✅ **Real-time**: Live bracket updates via Supabase subscriptions
✅ **Scalability**: Normalized data vs monolithic JSONB
✅ **Maintainability**: Granular updates, proper constraints

## Testing

**Local Setup**:
1. Install Supabase CLI: `npm install -g supabase`
2. Start local instance: `supabase start`
3. Run migration: `supabase db push`
4. Verify tables: `supabase db inspect`

**Production**:
- Will be deployed via Supabase dashboard
- Automatically creates tables + RLS policies

## Migration Path

**Current** (Guillaume):
```typescript
// localStorage
const tournaments = JSON.parse(localStorage.getItem('tournaments'))
```

**Future** (After Phase 2):
```typescript
// Supabase
const { data: tournaments } = await supabase
  .from('tournaments')
  .select('*, players(*), rounds(*, matches(*))')
```

## Notes

- **UI unchanged**: All Guillaume components remain the same
- **Data layer only**: This is purely backend infrastructure
- **Backward compatible**: Can keep localStorage as fallback initially
- **Incremental migration**: Won't break existing functionality

---

**Next Phase**: Backend Services Integration (Supabase client, React Query)
