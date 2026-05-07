# Plano de CMS para Conteúdo da Paróquia

## Objetivo

Permitir que padres e agentes de pastoral editem missas, notícias e eventos diretamente no
site, sem tocar em Markdown ou código. O painel de administração fica no mesmo domínio
(`/admin`), dentro da mesma aplicação Nuxt.

A médio prazo, o mesmo banco de dados e a mesma aplicação devem poder servir a múltiplas
paróquias (multi-tenant), com cada instância tendo sua própria identidade visual e conteúdo.

---

## Decisão de infraestrutura

**Netlify free tier + Supabase free tier → custo €0/mês por tenant**

- Netlify: deploy automático via Git push, funções serverless para API, CDN global
- Supabase: Postgres gerenciado, auth via magic link nativo, Row Level Security, 500 MB gratuito
- Sem servidor para gerenciar, SSL automático, backups automáticos

> Se o projeto crescer e o Supabase free hibernar com frequência (projetos sem acesso por 7+
> dias), o plano Pro do Supabase ($25/mês) é o próximo passo — não migração de infraestrutura.

---

## Autenticação

- **Magic link** (sem senha): usuário recebe e-mail com link de acesso, válido por 1 hora
- Fluxo de solicitação: qualquer pessoa preenche `/admin/solicitar` (público) com nome, e-mail
  e função na paróquia → solicitação fica `pending` → admin aprova → Supabase envia magic link
- Roles: `admin` (aprova usuários, acessa tudo na paróquia) e `editor` (edita conteúdo)
- `is_super_admin` boolean em `profiles` para o operador da fraternidade (ver Fase 3)
- RLS com funções `SECURITY DEFINER` para evitar recursão em policies
- Operações administrativas usam `service_role` via server routes — RLS é defesa em
  profundidade, não controle primário

---

## Estrutura do painel `/admin`

```
/admin                      → redirect para /admin/dashboard ou /admin/login
/admin/login                → formulário de magic link
/admin/dashboard            → resumo: próximos eventos, notícias recentes, atividade recente
/admin/noticias             → lista de notícias (publicadas + rascunhos)
/admin/noticias/nova        → criar notícia
/admin/noticias/[id]        → editar notícia
/admin/eventos              → lista de eventos
/admin/eventos/novo         → criar evento
/admin/eventos/[id]         → editar evento
/admin/capelas              → lista de capelas
/admin/capelas/[id]         → editar dados, contatos e galeria de uma capela
/admin/missas               → tabela de missas/confissões/catequese por capela
/admin/pastorais            → lista de pastorais
/admin/pastorais/novo       → criar pastoral
/admin/pastorais/[id]       → editar pastoral
/admin/usuarios             → listar/convidar/promover/excluir usuários (só admin)
/admin/log                  → log de auditoria com filtros (só admin)
```

---

## Fases concluídas ✅

### Fase 1 — Autenticação e scaffolding
- [x] Criar projeto no Supabase
- [x] Configurar `@nuxtjs/supabase` no Nuxt
- [x] Criar tabelas `profiles`, `user_requests` e `audit_log`
- [x] Implementar `/admin/login` com magic link
- [x] Middleware de rota `admin` que redireciona para login
- [x] Layout do painel (`layouts/admin.vue`) com sidebar

### Fase 2 — Notícias
- [x] Tabela `noticias` no Supabase
- [x] API routes: GET lista, GET detalhe, POST, PATCH, DELETE
- [x] Páginas admin: lista, criar, editar
- [x] Editor WYSIWYG (Tiptap via `AdminEditor.vue`)
- [x] Publicação/despublicação
- [x] Migrar notícias de Markdown para Supabase
- [x] Atualizar `pages/noticias/` para buscar da API

### Fase 3 — Eventos
- [x] Tabela `eventos` no Supabase
- [x] API routes: GET lista, GET detalhe, POST, PATCH, DELETE
- [x] Páginas admin: lista, criar, editar
- [x] Migrar eventos de Markdown para Supabase
- [x] Atualizar `pages/eventos/` para buscar da API

