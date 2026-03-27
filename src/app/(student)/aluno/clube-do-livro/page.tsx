'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Library, Star, BookOpen, ChevronRight, ArrowRight,
  CalendarDays, Users, Bookmark, Quote, Flame,
  MessageCircle, Copy, Check, PenLine,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Book {
  id: string
  title: string
  author: string
  comp: 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'Geral'
  rating: number
  reviews: number
  pages: number
  description: string
  how_to_use: string
  quote: string
  gradient: string
  tags: string[]
  featured?: boolean
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const MONTHLY_PICK: Book = {
  id: 'raizes-brasil',
  title: 'Raízes do Brasil',
  author: 'Sérgio Buarque de Holanda',
  comp: 'C3',
  rating: 4.9,
  reviews: 214,
  pages: 220,
  description:
    'Uma das obras mais importantes da historiografia brasileira. Analisa a formação cultural do Brasil, com foco nas raízes ibéricas e no conceito do "homem cordial" — base de repertório para temas como cidadania, democracia e identidade nacional.',
  how_to_use:
    'Use o conceito de "homem cordial" em temas de corrupção, nepotismo ou falta de civismo. O argumento da herança colonial funciona em praticamente qualquer tema sobre desigualdade ou educação.',
  quote: '"A democracia no Brasil sempre foi um mal-entendido."',
  gradient: 'from-amber-700 to-orange-900',
  tags: ['Identidade nacional', 'Democracia', 'Desigualdade', 'Cidadania'],
  featured: true,
}

const LIBRARY: Book[] = [
  {
    id: 'povo-brasileiro',
    title: 'O Povo Brasileiro',
    author: 'Darcy Ribeiro',
    comp: 'C3',
    rating: 4.8,
    reviews: 189,
    pages: 476,
    description: 'Análise da formação étnica e cultural do Brasil. Indispensável para temas de diversidade, racismo e identidade nacional.',
    how_to_use: 'Cite Darcy Ribeiro ao falar sobre herança cultural, mestiçagem e formação do povo brasileiro em temas de identidade ou inclusão.',
    quote: '"O Brasil não é um país subdesenvolvido; é um país injustiçado."',
    gradient: 'from-red-700 to-rose-900',
    tags: ['Identidade nacional', 'Racismo', 'Diversidade'],
  },
  {
    id: 'capital-seculo21',
    title: 'O Capital no Século XXI',
    author: 'Thomas Piketty',
    comp: 'C3',
    rating: 4.7,
    reviews: 156,
    pages: 696,
    description: 'Análise econômica da desigualdade de renda e riqueza no mundo. Dados essenciais para argumentar sobre concentração de renda.',
    how_to_use: 'Use dados do Piketty (retorno do capital > crescimento da renda) para argumentar sobre desigualdade econômica com embasamento quantitativo.',
    quote: '"Quando a taxa de retorno do capital supera a taxa de crescimento, a desigualdade aumenta."',
    gradient: 'from-blue-700 to-indigo-900',
    tags: ['Desigualdade', 'Economia', 'Capitalismo'],
  },
  {
    id: 'democracia-em-vertigem',
    title: 'Democracia em Vertigem',
    author: 'Petra Costa (documentário Netflix, 2019)',
    comp: 'C2',
    rating: 4.6,
    reviews: 142,
    pages: 0,
    description: 'Documentário indicado ao Oscar sobre a crise democrática brasileira — impeachment, polarização e desinformação. Perspectiva narrativa e histórica sobre a democracia como processo frágil.',
    how_to_use: 'Cite como referência audiovisual contemporânea para temas de democracia, fake news ou participação política. "Democracia como conquista histórica, não garantia permanente" é argumento central e citável.',
    quote: '"A democracia não é uma conquista definitiva — é um processo que pode ser revertido."',
    gradient: 'from-violet-700 to-purple-900',
    tags: ['Democracia', 'Política', 'Desinformação', 'Brasil contemporâneo'],
  },
  {
    id: 'os-sertoes',
    title: 'Os Sertões',
    author: 'Euclides da Cunha',
    comp: 'C3',
    rating: 4.8,
    reviews: 201,
    pages: 632,
    description: 'Obra monumental sobre a Guerra de Canudos e o sertão nordestino. Euclides da Cunha revela a exclusão estrutural do nordeste e a brutalidade do Estado republicano — repertório indispensável para desigualdade regional.',
    how_to_use: 'Cite "o sertanejo é, antes de tudo, um forte" para temas de nordeste ou resiliência. O argumento de que "o Estado virou as costas para o sertão" funciona em qualquer tema de desigualdade regional.',
    quote: '"O sertanejo é, antes de tudo, um forte."',
    gradient: 'from-yellow-700 to-amber-900',
    tags: ['Nordeste', 'Desigualdade regional', 'Exclusão social', 'Identidade brasileira'],
  },
  {
    id: 'pedagogy-oppressed',
    title: 'Pedagogia do Oprimido',
    author: 'Paulo Freire',
    comp: 'C3',
    rating: 4.9,
    reviews: 267,
    pages: 253,
    description: 'Obra fundacional da educação crítica. Conceitos de educação bancária, consciência crítica e emancipação — essenciais para temas de educação.',
    how_to_use: 'Cite Freire em qualquer tema de educação. "Educação bancária" vs "educação problematizadora" é um par conceitual que impressiona corretores.',
    quote: '"Ninguém educa ninguém, ninguém se educa sozinho, os homens se educam em comunhão."',
    gradient: 'from-emerald-700 to-teal-900',
    tags: ['Educação', 'Cidadania', 'Desigualdade'],
  },
  {
    id: 'morte-e-vida-severina',
    title: 'Morte e Vida Severina',
    author: 'João Cabral de Melo Neto',
    comp: 'C3',
    rating: 4.8,
    reviews: 203,
    pages: 96,
    description: 'Poema épico que retrata a vida precária no sertão nordestino. Leitura rápida com repertório poderoso sobre exclusão e dignidade humana.',
    how_to_use: 'Cite o poema para humanizar argumentos sobre pobreza, seca e desigualdade regional. O contraste vida/morte no título já é um argumento retórico.',
    quote: '"O homem, bicho da terra tão pequeno, / chega a ser grande, João?"',
    gradient: 'from-slate-600 to-gray-900',
    tags: ['Nordeste', 'Pobreza', 'Dignidade humana'],
  },

  // ── FORMAÇÃO DO BRASIL ────────────────────────────────────────────────────
  {
    id: 'casa-grande-senzala',
    title: 'Casa-Grande & Senzala',
    author: 'Gilberto Freyre',
    comp: 'C3',
    rating: 4.7,
    reviews: 178,
    pages: 668,
    description: 'Obra fundadora dos estudos culturais brasileiros. Analisa a formação da sociedade brasileira a partir das relações entre colonizadores, indígenas e africanos escravizados.',
    how_to_use: 'Use para argumentos sobre racismo estrutural, herança colonial e desigualdade. Citar Freyre mostra conhecimento de clássicos e profundidade histórica.',
    quote: '"A história do Brasil é a história de uma simbiose e de um conflito."',
    gradient: 'from-stone-600 to-amber-900',
    tags: ['Formação do Brasil', 'Racismo', 'Colonialismo', 'Identidade'],
  },
  {
    id: 'elite-do-atraso',
    title: 'A Elite do Atraso',
    author: 'Jessé Souza',
    comp: 'C3',
    rating: 4.6,
    reviews: 134,
    pages: 192,
    description: 'Análise crítica de como as elites brasileiras mantêm privilégios históricos por meio da naturalização da desigualdade e do populismo.',
    how_to_use: 'Excelente para temas de corrupção, desigualdade e democracia. O conceito de "subcidadania" de Jessé Souza é um argumento forte e específico.',
    quote: '"A pobreza no Brasil não é acidente — é produto de uma elite que a produz e a reproduz."',
    gradient: 'from-zinc-700 to-neutral-900',
    tags: ['Desigualdade', 'Política', 'Democracia', 'Formação do Brasil'],
  },
  {
    id: 'vidas-secas',
    title: 'Vidas Secas',
    author: 'Graciliano Ramos',
    comp: 'C3',
    rating: 4.9,
    reviews: 312,
    pages: 176,
    description: 'Romance modernista sobre a migração nordestina e a desigualdade estrutural. Fabiano e sua família representam toda uma classe excluída do projeto nacional.',
    how_to_use: 'Cite Fabiano e a família como símbolos de exclusão social. A obra humaniza dados de desigualdade — use em temas de seca, nordeste ou dignidade.',
    quote: '"Fabiano, tu és um homem, bradou ele mentalmente."',
    gradient: 'from-orange-800 to-red-950',
    tags: ['Nordeste', 'Exclusão social', 'Migração', 'Desigualdade'],
  },
  {
    id: 'quarto-de-despejo',
    title: 'Quarto de Despejo',
    author: 'Carolina Maria de Jesus',
    comp: 'C5',
    rating: 4.9,
    reviews: 389,
    pages: 204,
    description: 'Diário de uma catadora de papel na favela do Canindé em São Paulo. Documento humano único sobre pobreza, racismo e sobrevivência na cidade.',
    how_to_use: 'Cite Carolina para qualquer tema de pobreza urbana, segurança alimentar, racismo ou desigualdade. "O Brasil é para quem tem dinheiro" é citável diretamente.',
    quote: '"Quando estou na favela, sinto que sou um objeto fora do lugar."',
    gradient: 'from-rose-800 to-pink-950',
    tags: ['Pobreza urbana', 'Racismo', 'Favelização', 'Segurança alimentar'],
  },

  // ── RACISMO E IDENTIDADE ──────────────────────────────────────────────────
  {
    id: 'racismo-estrutural',
    title: 'Racismo Estrutural',
    author: 'Silvio Almeida',
    comp: 'C3',
    rating: 4.9,
    reviews: 445,
    pages: 264,
    description: 'A obra mais citada sobre racismo no Brasil atual. Define racismo estrutural como elemento constituinte das relações sociais — não exceção, mas regra.',
    how_to_use: 'Cite Silvio Almeida diretamente: "racismo é processo político, econômico e jurídico". Funciona em qualquer tema de raça, desigualdade ou direitos.',
    quote: '"O racismo é uma decorrência da própria estrutura social, ou seja, do modo normal com que se constituem as relações sociais."',
    gradient: 'from-red-800 to-rose-950',
    tags: ['Racismo', 'Direitos humanos', 'Desigualdade', 'Estrutura social'],
    featured: true,
  },
  {
    id: 'mulheres-raca-classe',
    title: 'Mulheres, Raça e Classe',
    author: 'Angela Davis',
    comp: 'C3',
    rating: 4.8,
    reviews: 278,
    pages: 244,
    description: 'Análise da interseccionalidade entre gênero, raça e classe. Mostra como essas opressões se reforçam — essencial para temas de feminismo, racismo e trabalho.',
    how_to_use: 'Use para construir argumentos interseccionais. "A mulher negra ocupa o lugar mais vulnerável da estrutura social" é uma tese que precisa de pouco texto para ser forte.',
    quote: '"A libertação das mulheres negras implica a libertação de toda a sociedade."',
    gradient: 'from-fuchsia-700 to-purple-900',
    tags: ['Feminismo', 'Racismo', 'Interseccionalidade', 'Trabalho'],
  },
  {
    id: 'avesso-da-pele',
    title: 'O Avesso da Pele',
    author: 'Jeferson Tenório',
    comp: 'C2',
    rating: 4.7,
    reviews: 156,
    pages: 192,
    description: 'Premiado romance brasileiro contemporâneo sobre o impacto do racismo na vida de um jovem negro. Leitura que humaniza debates sobre identidade e violência.',
    how_to_use: 'Cite como literatura contemporânea para humanizar temas de racismo. Mostrar que você leu ficção recente, não só clássicos, valoriza a redação.',
    quote: '"Ser negro no Brasil é saber que o sistema foi feito para te excluir."',
    gradient: 'from-gray-700 to-slate-900',
    tags: ['Racismo', 'Identidade', 'Literatura contemporânea'],
  },
  {
    id: 'torto-arado',
    title: 'Torto Arado',
    author: 'Itamar Vieira Jr.',
    comp: 'C3',
    rating: 4.9,
    reviews: 367,
    pages: 264,
    description: 'Premiado romance sobre famílias de trabalhadores rurais negros no sertão baiano. Conecta escravidão, luta pela terra, racismo e espiritualidade afro-brasileira.',
    how_to_use: 'Uso estratégico múltiplo: desigualdade agrária, racismo, direitos de trabalhadores rurais, meio ambiente e identidade negra. Raro livro que atravessa 4 competências.',
    quote: '"A terra não mente — ela guarda tudo que a gente planta nela."',
    gradient: 'from-amber-800 to-yellow-950',
    tags: ['Reforma agrária', 'Racismo', 'Meio ambiente', 'Cultura afro-brasileira'],
    featured: true,
  },

  // ── DEMOCRACIA E POLÍTICA ─────────────────────────────────────────────────
  {
    id: '1984',
    title: '1984',
    author: 'George Orwell',
    comp: 'C2',
    rating: 4.8,
    reviews: 521,
    pages: 328,
    description: 'Distopia clássica sobre totalitarismo, vigilância do Estado e manipulação da verdade. Base de referência para temas de liberdade, censura e democracia.',
    how_to_use: 'Cite o conceito de "novilíngua" para temas de desinformação, ou o "Grande Irmão" para temas de privacidade digital e vigilância. Amplamente reconhecido pelos corretores.',
    quote: '"Quem controla o passado controla o futuro; quem controla o presente controla o passado."',
    gradient: 'from-neutral-700 to-zinc-900',
    tags: ['Democracia', 'Totalitarismo', 'Desinformação', 'Privacidade'],
  },
  {
    id: 'como-democracias-morrem',
    title: 'Como as Democracias Morrem',
    author: 'Steven Levitsky & Daniel Ziblatt',
    comp: 'C3',
    rating: 4.7,
    reviews: 198,
    pages: 272,
    description: 'Análise de como democracias modernas enfraquecem gradualmente — não por golpes militares, mas por erosão institucional. Muito relevante para o contexto brasileiro.',
    how_to_use: 'Use o conceito de "erosão democrática gradual" para temas de polarização, instituições e cidadania. Mostra sofisticação ao ir além de "golpe vs democracia".',
    quote: '"As democracias modernas não morrem com um estrondo, mas com um sussurro."',
    gradient: 'from-blue-800 to-sky-950',
    tags: ['Democracia', 'Polarização', 'Instituições', 'Política'],
  },
  {
    id: 'condicao-humana',
    title: 'A Condição Humana',
    author: 'Hannah Arendt',
    comp: 'C3',
    rating: 4.8,
    reviews: 167,
    pages: 390,
    description: 'Análise filosófica sobre trabalho, obra, ação e política. A distinção entre esfera pública e privada é fundamento para argumentar sobre cidadania.',
    how_to_use: 'Cite Arendt para elevar o nível filosófico da redação. "Ação política" como base da cidadania é argumento de alto impacto para temas de democracia e participação.',
    quote: '"A tirania é a forma de governo que destrói o espaço público, eliminando a ação política."',
    gradient: 'from-indigo-700 to-blue-900',
    tags: ['Democracia', 'Filosofia política', 'Cidadania', 'Totalitarismo'],
  },

  // ── MEIO AMBIENTE ─────────────────────────────────────────────────────────
  {
    id: 'primavera-silenciosa',
    title: 'Primavera Silenciosa',
    author: 'Rachel Carson',
    comp: 'C3',
    rating: 4.7,
    reviews: 143,
    pages: 368,
    description: 'Obra que fundou o ambientalismo moderno. Denuncia os impactos do DDT e pesticides na natureza — primeira análise sistemática dos riscos da tecnologia ao meio ambiente.',
    how_to_use: 'Cite Carson como origem do movimento ambiental. Para temas de agrotóxicos, biodiversidade ou sustentabilidade, é a referência histórica mais respeitada.',
    quote: '"Num lugar que estava em silêncio, mesmo as aves tinham deixado de cantar."',
    gradient: 'from-green-700 to-emerald-900',
    tags: ['Meio ambiente', 'Agrotóxicos', 'Biodiversidade', 'Sustentabilidade'],
  },
  {
    id: 'krenak-ideias',
    title: 'Ideias para Adiar o Fim do Mundo',
    author: 'Ailton Krenak',
    comp: 'C5',
    rating: 4.8,
    reviews: 312,
    pages: 96,
    description: 'O filósofo e líder indígena Ailton Krenak questiona a ideia de "humanidade" que destruiu o planeta e propõe uma relação radicalmente diferente com a natureza. Leitura breve (96 páginas) de alto impacto para temas ambientais.',
    how_to_use: '"Adiar o fim do mundo" como metáfora é diretamente citável. Funciona para temas de meio ambiente, sustentabilidade e direitos indígenas. Mostrar que você leu pensadores indígenas eleva o nível cultural da redação.',
    quote: '"Enquanto a humanidade dançar sua dança, o mundo não vai acabar."',
    gradient: 'from-teal-700 to-green-900',
    tags: ['Meio ambiente', 'Povos indígenas', 'Sustentabilidade', 'Cosmovisão'],
  },
  {
    id: 'era-do-capital',
    title: 'A Era dos Extremos',
    author: 'Eric Hobsbawm',
    comp: 'C3',
    rating: 4.8,
    reviews: 234,
    pages: 598,
    description: 'História do século XX — guerras, revoluções, crises e transformações. Repertório histórico rico e preciso para qualquer tema que precise de contexto global.',
    how_to_use: 'Cite eventos históricos com precisão usando Hobsbawm como fonte. Para temas de tecnologia, democracia ou globalização, o contexto histórico eleva a nota em C3.',
    quote: '"O século XX foi o mais violento da história humana — e também o de maior progresso."',
    gradient: 'from-sky-700 to-blue-900',
    tags: ['História contemporânea', 'Globalização', 'Democracia', 'Guerras'],
  },

  // ── TECNOLOGIA E SOCIEDADE ────────────────────────────────────────────────
  {
    id: 'sapiens',
    title: 'Sapiens: Uma Breve História da Humanidade',
    author: 'Yuval Noah Harari',
    comp: 'C3',
    rating: 4.8,
    reviews: 487,
    pages: 443,
    description: 'Historia da espécie humana desde a pré-história até o século XXI. Ideal para contextualizar qualquer tema com perspectiva ampla sobre tecnologia, sociedade e progresso.',
    how_to_use: 'Cite Harari para dar escala histórica a qualquer argumento. "Revoluções cognitiva, agrícola e científica" são pontos de referência reconhecíveis e valorizados.',
    quote: '"Homo sapiens governa o mundo porque é o único animal capaz de acreditar em ficções coletivas."',
    gradient: 'from-cyan-700 to-teal-900',
    tags: ['Tecnologia', 'Sociedade', 'História', 'Ciência'],
  },
  {
    id: 'admiravel-mundo-novo',
    title: 'Admirável Mundo Novo',
    author: 'Aldous Huxley',
    comp: 'C2',
    rating: 4.7,
    reviews: 344,
    pages: 311,
    description: 'Distopia sobre uma sociedade controlada pelo prazer, consumo e tecnologia de condicionamento. Contraponto a 1984 — dominação por sedução em vez de medo.',
    how_to_use: 'Cite Huxley para temas de consumismo, tecnologia e controle social. "Controle pelo prazer" vs "controle pelo terror" é uma distinção que mostra leitura crítica.',
    quote: '"As pessoas são condicionadas a gostar do que têm que gostar."',
    gradient: 'from-violet-700 to-indigo-900',
    tags: ['Tecnologia', 'Consumismo', 'Distopia', 'Liberdade'],
  },
  {
    id: 'sociedade-cansaco',
    title: 'A Sociedade do Cansaço',
    author: 'Byung-Chul Han',
    comp: 'C3',
    rating: 4.6,
    reviews: 198,
    pages: 80,
    description: 'Filósofo coreano-alemão analisa como a sociedade contemporânea substituiu a disciplina pelo desempenho — gerando esgotamento, burnout e perda de identidade.',
    how_to_use: 'Leitura rápida (80 páginas). Cite Han para temas de saúde mental, trabalho, tecnologia e pressão por produtividade. Muito atual para temas do ENEM.',
    quote: '"A depressão é a doença do século XXI — produto de uma sociedade que não tolera limites."',
    gradient: 'from-slate-700 to-gray-900',
    tags: ['Saúde mental', 'Trabalho', 'Tecnologia', 'Contemporaneidade'],
  },

  // ── EDUCAÇÃO ──────────────────────────────────────────────────────────────
  {
    id: 'pedagogia-autonomia',
    title: 'Pedagogia da Autonomia',
    author: 'Paulo Freire',
    comp: 'C5',
    rating: 4.9,
    reviews: 289,
    pages: 144,
    description: 'Complemento à Pedagogia do Oprimido. Foca nos saberes necessários à prática educativa libertadora — respeito à autonomia, curiosidade e rigor metodológico.',
    how_to_use: 'Cite "ensinar não é transferir conhecimento, mas criar possibilidades" para temas de metodologia educacional, formação de professores ou EaD.',
    quote: '"Ensinar não é transferir conhecimento, mas criar possibilidades para a sua produção ou construção."',
    gradient: 'from-emerald-600 to-green-900',
    tags: ['Educação', 'Autonomia', 'Pedagogia', 'Formação'],
  },
  {
    id: 'escola-desigualdade',
    title: 'A Escola e a Desigualdade',
    author: 'Simon Schwartzman & Cláudio de Moura Castro',
    comp: 'C3',
    rating: 4.5,
    reviews: 78,
    pages: 201,
    description: 'Análise empírica das desigualdades no sistema educacional brasileiro — acesso, qualidade e evasão. Dados concretos para argumentar sobre educação.',
    how_to_use: 'Use dados concretos sobre evasão escolar, qualidade do ensino público e disparidades regionais. Especificidade factual fortalece enormemente o C3.',
    quote: '"No Brasil, quem vai para a escola pública e quem vai para a escola privada está determinado pelo berço."',
    gradient: 'from-blue-700 to-cyan-900',
    tags: ['Educação', 'Desigualdade', 'Escola pública', 'Evasão escolar'],
  },

  // ── DIREITOS HUMANOS E CIDADANIA ──────────────────────────────────────────
  {
    id: 'justica-sandel',
    title: 'Justiça — O Que é a Coisa Certa a Fazer?',
    author: 'Michael Sandel',
    comp: 'C3',
    rating: 4.8,
    reviews: 245,
    pages: 348,
    description: 'Filosofia moral acessível: teorias de justiça de Rawls, Bentham, Kant e Aristóteles aplicadas a dilemas contemporâneos. Eleva o nível filosófico da redação.',
    how_to_use: 'Cite diferentes teorias de justiça para mostrar múltiplas perspectivas. "Véu da ignorância" de Rawls é perfeito para argumentar sobre equidade e direitos sociais.',
    quote: '"Fazer a coisa certa não é apenas seguir regras; é questionar quais regras merecem ser seguidas."',
    gradient: 'from-amber-600 to-orange-900',
    tags: ['Filosofia', 'Justiça social', 'Direitos humanos', 'Ética'],
  },
  {
    id: 'abolicionismo-nabuco',
    title: 'O Abolicionismo',
    author: 'Joaquim Nabuco',
    comp: 'C3',
    rating: 4.6,
    reviews: 112,
    pages: 248,
    description: 'Escrito em 1883, é o manifesto intelectual pelo fim da escravidão no Brasil. Argumentação histórica e moral que ainda ressoa em debates sobre racismo e reparação.',
    how_to_use: 'Cite Nabuco para fundamentar argumentos sobre herança da escravidão. "O abolicionismo é um imperativo moral, não apenas político" eleva qualquer redação sobre raça.',
    quote: '"A escravidão contamina tudo que toca — o escravo, o senhor e a nação inteira."',
    gradient: 'from-stone-700 to-zinc-900',
    tags: ['Escravidão', 'Racismo', 'Direitos humanos', 'Formação do Brasil'],
  },
  {
    id: 'direitos-humanos-constituicao',
    title: 'Direitos Humanos e Justiça Internacional',
    author: 'Flávia Piovesan',
    comp: 'C5',
    rating: 4.6,
    reviews: 93,
    pages: 308,
    description: 'Estudo da proteção internacional dos direitos humanos e sua aplicação no Brasil. Essencial para temas que exigem propostas vinculadas a tratados e legislação.',
    how_to_use: 'Cite tratados internacionais e mecanismos de proteção para fortalecer a proposta de intervenção (C5). "O Brasil é signatário de..." é uma base jurídica poderosa.',
    quote: '"Os direitos humanos são a linguagem moral universal que nenhum Estado pode ignorar."',
    gradient: 'from-teal-600 to-cyan-900',
    tags: ['Direitos humanos', 'Legislação', 'Cidadania', 'Proposta de intervenção'],
  },

  // ── CULTURA BRASILEIRA ────────────────────────────────────────────────────
  {
    id: 'macunaima',
    title: 'Macunaíma',
    author: 'Mário de Andrade',
    comp: 'C2',
    rating: 4.5,
    reviews: 167,
    pages: 208,
    description: 'Rapsódia modernista que sintetiza a identidade cultural brasileira na figura do "herói sem nenhum caráter". Leitura de múltiplas camadas sobre o Brasil.',
    how_to_use: 'Cite "herói sem nenhum caráter" como metáfora da ambiguidade moral nacional. Funciona em temas de identidade, ética pública e formação cultural brasileira.',
    quote: '"Ai, que preguiça!... — o grito do herói sem caráter."',
    gradient: 'from-lime-700 to-green-900',
    tags: ['Cultura brasileira', 'Modernismo', 'Identidade nacional'],
  },
  {
    id: 'o-cortico',
    title: 'O Cortiço',
    author: 'Aluísio Azevedo',
    comp: 'C3',
    rating: 4.6,
    reviews: 198,
    pages: 244,
    description: 'Naturalismo brasileiro sobre a vida nas habitações coletivas do Rio de Janeiro do século XIX. Retrata desigualdade urbana, imigração e exploração do trabalho.',
    how_to_use: 'Use para temas de habitação, urbanização e desigualdade. A relação entre condições de moradia e comportamento social é argumento estrutural de grande profundidade.',
    quote: '"Johão Romano era o tipo do especulador brasileiro — vendia miséria a preço de luxo."',
    gradient: 'from-orange-700 to-amber-900',
    tags: ['Desigualdade urbana', 'Habitação', 'Urbanização', 'Literatura brasileira'],
  },
  {
    id: 'hora-da-estrela',
    title: 'A Hora da Estrela',
    author: 'Clarice Lispector',
    comp: 'C2',
    rating: 4.9,
    reviews: 421,
    pages: 88,
    description: 'Obra-prima sobre Macabéa, nordestina invisível no Rio de Janeiro. Questiona a visibilidade dos pobres, das mulheres e dos migrantes na sociedade brasileira.',
    how_to_use: 'Cite Macabéa como símbolo de exclusão múltipla (nordestina, pobre, mulher). Leitura rápida — leia para usar com autoridade em temas de desigualdade e identidade.',
    quote: '"Ela era incompetente. Incompetente para a vida."',
    gradient: 'from-pink-700 to-rose-900',
    tags: ['Identidade feminina', 'Migração', 'Invisibilidade social', 'Nordeste'],
  },

  // ── DESIGUALDADE SOCIAL ────────────────────────────────────────────────────
  {
    id: 'riqueza-miseraveis',
    title: 'A Ralé Brasileira',
    author: 'Jessé Souza',
    comp: 'C3',
    rating: 4.7,
    reviews: 143,
    pages: 424,
    description: 'Sociologia da pobreza brasileira como resultado de uma herança histórica e cultural — não de "falta de esforço individual". Contradicta o senso comum econômico.',
    how_to_use: 'Cite Jessé Souza para desconstruir o argumento de que "quem trabalha vence". Pobreza como estrutura, não fracasso individual, é um argumento de alto impacto.',
    quote: '"A pobreza não é falta de esforço. É herança de quem nunca teve chance de começar."',
    gradient: 'from-neutral-600 to-stone-900',
    tags: ['Desigualdade', 'Pobreza estrutural', 'Mobilidade social'],
  },
  {
    id: 'tributacao-riqueza',
    title: 'O Mito da Meritocracia',
    author: 'Daniel Markovits',
    comp: 'C3',
    rating: 4.6,
    reviews: 112,
    pages: 320,
    description: 'Análise de como a meritocracia produz novas formas de exclusão ao privilegiar quem teve acesso a educação e capital cultural — especialmente relevante para o ENEM.',
    how_to_use: 'Use para questionar a ideia de que o ENEM é igualitário sem cotas ou apoio social. "Meritocracia favorece quem já está no topo" é argumento forte para temas de educação.',
    quote: '"A meritocracia não elimina privilégios — ela os disfarça de mérito."',
    gradient: 'from-blue-600 to-indigo-900',
    tags: ['Meritocracia', 'Desigualdade', 'Educação', 'Mobilidade social'],
  },

  // ── CIDADANIA E PARTICIPAÇÃO ──────────────────────────────────────────────
  {
    id: 'cidadania-brasil',
    title: 'Cidadania no Brasil: O Longo Caminho',
    author: 'José Murilo de Carvalho',
    comp: 'C3',
    rating: 4.7,
    reviews: 156,
    pages: 256,
    description: 'História do desenvolvimento da cidadania no Brasil — dos direitos civis ao voto, da escravidão à democracia. Panorama claro e acessível do caminho da cidadania nacional.',
    how_to_use: 'Cite a tipologia de Carvalho (cidadania civil, política, social) para organizar argumentos em temas de democracia e direitos. Mostra sofisticação conceitual ao corretor.',
    quote: '"No Brasil, a cidadania foi construída de cima para baixo — do Estado para o povo, não o contrário."',
    gradient: 'from-sky-600 to-blue-900',
    tags: ['Cidadania', 'Democracia', 'Direitos', 'História do Brasil'],
  },
  {
    id: 'bem-comum',
    title: 'A Tirania do Mérito',
    author: 'Michael Sandel',
    comp: 'C5',
    rating: 4.7,
    reviews: 187,
    pages: 320,
    description: 'Análise de como o discurso do mérito corrói o senso de bem comum e aprofunda divisões sociais. Propõe uma política de dignidade que vai além da competição individual.',
    how_to_use: 'Use para embasar propostas de inclusão e redistribuição. "Políticas de bem comum em vez de meritocracia" é base sólida para C5 em temas de educação e desigualdade.',
    quote: '"Uma democracia saudável precisa de humildade — não de vencedores e perdedores."',
    gradient: 'from-purple-600 to-violet-900',
    tags: ['Meritocracia', 'Democracia', 'Bem comum', 'Cidadania'],
  },
]

const COMP_COLOR: Record<string, string> = {
  C1: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  C2: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  C3: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  C4: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  C5: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Geral: 'text-gray-400 bg-white/[0.04] border-white/[0.08]',
}

// ─── Library sections — controls UI grouping order ────────────────────────────

const LIBRARY_SECTIONS: Array<{ label: string; ids: string[] }> = [
  {
    label: 'Clássicos da literatura brasileira',
    ids: ['morte-e-vida-severina', 'vidas-secas', 'os-sertoes', 'quarto-de-despejo', 'macunaima', 'o-cortico', 'hora-da-estrela'],
  },
  {
    label: 'Formação e identidade do Brasil',
    ids: ['povo-brasileiro', 'casa-grande-senzala', 'elite-do-atraso', 'abolicionismo-nabuco', 'cidadania-brasil'],
  },
  {
    label: 'Racismo, gênero e interseccionalidade',
    ids: ['racismo-estrutural', 'mulheres-raca-classe', 'avesso-da-pele', 'torto-arado'],
  },
  {
    label: 'Democracia e política',
    ids: ['democracia-em-vertigem', '1984', 'como-democracias-morrem', 'condicao-humana', 'era-do-capital'],
  },
  {
    label: 'Desigualdade e meritocracia',
    ids: ['capital-seculo21', 'riqueza-miseraveis', 'tributacao-riqueza', 'bem-comum'],
  },
  {
    label: 'Meio ambiente e sustentabilidade',
    ids: ['primavera-silenciosa', 'krenak-ideias'],
  },
  {
    label: 'Tecnologia e sociedade',
    ids: ['sapiens', 'admiravel-mundo-novo', 'sociedade-cansaco'],
  },
  {
    label: 'Educação',
    ids: ['pedagogy-oppressed', 'pedagogia-autonomia', 'escola-desigualdade'],
  },
  {
    label: 'Direitos humanos e filosofia',
    ids: ['justica-sandel', 'direitos-humanos-constituicao'],
  },
]

// Fast lookup by id
const LIBRARY_BY_ID = new Map(LIBRARY.map(b => [b.id, b]))

// ─── Sub-components ────────────────────────────────────────────────────────────

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          size={10}
          className={i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}
        />
      ))}
      <span className="text-[11px] font-semibold text-gray-300 ml-0.5">{rating}</span>
      <span className="text-[10px] text-gray-700">({reviews})</span>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [text])
  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
        copied
          ? 'border-green-500/30 bg-green-500/10 text-green-400'
          : 'border-white/[0.09] bg-white/[0.03] text-gray-500 hover:text-gray-200 hover:border-white/[0.18]'
      }`}
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
      {copied ? 'Copiado!' : 'Copiar citação'}
    </button>
  )
}

function BookCard({ book, expanded, onToggle }: { book: Book; expanded: boolean; onToggle: () => void }) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        expanded
          ? 'border-white/[0.12] bg-white/[0.03]'
          : 'border-white/[0.07] hover:border-white/[0.12] hover:bg-white/[0.02] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full text-left"
      >
        <div className="flex items-start gap-4 p-4">
          {/* Spine */}
          <div className={`w-10 h-14 rounded-lg bg-gradient-to-br ${book.gradient} flex-shrink-0 flex items-end justify-center pb-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.4)]`}>
            <span className="text-[9px] font-bold text-white/70 [writing-mode:vertical-lr] rotate-180">{book.comp}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <p className="text-[13px] font-semibold text-gray-200 leading-tight">{book.title}</p>
                <p className="text-[11px] text-gray-600 mt-0.5">{book.author}</p>
              </div>
              <span className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${COMP_COLOR[book.comp]}`}>
                {book.comp}
              </span>
            </div>
            <StarRating rating={book.rating} reviews={book.reviews} />
            {!expanded && (
              <p className="text-[11px] text-gray-600 mt-2 leading-relaxed line-clamp-2">{book.description}</p>
            )}
          </div>

          <ChevronRight
            size={14}
            className={`flex-shrink-0 text-gray-600 transition-transform mt-1 ${expanded ? 'rotate-90' : ''}`}
          />
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/[0.05] pt-3">
          <p className="text-[12px] text-gray-500 leading-relaxed">{book.description}</p>

          {/* Quote */}
          <div className="flex gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <Quote size={14} className="text-purple-500/50 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-400 italic leading-relaxed">{book.quote}</p>
          </div>

          {/* How to use */}
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/[0.05] px-3.5 py-3">
            <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-1">Como usar na redação</p>
            <p className="text-[12px] text-gray-400 leading-relaxed">{book.how_to_use}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {book.tags.map(t => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-white/[0.07] text-gray-600 bg-white/[0.02]">
                {t}
              </span>
            ))}
          </div>

          {/* Action row — writing tool integration */}
          <div className="pt-3 border-t border-white/[0.05] flex flex-wrap items-center gap-2">
            {/* Copy quote to clipboard */}
            <CopyButton text={book.quote} />

            {/* Write essay about this book's theme */}
            <Link
              href={`/aluno/redacoes/nova?tema_livre=${encodeURIComponent(book.tags[0] + ' — ' + book.title)}`}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-white/[0.09] bg-white/[0.03] text-gray-500 hover:text-gray-200 hover:border-white/[0.18] transition-all"
            >
              <PenLine size={10} />
              Escrever redação
            </Link>

            {/* Generate arguments with Biia */}
            <Link
              href={`/aluno/biia?prompt=${encodeURIComponent(`Me dê 3 argumentos prontos para usar em redação ENEM usando "${book.title}" de ${book.author}. Para cada argumento: cite a obra, explique o raciocínio e mostre como conectar ao tema.`)}`}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-purple-500/20 bg-purple-500/[0.06] text-purple-400 hover:bg-purple-500/[0.12] hover:border-purple-500/35 transition-all"
            >
              <MessageCircle size={10} />
              Gerar argumentos com Biia
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClubeLivroPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedFeatured, setExpandedFeatured] = useState(false)

  const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id)

  return (
    <div className="max-w-5xl">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/25 flex items-center justify-center">
            <Library size={15} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Clube do Livro</h1>
            <p className="text-[12px] text-gray-600">Repertório literário para construir argumentos de alto impacto</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-5 items-start">

        {/* ── Left: featured pick + library ───────────────────────────────── */}
        <div className="space-y-5">

          {/* Monthly pick */}
          <div className="relative rounded-2xl border border-purple-500/25 overflow-hidden">
            {/* Gradient bg */}
            <div className={`absolute inset-0 bg-gradient-to-br ${MONTHLY_PICK.gradient} opacity-15`} />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />

            <div className="relative p-5">
              {/* Badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-600/20 border border-purple-500/30">
                  <Flame size={10} className="text-purple-400" />
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Escolha do Mês</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-600">
                  <CalendarDays size={9} />
                  {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </div>
              </div>

              <div className="flex gap-5">
                {/* Book spine — larger */}
                <div className={`w-14 h-20 rounded-xl bg-gradient-to-br ${MONTHLY_PICK.gradient} flex-shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-end justify-center pb-2`}>
                  <span className="text-[10px] font-bold text-white/60">{MONTHLY_PICK.comp}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-white leading-tight mb-0.5">{MONTHLY_PICK.title}</p>
                  <p className="text-[12px] text-gray-500 mb-2">{MONTHLY_PICK.author}</p>
                  <StarRating rating={MONTHLY_PICK.rating} reviews={MONTHLY_PICK.reviews} />
                  {!expandedFeatured && (
                    <p className="text-[12px] text-gray-500 mt-2 leading-relaxed line-clamp-3">{MONTHLY_PICK.description}</p>
                  )}
                </div>
              </div>

              {/* Expanded section */}
              {expandedFeatured && (
                <div className="mt-4 space-y-3 border-t border-white/[0.07] pt-4">
                  <p className="text-[12px] text-gray-400 leading-relaxed">{MONTHLY_PICK.description}</p>

                  <div className="flex gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                    <Quote size={14} className="text-purple-400/50 flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] text-gray-300 italic leading-relaxed">{MONTHLY_PICK.quote}</p>
                  </div>

                  <div className="rounded-xl border border-purple-500/25 bg-purple-500/[0.07] px-4 py-3">
                    <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-1.5">Como usar na redação</p>
                    <p className="text-[12px] text-gray-300 leading-relaxed">{MONTHLY_PICK.how_to_use}</p>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {MONTHLY_PICK.tags.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-white/[0.08] text-gray-500 bg-white/[0.03]">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Writing tool actions for monthly pick */}
                  <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
                    <CopyButton text={MONTHLY_PICK.quote} />
                    <Link
                      href={`/aluno/biia?prompt=${encodeURIComponent(`Me dê 3 argumentos prontos para usar em redação ENEM usando "${MONTHLY_PICK.title}" de ${MONTHLY_PICK.author}. Para cada argumento: cite a obra, explique o raciocínio e mostre como conectar ao tema.`)}`}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-purple-500/25 bg-purple-500/[0.08] text-purple-300 hover:bg-purple-500/[0.15] transition-all"
                    >
                      <MessageCircle size={10} />
                      Gerar argumentos com Biia
                    </Link>
                  </div>
                </div>
              )}

              <button
                onClick={() => setExpandedFeatured(p => !p)}
                className="mt-4 flex items-center gap-1.5 text-[12px] font-semibold text-purple-400 hover:text-purple-300 transition-colors"
              >
                {expandedFeatured ? 'Mostrar menos' : 'Ver como usar na redação'}
                <ArrowRight size={11} className={`transition-transform ${expandedFeatured ? 'rotate-90' : ''}`} />
              </button>
            </div>
          </div>

          {/* Library — grouped by category */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-700">Biblioteca de repertório</p>
              <span className="text-[11px] text-gray-600">{LIBRARY.length} obras</span>
            </div>
            <div className="space-y-6">
              {LIBRARY_SECTIONS.map(section => {
                const books = section.ids.map(id => LIBRARY_BY_ID.get(id)).filter(Boolean) as Book[]
                if (books.length === 0) return null
                return (
                  <div key={section.label}>
                    <div className="flex items-center gap-3 mb-2.5 px-0.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.11em] text-gray-600 whitespace-nowrap">
                        {section.label}
                      </p>
                      <div className="flex-1 h-px bg-white/[0.04]" />
                    </div>
                    <div className="space-y-2">
                      {books.map(book => (
                        <BookCard
                          key={book.id}
                          book={book}
                          expanded={expandedId === book.id}
                          onToggle={() => toggle(book.id)}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Right sidebar ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Reading challenge */}
          <div className="card-dark rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Flame size={12} className="text-amber-400" />
              </div>
              <p className="text-[12px] font-semibold text-white">Desafio de leitura</p>
            </div>
            <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">
              Leia 1 obra por mês e registre 1 citação usável na redação.
            </p>
            {/* Progress */}
            <div className="space-y-2.5">
              {['Jan', 'Fev', 'Mar'].map((month, i) => (
                <div key={month} className="flex items-center gap-2.5">
                  <span className="text-[10px] text-gray-600 w-6">{month}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${i < 2 ? 'bg-green-500' : 'bg-purple-600 animate-pulse'}`}
                      style={{ width: i < 2 ? '100%' : '35%' }}
                    />
                  </div>
                  {i < 2
                    ? <span className="text-[9px] text-green-400">✓</span>
                    : <span className="text-[9px] text-gray-600">em curso</span>
                  }
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
              <p className="text-[10px] text-gray-700">Sequência atual</p>
              <p className="text-[15px] font-bold text-white tabular-nums">2 <span className="text-[11px] text-gray-600 font-normal">meses seguidos</span></p>
            </div>
          </div>

          {/* This month's tip */}
          <div className="card-dark rounded-2xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-700 mb-3">Dica do mês</p>
            <div className="flex gap-2.5 rounded-xl border border-purple-500/20 bg-purple-500/[0.05] p-3 mb-3">
              <Quote size={12} className="text-purple-400/50 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-400 italic leading-relaxed">
                "Não cite autores que você não leu. Um dado concreto vale mais do que um nome famoso mal usado."
              </p>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Corretores do ENEM identificam rapidamente citações genéricas ou fora de contexto. Foque em 3–4 referências que você domina.
            </p>
          </div>

          {/* By competency quick links */}
          <div className="card-dark rounded-2xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-700 mb-3">Por competência</p>
            <div className="space-y-1">
              {(['C2', 'C3', 'C5'] as const).map(comp => {
                const count = [MONTHLY_PICK, ...LIBRARY].filter(b => b.comp === comp).length
                return (
                  <div key={comp} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${COMP_COLOR[comp]}`}>
                        {comp}
                      </span>
                      <span className="text-[12px] text-gray-500">
                        {comp === 'C2' ? 'Compreensão' : comp === 'C3' ? 'Argumentação' : 'Intervenção'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-gray-600">{count} obras</span>
                      <ChevronRight size={11} className="text-gray-700" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mentoria CTA */}
          <div className="card-dark rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={12} className="text-gray-600" />
              <p className="text-[12px] font-semibold text-white">Clube ao vivo</p>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed mb-3">
              Próxima sessão de debate literário — <strong className="text-gray-400">Sábado, 29 Mar · 10h</strong>
            </p>
            <Link
              href="/aluno/mentoria"
              className="flex items-center justify-center gap-1.5 w-full h-8 rounded-xl text-[12px] font-semibold bg-white/[0.05] border border-white/[0.10] text-gray-300 hover:bg-white/[0.09] hover:text-white transition-all"
            >
              <BookOpen size={11} />
              Ver mentoria
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
