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

### Fase 6 — Log de auditoria
- [x] `/admin/log` com paginação (25 por página)
- [x] Filtros por tabela, ação e intervalo de datas
- [x] Diff JSONB legível (campo: antigo → novo)
- [x] Somente admins acessam

### Fase 7 — Dashboard funcional
- [x] Saudação por hora do dia + role badge
- [x] 6 stat cards (notícias, eventos, pastorais, capelas, usuários, pendências)
- [x] Próximos 3 eventos e últimas 5 entradas do audit_log (só admin)
- [x] Grade de acesso rápido aos módulos

### Fase 8 — Multi-tenant
- [x] Tabela `parishes` + junction `profile_parishes`
- [x] `parish_id` em todas as tabelas de conteúdo (migration + backfill)
- [x] RLS com `get_my_parish_ids()` e `is_super_admin()`
- [x] `PARISH_ID` como env var em `nuxt.config.ts` (runtimeConfig privado)
- [x] `getParishId()`, `applyParishFilter()`, `assertChapelAccess()` em `server/utils/`
- [x] Todas as rotas públicas filtradas por `parish_id` do env var
- [x] Todas as rotas admin filtradas por `parishIds` do perfil autenticado
- [x] UI de atribuição cross-paróquia em `/admin/usuarios` (busca por nome/email,
      adiciona editor existente à paróquia atual)
- [x] Aprovação de usuário cria entrada em `profile_parishes` automaticamente

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

## Fase 10 — Templates de email em português

### Motivação

O email padrão do Supabase (convite e magic link) está em inglês, sem identidade visual
e com remetente `noreply@mail.app.supabase.io`. Para usuários leigos, a experiência de
onboarding começa mal antes mesmo de entrar no painel.

### Abordagem

Templates armazenados em `supabase/templates/` (versionados em Git, aplicados via
`supabase db push`). SMTP built-in do Supabase por ora — o volume de uma paróquia
não justifica um provedor externo. Se a entregabilidade se tornar problema, migrar
para Resend (100 e-mails/dia grátis) numa fase 10.2.

### Emails a customizar

| Template | Gatilho |
|----------|---------|
| `invite.html` | Admin aprova solicitação → `inviteUserByEmail()` |
| `magic_link.html` | Usuário solicita link de login |

### Requisitos de conteúdo

- Idioma: português brasileiro
- Texto intercambiável: nome da paróquia via `PARISH_NAME` (env var) — embutido no
  template em tempo de build; troca de tenant = troca da env var
- Identidade visual: Tau SVG inline, paleta `fr-*` / `cv-*` como CSS inline no `<style>`
  do próprio HTML de email
- Estrutura: cabeçalho com símbolo + nome da paróquia, instrução clara em português,
  botão CTA grande, rodapé com link para o site

### Variáveis disponíveis nos templates Supabase

```
{{ .ConfirmationURL }}  — link de confirmação/convite
{{ .Token }}           — token OTP (magic link manual)
{{ .SiteURL }}         — URL base configurada no Supabase dashboard
{{ .Email }}           — email do destinatário
```

### Arquivos a criar

```
supabase/templates/
  invite.html
  magic_link.html
```

### Limitação multi-tenant

Com templates estáticos, a identidade visual não muda por tenant em runtime.
Para branding real per-tenant seria necessário o hook `send_email` + Resend.
Deixar para fase 10.2 quando o segundo tenant for onboardado.

---

## Fase 11 — Refatoração e organização

### Motivação

Com 8 fases entregues, surgem padrões repetidos: modal de confirmação, flash de
sucesso/erro, paginação e inserção em `audit_log` estão duplicados em praticamente
todas as páginas e handlers. A Fase 9 adicionará mais componentes. É o momento
de organizar antes que a dívida cresça.

### Componentes

Extrair padrões repetidos para `app/components/admin/`:

| Componente | Responsabilidade |
|-----------|-----------------|
| `AdminPageHeader.vue` | Título + botão de ação primária da página |
| `AdminConfirmModal.vue` | Dialog genérico de confirmação com slot de mensagem |
| `AdminFlash.vue` | Mensagem temporária de sucesso/erro (auto-dismiss) |
| `AdminPagination.vue` | Prev/next + info de página atual |
| `AdminFilterBar.vue` | Wrapper de filtros com grid responsivo |

`AdminEditor.vue` já existe e segue essa convenção — manter sem mudança.

Componentes públicos (`AppNav`, `ChapelCard`, `StatusPanel`, `InstagramFeed`):
manter flat em `app/components/`. São poucos e estáveis; reorganizar geraria
renaming em cascata sem ganho real.

### Composables

Criar `app/composables/admin/` para lógica exclusiva do painel:

| Composable | Estado encapsulado |
|-----------|-------------------|
| `admin/useFlash.ts` | `{ flash, showFlash, clearFlash }` — tipo + mensagem |
| `admin/useConfirm.ts` | `{ target, openConfirm, confirmed, cancel }` |

Os três composables públicos (`useChapels`, `useParishTime`, `usePastorais`)
ficam na raiz sem mudança.

### Server utils

Extrair inserção no `audit_log` para evitar duplicação nos 28 handlers:

```typescript
// server/utils/auditLog.ts
export function insertAuditLog(supabase: SupabaseClient, opts: {
  table_name: string
  record_id: string
  action: string
  parish_id: string
  actor_id: string
  actor_name: string
  diff?: Record<string, [unknown, unknown]>
}): Promise<void>
```

### Server routes e páginas

Sem reestruturação de pastas em nenhum dos dois — o file-based routing do Nitro
já organiza por feature. O ganho está em handlers e páginas mais curtos com os
novos utils e componentes.

### Ordem de execução sugerida

1. `server/utils/auditLog.ts` + atualizar os 28 handlers (menor risco, maior ganho)
2. `useFlash` e `useConfirm`
3. `AdminConfirmModal`, `AdminFlash`, `AdminPagination`
4. Atualizar todas as páginas admin para usar os novos componentes/composables
5. `AdminPageHeader` e `AdminFilterBar` (ganho cosmético, menor prioridade)

---

## Decisões já tomadas

- **Editor**: Tiptap (WYSIWYG) — implementado via `AdminEditor.vue`
- **Slug**: gerado automaticamente do título, editável antes de salvar, bloqueado depois
- **Pastorais**: migradas para Supabase (não ficaram em Markdown)
- **Capelas**: completamente migradas, incluindo horários, contatos e galeria
- **Editor de capela**: role deliberadamente não criado — problema social, não técnico
- **Multi-tenant**: junction `profile_parishes` para editores (1-N paróquias);
  admins veem tudo via `role = 'admin'` sem filtro de junction
- **PARISH_ID**: env var privada no `runtimeConfig` — rotas públicas não dependem
  do usuário autenticado para saber de qual paróquia exibir conteúdo
- **super_admin**: flag `is_super_admin` em `profiles`; só super_admin cria/deleta
  paróquias; admin gerencia conteúdo e usuários dentro da sua paróquia
- **service_role**: todas as operações admin usam `serverSupabaseServiceRole` —
  RLS é defesa em profundidade, não controle primário
- **Carrossel Instagram**: CSS scroll-snap, sem biblioteca
- **Tooltip CatechismPill**: CSS + VueUse, sem biblioteca
- **Transparência**: aguardando contador — não tratar antes disso
- **Dízimo**: página estática, sem banco, sem formulário — não alterar