### Fase 4 — Capelas e Missas
- [x] Tabelas `chapels`, `chapel_contacts`, `chapel_images`, `masses`, `confessions`,
      `catechism_groups` no Supabase
- [x] API pública `/api/chapels` e `/api/chapels/[slug]`
- [x] API admin: CRUD completo para capelas, contatos, imagens, missas, confissões,
      catequese
- [x] Páginas admin: lista de capelas, editar capela (meta + contatos + galeria),
      tabela de missas/confissões/catequese
- [x] Migrar todas as capelas e horários de Markdown para Supabase
- [x] Atualizar `pages/capelas/`, `StatusPanel.vue`, `ChapelCard.vue`, `index.vue`
      para formato flat do DB

### Fase 5 — Pastorais e Usuários
- [x] Tabela `pastorais` no Supabase (slug, name, category, summary, coordinator,
      meetings, body)
- [x] API pública `/api/pastorais` e admin CRUD
- [x] Páginas admin: lista, criar, editar
- [x] Migrar 19 pastorais de Markdown para Supabase
- [x] Atualizar `pages/pastorais/index.vue` e `pages/index.vue`
- [x] Remover todos os arquivos `content/pastorais/*.md`
- [x] Gerenciamento de usuários: aprovar solicitações, promover/rebaixar, excluir
- [x] Regras de deleção: admin não pode ser deletado direto, não pode se auto-rebaixar,
      não pode deletar outro admin

---

### Fase 6 — Log de auditoria (stub existe, falta conteúdo)
- [ ] `/admin/log`: buscar `audit_log` com paginação
- [ ] Filtros por: tabela, ator, ação, intervalo de datas
- [ ] Exibir `diff` JSONB de forma legível (campo: [antes → depois])
- [ ] Somente admins acessam

### Fase 7 — Dashboard funcional
- [ ] Resumo de conteúdo: notícias publicadas, eventos futuros, pastorais
- [ ] Próximos 3 eventos
- [ ] Últimas 5 entradas do audit_log
- [ ] Acesso rápido aos módulos

---

## Em espera

### Transparência financeira
- [ ] Aguardando dados do contador
- [ ] Script Go/Rust em `scripts/parse_sheet/` gera `content/transparencia/dados.json`
- [ ] CI roda o script e faz commit no branch; página `/transparencia` lê o JSON gerado

### Dízimo
- [x] Página estática `/dizimo` — sem banco, sem formulário, sem transação
- [ ] Verificar se o conteúdo atual está completo e aprovado

---

## Fase 8 — Multi-tenant

### Conceito

O mesmo banco de dados serve a múltiplas paróquias. Cada paróquia é um **tenant** com
seu próprio conteúdo, usuários e configuração. Diferentes fraternidades (e.g. Imaculada
Conceição e Bom Jesus) partilham a infraestrutura mas não veem o conteúdo umas das outras.

### Hierarquia de roles

| Role | Escopo | Pode fazer |
|------|--------|-----------|
| `super_admin` | Todos os tenants | Ver e editar qualquer dado, gerenciar paróquias, promover admins |
| `admin` | Sua paróquia | Gerenciar usuários e todo o conteúdo da paróquia |
| `editor` | Sua paróquia | Editar conteúdo (notícias, eventos, pastorais, capelas) |

> **Sobre "editor de capela":** deliberadamente não existe esse role. Criar dois tipos de
> editor com hierarquia visível entre eles é um problema social, não técnico. O admin da
> paróquia gerencia quem edita o quê através de treinamento e confiança — não de restrição
> técnica. Se surgir necessidade real no futuro, revisitar.

### Esquema

