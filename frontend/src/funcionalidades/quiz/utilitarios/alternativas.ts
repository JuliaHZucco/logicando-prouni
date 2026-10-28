const classesDasAlternativas = ["alt-a", "alt-b", "alt-c", "alt-d"];

export function classeDaAlternativa(indice: number): string {
  return classesDasAlternativas[indice % classesDasAlternativas.length];
}
