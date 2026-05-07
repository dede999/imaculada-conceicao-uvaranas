-- parish_config: per-tenant appearance settings
create table parish_config (
  parish_id   uuid primary key references parishes(id) on delete cascade,
  colors      jsonb not null default '{}',
  icon_type   text  not null default 'tau'
                check (icon_type in ('tau', 'sacred_heart', 'custom')),
  icon_url    text,
  home_layout text  not null default 'standard',
  sections    jsonb not null default '{"instagram": true, "ministries": true}',
  updated_at  timestamptz not null default now(),
  updated_by  uuid references profiles(id)
);

-- immutable snapshots for undo — never DELETE rows
create table parish_config_history (
  id         bigint primary key generated always as identity,
  parish_id  uuid  not null references parishes(id) on delete cascade,
  snapshot   jsonb not null,
  actor_id   uuid  references profiles(id),
  actor_name text,
  created_at timestamptz not null default now()
);

-- RLS
alter table parish_config         enable row level security;
alter table parish_config_history enable row level security;

-- Public: anyone can read config (needed for public site CSS injection)
create policy "parish_config_read" on parish_config
  for select using (true);

-- Admin write (service_role bypasses RLS; these cover authenticated clients)
create policy "parish_config_write" on parish_config
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
    or is_super_admin()
  );

create policy "parish_config_history_read" on parish_config_history
  for select using (true);

create policy "parish_config_history_insert" on parish_config_history
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
    or is_super_admin()
  );

-- Seed default config for every existing parish
insert into parish_config (parish_id)
select id from parishes
on conflict (parish_id) do nothing;
