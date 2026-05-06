-- Dados iniciais de exemplo
-- Execute após as migrations em ambiente de desenvolvimento

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
