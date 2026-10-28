export type ModoQuiz = "aleatorio" | "categoria" | "misto";

export interface ConfiguracaoQuiz {
  modo: ModoQuiz;
  categorias: string[];
  quantidade: number;
}

export interface OpcaoResposta {
  alternativaId: number;
  texto: string;
}

export interface PerguntaQuiz {
  duvidaId: string;
  duvidaPergunta: string;
  categoriaId: string;
  categoriaNome: string;
  opcoesResposta: OpcaoResposta[];
}

export interface PartidaQuiz {
  partidaId: number;
  perguntas: PerguntaQuiz[];
}

export interface ItemDoResultado {
  ordem: number;
  duvidaId: string;
  duvidaPergunta: string;
  categoriaId: string;
  baseDuvidaId: string;
  correta: boolean | null;
}

export interface ResultadoPartida {
  partidaId: number;
  finalizada: boolean;
  totalPerguntas: number;
  acertos: number;
  percentualAcerto: number;
  aproveitamentoPositivo: boolean;
  itens: ItemDoResultado[];
}

export interface ResultadoResposta {
  correta: boolean;
  alternativaCorretaId: number;
  explicacao: string;
  baseDuvidaId: string;
}
