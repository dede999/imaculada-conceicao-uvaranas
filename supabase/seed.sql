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

-- ── Pastorais ──────────────────────────────────────────────────────────────────

insert into public.pastorais (slug, name, category, summary, coordinator, meetings, body) values

('apostolado-da-oracao',
 'Apostolado da Oração', 'movimentos',
 'Santificação pessoal e evangelização das famílias, com devoção especial ao Sagrado Coração de Jesus.',
 'Alba', '1ª quinta-feira de cada mês, às 14h30',
 '<p>O Apostolado da Oração é uma organização composta por leigos católicos cuja finalidade é a santificação pessoal e a evangelização.</p><p>Nasceu num colégio da Companhia de Jesus — padres Jesuítas — na França, e espalhou-se pelo mundo. Trabalha com afinco pela evangelização das famílias, tem uma devoção especial ao Sagrado Coração de Jesus, e todos os seus membros rezam diariamente pelas intenções do Santo Padre o Papa.</p>'),

('catequese',
 'Pastoral Catequética', 'formacao',
 'Itinerário de fé para crianças, jovens e adultos — um caminho permanente de encontro com Jesus Cristo.',
 'Roseli', 'Quintas à tarde · Sextas à noite · Sábados manhã e tarde',
 '<p>A Catequese é o caminho para o discipulado. O cristão é chamado a ser discípulo missionário do Reino de Deus.</p><p>Catequese não pode ser pensada como aula, estudo ou diplomação de curso de fé. É um caminho que começa no ventre da mamãe e termina na ressurreição — um processo permanente ao longo da nossa vida. Estamos sempre aprendendo algo novo a respeito de nossa fé e fazendo experiências de Deus.</p><p>É um itinerário de vida que leva ao encontro e comunhão com Jesus Cristo.</p>'),

('clube-de-maes',
 'Clube de Mães', 'social',
 'Oficina de corte, costura e artesanato com foco em economia solidária e laços comunitários.',
 'Troia', 'Terças-feiras, às 13h30',
 '<p>Oficina de corte, costura e artesanato com foco na economia solidária e no fortalecimento dos laços comunitários entre as mães da paróquia.</p>'),

('cursinho-pre-vestibular',
 'Cursinho Pré-Vestibular', 'social',
 'Preparação gratuita para vestibulares voltada a pessoas de baixa renda, promovendo inclusão social.',
 'Rodrigo', 'Segunda a sexta-feira, das 18h45 às 22h',
 '<p>Assistir pessoas de baixa renda quanto à preparação para cursos vestibulares, propiciando inclusão social.</p><p>Motivar professores das diversas áreas do conhecimento para que participem ativamente do projeto e de outras atividades pastorais da comunidade.</p>'),

('evangelizacao-de-adultos',
 'Evangelização de Adultos', 'formacao',
 'Encontros semanais para adultos que desejam crescer na maturidade da fé e no compromisso com a missão.',
 'Luciano', 'Segundas-feiras, às 19h20',
 '<p><em>"Evangelizar é a missão de Cristo e a razão de ser Igreja, cujo conteúdo foi explicitado no decorrer dos tempos, a partir dos diferentes apelos e situações de cada época"</em> (Cf. Lc 4,18; Mt 28,16-20).</p><p><em>"Para evangelizar com credibilidade, a Igreja deve evangelizar a si mesma por uma conversão constante"</em> (Evangelii Nuntiandi 15 e Puebla 394).</p><p>Somos convidados a crescer na maturidade com Cristo. Jesus Cristo, fonte que sacia e compromete: <em>"Senhor, dá-me dessa água"</em> (Jo 4,15).</p>'),

('jufra',
 'JUFRA Gralha Azul — Juventude Franciscana', 'movimentos',
 'Jovens que buscam viver o Evangelho com o carisma de São Francisco de Assis.',
 'Guilherme Puchta', '2º e 4º domingos, às 15h',
 '<p>A JUFRA Gralha Azul busca viver o Evangelho com o carisma de São Francisco de Assis.</p><p>Para conhecer melhor e se juntar ao grupo, entre em contato pelo Instagram: <strong>@jufragralhaazul</strong>.</p>'),

