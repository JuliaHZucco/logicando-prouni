import type { EstadoSala } from "../../salas/tipos";

export interface PropsTelaDaSala {
  estado: EstadoSala;
  ocupado: boolean;
  aoAcionar: (metodo: string) => void;
  aoPedirEncerramento: () => void;
}

export function descreverModoDaSala(estado: EstadoSala): string {
  if (estado.modo === "aleatorio") return "Aleatório";
  if (estado.modo === "categoria") return estado.categorias[0] ?? "Uma categoria";
  return `Misto (${estado.categorias.join(", ")})`;
}

export function descreverCronometro(estado: EstadoSala): string {
  return estado.segundosPorPergunta ? `${estado.segundosPorPergunta} segundos por pergunta` : "Sem cronômetro";
}
