-- ── Pastorais ─────────────────────────────────────────────────────────────────

create table public.pastorais (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  category    text not null check (category in ('liturgia', 'formacao', 'social', 'movimentos', 'comunicacao')),
  summary     text not null default '',
  coordinator text not null default '',
  meetings    text not null default '',
  body        text not null default ''
);

alter table public.pastorais enable row level security;

create policy "Pastorais são públicas"
  on public.pastorais for select
  using (true);

create policy "Admin insere pastoral"
  on public.pastorais for insert
  with check (get_my_role() = 'admin');

create policy "Admin atualiza pastoral"
  on public.pastorais for update
  using (get_my_role() = 'admin');

create policy "Admin exclui pastoral"
  on public.pastorais for delete
  using (get_my_role() = 'admin');