```sql
-- Nova tabela central de tenants
create table parishes (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,  -- usado no nuxt.config como identificador
  name       text not null,
  created_at timestamptz default now()
);

-- profiles: adicionar parish_id e is_super_admin
alter table profiles
  add column parish_id    uuid references parishes(id),
  add column is_super_admin boolean not null default false;

-- Todas as tabelas de conteúdo recebem parish_id
-- noticias, eventos, pastorais, chapels, etc.
alter table noticias  add column parish_id uuid not null references parishes(id);
alter table eventos   add column parish_id uuid not null references parishes(id);
alter table pastorais add column parish_id uuid not null references parishes(id);
alter table chapels   add column parish_id uuid not null references parishes(id);
-- (idem para masses, confessions, catechism_groups, chapel_contacts, chapel_images)

-- Slugs passam a ser únicos por paróquia, não globalmente
alter table noticias  drop constraint noticias_slug_key;
alter table noticias  add  constraint noticias_slug_parish_key unique (parish_id, slug);
-- (idem para eventos, pastorais, chapels)
```

### RLS com multi-tenant

```sql
-- Função auxiliar (já existe padrão similar com get_my_role)
create or replace function get_my_parish_id()
returns uuid language sql security definer stable as $$
  select parish_id from public.profiles where id = auth.uid()
$$;

create or replace function is_super_admin()
returns boolean language sql security definer stable as $$
  select coalesce(is_super_admin, false) from public.profiles where id = auth.uid()
$$;

-- Exemplo de policy para noticias (replicar em todas as tabelas)
alter table noticias enable row level security;

-- Leitura pública (publicadas) — sem restrição de tenant para SEO
create policy "noticias_public_read" on noticias
  for select using (published = true);

-- Admin e editor veem todo o conteúdo da sua paróquia
create policy "noticias_tenant_read" on noticias
  for select using (
    is_super_admin()
    or parish_id = get_my_parish_id()
  );

-- Escrita restrita à paróquia do usuário (ou super_admin)
create policy "noticias_tenant_write" on noticias
  for all using (
    is_super_admin()
    or parish_id = get_my_parish_id()
  );
```

### Impacto no código Nuxt

- `nuxt.config.ts`: `runtimeConfig.public.parishSlug` identifica o tenant ativo
- Todas as API routes públicas filtram por `parish_id` do tenant configurado
- API routes admin filtram pelo `parish_id` do usuário autenticado (ou ignoram o filtro
  se `is_super_admin`)
- Nenhuma mudança visível para o usuário final — cada instância do site é "sua" paróquia

### Estratégia de rollout incremental

A migração não precisa acontecer de uma vez. O sistema atual funciona como um
tenant implícito. A ordem abaixo permite ir devagar sem quebrar nada:

1. Criar tabela `parishes`, inserir a Imaculada Conceição como primeiro tenant
2. Migration: adicionar `parish_id` às tabelas de conteúdo, popular com o id da
   Imaculada Conceição (todos os dados existentes ficam no tenant correto)
3. Atualizar RLS policies (com `parish_id = get_my_parish_id()`)
4. Atualizar API routes para filtrar por `parish_id` do runtime config
5. Atualizar `nuxt.config.ts` com `parishSlug` e adicionar `parish_id` às API calls
6. **Validar** que o site da Imaculada Conceição continua funcionando normalmente
7. Só então: adicionar o segundo tenant (Bom Jesus), criar usuário admin para ele
8. Testar isolamento: um tenant não pode ver o conteúdo do outro

---

## Fase 9 — Customização por tenant

### Sub-fases (em ordem de complexidade)

#### 9.1 — Paleta de cores, ícone e seções visíveis (baixa complexidade, alto valor)

```sql
create table parish_config (
  parish_id     uuid primary key references parishes(id),
  -- Overrides de tokens CSS (null = usa o padrão do tema base)
  colors        jsonb default '{}',
  -- Ícone/símbolo da paróquia
  -- 'tau' (franciscano), 'sacred_heart' (tradicional), 'custom' (upload)
  icon_type     text not null default 'tau' check (icon_type in ('tau', 'sacred_heart', 'custom')),
  icon_url      text,  -- preenchido apenas quando icon_type = 'custom'
  -- Layout ativo da home (ver B2)
  home_layout   text not null default 'standard',
  -- Quais seções opcionais ficam visíveis
  sections      jsonb default '{"instagram": true, "ministries": true}',
  updated_at    timestamptz default now(),
  updated_by    uuid references profiles(id)
);

-- Histórico para undo — snapshots imutáveis, nunca DELETE
create table parish_config_history (
  id         bigint primary key generated always as identity,
  parish_id  uuid not null references parishes(id),
  snapshot   jsonb not null,  -- cópia completa do parish_config no momento
  actor_id   uuid references profiles(id),
  actor_name text,
  created_at timestamptz default now()
);
```

