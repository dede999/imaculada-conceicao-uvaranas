# Paróquia Imaculada Conceição — Documento de Referência do Projeto

> Este arquivo serve como briefing e contexto para o desenvolvimento.
> Mantenha-o na raiz do repositório como `PROJETO.md`.

---

## Identidade

| Campo | Valor |
|---|---|
| Nome | Paróquia Imaculada Conceição |
| Localização | Uvaranas, Ponta Grossa — PR |
| Diocese | Diocese de Ponta Grossa |
| Irmandade | Ordem dos Frades Menores Capuchinhos (OFM Cap.) |
| Repositório | Template público — forkável por outras paróquias |

### Unidades

| Nome | Tipo |
|---|---|
| Paróquia Imaculada Conceição | `matriz` |
| Capela São Vicente | `branch` |
| Capela Divina Pastora | `branch` |

---

## Stack

| Camada | Escolha |
|---|---|
| Framework | Nuxt 3 |
| Conteúdo estático | @nuxt/content (Markdown + YAML frontmatter) |
| Estilo | Tailwind CSS (ou UnoCSS) — light mode fixo, sem color-mode |
| i18n | @nuxtjs/i18n — estruturar desde o início, começar só com `pt-BR` |
| Formulários / LGPD | Supabase (dízimo, cadastro, exclusão de dados) |
| Dados financeiros | Script em Go ou Rust que lê `.xlsx` e gera `.json` |
| CI/CD | GitHub Actions — deploy automático + script financeiro agendado (dia 1 de cada mês) |
| Hospedagem | Netlify ou Vercel (tier gratuito) |
| Instagram embed | Behold.so (tier gratuito) |

### Observações de stack

- **Dark mode**: desabilitado intencionalmente. Público amplo (idosos, crianças). Não instalar `@nuxtjs/color-mode`. Todos os tokens de cor são fixos em hex.
- **i18n**: mesmo sem tradução imediata, todos os textos devem vir de arquivos de locale (`locales/pt-BR.json`). Nunca string hardcoded em template.
- **Script financeiro**: compilar o binário no CI antes de rodar. Não usar `go run` ou `cargo run` em produção — recompila toda vez e desperdiça minutos de Action.
- **Supabase**: documentar schema e RLS policies num `README` dedicado em `/docs/dizimo.md`. Centralizar lógica num composable `useDizimo.ts`.

---

## Páginas e rotas

| Rota | Descrição |
|---|---|
| `/` | Home — layout bento |
| `/capelas` | Lista de capelas/paróquias |
| `/dizimo` | Dízimo — dimensões, meios, cadastro, LGPD |
| `/pastorais` | Lista de pastorais (conteúdo em Markdown) |
| `/eventos` | Eventos futuros e passados + comunicados |
| `/noticias` | Blog de notícias (página separada) |
| `/transparencia` | Contas da Igreja — dados extraídos de planilha |

---

## Design — tokens (light mode fixo)

### Paleta âmbar (franciscana — hábito, ocre, areia)

```css
--fr-950: #412402;
--fr-800: #633806;
--fr-600: #854F0B;
--fr-400: #BA7517;
--fr-200: #EF9F27;
--fr-100: #FAC775;
--fr-50:  #FAEEDA;
```

### Paleta teal (conventual — verde claustro, musgo)

```css
--cv-950: #04342C;
--cv-800: #085041;
--cv-600: #0F6E56;
--cv-400: #1D9E75;
--cv-200: #5DCAA5;
--cv-100: #9FE1CB;
--cv-50:  #E1F5EE;
```

### Tipografia

```css
/* Títulos e nomes próprios */
font-family: var(--font-serif);   /* Georgia, serif */

/* Tudo operacional */
font-family: var(--font-sans);    /* system-ui, sans-serif */

/* Eyebrows e labels */
font-size: 11px;
font-weight: 500;
letter-spacing: 0.1em;
text-transform: uppercase;
color: var(--fr-600);

/* Títulos de seção */
font-family: var(--font-serif);
font-size: 22px;
font-weight: 500;
color: var(--fr-950);

/* Corpo */
font-size: 14px;
line-height: 1.7;
```

### Motivos visuais franciscanos

- **Tau**: SVG com curvas Bézier (ver arquivo `/assets/tau.svg`). Usar com parcimônia — um por página.
- **Cordão dos três nós**: elemento decorativo secundário.
- **Acento lateral**: barra de 4px na cor `--fr-600`, usada no hero e cards de destaque.

### Tau SVG (path)

```svg
<svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="
    M4 8 C4 5 7 2 10 2 L54 2 C57 2 60 5 60 8
    C60 13 57 17 52 18 L38 19 L38 68
    C38 74 35 78 32 78 C29 78 26 74 26 68
    L26 19 L12 18 C7 17 4 13 4 8 Z
  " fill="currentColor"/>
</svg>
```

Usar `fill="currentColor"` e controlar a cor via CSS no pai.

### Hierarquia visual das capelas

- **Matriz**: fundo `--fr-50`, borda `--fr-400`, Tau visível, texto `--fr-950`
- **Capelas irmãs**: fundo branco, borda neutra, sem Tau, texto padrão

---

## Schema de conteúdo (Nuxt Content frontmatter)

### Capelas (`content/capelas/*.md`)

