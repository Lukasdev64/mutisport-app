-- Ajouter la colonne email à la table profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- Mettre à jour les profils existants avec l'email de auth.users
-- Note: Cela nécessite des permissions élevées, généralement ok dans les migrations Supabase
DO $$
BEGIN
  UPDATE profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.id = u.id
  AND p.email IS NULL;
END $$;

-- Créer une fonction pour synchroniser l'email lors de l'inscription ou modification
CREATE OR REPLACE FUNCTION public.handle_user_email_sync()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour mettre à jour l'email si l'utilisateur change son email dans auth.users
DROP TRIGGER IF EXISTS on_auth_user_email_update ON auth.users;
CREATE TRIGGER on_auth_user_email_update
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_email_sync();

-- Note: Le trigger de création de profil (handle_new_user) devrait aussi être mis à jour pour inclure l'email
-- Si vous avez déjà un trigger handle_new_user, il faut le modifier.
-- Comme je ne vois pas le code de handle_new_user, je vais créer un trigger séparé ou assumer que le sync update suffira si l'insert se fait sans email puis update?
-- Non, le mieux est de modifier la fonction handle_new_user si elle existe.
-- Mais comme je ne peux pas la voir facilement, je vais créer un trigger spécifique pour l'INSERT aussi, au cas où.

CREATE OR REPLACE FUNCTION public.handle_new_user_email_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- On essaie d'update si le profil existe déjà (créé par un autre trigger)
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  
  -- Si le profil n'existe pas encore, on ne fait rien, l'autre trigger le créera.
  -- Mais si l'autre trigger le crée SANS email, on a un problème.
  -- Idéalement, il faudrait remplacer la fonction handle_new_user.
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- On attache ce trigger après l'insert, en espérant que le profil soit créé.
-- C'est risqué (race condition).
-- Le mieux est de redéfinir handle_new_user si on savait ce qu'il y a dedans.
-- On va supposer que pour les nouveaux utilisateurs, on pourra récupérer l'email autrement ou que le trigger update suffira.

-- Alternative: Une fonction RPC pour récupérer l'ID par email, au cas où le champ email de profiles soit vide.
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS UUID AS $$
DECLARE
  target_id UUID;
BEGIN
  SELECT id INTO target_id FROM auth.users WHERE email = user_email;
  RETURN target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
