-- Création de la table pour stocker les jetons d'accès Shopify
create table if not exists shopify_stores (
  id uuid primary key default gen_random_uuid(),
  shop_domain text not null unique,
  access_token text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Désactive le RLS pour permettre les écritures de confiance par le serveur OAuth
alter table shopify_stores disable row level security;
