export const quantidadeMaximaDePerguntas = 10;

export function ajustarQuantidade(quantidade: number, minimo: number): number {
  return Math.min(quantidadeMaximaDePerguntas, Math.max(quantidade, minimo));
}