('legiao-de-maria',
 'Legião de Maria', 'movimentos',
 'Maior organização leiga de apostolado da Igreja Católica, a serviço da evangelização e do amor de Deus.',
 'Sandra', 'Adoração ao Santíssimo: 1ª, 3ª e 5ª segunda-feira, às 8h · Reuniões: todas as segundas, às 13h30',
 '<p>Legião de Maria é uma associação de leigos católicos que servem à Igreja de forma voluntária. A palavra legião significa exército, e legionário é o soldado que faz parte desse exército.</p><p>Foi fundada em Dublin, Irlanda, por Frank Duff em 07 de setembro de 1921. Hoje, entre membros ativos e auxiliares, possui mais de 3 milhões em todo o mundo — a maior organização leiga de apostolado da Igreja Católica.</p><p>O objetivo dos participantes é combater o mal que há no mundo e tudo aquilo que vá contra o projeto de Deus. <em>"O ladrão só vem pra roubar, matar e destruir. Eu vim pra que tenham vida, e a tenham em abundância"</em> (Jo 10,10).</p>'),

('liturgia-e-canto',
 'Pastoral da Liturgia e Canto', 'liturgia',
 'Prepara, realiza e avalia as celebrações, cuidando da música litúrgica e da formação do povo.',
 'Vilcléia', '',
 '<p>A pastoral litúrgica, com a participação da comunidade ou de seus representantes, ocupa-se com a preparação, realização e avaliação das celebrações. Comporta uma adequada organização da vida litúrgica em todos os níveis eclesiais e uma permanente formação litúrgica do povo, dos ministros e das equipes de liturgia.</p><p>A música é a linguagem que envolve globalmente a pessoa pela emoção. Cria um clima próprio para a assembleia vivenciar a Liturgia como um momento intenso de comunhão com Deus e com os irmãos. Todo canto litúrgico deve ser inspirado na Bíblia, na Tradição da Igreja e no povo.</p>'),

('mece',
 'Ministros Extraordinários da Comunhão — MECE', 'liturgia',
 'Leigos que distribuem a comunhão e presidem celebrações da Palavra, levando os sacramentos aos doentes.',
 'Almira', '4ª quinta-feira de cada mês, às 20h',
 '<p>O Ministro Extraordinário da Comunhão é, na Igreja Católica, um leigo a quem é dada permissão — de forma temporária ou permanente — de distribuir a comunhão aos fiéis, na missa ou noutras circunstâncias, quando não há um ministro ordenado (bispo, presbítero ou diácono).</p><p>Chamam-se extraordinários porque só devem exercer o seu ministério em caso de necessidade, pois os ministros ordinários da comunhão são os fiéis que receberam o sacramento da ordem. Na ausência do presbítero ou diácono, o MECE preside a Celebração da Palavra (Culto à Palavra). Sua principal atividade é levar a Sagrada Comunhão aos doentes impossibilitados de participar da Santa Missa.</p>'),

('ordem-franciscana-secular',
 'Ordem Franciscana Secular — OFS', 'liturgia',
 'Leigos e leigas que vivem o Evangelho segundo o carisma de São Francisco de Assis.',
 'Rogério (Ministro da Fraternidade)', 'Todo 3º domingo às 18h (Missa) e às 19h30 (encontro fraterno)',
 '<p>A Ordem Franciscana Secular é uma organização de pessoas — homens e mulheres, jovens e adultos, casados e solteiros — que procuram viver o Evangelho de Nosso Senhor Jesus Cristo, seguindo o exemplo de São Francisco de Assis.</p><p>As três ordens criadas por São Francisco — Frades, Clarissas e a Ordem Terceira — formam a família franciscana, presente no mundo todo, nas mais diferentes circunstâncias e atividades. Sua missão é viver e testemunhar Nosso Senhor Jesus Cristo pobre, humilde e crucificado.</p><p>Na Igrejinha de Uvaranas temos duas fraternidades: <strong>Santana</strong>, que já completou 90 anos, e <strong>Frei Eurico de Mello</strong>. Ambas estão em plena atividade.</p>'),

