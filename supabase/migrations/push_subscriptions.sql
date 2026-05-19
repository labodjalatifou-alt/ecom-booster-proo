create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- Active Row Level Security
alter table push_subscriptions enable row level security;

-- Politique : chaque user voit seulement ses subscriptions
create policy "Users can manage own subscriptions"
  on push_subscriptions
  for all
  using (auth.uid() = user_id);

-- Index pour les recherches rapides
create index on push_subscriptions(user_id);
