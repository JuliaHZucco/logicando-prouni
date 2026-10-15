import "dotenv/config";

function exigirVariavel(nome: string): string {
  const valor = process.env[nome]?.trim();
  if (!valor) {
    throw new Error(`A variável de ambiente ${nome} é obrigatória.`);
  }
  return valor;
}

function lerPorta(): number {
  const valor = process.env.PORTA?.trim() || "3000";
  const porta = Number(valor);
  if (!Number.isInteger(porta) || porta < 1 || porta > 65535) {
    throw new Error("A variável PORTA deve ser um número inteiro entre 1 e 65535.");
  }
  return porta;
}

export const ambiente = {
  bancoUrl: exigirVariavel("DATABASE_URL"),
  jwtSegredo: exigirVariavel("JWT_SEGREDO"),
  nodeEnv: process.env.NODE_ENV?.trim() || "development",
  pastaFrontend: process.env.PASTA_FRONTEND?.trim() || "",
  porta: lerPorta(),
};

export const producao = ambiente.nodeEnv === "production";
