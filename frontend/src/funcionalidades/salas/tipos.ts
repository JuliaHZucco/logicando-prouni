export type StatusSala =
  | "aguardando"
  | "pergunta_aberta"
  | "resultado_pergunta"
  | "ranking"
  | "encerrada";

export interface ParticipanteSala {
  id: number;
  apelido: string;
}

export interface AlternativaSala {
  alternativaId: number;
  texto: string;
  posicao: number;
}

export interface PerguntaSala {
  ordem: number;
  total: number;
  enunciado: string;
  alternativas: AlternativaSala[];
  segundosRestantes: number | null;
  respondidas: number;
}

export interface BarraGrafico {
  alternativaId: number;
  posicao: number;
  texto: string;
  respostas: number;
  percentual: number;
}

export interface ResultadoPergunta {
  totalParticipantes: number;
  totalRespostas: number;
  naoResponderam: number;
  acertos: number;
  erros: number;
  percentualAcerto: number;
  alternativaCorretaId: number;
  explicacao: string;
  grafico: BarraGrafico[];
}

export interface LinhaRanking {
  participanteId: number;
  apelido: string;
  acertos: number;
  posicao: number;
  perguntasExibidas: number;
  aproveitamento: number | null;
}

export interface EstadoSala {
  codigo: string;
  nome: string;
  status: StatusSala;
  modo: string;
  categorias: string[];
  quantidadePerguntas: number;
  segundosPorPergunta: number | null;
  perguntaAtual: number | null;
  rodada: number;
  totalParticipantes: number;
  souModerador: boolean;
  participante: ParticipanteSala | null;
  participantes: ParticipanteSala[];
  pergunta: PerguntaSala | null;
  minhaAlternativaId: number | null;
  resultado: ResultadoPergunta | null;
  ranking: LinhaRanking[] | null;
  minhaPosicao: LinhaRanking | null;
}

export interface ResultadoEntrada {
  participante: ParticipanteSala;
  reconectado: boolean;
}

export interface ResultadoAcao {
  ok: boolean;
  erro?: string;
}
