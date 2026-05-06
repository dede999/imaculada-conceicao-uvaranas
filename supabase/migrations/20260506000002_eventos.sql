-- ── Eventos / Anúncios ───────────────────────────────────────────
create table public.eventos (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  title      text not null,
  type       text not null default 'event' check (type in ('event', 'announcement')),
  date       date not null,
  end_date   date,
  status     text not null default 'active' check (status in ('active', 'cancelled', 'postponed')),
  summary    text not null default '',
  body       text not null default '',
  published  bool not null default false,
  created_at timestamptz default now(),
  created_by uuid references public.profiles(id),
  updated_at timestamptz default now(),
  updated_by uuid references public.profiles(id)
);

alter table public.eventos enable row level security;

create policy "Lê eventos publicados"
  on public.eventos for select
  using (published = true);

create policy "Editor lê todos os eventos"
  on public.eventos for select
  using (get_my_role() in ('admin', 'editor'));

create policy "Editor cria eventos"
  on public.eventos for insert
  with check (get_my_role() in ('admin', 'editor'));

create policy "Editor atualiza eventos"
  on public.eventos for update
  using (get_my_role() in ('admin', 'editor'));

create policy "Admin deleta eventos"
  on public.eventos for delete
  using (get_my_role() = 'admin');

create trigger set_eventos_updated_at
  before update on public.eventos
  for each row execute function public.set_updated_at();
