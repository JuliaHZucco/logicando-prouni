import { buscarJson, enviarJson, tratarErro } from "../../../utilitarios/api";
import type { LinhaRanking } from "../../salas/tipos";
import type { FiltrosDeSalas, ModeradorLogado, NovaSala, SalaResumo } from "../tipos";

export async function entrarComoModerador(email: string, senha: string): Promise<ModeradorLogado> {
  return tratarErro(await enviarJson<ModeradorLogado>("/api/auth/login", { email, senha }));
}

export async function buscarModeradorLogado(): Promise<ModeradorLogado> {
  return tratarErro(await buscarJson<ModeradorLogado>("/api/auth/eu"));
}

export async function sairDoModerador(): Promise<void> {
  tratarErro(await enviarJson<unknown>("/api/auth/sair"));
}

export async function criarSala(sala: NovaSala): Promise<{ codigo: string }> {
  return tratarErro(await enviarJson<{ codigo: string }>("/api/salas", sala));
}

export async function listarMinhasSalas(filtros: FiltrosDeSalas): Promise<SalaResumo[]> {
  const parametros = new URLSearchParams();
  if (filtros.busca.trim()) parametros.set("busca", filtros.busca.trim());
  if (filtros.estado) parametros.set("estado", filtros.estado);
  if (filtros.de) parametros.set("de", filtros.de);
  if (filtros.ate) parametros.set("ate", filtros.ate);

  const consulta = parametros.toString();
  return tratarErro(await buscarJson<SalaResumo[]>(`/api/salas/minhas${consulta ? `?${consulta}` : ""}`));
}

export async function buscarRankingGeral(codigo: string): Promise<LinhaRanking[]> {
  return tratarErro(await buscarJson<LinhaRanking[]>(`/api/salas/${codigo}/ranking`));
}
