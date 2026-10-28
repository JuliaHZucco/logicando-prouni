import { createContext } from "react";
import type { Categoria } from "../tipos";

export interface ValorContextoConteudo {
  categorias: Categoria[];
  totalGeralDuvidas: number;
}

export const ContextoConteudo = createContext<ValorContextoConteudo | null>(null);
