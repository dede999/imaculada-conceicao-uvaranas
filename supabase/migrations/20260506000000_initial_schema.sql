-- ── Helper anti-recursão em policies ────────────────────────────────
create function public.get_my_role()
returns text language sql security definer stable as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ── Perfis ───────────────────────────────────────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null default '',
  parish_role  text not null default '',
  role         text not null default 'editor' check (role in ('admin', 'editor')),
  created_at   timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Lê próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admin lê todos os perfis"
  on public.profiles for select
  using (get_my_role() = 'admin');

create policy "Admin atualiza perfis"
  on public.profiles for update
  using (get_my_role() = 'admin');

-- ── Solicitações de acesso ───────────────────────────────────────────
create table public.user_requests (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  parish_role  text not null,
  status       text not null default 'pending'
                 check (status in ('pending', 'approved', 'rejected')),
  reviewed_by  uuid references public.profiles(id),
  reviewed_at  timestamptz,
  created_at   timestamptz default now()
);

alter table public.user_requests enable row level security;

create policy "Qualquer um pode solicitar"
  on public.user_requests for insert
  with check (true);

create policy "Admin lê solicitações"
  on public.user_requests for select
  using (get_my_role() = 'admin');

create policy "Admin atualiza solicitações"
  on public.user_requests for update
  using (get_my_role() = 'admin');

-- ── Log de auditoria (imutável) ──────────────────────────────────────
create table public.audit_log (
  id         bigint primary key generated always as identity,
  table_name text not null,
  record_id  uuid,
  action     text not null check (action in ('create', 'update', 'delete', 'publish', 'unpublish', 'approve', 'reject')),
  diff       jsonb,
  actor_id   uuid references public.profiles(id),
  actor_name text,
  created_at timestamptz default now()
);

alter table public.audit_log enable row level security;

create policy "Admin lê o log"
  on public.audit_log for select
  using (get_my_role() = 'admin');

-- ── Trigger: cria perfil ao confirmar e-mail ─────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, parish_role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'parish_role', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
