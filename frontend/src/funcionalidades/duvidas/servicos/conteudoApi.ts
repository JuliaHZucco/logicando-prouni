import { buscarJson, enviarJson, tratarErro } from "../../../utilitarios/api";
import type { Categoria } from "../tipos";

export async function buscarConteudo(): Promise<Categoria[]> {
  return tratarErro(await buscarJson<Categoria[]>("/api/conteudo"));
}

export async function buscarDuvidasVistas(): Promise<string[]> {
  return tratarErro(await buscarJson<string[]>("/api/duvidas-vistas"));
}

export async function registrarDuvidaVista(duvidaId: string): Promise<void> {
  tratarErro(await enviarJson<{ success: boolean }>("/api/duvidas-vistas", { duvidaId }));
}
