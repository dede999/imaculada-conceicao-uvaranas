-- ── Phase 8: Multi-tenant support ──────────────────────────────────────────
--
-- Fixed parish UUID for Imaculada Conceição — Uvaranas:
--   aaaaaaaa-0000-4000-8000-000000000001
--
-- After running this migration, add to .env / Netlify env vars:
--   PARISH_ID=aaaaaaaa-0000-4000-8000-000000000001
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Parishes ──────────────────────────────────────────────────────────────

create table public.parishes (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  created_at timestamptz default now()
);

insert into public.parishes (id, slug, name) values
  ('aaaaaaaa-0000-4000-8000-000000000001',
   'imaculada-conceicao',
   'Paróquia Imaculada Conceição — Uvaranas');

-- ── 2. Profile → parish assignments (editors only; admins bypass) ────────────
--    An editor with profile_parishes entries covering all M parishes
--    still cannot manage users — that requires role = 'admin'.

create table public.profile_parishes (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  parish_id  uuid not null references public.parishes(id) on delete cascade,
  primary key (profile_id, parish_id)
);

alter table public.profile_parishes enable row level security;

create policy "profile_parishes_own_select"
  on public.profile_parishes for select
  using (auth.uid() = profile_id);

create policy "profile_parishes_admin_all"
  on public.profile_parishes for all
  using (get_my_role() = 'admin');

-- ── 3. Extend profiles ───────────────────────────────────────────────────────
--    is_super_admin: operator-level flag (fraternidade), wired in Phase 9.

alter table public.profiles
  add column is_super_admin boolean not null default false;

-- ── 4. Add parish_id to content tables (nullable for safe backfill) ──────────

alter table public.noticias      add column parish_id uuid references public.parishes(id);
alter table public.eventos       add column parish_id uuid references public.parishes(id);
alter table public.pastorais     add column parish_id uuid references public.parishes(id);
alter table public.chapels       add column parish_id uuid references public.parishes(id);
alter table public.user_requests add column parish_id uuid references public.parishes(id);
alter table public.audit_log     add column parish_id uuid references public.parishes(id);

-- ── 5. Backfill all existing rows → Imaculada Conceição ─────────────────────

update public.noticias      set parish_id = 'aaaaaaaa-0000-4000-8000-000000000001' where parish_id is null;
update public.eventos       set parish_id = 'aaaaaaaa-0000-4000-8000-000000000001' where parish_id is null;
update public.pastorais     set parish_id = 'aaaaaaaa-0000-4000-8000-000000000001' where parish_id is null;
update public.chapels       set parish_id = 'aaaaaaaa-0000-4000-8000-000000000001' where parish_id is null;
update public.user_requests set parish_id = 'aaaaaaaa-0000-4000-8000-000000000001' where parish_id is null;

-- ── 6. Enforce NOT NULL on content tables (audit_log stays nullable) ─────────

alter table public.noticias      alter column parish_id set not null;
alter table public.eventos       alter column parish_id set not null;
alter table public.pastorais     alter column parish_id set not null;
alter table public.chapels       alter column parish_id set not null;

-- ── 7. Migrate all existing profiles → profile_parishes ─────────────────────

insert into public.profile_parishes (profile_id, parish_id)
  select id, 'aaaaaaaa-0000-4000-8000-000000000001'
  from public.profiles;

-- ── 8. Per-parish slug uniqueness (drop global, add scoped) ─────────────────

alter table public.noticias  drop constraint noticias_slug_key;
alter table public.noticias  add  constraint noticias_slug_parish_key  unique (parish_id, slug);

alter table public.eventos   drop constraint eventos_slug_key;
alter table public.eventos   add  constraint eventos_slug_parish_key   unique (parish_id, slug);

alter table public.pastorais drop constraint pastorais_slug_key;
alter table public.pastorais add  constraint pastorais_slug_parish_key unique (parish_id, slug);

alter table public.chapels   drop constraint chapels_slug_key;
alter table public.chapels   add  constraint chapels_slug_parish_key   unique (parish_id, slug);

-- ── 9. Helper functions ──────────────────────────────────────────────────────

-- Returns the set of parish UUIDs the current user is assigned to.
-- Admins check role separately and bypass this.
create or replace function public.get_my_parish_ids()
returns setof uuid language sql security definer stable as $$
  select parish_id from public.profile_parishes where profile_id = auth.uid()
$$;

create or replace function public.is_super_admin()
returns boolean language sql security definer stable as $$
  select coalesce(is_super_admin, false) from public.profiles where id = auth.uid()
$$;

-- ── 10. Update RLS policies ──────────────────────────────────────────────────
--
-- Admin role = all parishes (no parish filter needed for admins).
-- Editor role = only rows where parish_id is in their profile_parishes.
-- Public read = published rows only (no auth required).

-- noticias
drop policy "Editor lê todas as notícias" on public.noticias;
drop policy "Editor cria notícias"         on public.noticias;
drop policy "Editor atualiza notícias"     on public.noticias;
drop policy "Admin deleta notícias"        on public.noticias;

create policy "noticias_auth_select" on public.noticias for select
  using (
    get_my_role() = 'admin'
    or parish_id = any(array(select * from get_my_parish_ids()))
  );

create policy "noticias_auth_insert" on public.noticias for insert
  with check (
    get_my_role() = 'admin'
    or parish_id = any(array(select * from get_my_parish_ids()))
  );

create policy "noticias_auth_update" on public.noticias for update
  using (
    get_my_role() = 'admin'
    or parish_id = any(array(select * from get_my_parish_ids()))
  );

