-- Add configurable footer motto to parish_config
alter table parish_config
  add column if not exists footer_show         boolean not null default true,
  add column if not exists footer_motto_latin  text    not null default 'Instaurare omnia in Christo',
  add column if not exists footer_motto_pt     text    not null default 'Restaurar todas as coisas em Cristo',
  add column if not exists footer_display_mode text    not null default 'both'
    check (footer_display_mode in ('latin_only', 'both', 'translation_only'));
