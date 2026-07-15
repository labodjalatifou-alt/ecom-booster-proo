-- Active la publication Realtime pour les notifications en temps réel
-- Exécute ces commandes DANS SUPABASE SQL EDITOR

-- 1. Créer la publication (si elle n'existe pas déjà)
CREATE PUBLICATION supabase_replication_public;

-- 2. Configurer la table orders pour la réplication
ALTER TABLE orders REPLICA IDENTITY FULL;

-- 3. Ajouter la table orders à la publication
ALTER PUBLICATION supabase_replication_public ADD TABLE orders;

-- 4. Vérifier que la publication est active
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_replication_public';
