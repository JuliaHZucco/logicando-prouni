export type ResultadoRequisicao<T> = {
  resposta: Response;
  dados: T;
};

export class ErroApi extends Error {
  status: number;
  codigo: string;
  tipo: string;

  constructor(opcoes: { status: number; codigo: string; tipo: string; mensagem: string }) {
    super(opcoes.mensagem);
    this.name = "ErroApi";
    this.status = opcoes.status;
    this.codigo = opcoes.codigo;
    this.tipo = opcoes.tipo;
  }
}

async function lerJson<T>(resposta: Response): Promise<T> {
  try {
    return await resposta.json();
  } catch {
    return {} as T;
  }
}

export async function buscarJson<T>(rota: string): Promise<ResultadoRequisicao<T>> {
  const resposta = await fetch(rota, { credentials: "include" });
  return { resposta, dados: await lerJson<T>(resposta) };
}

export async function enviarJson<T>(rota: string, corpo?: unknown): Promise<ResultadoRequisicao<T>> {
  const resposta = await fetch(rota, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  return { resposta, dados: await lerJson<T>(resposta) };
}

export function tratarErro<T>(resultado: ResultadoRequisicao<T>): T {
  const { resposta, dados } = resultado;
  if (resposta.ok) return dados;

  const erro = dados as { type?: string; code?: string; message?: string };
  throw new ErroApi({
    status: resposta.status,
    codigo: erro?.code || "ERRO_HTTP",
    tipo: erro?.type || "error",
    mensagem: erro?.message || "Erro inesperado.",
  });
}
