-- Supprimer la table existante pour éviter les conflits de types
drop table if exists push_subscriptions;

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_id text, -- Type text pour correspondre au type id de votre table User
  created_at timestamp with time zone default now()
);

-- Active Row Level Security
alter table push_subscriptions enable row level security;

-- Politique : chaque user voit seulement ses subscriptions (avec cast de uuid vers text)
create policy "Users can manage own subscriptions"
  on push_subscriptions
  for all
  using (auth.uid()::text = user_id);

-- Index pour les recherches rapides
create index on push_subscriptions(user_id);
