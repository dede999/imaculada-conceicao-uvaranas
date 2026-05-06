-- Dados iniciais de exemplo
-- Execute após as migrations em ambiente de desenvolvimento

insert into public.eventos (slug, title, type, date, end_date, status, summary, body, published) values
(
  'festa-padroeira-2026',
  'Festa da Padroeira — Imaculada Conceição',
  'event',
  '2026-05-15',
  '2026-05-15',
  'active',
  'Celebração solene da Festa da Padroeira com missa festiva às 10h, procissão pelas ruas do bairro e confraternização comunitária no pátio da paróquia.',
  '<p>A comunidade está convidada para celebrar a Festa da Padroeira em honra à Nossa Senhora da Imaculada Conceição.</p><h2>Programação</h2><ul><li><strong>9h30</strong> — Concentração no pátio</li><li><strong>10h00</strong> — Missa Solene presidida pelo pároco</li><li><strong>11h30</strong> — Procissão pelas ruas do bairro</li><li><strong>12h30</strong> — Almoço comunitário (inscrições na secretaria)</li></ul><p>Venha celebrar com sua família!</p>',
  true
),
(
  'comunicado-voluntarios-pastoral',
  'Pastoral da Criança abre inscrições para voluntários',
  'announcement',
  '2026-04-29',
  null,
  'active',
  'A Pastoral da Criança abre inscrições para novos voluntários. Venha fazer parte desta missão de amor e serviço às famílias mais vulneráveis da nossa comunidade.',
  '<p>A Pastoral da Criança da Paróquia Imaculada Conceição está buscando voluntários para reforçar o trabalho junto às famílias atendidas em Uvaranas.</p><h2>Como participar</h2><p>Compareça à secretaria paroquial de segunda a sexta, das 9h às 12h, e solicite a ficha de cadastro de voluntário.</p><p><strong>Requisitos</strong>: maior de 18 anos, disponibilidade de meio turno por semana.</p><p>Formação inicial será realizada na primeira semana de maio.</p>',
  true
);

insert into public.noticias (slug, title, date, summary, body, published) values
(
  'campanha-agasalho-2026',
  'Encontro anual das pastorais planeja segundo semestre',
  '2026-04-22',
  'Lideranças das pastorais e ministérios se reuniram para planejar as ações do próximo semestre, com destaque para a preparação da Festa da Padroeira em maio.',
  '<p>As lideranças das pastorais e ministérios da Paróquia Imaculada Conceição se reuniram no salão paroquial para o encontro anual de planejamento.</p><h2>Principais decisões</h2><ul><li><strong>Festa da Padroeira</strong>: comissão formada para organizar a programação de 15 de maio</li><li><strong>Pastoral da Criança</strong>: ampliação do atendimento para a região da Capela São Vicente</li><li><strong>Catequese</strong>: início das turmas de adultos em junho, em todas as três unidades</li></ul><p>O próximo encontro está previsto para agosto. Todas as lideranças pastorais estão convidadas.</p>',
  true
),
(
  'reforma-salao-paroquial',
  'Reforma do salão paroquial é concluída',
  '2026-04-10',
  'Após dois meses de obras, o salão paroquial da Paróquia Imaculada Conceição reabriu com nova iluminação, piso reformado e capacidade ampliada para os encontros comunitários.',
  '<p>O salão paroquial da Paróquia Imaculada Conceição foi entregue reformado à comunidade. As obras, iniciadas em fevereiro, foram custeadas por doações dos fiéis e pelo Fundo Paroquial de Obras.</p><h2>O que foi renovado</h2><ul><li>Iluminação LED em todo o espaço</li><li>Piso cerâmico substituído</li><li>Sistema de ventilação ampliado</li><li>Pintura geral das paredes internas</li></ul><p>A paróquia agradece a todos os que contribuíram com doações e com mão de obra voluntária para tornar esta reforma possível. O espaço já está disponível para os grupos e pastorais.</p>',
  true
);
