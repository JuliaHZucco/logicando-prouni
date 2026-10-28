import { buscarJson, enviarJson, tratarErro } from "../../../utilitarios/api";
import type { EstadoSala, ResultadoEntrada } from "../tipos";

export async function entrarNaSala(codigo: string, apelido: string): Promise<ResultadoEntrada> {
  return tratarErro(await enviarJson<ResultadoEntrada>(`/api/salas/${codigo}/participantes`, { apelido }));
}

export async function buscarEstadoDaSala(codigo: string): Promise<EstadoSala> {
  return tratarErro(await buscarJson<EstadoSala>(`/api/salas/${codigo}/estado`));
}