('pascom',
 'PASCOM — Pastoral da Comunicação', 'comunicacao',
 'Comunicação nas redes sociais e transmissão das missas, fazendo comunhão entre as pastorais da paróquia.',
 'Gabriel', '',
 '<p>A Pastoral da Comunicação — PASCOM — nasceu da necessidade da Igreja de comunicar-se: tanto a comunicação através dos meios impressos quanto os atuais veículos como televisão, rádio e internet.</p><p>A principal função da PASCOM dentro da Igreja é comunicar — é fazer comunhão entre as pastorais, movimentos e associações existentes na comunidade.</p><p>Em nossa paróquia temos página no Facebook, perfil no Instagram, e a missa das 10h aos domingos tem transmissão online com escala da equipe.</p>'),

('pastoral-do-batismo',
 'Pastoral do Batismo', 'liturgia',
 'Preparação de pais e padrinhos para o sacramento do Batismo, em cinco encontros na paróquia.',
 'Diácono Nelson Luís', 'Cinco encontros na paróquia onde os pais residem',
 '<p>O Batismo é um sacramento de iniciação cristã. É tão importante que Jesus quis ser batizado antes de iniciar sua vida pública (Mt 3,13-17). É o fundamento da vida no seguimento de Jesus, o início da vida em comunidade e o grande sinal do amor de Deus para conosco. Faz-nos filhos e filhas de Deus e irmãos e irmãs de Jesus. O Batismo nos transforma em morada da Santíssima Trindade e liberta-nos do pecado.</p><p>Em nossa comunidade há uma preparação para pais e padrinhos. Desde janeiro de 2025 a Diocese personalizou o itinerário: os cinco encontros são realizados na paróquia onde os pais residem. O primeiro encontro é só com os pais; os três seguintes os padrinhos participam junto com os pais; e o quinto acontece após o batizado.</p>'),

('pastoral-dos-coroinhas',
 'Pastoral dos Coroinhas', 'liturgia',
 'Crianças a partir de 8 anos a serviço do altar, da liturgia e da acolhida na comunidade.',
 'Luan Mateus', 'Formação mensal com acompanhamento de adulto responsável',
 '<p>É um incentivo para que desde pequeninos (a partir de 08 anos) abracem a missão na Comunidade. Eles estão a serviço da Igreja, do Altar e da Liturgia nas suas várias dimensões: servir o altar, entregar folhetos às pessoas, ajudar na acolhida da Comunidade, nas Celebrações, etc.</p><p>Com certeza, <em>"criança, evangeliza criança"</em>! Seu testemunho de amor à Igreja e de participação chega aos seus coleguinhas da escola, do bairro e da própria comunidade, que também sentem o apelo de participar da vida e da missão da Igreja.</p>'),

('pastoral-familiar',
 'Pastoral Familiar', 'movimentos',
 'Fortalecimento e evangelização das famílias, com preparação de noivos para o sacramento do Matrimônio.',
 'Em reestruturação', '',
 '<p>Para enfrentar os desafios da sociedade pluricultural em que vivemos, a Igreja tem acentuado que a base familiar deve ser edificada a partir do Sacramento do Matrimônio. O enfoque da pastoral é: promover, fortalecer e evangelizar a família; acolher e valorizar o ser humano desde a concepção até a morte; e fortalecer os laços familiares.</p><p>A Pastoral Familiar está em processo de reestruturação. Dois casais preparam atualmente os encontros com os casais de noivos, com apoio dos diáconos.</p>'),