- Página `/admin/configuracoes/aparencia`: editor de paleta com preview ao vivo
- Seletor de ícone: 3 opções com preview (Tau, Sagrado Coração, upload custom)
  - Tau: identidade franciscana — default para fraternidades OFM/TOR
  - Sagrado Coração: tradicional, comum em paróquias diocesanas e SSPX-adjacentes
  - Custom: upload de SVG ou PNG para paróquias com identidade própria
- Toggles para seções opcionais (Instagram feed, bloco de ministérios)
- Cada mudança grava snapshot em `parish_config_history` antes de aplicar
- Botão "Desfazer" restaura o snapshot anterior (lista dos últimos 10)
- Nuxt injeta tokens CSS sobrescritos via `useHead()` — sem rebuild necessário

#### 9.2 — Templates de layout (moderada complexidade, guardrails por design)

Em vez de drag-n-drop livre, a paróquia escolhe entre um conjunto de templates
pré-desenhados e testados. Cada template é uma combinação válida de seções — não
há como criar um layout quebrado.

**Por que templates e não drag-n-drop:**
Drag-n-drop expõe estados parciais (seção arrastada a meio, ordem que quebra a
narrativa visual). Para usuários leigos, a possibilidade de erro é alta. Templates
com preview são mais seguros: o usuário vê exatamente o que vai ficar, escolhe, e
o resultado é sempre válido. Menos poder, mas menos desastres.

**Templates propostos para a home:**

| Slug | Descrição |
|------|-----------|
| `standard` | Hero → Status → Eventos → Notícias → Ministérios → Instagram |
| `events-first` | Hero → Eventos (destaque) → Status → Notícias → Ministérios |
| `community` | Hero → Ministérios (destaque) → Status → Eventos → Notícias |
| `minimal` | Hero → Status → Notícias → Eventos (sem Instagram, sem Ministérios) |

- `home_layout` em `parish_config` guarda o slug do template ativo
- Página `/admin/configuracoes/layout`: galeria de templates com screenshot/preview
- Mudança de template também grava snapshot para undo
- Mesmo padrão pode ser aplicado a outras páginas no futuro (capelas, pastorais)

#### 9.3 — Overrides de locale (alta complexidade, baixa prioridade)

- `parish_config.locale_overrides jsonb`: patch sobre `locales/pt-BR.json`
- Ex: `{"parish.name": "Paróquia Bom Jesus", "home.hero.subtitle": "texto customizado"}`
- Mergeado em runtime com o locale base antes de montar o `i18n`
- Só faz sentido se a paróquia tiver identidade textual muito diferente do template base

#### Não incluir (por ora)

- Drag-n-drop de seções — substituído por templates pré-desenhados (ver B2)
- Editor de código CSS diretamente — risco de usuário travar a página
- Edição do template HTML/Vue — escopo de product builder, não CMS
- Upload de fontes custom — complexidade de CORS e performance

---

## Decisões já tomadas

- **Editor**: Tiptap (WYSIWYG) — implementado via `AdminEditor.vue`
- **Slug**: gerado automaticamente do título, editável antes de salvar, bloqueado depois
- **Pastorais**: migradas para Supabase (não ficaram em Markdown)
- **Capelas**: completamente migradas, incluindo horários, contatos e galeria
- **Editor de capela**: role deliberadamente não criado (ver Fase A)
- **Carrossel Instagram**: CSS scroll-snap, sem biblioteca
- **Tooltip CatechismPill**: CSS + VueUse, sem biblioteca
- **Transparência**: aguardando contador — não tratar antes disso
- **Dízimo**: página estática, sem banco, sem formulário — não alterar
