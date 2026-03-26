/**
 * Mock data para visualização em desenvolvimento.
 * Substituir por queries Supabase reais quando auth estiver configurado.
 */

export type EssayStatus = 'pending' | 'in_review' | 'corrected'

export interface MockCorrection {
  c1: number; c2: number; c3: number; c4: number; c5: number
  total: number
  feedback: string
  correctedAt: string
  reviewerName: string
}

export interface MockEssay {
  id: string
  themeTitle: string
  submittedAt: string
  status: EssayStatus
  content: string
  correction?: MockCorrection
  previousTotal?: number
}

export interface MockStudent {
  id: string
  name: string
  email: string
  plan: string
  creditsTotal: number
  creditsUsed: number
  joinedAt: string
  essays: MockEssay[]
}

// ─── Aluno mockado ────────────────────────────────────────────────────────────
export const MOCK_STUDENT: MockStudent = {
  id: 'student-1',
  name: 'Lucas Ferreira',
  email: 'lucas@email.com',
  plan: 'Estratégia',
  creditsTotal: 5,
  creditsUsed: 3,
  joinedAt: '2025-01-10',
  essays: [
    {
      id: 'essay-1',
      themeTitle: 'Violência e desigualdade no Brasil contemporâneo',
      submittedAt: '2025-03-20T14:30:00Z',
      status: 'corrected',
      previousTotal: 720,
      content: `A violência no Brasil é um fenômeno multifacetado que transcende a simples ocorrência de crimes, revelando profundas fraturas na estrutura social do país. Dados do Fórum Brasileiro de Segurança Pública indicam que, em 2022, o Brasil registrou mais de 47 mil homicídios dolosos, colocando o país entre os mais violentos do mundo. Esse cenário não é fruto do acaso, mas resultado de desigualdades históricas que se perpetuam por séculos.

Sob a perspectiva sociológica de Émile Durkheim, a violência pode ser compreendida como um fenômeno anômico: quando as instituições sociais falham em integrar os indivíduos à sociedade, emerge o estado de anomia, terreno fértil para comportamentos desviantes. No Brasil, essa anomia se manifesta especialmente nas periferias urbanas, onde jovens negros e pobres são expostos a precárias condições de vida, educação deficiente e ausência de perspectivas econômicas. Não é coincidência que essa população seja, simultaneamente, a principal vítima e a principal ré nos crimes violentos.

Ademais, a desigualdade econômica — medida pelo coeficiente de Gini, em que o Brasil figura entre os países mais desiguais do planeta — alimenta um ciclo vicioso de exclusão e violência. Conforme aponta o economista Amartya Sen, a falta de liberdades substantivas, como acesso à educação de qualidade e renda digna, priva os indivíduos de agência sobre suas próprias vidas, empurrando-os para a marginalidade.

Portanto, para que o Brasil enfrente sua epidemia de violência, é imprescindível uma ação estatal articulada. O Ministério da Justiça, em parceria com os governos estaduais, deve implementar políticas públicas de reinserção social para jovens em situação de vulnerabilidade, por meio de programas de capacitação profissional e geração de renda. Paralelamente, o Ministério da Educação precisa ampliar o acesso à educação integral nas periferias, oferecendo não apenas instrução acadêmica, mas também formação cidadã e suporte psicossocial. Somente por meio de intervenções estruturais que atacam as raízes da desigualdade será possível construir uma sociedade efetivamente mais justa e segura.`,
      correction: {
        c1: 160,
        c2: 160,
        c3: 180,
        c4: 160,
        c5: 140,
        total: 800,
        reviewerName: 'Professora Beatriz',
        correctedAt: '2025-03-22T09:15:00Z',
        feedback: `**Parabéns pela evolução!** Você teve um salto significativo nessa redação — subiu 80 pontos em relação à anterior. Vou detalhar o que funcionou bem e o que ainda pode melhorar.

**C1 – Domínio da Escrita Formal (160/200)**
Sua escrita está bastante consolidada. Boa variedade de estruturas sintáticas e vocabulário preciso. O único ponto de atenção foi o uso de "Não é coincidência que" no 3º parágrafo — evite construções coloquiais mesmo que sutis. Prefira "Não por acaso".

**C2 – Compreensão da Proposta (160/200)**
Você desenvolveu bem o tema, mas o recorte ficou amplo demais. A proposta pedia especificamente "violência urbana", e sua redação trouxe dados gerais do país. Na próxima, leia a proposta duas vezes e grife as palavras-chave antes de começar.

**C3 – Seleção e Organização dos Argumentos (180/200)** ⭐
Esse é o seu ponto mais forte. Os argumentos de Durkheim e Amartya Sen foram usados de forma pertinente e bem articulados com a realidade brasileira. A transição entre parágrafos está fluida. Mantenha esse padrão.

**C4 – Mecanismos de Coesão (160/200)**
Boa variedade de conectivos. Porém, "Ademais" no 3º parágrafo ficou um pouco solto — precisava de uma ligação mais explícita com o parágrafo anterior. Experimente "Além disso, esse contexto de exclusão..."

**C5 – Proposta de Intervenção (140/200)**
Aqui está o maior espaço para crescer. Você mencionou dois agentes (Ministério da Justiça e da Educação), mas a proposta ficou genérica. O ENEM cobra: agente, ação, meio/modo e finalidade — os quatro elementos. Revise sua proposta sempre checando esses 4 pontos.

**Foco para a próxima redação:** trabalhe especificamente a proposta de intervenção. Preencha todos os 4 elementos com detalhamento. Você já sabe argumentar muito bem — esse detalhe vai te levar para 880+.`,
      },
    },
    {
      id: 'essay-2',
      themeTitle: 'Crise hídrica e gestão de recursos naturais',
      submittedAt: '2025-03-15T10:00:00Z',
      status: 'in_review',
      content: 'Redação sobre crise hídrica...',
    },
    {
      id: 'essay-3',
      themeTitle: 'Educação inclusiva no Brasil',
      submittedAt: '2025-03-08T16:45:00Z',
      status: 'corrected',
      previousTotal: 680,
      content: 'Redação sobre educação inclusiva...',
      correction: {
        c1: 160, c2: 140, c3: 160, c4: 140, c5: 120,
        total: 720,
        reviewerName: 'Professora Beatriz',
        correctedAt: '2025-03-10T11:00:00Z',
        feedback: 'Boa progressão em relação à primeira redação...',
      },
    },
  ],
}

