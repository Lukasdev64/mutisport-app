# Configuration Supabase pour Multi-Sport Competition

## 1. Créer les tables dans Supabase

Connectez-vous à votre projet Supabase et allez dans l'éditeur SQL pour exécuter le script suivant :

```sql
-- ============================================
-- TABLE: profiles (profils utilisateurs)
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  
  -- Préférences
  newsletter_subscription BOOLEAN DEFAULT false,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT false,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_full_name ON public.profiles(full_name);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Profiles can be created during signup" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- ============================================
-- TABLE: competitions
-- ============================================
CREATE TABLE public.competitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Informations générales
  name TEXT NOT NULL,
  sport TEXT NOT NULL,
  description TEXT,
  competition_date DATE NOT NULL,
  
  -- Lieu
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'France',
  
  -- Participants
  max_participants INTEGER NOT NULL CHECK (max_participants > 0),
  current_participants INTEGER DEFAULT 0 CHECK (current_participants >= 0),
  age_category TEXT NOT NULL CHECK (age_category IN ('minors', 'adults', 'both')),
  
  -- Statut
  is_official BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  
  -- Fichiers
  cover_image_url TEXT,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_competitions_organizer ON public.competitions(organizer_id);
CREATE INDEX idx_competitions_date ON public.competitions(competition_date);
CREATE INDEX idx_competitions_sport ON public.competitions(sport);
CREATE INDEX idx_competitions_status ON public.competitions(status);
CREATE INDEX idx_competitions_city ON public.competitions(city);

-- RLS
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Competitions are viewable by everyone" 
  ON public.competitions FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create competitions" 
  ON public.competitions FOR INSERT 
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their competitions" 
  ON public.competitions FOR UPDATE 
  USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their competitions" 
  ON public.competitions FOR DELETE 
  USING (auth.uid() = organizer_id);

-- ============================================
-- TABLE: competition_files
-- ============================================
CREATE TABLE public.competition_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_competition_files_competition ON public.competition_files(competition_id);

-- RLS
ALTER TABLE public.competition_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Competition files are viewable by everyone" 
  ON public.competition_files FOR SELECT 
  USING (true);

CREATE POLICY "Organizers can upload files to their competitions" 
  ON public.competition_files FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.competitions 
      WHERE id = competition_id AND organizer_id = auth.uid()
    )
  );

-- ============================================
-- TABLE: participants (inscriptions)
-- ============================================
CREATE TABLE public.participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Statut
  registration_status TEXT DEFAULT 'pending' CHECK (
    registration_status IN ('pending', 'confirmed', 'cancelled', 'rejected')
  ),
  
  -- Disponibilité
  availability_status TEXT DEFAULT 'unknown' CHECK (
    availability_status IN ('confirmed', 'declined', 'unknown')
  ),
  
  -- Notes
  notes TEXT,
  
  -- Métadonnées
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(competition_id, user_id)
);

-- Index
CREATE INDEX idx_participants_competition ON public.participants(competition_id);
CREATE INDEX idx_participants_user ON public.participants(user_id);
CREATE INDEX idx_participants_status ON public.participants(registration_status);

-- RLS
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view participants of competitions they're involved in" 
  ON public.participants FOR SELECT 
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.competitions 
      WHERE id = competition_id AND organizer_id = auth.uid()
    )
  );

CREATE POLICY "Users can register themselves to competitions" 
  ON public.participants FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registration" 
  ON public.participants FOR UPDATE 
  USING (auth.uid() = user_id);

-- ============================================
-- TABLE: results (résultats)
-- ============================================
CREATE TABLE public.results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE NOT NULL,
  
  -- Résultats
  rank INTEGER CHECK (rank > 0),
  score DECIMAL(10, 2),
  time_seconds INTEGER,
  points INTEGER DEFAULT 0,
  
  -- Notes
  notes TEXT,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(competition_id, participant_id)
);

-- Index
CREATE INDEX idx_results_competition ON public.results(competition_id);
CREATE INDEX idx_results_participant ON public.results(participant_id);
CREATE INDEX idx_results_rank ON public.results(rank);

-- RLS
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Results are viewable by everyone" 
  ON public.results FOR SELECT 
  USING (true);

CREATE POLICY "Only organizers can manage results" 
  ON public.results FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.competitions 
      WHERE id = competition_id AND organizer_id = auth.uid()
    )
  );

-- ============================================
-- TABLE: messages
-- ============================================
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE,
  
  -- Contenu
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  
  -- Statut
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_messages_competition ON public.messages(competition_id);
CREATE INDEX idx_messages_read_status ON public.messages(is_read);

-- RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages" 
  ON public.messages FOR SELECT 
  USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "Users can send messages" 
  ON public.messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received" 
  ON public.messages FOR UPDATE 
  USING (auth.uid() = receiver_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Fonction: Mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitions_updated_at 
  BEFORE UPDATE ON public.competitions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participants_updated_at 
  BEFORE UPDATE ON public.participants 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_results_updated_at 
  BEFORE UPDATE ON public.results 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction: Créer un profil automatiquement lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonction: Mettre à jour le nombre de participants
CREATE OR REPLACE FUNCTION update_competition_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.registration_status = 'confirmed' THEN
    UPDATE public.competitions 
    SET current_participants = current_participants + 1
    WHERE id = NEW.competition_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.registration_status != 'confirmed' AND NEW.registration_status = 'confirmed' THEN
      UPDATE public.competitions 
      SET current_participants = current_participants + 1
      WHERE id = NEW.competition_id;
    ELSIF OLD.registration_status = 'confirmed' AND NEW.registration_status != 'confirmed' THEN
      UPDATE public.competitions 
      SET current_participants = current_participants - 1
      WHERE id = NEW.competition_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.registration_status = 'confirmed' THEN
    UPDATE public.competitions 
    SET current_participants = current_participants - 1
    WHERE id = OLD.competition_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le compteur de participants
CREATE TRIGGER update_participant_count
  AFTER INSERT OR UPDATE OR DELETE ON public.participants
  FOR EACH ROW EXECUTE FUNCTION update_competition_participant_count();
```

