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

-- ─── Chapels ──────────────────────────────────────────────────────────────────

insert into public.chapels (slug, name, type, address, lat, lng, pastor, sort) values
(
  'imaculada-conceicao',
  'Paróquia Imaculada Conceição',
  'matriz',
  'Av. Gen. Carlos Cavalcanti, 361 — Uvaranas, Ponta Grossa — PR',
  -25.090067292243273,
  -50.148260988374844,
  'Padre Frei Pedro Brondani, OFMcap',
  0
),
(
  'divina-pastora',
  'Capela Divina Pastora',
  'branch',
  'R. Tomazina, 675 - Uvaranas, Ponta Grossa - PR, 84025-510',
  -25.098121096522533,
  -50.13699918461159,
  'Padre Frei Pedro Brondani, OFMcap',
  1
),
(
  'sao-vicente',
  'Capela São Vicente',
  'branch',
  'R. Emíliano Perneta, 553 - Uvaranas, Ponta Grossa - PR, 84025-410',
  -25.096216767421247,
  -50.141902245379036,
  'Padre Frei Pedro Brondani, OFMcap',
  2
);

update public.chapels set body = $IC_BODY$<p>A Paróquia Imaculada Conceição é a matriz da comunidade católica em Uvaranas, bairro de Ponta Grossa — PR. Administrada pelos Frades Menores Capuchinhos, a paróquia reúne fiéis de toda a região em torno dos sacramentos, da catequese e da missão evangelizadora.</p><h2>Nossa Missão</h2><p>Evangelizar, celebrar os sacramentos e promover a fraternidade cristã segundo o carisma franciscano capuchinho, colocando o amor ao próximo e a simplicidade de vida no centro de tudo.</p><h2>História</h2><p>Fundada na segunda metade do século XX, a paróquia cresceu junto com o bairro Uvaranas. Hoje conta com duas capelas filiais — Divina Pastora e São Vicente — além de diversas pastorais e ministérios que atendem crianças, jovens, famílias e idosos.</p><h2>Pastorais e Ministérios</h2><ul><li>Pastoral da Criança</li><li>Pastoral da Família</li><li>Pastoral da Juventude</li><li>Ministério da Liturgia</li><li>Legião de Maria</li><li>Apostolado da Oração</li></ul>$IC_BODY$ where slug = 'imaculada-conceicao';

update public.chapels set body = $DP_BODY$<p>A Capela Divina Pastora é uma das capelas filiais da Paróquia Imaculada Conceição, localizada na Rua Tomazina, no bairro Uvaranas. A comunidade é conhecida pela devoção à Nossa Senhora Divina Pastora e pela participação ativa na Legião de Maria.</p><h2>Destaques da Comunidade</h2><p>Todas as quartas-feiras à noite a comunidade se reúne para a Novena de Nossa Senhora Divina Pastora. Às quintas-feiras é realizada a Adoração ao Santíssimo Sacramento, momento de oração silenciosa e contemplação.</p><h2>Catequese</h2><p>A catequese de iniciação cristã é oferecida aos sábados, atendendo crianças e adolescentes em diferentes etapas de formação.</p>$DP_BODY$ where slug = 'divina-pastora';

update public.chapels set body = $SV_BODY$<p>A Capela São Vicente é a segunda capelinha filial da Paróquia Imaculada Conceição, situada na Rua Emíliano Perneta, em Uvaranas. Pequena e acolhedora, a comunidade celebra sua missa dominical às 9h e mantém grupos de catequese aos sábados e sextas-feiras.</p><h2>Comunidade</h2><p>A família de São Vicente tem forte espírito de vizinhança e mutirão. Os voluntários organizam os encontros de catequese e colaboram com as ações sociais da paróquia-matriz.</p>$SV_BODY$ where slug = 'sao-vicente';

-- ─── chapel_contacts (imaculada-conceicao) ────────────────────────────────────

insert into public.chapel_contacts (chapel_id, type, value, sort) values
(
  (select id from public.chapels where slug = 'imaculada-conceicao'),
  'phone', '+55 42 9924-1515', 0
),
(
  (select id from public.chapels where slug = 'imaculada-conceicao'),
  'whatsapp', '+55 42 9924-1515', 1
),
(
  (select id from public.chapels where slug = 'imaculada-conceicao'),
  'email', 'paroquia.imaculada@exemplo.com.br', 2
),
(
  (select id from public.chapels where slug = 'imaculada-conceicao'),
  'instagram', '@paroquiaimaculadapg', 3
),
(
  (select id from public.chapels where slug = 'imaculada-conceicao'),
  'facebook', 'paroquiaimaculadapg', 4
);

-- ─── chapel_images ────────────────────────────────────────────────────────────