('pastoral-social',
 'Pastoral Social', 'social',
 'Projeto Semeando Esperança — atendimento a mais de 40 famílias com cestas, visitas e evangelização.',
 'Sandra e Simone', 'Reuniões mensais',
 '<p>Evangelizar é fazer o que Jesus fez: por palavras e ações expressar o amor misericordioso e compassivo de Deus, em especial para com os pequeninos, pobres, necessitados e esquecidos. Com esse olhar somos convidados a realizar um trabalho social em prol dos menos favorecidos na comunidade, buscando formas concretas de resgatar a dignidade humana à luz do Evangelho.</p><p>Aqui na Igrejinha a Pastoral Social está incluída no <strong>Projeto Semeando Esperança</strong>, que compreende o atendimento a mais de quarenta famílias, com acompanhamento, evangelização, visitas periódicas e distribuição de cestas básicas.</p>'),

('pequenos-grupos',
 'Pequenos Grupos', 'formacao',
 'Cristãos que se reúnem nas casas para partilhar a fé, a vida e a prática da oração em comum.',
 'Patrícia Schiller', '',
 '<p>Os Pequenos Grupos visam a evangelização no âmbito da pessoa, promovendo sua dignidade. São grupos de cristãos que querem fazer a experiência do encontro com o Deus do amor e da vida e para isso se reúnem nas próprias casas para partilhar a fé, a vida e a prática da oração em comum.</p><p>À luz da Palavra de Deus, juntos assumem o compromisso de ações práticas para a transformação da realidade que os cerca.</p><p>O objetivo dos Pequenos Grupos é reunir as pessoas em "família", onde Jesus possa fazer-se presente, conforme a sua promessa: <em>"Onde dois ou mais estiveram reunidos em meu nome, eu estarei no meio deles"</em> (Mt 18,20).</p>'),

('provedores-da-fe',
 'Provedores da Fé — Pastoral da Acolhida', 'social',
 'Animação do dízimo e acolhida nas celebrações — o testemunho de fé que atrai pessoas para a comunidade.',
 'Regina', 'Plantão no Cantinho do Dízimo: Sáb 19h · Dom 8h, 10h e 18h',
 '<p>Dízimo é a expressão da fé de muita gente, também é semente: quando plantado em terra boa dá muitos e bons frutos. Cada pessoa que testemunha sua fé é semente em terra fértil, que atrai mais e mais pessoas para a comunidade.</p><p>Contribuir com o Dízimo é participar da grande missão da Igreja — a evangelização. Quem oferta o Dízimo com consciência e fé torna-se evangelizador, mesmo que não saiba anunciar a Palavra de Deus. Ser dizimista é abrir o coração e a vida, partilhando o que se tem, mesmo quando se tem pouco.</p><p><em>"Cada um dê conforme o impulso do seu coração, não dê de má vontade ou constrangido. Deus ama a quem dá com alegria"</em> (2Cor 9,7).</p>'),

('sav',
 'Serviço de Animação Vocacional — SAV', 'formacao',
 'Anima a comunidade a se comprometer com as vocações e ministérios na missão evangelizadora da Igreja.',
 'Casal Nereu e Gislaine', '3ª quarta-feira de cada mês, às 20h · Adoração ao Santíssimo: 1ª quinta-feira, às 19h30',
 '<p>O SAV tem como objetivo animar a comunidade eclesial para se comprometer de maneira nova, vigorosa e decidida com as vocações e ministérios nas dimensões da ação evangelizadora, tendo presente o processo de enculturação, em vista de uma Igreja toda ministerial e missionária.</p>'),

('zeladoras-de-capelinhas',
 'Zeladoras de Capelinhas', 'movimentos',
 'Culto familiar a Deus por intermédio de Nossa Senhora, com 32 capelinhas circulando na comunidade.',
 'Maria Cristina', 'Adoração Vocacional: 1ª terça-feira, às 14h · Reuniões: 2ª quinta-feira, às 15h',
 '<p>O Movimento das Capelinhas é um culto familiar prestado a Deus por intermédio de Nossa Senhora. Começou em 1888, no Equador, e espalhou-se rapidamente pelo mundo inteiro.</p><p>Em nossa Diocese de Ponta Grossa, milhares de famílias são mensalmente visitadas pela Mãe de Deus. Na comunidade da Igrejinha circulam <strong>trinta e duas capelinhas</strong>.</p>');
