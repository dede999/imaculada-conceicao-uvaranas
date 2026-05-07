# Email templates

Templates de e-mail em português para autenticação Supabase.

## Como aplicar

Este projeto não usa `config.toml` (apenas migrations via CLI). Os templates
precisam ser aplicados manualmente no Dashboard do Supabase:

1. Acesse **Authentication → Email Templates** no Dashboard
2. Para cada template abaixo, cole o conteúdo do arquivo `.html` correspondente
   no campo **Body** e salve o assunto indicado

| Template no Dashboard | Arquivo               | Assunto sugerido                                        |
|-----------------------|-----------------------|---------------------------------------------------------|
| Invite user           | `invite.html`         | Convite de acesso ao painel — Paróquia Imaculada Conceição |
| Magic Link            | `magic_link.html`     | Link de acesso ao painel — Paróquia Imaculada Conceição |

## Variáveis utilizadas

- `{{ .ConfirmationURL }}` — link de confirmação/convite gerado pelo Supabase
  (válido por 24 h no invite, 1 h no magic link)

## Atualização

Ao editar os arquivos `.html` neste repositório, aplicar manualmente no Dashboard
seguindo os passos acima. Os arquivos aqui são a fonte de verdade.