```yaml
name: "Paróquia Imaculada Conceição"
type: "matriz"           # ou "branch"
address: "Rua X, 123 — Uvaranas, Ponta Grossa"
images: []

masses:
  - day: 0              # 0 = domingo, 6 = sábado
    time: "09:00"
  - day: 3
    time: "19:30"

confession:             # lista vazia se não houver
  - time_start: "12:00"
    time_end: "13:00"
    days: [0, 6]

catechism:              # lista vazia se não houver
  - group: "Crianças"
    days: [6]
    time: "09:00"
  - group: "Jovens"
    days: [5]
    time: "19:00"
  - group: "Adultos"
    days: [3]
    time: "19:30"
```

### Eventos (`content/events/*.md`)

```yaml
title: "Festa de Nossa Senhora"
type: "event"           # event | announcement
date: "2025-10-12"
end_date: "2025-10-12"  # vazio = comunicado sem prazo
status: "active"        # active | cancelled | postponed
summary: "Celebração anual com missa solene..."
```

**Regras de exibição:**
- Home: apenas `status: active` e data futura
- Evento cancelado: badge visual na página de eventos, nunca sobe para a home
- Sem evento ativo: bloco some com `v-if`, os blocos de notícia e comunicado se expandem

### Notícias (`content/noticias/*.md`)

```yaml
title: "Resultado da campanha do agasalho"
date: "2025-10-02"
summary: "..."
```

### Pastorais (`content/pastorais/*.md`)

Conteúdo livre em Markdown. Frontmatter mínimo:

```yaml
name: "Pastoral da Criança"
summary: "..."
```

---

## Componentes principais

### `StatusPanel.vue`
Calcula em tempo real (via `setInterval` + `useNow` do VueUse) se há missa ou confissão em andamento, comparando horário atual com os dados do frontmatter da chapel.

### `CatechismPill.vue`
- **Desktop**: tooltip no hover com horários por grupo
- **Mobile**: bottom sheet que abre no toque e fecha com toque fora ou após 4 segundos
- Detectar breakpoint via `useBreakpoints` do VueUse
- Usar `Teleport` para o `body` no Nuxt para garantir z-index correto

### `InstagramFeed.vue`
- **Desktop**: grid 3 colunas
- **Mobile**: carrossel com CSS scroll-snap, sem biblioteca. Dots de navegação sincronizados com scroll.
- Provider: Behold.so

### Lógica de eventos na home
```typescript
// Mostrar bloco de evento apenas se:
const showEvent = computed(() =>
  events.value.some(e =>
    e.status === 'active' && new Date(e.date) > new Date()
  )
)
```

---

## CI/CD — GitHub Actions

### Deploy (em cada push para `main`)
```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
- run: npm ci
- run: npm run generate
- uses: netlify/actions/cli@master
```

### Script financeiro (dia 1 de cada mês)
```yaml
on:
  schedule:
    - cron: '0 6 1 * *'

jobs:
  update-financeiro:
    steps:
      - uses: actions/checkout@v4
      - name: Build script
        run: go build -o bin/parse-sheet ./scripts/
      - name: Run script
        run: ./bin/parse-sheet
      - name: Commit JSON gerado
        run: |
          git config user.email "ci@paroquia.bot"
          git config user.name "CI"
          git add content/transparencia/
          git commit -m "chore: atualiza dados financeiros $(date +'%Y-%m')"
          git push
```

---

## Estrutura de pastas sugerida

```
/
├── assets/
│   ├── tau.svg
│   └── css/
│       └── tokens.css        # variáveis de cor e tipografia
├── components/
│   ├── StatusPanel.vue
│   ├── CatechismPill.vue
│   ├── InstagramFeed.vue
│   └── BentoHome/
│       ├── HeroCard.vue
│       ├── EventCard.vue
│       └── CapelasCard.vue
├── composables/
│   ├── useStatusPanel.ts
│   ├── useDizimo.ts
│   └── useAdaptivePopover.ts
├── content/
│   ├── capelas/
│   │   ├── imaculada-conceicao.md
│   │   ├── sao-vicente.md
│   │   └── divina-pastora.md
│   ├── events/
│   ├── noticias/
│   ├── pastorais/
│   └── transparencia/
│       └── dados.json        # gerado pelo script Go/Rust
├── locales/
│   └── pt-BR.json            # todas as strings da UI
├── pages/
│   ├── index.vue
│   ├── capelas.vue
│   ├── dizimo.vue
│   ├── pastorais.vue
│   ├── eventos.vue
│   ├── noticias.vue
│   └── transparencia.vue
├── scripts/                  # script Go ou Rust
│   └── parse_sheet/
├── docs/
│   └── dizimo.md             # instruções de manutenção do Supabase
├── PROJETO.md                # este arquivo
└── nuxt.config.ts
```

---

## Decisões em aberto

- [ ] Nome completo da irmandade franciscana (para o eyebrow do hero)
- [ ] Endereços reais das capelas
- [ ] Horários reais de missa, confissão e catequese
- [ ] Grupos de catequese existentes (Crianças / Jovens / Adultos / RICA?)
- [ ] Provedor de hospedagem final (Netlify vs Vercel)
- [ ] Planilha financeira: Google Drive ou repositório?
- [ ] Linguagem do script de importação: Go ou Rust?