-- ── Notícias ─────────────────────────────────────────────────────────
create table public.noticias (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  title      text not null,
  date       date not null,
  summary    text not null default '',
  body       text not null default '',
  published  bool not null default false,
  created_at timestamptz default now(),
  created_by uuid references public.profiles(id),
  updated_at timestamptz default now(),
  updated_by uuid references public.profiles(id)
);

alter table public.noticias enable row level security;

create policy "Lê notícias publicadas"
  on public.noticias for select
  using (published = true);

create policy "Editor lê todas as notícias"
  on public.noticias for select
  using (get_my_role() in ('admin', 'editor'));

create policy "Editor cria notícias"
  on public.noticias for insert
  with check (get_my_role() in ('admin', 'editor'));

create policy "Editor atualiza notícias"
  on public.noticias for update
  using (get_my_role() in ('admin', 'editor'));

create policy "Admin deleta notícias"
  on public.noticias for delete
  using (get_my_role() = 'admin');

-- ── Trigger: atualiza updated_at automaticamente ─────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_noticias_updated_at
  before update on public.noticias
  for each row execute function public.set_updated_at();
