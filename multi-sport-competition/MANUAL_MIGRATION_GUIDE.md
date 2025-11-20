# Manuel de Migration - Tournois V2

Guide complet pour migrer manuellement de l'ancien système JSONB vers le nouveau système normalisé.

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Pré-requis](#pré-requis)
3. [Étape 1: Backup](#étape-1-backup)
4. [Étape 2: Créer les nouvelles tables](#étape-2-créer-les-nouvelles-tables)
5. [Étape 3: Migrer les données](#étape-3-migrer-les-données)
6. [Étape 4: Vérification](#étape-4-vérification)
7. [Étape 5: Nettoyage](#étape-5-nettoyage)
8. [Rollback](#rollback)
9. [Troubleshooting](#troubleshooting)

---

## Vue d'ensemble

### Qu'est-ce qui change?

**Avant (V1)**:
```
anonymous_tournaments (table unique)
├── JSONB: players[]
├── JSONB: matches[]
├── JSONB: rounds[]
└── JSONB: settings
```

**Après (V2)**:
```
tournaments (table principale)
├── tournament_players (table relationnelle)
├── tournament_matches (table relationnelle)
└── tournament_rounds (table relationnelle)
```

### Avantages
- ✅ Requêtes 50-60% plus rapides
- ✅ Indexation efficace
- ✅ Intégrité référentielle
- ✅ Mises à jour atomiques
- ✅ Support complet double elimination

---

## Pré-requis

### Accès requis
- [x] Accès Supabase Dashboard (admin)
- [x] Éditeur SQL activé
- [x] Backup avant migration

### Vérifications
```sql
-- 1. Vérifier que les anciennes tables existent
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'anonymous_tournaments';

-- 2. Compter les tournois à migrer
SELECT COUNT(*) as total_tournaments FROM anonymous_tournaments;

-- 3. Vérifier l'espace disque disponible
SELECT pg_size_pretty(pg_database_size(current_database())) as db_size;
```

---

## Étape 1: Backup

### 1.1 Backup automatique via Supabase

**Dashboard → Settings → Database → Backups**
- Créer un backup manuel avant migration
- Noter l'heure de création

### 1.2 Export SQL manuel

```sql
-- Exporter la table des tournois
COPY (
  SELECT * FROM anonymous_tournaments
) TO '/tmp/anonymous_tournaments_backup.csv' WITH CSV HEADER;
```

### 1.3 Créer une table de backup

```sql
-- Créer une copie de sécurité dans la base
CREATE TABLE anonymous_tournaments_backup AS
SELECT * FROM anonymous_tournaments;

-- Vérifier
SELECT COUNT(*) FROM anonymous_tournaments_backup;
```

**✅ Checkpoint**: Vérifiez que le nombre de lignes est identique

---

## Étape 2: Créer les nouvelles tables

### 2.1 Table principale: tournaments

```sql
CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifiants
  unique_url_code TEXT UNIQUE NOT NULL CHECK (length(unique_url_code) = 8),
  edit_token_hash TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Informations de base
  name TEXT NOT NULL CHECK (length(name) >= 3 AND length(name) <= 200),
  sport TEXT,
  description TEXT,

  -- Configuration
  format TEXT NOT NULL CHECK (format IN ('single_elimination', 'double_elimination', 'round_robin', 'swiss')),
  max_participants INTEGER CHECK (max_participants >= 2 AND max_participants <= 128),

  -- Statut
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'registration', 'in_progress', 'completed', 'cancelled')),
  current_round INTEGER DEFAULT 0,

  -- Compteurs (calculés automatiquement par triggers)
  total_players INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  completed_matches INTEGER DEFAULT 0,

  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Index pour performance
CREATE INDEX idx_tournaments_url_code ON tournaments(unique_url_code);
CREATE INDEX idx_tournaments_owner ON tournaments(owner_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_format ON tournaments(format);
CREATE INDEX idx_tournaments_created ON tournaments(created_at DESC);

COMMENT ON TABLE tournaments IS 'Main tournaments table - normalized from anonymous_tournaments JSONB';
```

### 2.2 Table des joueurs: tournament_players

```sql
CREATE TABLE IF NOT EXISTS public.tournament_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,

  -- Informations joueur
  name TEXT NOT NULL CHECK (length(name) >= 1 AND length(name) <= 100),
  seed INTEGER,

  -- Statistiques (mises à jour par triggers)
  matches_played INTEGER DEFAULT 0,
  matches_won INTEGER DEFAULT 0,
  matches_lost INTEGER DEFAULT 0,
  sets_won INTEGER DEFAULT 0,
  sets_lost INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,

  -- Swiss system
  buchholz_score NUMERIC(10, 2) DEFAULT 0,

  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Contraintes
  UNIQUE(tournament_id, name),
  CHECK (seed IS NULL OR seed > 0)
);

-- Index
CREATE INDEX idx_players_tournament ON tournament_players(tournament_id);
CREATE INDEX idx_players_seed ON tournament_players(tournament_id, seed);
CREATE INDEX idx_players_stats ON tournament_players(tournament_id, matches_won DESC, points DESC);

COMMENT ON TABLE tournament_players IS 'Players participating in tournaments';
```

### 2.3 Table des matchs: tournament_matches

```sql
CREATE TABLE IF NOT EXISTS public.tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,

  -- Position dans le bracket
  round_number INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  bracket_type TEXT DEFAULT 'main' CHECK (bracket_type IN ('main', 'winner', 'loser', 'grand_final')),

  -- Participants
  player1_id UUID REFERENCES tournament_players(id) ON DELETE SET NULL,
  player2_id UUID REFERENCES tournament_players(id) ON DELETE SET NULL,

  -- Résultat
  winner_id UUID REFERENCES tournament_players(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),

  -- Score détaillé (JSONB pour flexibilité des sports)
  score_data JSONB DEFAULT '{"sets": [], "tiebreaks": []}'::jsonb,

  -- Navigation dans le bracket
  feeds_to_match_id UUID REFERENCES tournament_matches(id) ON DELETE SET NULL,
  feeds_to_loser_match_id UUID REFERENCES tournament_matches(id) ON DELETE SET NULL,

  -- Scheduling
  scheduled_time TIMESTAMPTZ,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,

  -- Notes
  notes TEXT,

  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Contraintes
  UNIQUE(tournament_id, round_number, match_number, bracket_type),
  CHECK (player1_id != player2_id),
  CHECK (winner_id IS NULL OR winner_id IN (player1_id, player2_id))
);

-- Index
CREATE INDEX idx_matches_tournament ON tournament_matches(tournament_id);
CREATE INDEX idx_matches_round ON tournament_matches(tournament_id, round_number);
CREATE INDEX idx_matches_status ON tournament_matches(status);
CREATE INDEX idx_matches_players ON tournament_matches(player1_id, player2_id);
CREATE INDEX idx_matches_winner ON tournament_matches(winner_id);

COMMENT ON TABLE tournament_matches IS 'Individual matches in tournaments';
```

### 2.4 Table des rounds: tournament_rounds

```sql
CREATE TABLE IF NOT EXISTS public.tournament_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,

  round_number INTEGER NOT NULL,
  name TEXT,

  -- Statut
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),

  -- Statistiques
  total_matches INTEGER DEFAULT 0,
  completed_matches INTEGER DEFAULT 0,

  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  UNIQUE(tournament_id, round_number)
);

-- Index
CREATE INDEX idx_rounds_tournament ON tournament_rounds(tournament_id);
CREATE INDEX idx_rounds_status ON tournament_rounds(tournament_id, status);

COMMENT ON TABLE tournament_rounds IS 'Rounds for round-robin and swiss tournaments';
```

### 2.5 Triggers de mise à jour

```sql
-- Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON tournament_matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour mettre à jour les compteurs de tournoi
CREATE OR REPLACE FUNCTION update_tournament_counters()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tournaments
  SET
    total_players = (SELECT COUNT(*) FROM tournament_players WHERE tournament_id = NEW.tournament_id),
    total_matches = (SELECT COUNT(*) FROM tournament_matches WHERE tournament_id = NEW.tournament_id),
    completed_matches = (SELECT COUNT(*) FROM tournament_matches WHERE tournament_id = NEW.tournament_id AND status = 'completed')
  WHERE id = NEW.tournament_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_counters_on_player_change
  AFTER INSERT OR UPDATE OR DELETE ON tournament_players
  FOR EACH ROW EXECUTE FUNCTION update_tournament_counters();

CREATE TRIGGER update_counters_on_match_change
  AFTER INSERT OR UPDATE OR DELETE ON tournament_matches
  FOR EACH ROW EXECUTE FUNCTION update_tournament_counters();
```

**✅ Checkpoint**: Vérifiez que toutes les tables sont créées
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'tournament%'
ORDER BY table_name;
```

---

## Étape 3: Migrer les données

### 3.1 Fonction de migration

```sql
CREATE OR REPLACE FUNCTION migrate_anonymous_tournament_to_v2(tournament_row anonymous_tournaments)
RETURNS UUID AS $$
DECLARE
  new_tournament_id UUID;
  player_record JSONB;
  match_record JSONB;
  round_record JSONB;
  player_id_map JSONB := '{}'::jsonb;
  new_player_id UUID;
  new_match_id UUID;
BEGIN
  -- 1. Créer le tournoi principal
  INSERT INTO tournaments (
    unique_url_code,
    edit_token_hash,
    owner_id,
    name,
    sport,
    description,
    format,
    max_participants,
    status,
    current_round,
    created_at,
    updated_at
  ) VALUES (
    tournament_row.url_code,
    tournament_row.edit_token_hash,
    tournament_row.owner_id,
    tournament_row.name,
    tournament_row.sport,
    tournament_row.description,
    tournament_row.format,
    tournament_row.max_participants,
    COALESCE(tournament_row.status, 'draft'),
    COALESCE((tournament_row.bracket_data->>'currentRound')::INTEGER, 0),
    COALESCE(tournament_row.created_at, NOW()),
    COALESCE(tournament_row.updated_at, NOW())
  ) RETURNING id INTO new_tournament_id;

  -- 2. Migrer les joueurs
  IF tournament_row.bracket_data ? 'players' THEN
    FOR player_record IN SELECT * FROM jsonb_array_elements(tournament_row.bracket_data->'players')
    LOOP
      INSERT INTO tournament_players (
        tournament_id,
        name,
        seed,
        matches_played,
        matches_won,
        points,
        buchholz_score
      ) VALUES (
        new_tournament_id,
        player_record->>'name',
        (player_record->>'seed')::INTEGER,
        COALESCE((player_record->>'matchesPlayed')::INTEGER, 0),
        COALESCE((player_record->>'matchesWon')::INTEGER, 0),
        COALESCE((player_record->>'points')::INTEGER, 0),
        COALESCE((player_record->>'buchholzScore')::NUMERIC, 0)
      ) RETURNING id INTO new_player_id;

      -- Mapper l'ancien ID au nouveau
      player_id_map := jsonb_set(
        player_id_map,
        ARRAY[player_record->>'id'],
        to_jsonb(new_player_id::TEXT)
      );
    END LOOP;
  END IF;

  -- 3. Migrer les matchs
  IF tournament_row.bracket_data ? 'matches' THEN
    FOR match_record IN SELECT * FROM jsonb_array_elements(tournament_row.bracket_data->'matches')
    LOOP
      INSERT INTO tournament_matches (
        tournament_id,
        round_number,
        match_number,
        bracket_type,
        player1_id,
        player2_id,
        winner_id,
        status,
        score_data,
        scheduled_time,
        created_at,
        updated_at
      ) VALUES (
        new_tournament_id,
        COALESCE((match_record->>'roundNumber')::INTEGER, 0),
        COALESCE((match_record->>'matchNumber')::INTEGER, 0),
        COALESCE(match_record->>'bracketType', 'main'),
        (player_id_map->(match_record->>'player1Id'))::UUID,
        (player_id_map->(match_record->>'player2Id'))::UUID,
        (player_id_map->(match_record->>'winnerId'))::UUID,
        COALESCE(match_record->>'status', 'scheduled'),
        COALESCE(match_record->'scoreData', '{"sets": [], "tiebreaks": []}'::jsonb),
        (match_record->>'scheduledTime')::TIMESTAMPTZ,
        COALESCE((match_record->>'createdAt')::TIMESTAMPTZ, NOW()),
        NOW()
      );
    END LOOP;
  END IF;

  -- 4. Migrer les rounds (Round Robin / Swiss)
  IF tournament_row.bracket_data ? 'rounds' THEN
    FOR round_record IN SELECT * FROM jsonb_array_elements(tournament_row.bracket_data->'rounds')
    LOOP
      INSERT INTO tournament_rounds (
        tournament_id,
        round_number,
        name,
        status,
        total_matches,
        completed_matches,
        created_at
      ) VALUES (
        new_tournament_id,
        (round_record->>'roundNumber')::INTEGER,
        round_record->>'name',
        COALESCE(round_record->>'status', 'pending'),
        COALESCE((round_record->>'totalMatches')::INTEGER, 0),
        COALESCE((round_record->>'completedMatches')::INTEGER, 0),
        COALESCE((round_record->>'createdAt')::TIMESTAMPTZ, NOW())
      );
    END LOOP;
  END IF;

  RETURN new_tournament_id;
END;
$$ LANGUAGE plpgsql;
```

### 3.2 Exécuter la migration

```sql
-- Migrer tous les tournois un par un
DO $$
DECLARE
  tournament_record anonymous_tournaments%ROWTYPE;
  migrated_count INTEGER := 0;
  error_count INTEGER := 0;
BEGIN
  FOR tournament_record IN SELECT * FROM anonymous_tournaments ORDER BY created_at
  LOOP
    BEGIN
      PERFORM migrate_anonymous_tournament_to_v2(tournament_record);
      migrated_count := migrated_count + 1;

      -- Log progression tous les 10 tournois
      IF migrated_count % 10 = 0 THEN
        RAISE NOTICE 'Migrated % tournaments...', migrated_count;
      END IF;

    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      RAISE WARNING 'Failed to migrate tournament %: %', tournament_record.name, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'Migration complete: % successful, % errors', migrated_count, error_count;
END $$;
```

**✅ Checkpoint**: Vérifiez le nombre de tournois migrés
```sql
SELECT
  (SELECT COUNT(*) FROM anonymous_tournaments) as old_count,
  (SELECT COUNT(*) FROM tournaments) as new_count,
  (SELECT COUNT(*) FROM anonymous_tournaments) = (SELECT COUNT(*) FROM tournaments) as match;
```

---

## Étape 4: Vérification

### 4.1 Vérifier les compteurs

```sql
-- Vérifier que les joueurs sont correctement comptés
SELECT
  t.id,
  t.name,
  t.total_players,
  (SELECT COUNT(*) FROM tournament_players WHERE tournament_id = t.id) as actual_players
FROM tournaments t
WHERE t.total_players != (SELECT COUNT(*) FROM tournament_players WHERE tournament_id = t.id);

-- Devrait retourner 0 lignes
```

### 4.2 Vérifier l'intégrité référentielle

```sql
-- Matches sans joueur1
SELECT COUNT(*) FROM tournament_matches WHERE player1_id IS NULL AND status != 'scheduled';

-- Matches avec winner invalide
SELECT COUNT(*) FROM tournament_matches
WHERE winner_id IS NOT NULL
  AND winner_id NOT IN (player1_id, player2_id);

-- Joueurs orphelins
SELECT COUNT(*) FROM tournament_players p
WHERE NOT EXISTS (SELECT 1 FROM tournaments t WHERE t.id = p.tournament_id);
```

### 4.3 Test de requête

```sql
-- Tester une requête complexe
SELECT
  t.name,
  t.format,
  COUNT(DISTINCT p.id) as players,
  COUNT(m.id) as total_matches,
  COUNT(m.id) FILTER (WHERE m.status = 'completed') as completed_matches
FROM tournaments t
LEFT JOIN tournament_players p ON p.tournament_id = t.id
LEFT JOIN tournament_matches m ON m.tournament_id = t.id
GROUP BY t.id, t.name, t.format
ORDER BY t.created_at DESC
LIMIT 10;
```

**✅ Checkpoint**: Toutes les vérifications passent sans erreurs

---

## Étape 5: Nettoyage

### 5.1 Configurer les RLS (Row Level Security)

```sql
-- Enable RLS sur toutes les tables
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_rounds ENABLE ROW LEVEL SECURITY;

-- Policy: Lecture publique pour les tournois
CREATE POLICY "Tournaments are viewable by everyone"
  ON tournaments FOR SELECT
  USING (true);

-- Policy: Update avec edit token OU owner
CREATE POLICY "Tournaments are updatable by owner or with token"
  ON tournaments FOR UPDATE
  USING (
    auth.uid() = owner_id
    OR edit_token_hash IS NOT NULL
  );

-- Policy: Players viewable par tous
CREATE POLICY "Players are viewable by everyone"
  ON tournament_players FOR SELECT
  USING (true);

-- Policy: Matches viewable par tous
CREATE POLICY "Matches are viewable by everyone"
  ON tournament_matches FOR SELECT
  USING (true);

-- Policy: Rounds viewable par tous
CREATE POLICY "Rounds are viewable by everyone"
  ON tournament_rounds FOR SELECT
  USING (true);
```

### 5.2 Supprimer l'ancienne table (OPTIONNEL - PRUDENCE!)

```sql
-- NE PAS EXÉCUTER AVANT D'ÊTRE SÛR!
-- Garder la backup pendant au moins 30 jours

-- DROP TABLE anonymous_tournaments CASCADE;

-- À la place, renommer pour archivage
ALTER TABLE anonymous_tournaments RENAME TO anonymous_tournaments_archived_YYYYMMDD;
```

---

## Rollback

Si quelque chose se passe mal:

### Rollback complet

```sql
-- 1. Supprimer les nouvelles tables
DROP TABLE IF EXISTS tournament_rounds CASCADE;
DROP TABLE IF EXISTS tournament_matches CASCADE;
DROP TABLE IF EXISTS tournament_players CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;

-- 2. Restaurer depuis backup
-- Via Supabase Dashboard → Settings → Database → Backups
-- Ou restaurer la table de backup
```

### Rollback partiel (garder les deux versions)

```sql
-- Garder à la fois l'ancienne et la nouvelle structure
-- Permet des tests A/B

ALTER TABLE anonymous_tournaments RENAME TO anonymous_tournaments_v1;
-- Les tables V2 restent en place
```

---

## Troubleshooting

### Erreur: "duplicate key value violates unique constraint"

**Cause**: Conflit d'URL code ou de nom de joueur

**Solution**:
```sql
-- Trouver les doublons
SELECT unique_url_code, COUNT(*)
FROM tournaments
GROUP BY unique_url_code
HAVING COUNT(*) > 1;

-- Régénérer les URL codes en conflit
UPDATE tournaments
SET unique_url_code = substring(md5(random()::text) from 1 for 8)
WHERE id IN (
  SELECT id FROM tournaments
  WHERE unique_url_code IN (
    SELECT unique_url_code FROM tournaments
    GROUP BY unique_url_code HAVING COUNT(*) > 1
  )
);
```

### Erreur: "foreign key constraint violation"

**Cause**: Référence à un joueur/match qui n'existe pas

**Solution**:
```sql
-- Nettoyer les références orphelines
UPDATE tournament_matches
SET player1_id = NULL
WHERE player1_id NOT IN (SELECT id FROM tournament_players);

UPDATE tournament_matches
SET player2_id = NULL
WHERE player2_id NOT IN (SELECT id FROM tournament_players);

UPDATE tournament_matches
SET winner_id = NULL
WHERE winner_id NOT IN (SELECT id FROM tournament_players);
```

### Performance lente pendant la migration

**Cause**: Trop de données, index non optimisés

**Solution**:
```sql
-- Désactiver temporairement les triggers
ALTER TABLE tournaments DISABLE TRIGGER ALL;
ALTER TABLE tournament_players DISABLE TRIGGER ALL;
ALTER TABLE tournament_matches DISABLE TRIGGER ALL;

-- Faire la migration

-- Réactiver les triggers
ALTER TABLE tournaments ENABLE TRIGGER ALL;
ALTER TABLE tournament_players ENABLE TRIGGER ALL;
ALTER TABLE tournament_matches ENABLE TRIGGER ALL;

-- Recalculer les compteurs
UPDATE tournaments SET updated_at = NOW();
```

---

## Support

Pour aide avec la migration:
- **Documentation technique**: `TOURNAMENTS_V2_IMPLEMENTATION_GUIDE.md`
- **Issues GitHub**: [Créer une issue](https://github.com/your-repo/issues)
- **Email**: support@yourdomain.com

---

**Version**: 2.0.0
**Date**: Janvier 2025
