-- Configuration du bucket de stockage pour les fichiers de compétition
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer le bucket (si pas déjà fait via l'interface)
-- Nom: competition-files
-- Public: true

-- 2. Politiques de sécurité pour le bucket

-- Permettre à tout le monde de lire les fichiers (car bucket public)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'competition-files');

-- Permettre aux utilisateurs authentifiés d'uploader
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'competition-files');

-- Permettre aux utilisateurs authentifiés de mettre à jour leurs fichiers
CREATE POLICY "Authenticated users can update files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'competition-files');

-- Permettre aux utilisateurs authentifiés de supprimer leurs fichiers
CREATE POLICY "Authenticated users can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'competition-files');