insert into public.chapel_images (chapel_id, url, caption, sort) values
(
  (select id from public.chapels where slug = 'imaculada-conceicao'),
  'https://placehold.co/600x400/FAEEDA/412402?text=Fachada',
  'Fachada da Paróquia Imaculada Conceição',
  0
),
(
  (select id from public.chapels where slug = 'imaculada-conceicao'),
  'https://placehold.co/600x400/FAEEDA/412402?text=Interior',
  'Interior da paróquia',
  1
),
(
  (select id from public.chapels where slug = 'imaculada-conceicao'),
  'https://placehold.co/600x400/FAEEDA/412402?text=Altar',
  'Altar principal',
  2
),
(
  (select id from public.chapels where slug = 'divina-pastora'),
  'https://placehold.co/600x400/E1F5EE/04342C?text=Fachada',
  'Fachada da Capela Divina Pastora',
  0
),
(
  (select id from public.chapels where slug = 'divina-pastora'),
  'https://placehold.co/600x400/E1F5EE/04342C?text=Interior',
  'Interior da chapel',
  1
);

-- ─── masses ───────────────────────────────────────────────────────────────────

-- Imaculada Conceição
insert into public.masses (chapel_id, day_of_week, time, note)
select c.id, v.dow, v.t, v.n
from public.chapels c,
     (values
       (0::smallint, '06:30', null::text),
       (0,           '08:00', null),
       (0,           '10:00', null),
       (0,           '17:30', null),
       (0,           '19:30', null),
       (1,           '19:30', null),
       (2,           '19:30', null),
       (3,           '08:30', null),
       (3,           '19:30', null),
       (4,           '19:30', null),
       (5,           '19:30', null),
       (6,           '19:30', null)
     ) as v(dow, t, n)
where c.slug = 'imaculada-conceicao';

-- Divina Pastora
insert into public.masses (chapel_id, day_of_week, time, note)
select c.id, v.dow, v.t, v.n
from public.chapels c,
     (values
       (3::smallint, '19:30', 'Novena'),
       (4,           '19:00', 'Adoração do Santíssimo'),
       (6,           '15:00', 'Participação da equipe de liturgia da Legião de Maria'),
       (6,           '19:00', null::text)
     ) as v(dow, t, n)
where c.slug = 'divina-pastora';

-- São Vicente
insert into public.masses (chapel_id, day_of_week, time, note)
select c.id, v.dow, v.t, v.n
from public.chapels c,
     (values
       (0::smallint, '09:00', null::text)
     ) as v(dow, t, n)
where c.slug = 'sao-vicente';

-- ─── confessions (imaculada-conceicao) ───────────────────────────────────────

insert into public.confessions (chapel_id, day_of_week, time_start, time_end)
select c.id, v.dow, v.ts, v.te
from public.chapels c,
     (values
       (0::smallint, '08:00', '11:00'),
       (2,           '14:00', '17:00'),
       (3,           '14:00', '17:00'),
       (4,           '14:00', '17:00'),
       (5,           '14:00', '17:00'),
       (6,           '09:00', '11:00'),
       (6,           '19:00', '20:00')
     ) as v(dow, ts, te)
where c.slug = 'imaculada-conceicao';

-- ─── catechism_groups ─────────────────────────────────────────────────────────

-- Imaculada Conceição
insert into public.catechism_groups (chapel_id, group_name, day_of_week, time)
select c.id, v.gn, v.dow, v.t
from public.chapels c,
     (values
       ('Adultos',   1::smallint, '19:30'),
       ('1º Tempo',  6,           '09:00'),
       ('2º Tempo',  6,           '10:30'),
       ('3º Tempo',  4,           '14:00'),
       ('4º Tempo',  4,           '15:00')
     ) as v(gn, dow, t)
where c.slug = 'imaculada-conceicao';

-- Divina Pastora
insert into public.catechism_groups (chapel_id, group_name, day_of_week, time)
select c.id, v.gn, v.dow, v.t
from public.chapels c,
     (values
       ('1º Tempo', 6::smallint, '10:15'),
       ('2º Tempo', 6,           '10:00'),
       ('3º Tempo', 6,           '09:00'),
       ('4º Tempo', 6,           '13:00'),
       ('5º Tempo', 6,           '09:00')
     ) as v(gn, dow, t)
where c.slug = 'divina-pastora';

-- São Vicente
insert into public.catechism_groups (chapel_id, group_name, day_of_week, time)
select c.id, v.gn, v.dow, v.t
from public.chapels c,
     (values
       ('3º Tempo', 5::smallint, '18:00'),
       ('4º Tempo', 6,           '13:00'),
       ('5º Tempo', 6,           '14:00')
     ) as v(gn, dow, t)
where c.slug = 'sao-vicente';
