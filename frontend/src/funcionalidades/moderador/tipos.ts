import type { ModoQuiz } from "../quiz/tipos";

export interface ModeradorLogado {
  email: string;
}

export interface SalaResumo {
  codigo: string;
  nome: string;
  status: string;
  modo: ModoQuiz;
  quantidade: number;
  categorias: string[];
  criadaEm: string;
  participantes: number;
}

export type EstadoFiltravel = "" | "aguardando" | "em_andamento" | "encerrada";

export interface FiltrosDeSalas {
  busca: string;
  estado: EstadoFiltravel;
  de: string;
  ate: string;
}

export interface NovaSala {
  nome: string;
  modo: ModoQuiz;
  categorias: string[];
  quantidade: number;
  segundosPorPergunta: number | null;
}