## 2. Créer le bucket de storage

Allez dans **Storage** et créez un nouveau bucket :

- **Nom** : `competition-files`
- **Public** : ✅ Oui (pour permettre l'accès public aux images)

### Configuration des politiques Storage :

Allez dans **Storage** → **Policies** → **New Policy** pour `competition-files` et créez ces 3 politiques :

#### Politique 1 : Lecture publique
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'competition-files');
```

#### Politique 2 : Upload pour utilisateurs authentifiés
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'competition-files');
```

#### Politique 3 : Mise à jour pour utilisateurs authentifiés
```sql
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'competition-files')
WITH CHECK (bucket_id = 'competition-files');
```

#### Politique 4 : Suppression pour utilisateurs authentifiés
```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'competition-files');
```

**OU utilisez cette commande SQL simplifiée pour tout créer :**

```sql
-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Lecture publique
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'competition-files');

-- Upload pour authentifiés
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'competition-files');

-- Mise à jour pour authentifiés
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'competition-files')
WITH CHECK (bucket_id = 'competition-files');

-- Suppression pour authentifiés
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'competition-files');
```

## 3. Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon-publique
```

## 4. Vérification

Pour vérifier que tout fonctionne :

1. Inscrivez-vous avec un nouvel utilisateur
2. Un profil devrait être créé automatiquement dans `profiles`
3. Créez une compétition depuis le dashboard
4. La compétition devrait apparaître dans la table `competitions`
5. Les fichiers uploadés doivent être dans le bucket `competition-files`

## 5. Notes importantes

- **RLS (Row Level Security)** est activé sur toutes les tables
- Les triggers automatiques gèrent :
  - La création du profil utilisateur
  - La mise à jour des timestamps
  - Le comptage des participants
- Les suppressions sont en cascade (supprimer une compétition supprime aussi ses fichiers et participants)
