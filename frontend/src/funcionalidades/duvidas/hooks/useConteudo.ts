import { useContext } from "react";
import { ContextoConteudo } from "../contexto/ContextoConteudo";

export function useConteudo() {
  const contexto = useContext(ContextoConteudo);
  if (!contexto) {
    throw new Error("useConteudo deve ser usado dentro de ProvedorConteudo");
  }
  return contexto;
}
