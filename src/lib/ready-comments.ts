/**
 * Ready-to-use professor comments organized by competency and sub-criterion.
 *
 * Structure:
 *   READY_COMMENTS[compKey].subcriteria[].{label, comments[]}
 *
 * Each comment is a standalone sentence the professor can click to insert
 * into the feedback textarea. They can edit it before saving.
 */

export interface ReadyComment {
  text: string
  /** quality: 'positive' = good result, 'neutral' = partial, 'negative' = needs work */
  quality: 'positive' | 'neutral' | 'negative'
}

export interface SubCriterion {
  label: string
  comments: ReadyComment[]
}

export interface CompComments {
  subcriteria: SubCriterion[]
}

export const READY_COMMENTS: Record<string, CompComments> = {
  c1: {
    subcriteria: [
      {
        label: 'Ortografia',
        comments: [
          { text: 'Erros ortográficos recorrentes — revise especialmente letras duplicadas, hífen e acentuação gráfica.', quality: 'negative' },
          { text: 'Alguns deslizes ortográficos pontuais que não comprometem a leitura, mas devem ser eliminados.', quality: 'neutral' },
          { text: 'Ortografia exemplar — zero desvios detectados em toda a extensão do texto.', quality: 'positive' },
        ],
      },
      {
        label: 'Gramática',
        comments: [
          { text: 'Problemas de regência verbal e nominal — revise o uso dos complementos verbais com e sem preposição.', quality: 'negative' },
          { text: 'Gramática adequada com alguns deslizes de regência. Atenção ao uso de pronomes oblíquos.', quality: 'neutral' },
          { text: 'Boa aplicação das regras gramaticais — construções variadas, corretas e sem ambiguidades.', quality: 'positive' },
        ],
      },
      {
        label: 'Concordância',
        comments: [
          { text: 'Falhas de concordância verbal e/ou nominal em vários trechos — afeta diretamente a fluência e a nota de C1.', quality: 'negative' },
          { text: 'Concordância adequada na maior parte. Atenção à concordância com pronomes relativos e sujeitos compostos.', quality: 'neutral' },
          { text: 'Excelente domínio da concordância verbal e nominal em todo o texto.', quality: 'positive' },
        ],
      },
      {
        label: 'Sintaxe',
        comments: [
          { text: 'Construções sintáticas confusas em alguns parágrafos — prefira frases mais diretas para ganhar clareza.', quality: 'negative' },
          { text: 'Sintaxe funcional e variada. Alguns períodos muito longos que poderiam ser desmembrados.', quality: 'neutral' },
          { text: 'Domínio sintático evidente — períodos complexos bem construídos, sem ambiguidades.', quality: 'positive' },
        ],
      },
      {
        label: 'Pontuação',
        comments: [
          { text: 'Uso inadequado da vírgula — evite vírgula entre sujeito e predicado, e antes de "que" em orações restritivas.', quality: 'negative' },
          { text: 'Pontuação adequada na maior parte. Atenção ao ponto e vírgula em enumerações e ao uso de travessão.', quality: 'neutral' },
          { text: 'Pontuação excelente — expressiva, funcional e coerente com a estrutura argumentativa do texto.', quality: 'positive' },
        ],
      },
    ],
  },

  c2: {
    subcriteria: [
      {
        label: 'Compreensão da proposta',
        comments: [
          { text: 'A redação não demonstra compreensão plena da proposta — o recorte temático específico não foi contemplado.', quality: 'negative' },
          { text: 'Boa compreensão da proposta. O texto responde ao tema central com clareza e coerência geral.', quality: 'neutral' },
          { text: 'Excelente compreensão da proposta — tese diretamente ancorada no recorte temático, sem qualquer desvio.', quality: 'positive' },
        ],
      },
      {
        label: 'Repertório',
        comments: [
          { text: 'Repertório ausente ou muito genérico. Dados concretos, autores e referências fortalecem muito a C2.', quality: 'negative' },
          { text: 'Repertório presente, mas poderia ser mais específico e integrado à tese argumentativa.', quality: 'neutral' },
          { text: 'Repertório sociocultural pertinente, diversificado e bem articulado à tese — demonstra leitura ampla.', quality: 'positive' },
        ],
      },
      {
        label: 'Aderência ao tema',
        comments: [
          { text: 'Tangência ao tema — o texto aborda aspectos periféricos sem desenvolver o recorte central da proposta.', quality: 'negative' },
          { text: 'Boa aderência ao tema. Atenção para não desviar para causas ou consequências não pedidas no enunciado.', quality: 'neutral' },
          { text: 'Aderência plena ao tema proposto — cada parágrafo contribui diretamente para a discussão central.', quality: 'positive' },
        ],
      },
    ],
  },

  c3: {
    subcriteria: [
      {
        label: 'Argumentação',
        comments: [
          { text: 'Argumentação muito superficial — ideias afirmadas sem fundamentação em dados, exemplos ou raciocínio.', quality: 'negative' },
          { text: 'Argumentação com desenvolvimento médio. Aprofunde a análise de cada argumento antes de avançar.', quality: 'neutral' },
          { text: 'Argumentação consistente — cada argumento é fundamentado, analisado e conectado diretamente à tese.', quality: 'positive' },
        ],
      },
      {
        label: 'Aprofundamento',
        comments: [
          { text: 'Falta aprofundamento. Os argumentos apresentados são válidos, mas encerrados antes de revelarem potencial.', quality: 'negative' },
          { text: 'Bom aprofundamento em alguns momentos. Tente manter esse nível analítico em todos os parágrafos.', quality: 'neutral' },
          { text: 'Aprofundamento excelente — a análise vai além do senso comum e demonstra pensamento crítico maduro.', quality: 'positive' },
        ],
      },
      {
        label: 'Defesa da tese',
        comments: [
          { text: 'A tese não é defendida com consistência — argumentos divergem de direção e não convergem à conclusão.', quality: 'negative' },
          { text: 'Boa defesa da tese na maior parte. Certifique-se de que todos os argumentos apontam para a mesma conclusão.', quality: 'neutral' },
          { text: 'Defesa da tese exemplar — argumentos articulados, coerentes e convergindo para uma conclusão sólida.', quality: 'positive' },
        ],
      },
    ],
  },

  c4: {
    subcriteria: [
      {
        label: 'Coesão',
        comments: [
          { text: 'Problemas de coesão — parágrafos desconectados. Use pronomes demonstrativos e referências anafóricas.', quality: 'negative' },
          { text: 'Coesão adequada. Evite repetir o mesmo sujeito no início dos parágrafos consecutivos.', quality: 'neutral' },
          { text: 'Coesão textual excelente — as partes do texto se integram com fluidez e precisão referencial.', quality: 'positive' },
        ],
      },
      {
        label: 'Conectivos',
        comments: [
          { text: 'Uso repetitivo de "mas" e "porém". Diversifique: "todavia", "entretanto", "nesse sentido", "ademais".', quality: 'negative' },
          { text: 'Conectivos adequados na maior parte. Explore melhor os operadores de conclusão e adição.', quality: 'neutral' },
          { text: 'Uso excelente de conectivos — variedade funcional que demonstra domínio dos operadores argumentativos.', quality: 'positive' },
        ],
      },
      {
        label: 'Progressão textual',
        comments: [
          { text: 'Progressão comprometida — algumas ideias se repetem ou não avançam a linha argumentativa do texto.', quality: 'negative' },
          { text: 'Boa progressão na maior parte. Cada parágrafo deveria acrescentar algo novo à discussão.', quality: 'neutral' },
          { text: 'Progressão textual exemplar — o texto avança com clareza lógica do problema à proposta de solução.', quality: 'positive' },
        ],
      },
    ],
  },

  c5: {
    subcriteria: [
      {
        label: 'Proposta de intervenção',
        comments: [
          { text: 'Proposta de intervenção vaga ou incompleta. Estruture: quem age, o quê faz, como faz, com qual finalidade.', quality: 'negative' },
          { text: 'Proposta presente mas com elementos implícitos. Todos os 4 devem aparecer de forma explícita.', quality: 'neutral' },
          { text: 'Proposta de intervenção completa — os 4 elementos são explícitos, detalhados e viáveis.', quality: 'positive' },
        ],
      },
      {
        label: 'Agente',
        comments: [
          { text: 'Agente genérico ("o governo", "a sociedade"). Especifique: qual ministério, órgão, instituição ou grupo.', quality: 'negative' },
          { text: 'Agente identificado. Poderia ser mais específico para garantir a pontuação máxima neste elemento.', quality: 'neutral' },
          { text: 'Agente claramente especificado — a responsabilidade é atribuída à instância exata e adequada.', quality: 'positive' },
        ],
      },
      {
        label: 'Ação',
        comments: [
          { text: 'Ação vaga. Use verbos concretos: "implementar", "criar", "fiscalizar", "capacitar", "regulamentar".', quality: 'negative' },
          { text: 'Ação indicada, mas ainda genérica. Detalhe o mecanismo específico de intervenção proposta.', quality: 'neutral' },
          { text: 'Ação concreta e específica — demonstra que o candidato conhece como a intervenção funcionaria.', quality: 'positive' },
        ],
      },
      {
        label: 'Meio/modo',
        comments: [
          { text: 'Meio/modo ausente. Como a ação será realizada? Cite o instrumento, política ou metodologia.', quality: 'negative' },
          { text: 'Meio parcialmente indicado. Explicite melhor o instrumento ou método para garantir pontuação.', quality: 'neutral' },
          { text: 'Meio/modo claramente explicitado — proposta viável e bem detalhada no seu processo de execução.', quality: 'positive' },
        ],
      },
      {
        label: 'Finalidade',
        comments: [
          { text: 'Finalidade ausente ou não integrada à tese. Por que essa intervenção? Qual resultado concreto ela visa?', quality: 'negative' },
          { text: 'Finalidade presente mas desconectada da argumentação desenvolvida ao longo do texto.', quality: 'neutral' },
          { text: 'Finalidade articulada à tese — conecta a proposta ao problema discutido, fechando o ciclo argumentativo.', quality: 'positive' },
        ],
      },
    ],
  },
}