create policy "noticias_auth_delete" on public.noticias for delete
  using (
    get_my_role() = 'admin'
    or parish_id = any(array(select * from get_my_parish_ids()))
  );

-- eventos
drop policy "Editor lê todos os eventos" on public.eventos;
drop policy "Editor cria eventos"         on public.eventos;
drop policy "Editor atualiza eventos"     on public.eventos;
drop policy "Admin deleta eventos"        on public.eventos;

create policy "eventos_auth_select" on public.eventos for select
  using (
    get_my_role() = 'admin'
    or parish_id = any(array(select * from get_my_parish_ids()))
  );

create policy "eventos_auth_insert" on public.eventos for insert
  with check (
    get_my_role() = 'admin'
    or parish_id = any(array(select * from get_my_parish_ids()))
  );

create policy "eventos_auth_update" on public.eventos for update
  using (
    get_my_role() = 'admin'
    or parish_id = any(array(select * from get_my_parish_ids()))
  );

create policy "eventos_auth_delete" on public.eventos for delete
  using (
    get_my_role() = 'admin'
    or parish_id = any(array(select * from get_my_parish_ids()))
  );

-- pastorais
drop policy "Admin insere pastoral"  on public.pastorais;
drop policy "Admin atualiza pastoral" on public.pastorais;
drop policy "Admin exclui pastoral"  on public.pastorais;

create policy "pastorais_auth_insert" on public.pastorais for insert
  with check (
    get_my_role() = 'admin'
    or parish_id = any(array(select * from get_my_parish_ids()))
  );

create policy "pastorais_auth_update" on public.pastorais for update
  using (
    get_my_role() = 'admin'
    or parish_id = any(array(select * from get_my_parish_ids()))
  );

create policy "pastorais_auth_delete" on public.pastorais for delete
  using (
    get_my_role() = 'admin'
    or parish_id = any(array(select * from get_my_parish_ids()))
  );

-- chapels (select stays fully public; write scoped to parish)
drop policy "chapels_insert" on public.chapels;
drop policy "chapels_update" on public.chapels;
drop policy "chapels_delete" on public.chapels;

create policy "chapels_auth_insert" on public.chapels for insert
  with check (
    get_my_role() = 'admin'
    or parish_id = any(array(select * from get_my_parish_ids()))
  );

create policy "chapels_auth_update" on public.chapels for update
  using (
    get_my_role() = 'admin'
    or parish_id = any(array(select * from get_my_parish_ids()))
  );

create policy "chapels_auth_delete" on public.chapels for delete
  using (
    get_my_role() = 'admin'
    or parish_id = any(array(select * from get_my_parish_ids()))
  );

-- sub-resources (masses, confessions, catechism, contacts, images)
-- scoped via their parent chapel's parish_id using a JOIN check
drop policy "masses_insert"           on public.masses;
drop policy "masses_update"           on public.masses;
drop policy "masses_delete"           on public.masses;
drop policy "confessions_insert"      on public.confessions;
drop policy "confessions_update"      on public.confessions;
drop policy "confessions_delete"      on public.confessions;
drop policy "catechism_groups_insert" on public.catechism_groups;
drop policy "catechism_groups_update" on public.catechism_groups;
drop policy "catechism_groups_delete" on public.catechism_groups;
drop policy "chapel_contacts_insert"  on public.chapel_contacts;
drop policy "chapel_contacts_update"  on public.chapel_contacts;
drop policy "chapel_contacts_delete"  on public.chapel_contacts;
drop policy "chapel_images_insert"    on public.chapel_images;
drop policy "chapel_images_update"    on public.chapel_images;
drop policy "chapel_images_delete"    on public.chapel_images;

create policy "masses_auth_write" on public.masses for all
  using (
    get_my_role() = 'admin'
    or exists (
      select 1 from public.chapels c
      where c.id = chapel_id
        and c.parish_id = any(array(select * from get_my_parish_ids()))
    )
  );

create policy "confessions_auth_write" on public.confessions for all
  using (
    get_my_role() = 'admin'
    or exists (
      select 1 from public.chapels c
      where c.id = chapel_id
        and c.parish_id = any(array(select * from get_my_parish_ids()))
    )
  );

create policy "catechism_groups_auth_write" on public.catechism_groups for all
  using (
    get_my_role() = 'admin'
    or exists (
      select 1 from public.chapels c
      where c.id = chapel_id
        and c.parish_id = any(array(select * from get_my_parish_ids()))
    )
  );

create policy "chapel_contacts_auth_write" on public.chapel_contacts for all
  using (
    get_my_role() = 'admin'
    or exists (
      select 1 from public.chapels c
      where c.id = chapel_id
        and c.parish_id = any(array(select * from get_my_parish_ids()))
    )
  );

create policy "chapel_images_auth_write" on public.chapel_images for all
  using (
    get_my_role() = 'admin'
    or exists (
      select 1 from public.chapels c
      where c.id = chapel_id
        and c.parish_id = any(array(select * from get_my_parish_ids()))
    )
  );

-- audit_log: admins read all; editors read only their parishes
drop policy "Admin lê o log" on public.audit_log;

create policy "audit_log_admin_select" on public.audit_log for select
  using (get_my_role() = 'admin');

create policy "audit_log_editor_select" on public.audit_log for select
  using (
    parish_id = any(array(select * from get_my_parish_ids()))
  );

-- user_requests: admin reads all; scoped inserts (public already allowed)
create policy "user_requests_parish_select" on public.user_requests for select
  using (
    get_my_role() = 'admin'
    or parish_id = any(array(select * from get_my_parish_ids()))
  );
