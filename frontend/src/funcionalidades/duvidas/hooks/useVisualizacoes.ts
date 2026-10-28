import { useContext } from "react";
import { ContextoVisualizacoes } from "../contexto/ContextoVisualizacoes";

export function useVisualizacoes() {
  const contexto = useContext(ContextoVisualizacoes);
  if (!contexto) {
    throw new Error("useVisualizacoes deve ser usado dentro de ProvedorVisualizacoes");
  }
  return contexto;
}