// ─── Fila do admin (redações de múltiplos alunos) ─────────────────────────────
export const MOCK_ADMIN_QUEUE = [
  {
    id: 'essay-4',
    studentName: 'Ana Carolina',
    studentEmail: 'ana@email.com',
    plan: 'Intensivo',
    themeTitle: 'Impactos da inteligência artificial no mercado de trabalho',
    submittedAt: '2025-03-24T08:00:00Z',
    status: 'pending' as EssayStatus,
    content: `A revolução tecnológica protagonizada pela inteligência artificial (IA) impõe ao mercado de trabalho transformações de uma magnitude comparável à Revolução Industrial do século XVIII. Segundo relatório do Fórum Econômico Mundial, até 2025, cerca de 85 milhões de empregos poderão ser substituídos por máquinas, enquanto 97 milhões de novas funções emergirão — um saldo positivo que, no entanto, exige uma transição cuidadosamente gerida pelo Estado e pelas empresas.

Do ponto de vista econômico, a automação tende a concentrar ganhos de produtividade nas mãos de quem detém o capital tecnológico, aprofundando a já expressiva desigualdade social. O filósofo Byung-Chul Han argumenta que a sociedade do desempenho, ao substituir o trabalhador pelo algoritmo, não apenas elimina postos de trabalho, mas também esvazia o sentido identitário que muitos indivíduos constroem em torno de suas profissões. Esse fenômeno atinge com mais brutalidade trabalhadores de baixa qualificação — operadores de caixas, motoristas, atendentes — para quem a reconversão profissional representa um desafio hercúleo.

Contudo, seria simplista encarar a IA apenas como ameaça. A tecnologia também cria demandas por competências sofisticadas em áreas como ciência de dados, programação e ética computacional. O desafio, portanto, não é frear a automação, mas garantir que seus benefícios sejam distribuídos com equidade e que os trabalhadores deslocados tenham suporte para se adaptar.

Para tanto, é necessário que o governo federal, em articulação com o Ministério do Trabalho e Emprego, institua programas nacionais de requalificação profissional voltados especificamente para trabalhadores em setores vulneráveis à automação, por meio de parcerias com o Sistema S e universidades públicas. Adicionalmente, deve-se criar uma alíquota progressiva sobre empresas que substituam funcionários por sistemas automatizados, revertendo essa arrecadação em fundos de proteção e transição para os trabalhadores impactados. Com essas medidas, o Brasil poderá navegar a transição tecnológica sem aprofundar suas históricas desigualdades.`,
  },
  {
    id: 'essay-5',
    studentName: 'Pedro Almeida',
    studentEmail: 'pedro@email.com',
    plan: 'Estratégia',
    themeTitle: 'O papel das redes sociais na polarização política',
    submittedAt: '2025-03-23T20:30:00Z',
    status: 'in_review' as EssayStatus,
    content: 'Redação sobre redes sociais...',
  },
  {
    id: 'essay-6',
    studentName: 'Mariana Costa',
    studentEmail: 'mariana@email.com',
    plan: 'Evolução',
    themeTitle: 'Saúde mental e produtividade na sociedade contemporânea',
    submittedAt: '2025-03-23T14:15:00Z',
    status: 'pending' as EssayStatus,
    content: 'Redação sobre saúde mental...',
  },
  {
    id: 'essay-1',
    studentName: 'Lucas Ferreira',
    studentEmail: 'lucas@email.com',
    plan: 'Estratégia',
    themeTitle: 'Violência e desigualdade no Brasil contemporâneo',
    submittedAt: '2025-03-20T14:30:00Z',
    status: 'corrected' as EssayStatus,
    content: 'Redação sobre violência...',
  },
]

// ─── Temas disponíveis ────────────────────────────────────────────────────────
export const MOCK_THEMES = [
  'Violência e desigualdade no Brasil contemporâneo',
  'Impactos da inteligência artificial no mercado de trabalho',
  'O papel das redes sociais na polarização política',
  'Crise hídrica e gestão de recursos naturais',
  'Saúde mental e produtividade na sociedade contemporânea',
  'Educação inclusiva no Brasil',
  'Desafios da segurança alimentar no século XXI',
  'A invisibilidade da pessoa idosa na sociedade brasileira',
  'Fake news e a democracia em risco',
  'O legado da escravidão na sociedade brasileira',
]

// ─── Stats do admin ───────────────────────────────────────────────────────────
export const MOCK_ADMIN_STATS = {
  pendingEssays: 2,
  inReviewEssays: 1,
  correctedThisMonth: 11,
  totalStudents: 28,
  avgScore: 734,
  avgC5: 141, // competência mais fraca dos alunos
}
