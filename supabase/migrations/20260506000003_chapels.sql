-- Migration: chapels schema
-- Creates tables: chapels, chapel_contacts, chapel_images, masses, confessions, catechism_groups

-- ─── chapels ──────────────────────────────────────────────────────────────────

create table public.chapels (
  id      uuid primary key default gen_random_uuid(),
  slug    text unique not null,
  name    text not null,
  type    text not null default 'branch' check (type in ('matriz', 'branch')),
  address text not null default '',
  lat     numeric,
  lng     numeric,
  pastor  text not null default '',
  body    text not null default '',
  sort    smallint not null default 0
);

alter table public.chapels enable row level security;

create policy "chapels_select"
  on public.chapels for select
  using (true);

create policy "chapels_insert"
  on public.chapels for insert
  with check (get_my_role() in ('admin', 'editor'));

create policy "chapels_update"
  on public.chapels for update
  using (get_my_role() in ('admin', 'editor'))
  with check (get_my_role() in ('admin', 'editor'));

create policy "chapels_delete"
  on public.chapels for delete
  using (get_my_role() in ('admin', 'editor'));

-- ─── chapel_contacts ──────────────────────────────────────────────────────────

create table public.chapel_contacts (
  id        uuid primary key default gen_random_uuid(),
  chapel_id uuid not null references public.chapels (id) on delete cascade,
  type      text not null check (type in ('phone', 'whatsapp', 'email', 'instagram', 'facebook', 'youtube', 'tiktok')),
  value     text not null,
  sort      smallint not null default 0
);

alter table public.chapel_contacts enable row level security;

create policy "chapel_contacts_select"
  on public.chapel_contacts for select
  using (true);

create policy "chapel_contacts_insert"
  on public.chapel_contacts for insert
  with check (get_my_role() in ('admin', 'editor'));

create policy "chapel_contacts_update"
  on public.chapel_contacts for update
  using (get_my_role() in ('admin', 'editor'))
  with check (get_my_role() in ('admin', 'editor'));

create policy "chapel_contacts_delete"
  on public.chapel_contacts for delete
  using (get_my_role() in ('admin', 'editor'));

-- ─── chapel_images ────────────────────────────────────────────────────────────

create table public.chapel_images (
  id        uuid primary key default gen_random_uuid(),
  chapel_id uuid not null references public.chapels (id) on delete cascade,
  url       text not null,
  caption   text not null default '',
  sort      smallint not null default 0
);

alter table public.chapel_images enable row level security;

create policy "chapel_images_select"
  on public.chapel_images for select
  using (true);

create policy "chapel_images_insert"
  on public.chapel_images for insert
  with check (get_my_role() in ('admin', 'editor'));

create policy "chapel_images_update"
  on public.chapel_images for update
  using (get_my_role() in ('admin', 'editor'))
  with check (get_my_role() in ('admin', 'editor'));

create policy "chapel_images_delete"
  on public.chapel_images for delete
  using (get_my_role() in ('admin', 'editor'));

-- ─── masses ───────────────────────────────────────────────────────────────────

create table public.masses (
  id          uuid primary key default gen_random_uuid(),
  chapel_id   uuid not null references public.chapels (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  time        text not null,
  note        text,
  active      boolean not null default true
);

alter table public.masses enable row level security;

create policy "masses_select"
  on public.masses for select
  using (true);

create policy "masses_insert"
  on public.masses for insert
  with check (get_my_role() in ('admin', 'editor'));

create policy "masses_update"
  on public.masses for update
  using (get_my_role() in ('admin', 'editor'))
  with check (get_my_role() in ('admin', 'editor'));

create policy "masses_delete"
  on public.masses for delete
  using (get_my_role() in ('admin', 'editor'));

-- ─── confessions ──────────────────────────────────────────────────────────────

create table public.confessions (
  id          uuid primary key default gen_random_uuid(),
  chapel_id   uuid not null references public.chapels (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  time_start  text not null,
  time_end    text not null,
  active      boolean not null default true
);

alter table public.confessions enable row level security;

create policy "confessions_select"
  on public.confessions for select
  using (true);

create policy "confessions_insert"
  on public.confessions for insert
  with check (get_my_role() in ('admin', 'editor'));

create policy "confessions_update"
  on public.confessions for update
  using (get_my_role() in ('admin', 'editor'))
  with check (get_my_role() in ('admin', 'editor'));

create policy "confessions_delete"
  on public.confessions for delete
  using (get_my_role() in ('admin', 'editor'));

-- ─── catechism_groups ─────────────────────────────────────────────────────────

create table public.catechism_groups (
  id          uuid primary key default gen_random_uuid(),
  chapel_id   uuid not null references public.chapels (id) on delete cascade,
  group_name  text not null,
  day_of_week smallint,
  time        text,
  active      boolean not null default true
);

alter table public.catechism_groups enable row level security;

create policy "catechism_groups_select"
  on public.catechism_groups for select
  using (true);

create policy "catechism_groups_insert"
  on public.catechism_groups for insert
  with check (get_my_role() in ('admin', 'editor'));

create policy "catechism_groups_update"
  on public.catechism_groups for update
  using (get_my_role() in ('admin', 'editor'))
  with check (get_my_role() in ('admin', 'editor'));

create policy "catechism_groups_delete"
  on public.catechism_groups for delete
  using (get_my_role() in ('admin', 'editor'));
