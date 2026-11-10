import type { Categoria } from "../funcionalidades/duvidas/tipos";
import type { PartidaQuiz } from "../funcionalidades/quiz/tipos";
import type { EstadoSala, PerguntaSala, ResultadoPergunta } from "../funcionalidades/salas/tipos";

export function criarPergunta(parcial: Partial<PerguntaSala> = {}): PerguntaSala {
  return {
    ordem: 1,
    total: 3,
    enunciado: "Quem pode participar do ProUni?",
    alternativas: [
      { alternativaId: 11, texto: "Opção A", posicao: 1 },
      { alternativaId: 12, texto: "Opção B", posicao: 2 },
      { alternativaId: 13, texto: "Opção C", posicao: 3 },
      { alternativaId: 14, texto: "Opção D", posicao: 4 },
    ],
    segundosRestantes: null,
    respondidas: 0,
    ...parcial,
  };
}

export function criarResultado(parcial: Partial<ResultadoPergunta> = {}): ResultadoPergunta {
  return {
    totalParticipantes: 4,
    totalRespostas: 3,
    naoResponderam: 1,
    acertos: 2,
    erros: 1,
    percentualAcerto: 67,
    alternativaCorretaId: 12,
    explicacao: "A renda familiar por pessoa precisa respeitar o limite do programa.",
    grafico: [
      { alternativaId: 11, posicao: 1, texto: "Opção A", respostas: 1, percentual: 33.3 },
      { alternativaId: 12, posicao: 2, texto: "Opção B", respostas: 2, percentual: 66.7 },
      { alternativaId: 13, posicao: 3, texto: "Opção C", respostas: 0, percentual: 0 },
      { alternativaId: 14, posicao: 4, texto: "Opção D", respostas: 0, percentual: 0 },
    ],
    ...parcial,
  };
}

export function criarEstado(parcial: Partial<EstadoSala> = {}): EstadoSala {
  return {
    codigo: "ABC123",
    nome: "Turma 1",
    status: "aguardando",
    modo: "aleatorio",
    categorias: [],
    quantidadePerguntas: 3,
    segundosPorPergunta: null,
    perguntaAtual: null,
    rodada: 1,
    totalParticipantes: 1,
    souModerador: false,
    participante: { id: 1, apelido: "Ana" },
    participantes: [{ id: 1, apelido: "Ana" }],
    pergunta: null,
    minhaAlternativaId: null,
    resultado: null,
    ranking: null,
    minhaPosicao: null,
    ...parcial,
  };
}

export function criarCategorias(): Categoria[] {
  return [
    {
      categoriaId: "elegibilidade",
      categoriaNome: "Elegibilidade",
      categoriaDescricao: "Quem pode participar do programa.",
      categoriaIcone: "bi-person-check",
      categoriaDuvidas: [
        { duvidaId: "eleg-1", duvidaPergunta: "Quem pode participar do ProUni?", duvidaResposta: "Estudantes que fizeram o Enem." },
        { duvidaId: "eleg-2", duvidaPergunta: "Qual é o limite de renda?", duvidaResposta: "Até 1,5 salário mínimo por pessoa." },
      ],
    },
    {
      categoriaId: "prazos",
      categoriaNome: "Prazos",
      categoriaDescricao: "Datas importantes do processo.",
      categoriaIcone: "bi-calendar-event",
      categoriaDuvidas: [
        { duvidaId: "praz-1", duvidaPergunta: "Quando abrem as inscrições?", duvidaResposta: "As inscrições abrem depois do resultado do Enem." },
      ],
    },
    {
      categoriaId: "bolsas",
      categoriaNome: "Bolsas",
      categoriaDescricao: "Tipos de bolsa disponíveis.",
      categoriaIcone: "bi-award",
      categoriaDuvidas: [{ duvidaId: "bols-1", duvidaPergunta: "O que é a bolsa parcial?", duvidaResposta: "Cobre 50% da mensalidade." }],
    },
  ];
}

export function criarPartida(): PartidaQuiz {
  return {
    partidaId: 7,
    perguntas: [
      {
        duvidaId: "eleg-1",
        duvidaPergunta: "Quem pode participar do ProUni?",
        categoriaId: "elegibilidade",
        categoriaNome: "Elegibilidade",
        opcoesResposta: [
          { alternativaId: 101, texto: "Resposta 1A" },
          { alternativaId: 102, texto: "Resposta 1B" },
          { alternativaId: 103, texto: "Resposta 1C" },
          { alternativaId: 104, texto: "Resposta 1D" },
        ],
      },
      {
        duvidaId: "praz-1",
        duvidaPergunta: "Quando abrem as inscrições?",
        categoriaId: "prazos",
        categoriaNome: "Prazos",
        opcoesResposta: [
          { alternativaId: 201, texto: "Resposta 2A" },
          { alternativaId: 202, texto: "Resposta 2B" },
          { alternativaId: 203, texto: "Resposta 2C" },
          { alternativaId: 204, texto: "Resposta 2D" },
        ],
      },
    ],
  };
}