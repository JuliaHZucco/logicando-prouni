import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import { ContextoConteudo } from "../funcionalidades/duvidas/contexto/ContextoConteudo";
import { ContextoVisualizacoes } from "../funcionalidades/duvidas/contexto/ContextoVisualizacoes";
import type { Categoria } from "../funcionalidades/duvidas/tipos";
import { criarCategorias } from "./fabricas";
import LocalAtual from "./LocalAtual";

type Entrada = string | { pathname: string; state?: unknown };

export function renderizarComRotas(entrada: Entrada, rotas: Record<string, ReactElement>, envolver?: (filhos: ReactElement) => ReactElement) {
  const conteudo = (
    <Routes>
      {Object.entries(rotas).map(([caminho, elemento]) => (
        <Route key={caminho} path={caminho} element={elemento} />
      ))}
      <Route path="*" element={<LocalAtual />} />
    </Routes>
  );

  return render(<MemoryRouter initialEntries={[entrada]}>{envolver ? envolver(conteudo) : conteudo}</MemoryRouter>);
}

interface OpcoesDoSite {
  entrada?: Entrada;
  rota?: string;
  categorias?: Categoria[];
  vistas?: string[];
  marcarDuvidaComoVista?: (duvidaId: string) => void;
}

export function renderizarNoSite(elemento: ReactElement, opcoes: OpcoesDoSite = {}) {
  const categorias = opcoes.categorias ?? criarCategorias();
  const vistas = new Set(opcoes.vistas ?? []);
  const marcarDuvidaComoVista = opcoes.marcarDuvidaComoVista ?? vi.fn();

  return renderizarComRotas(opcoes.entrada ?? "/", { [opcoes.rota ?? "/"]: elemento }, (filhos) => (
    <ContextoConteudo.Provider
      value={{ categorias, totalGeralDuvidas: categorias.reduce((total, categoria) => total + categoria.categoriaDuvidas.length, 0) }}
    >
      <ContextoVisualizacoes.Provider
        value={{
          duvidaIdsVistas: vistas,
          marcarDuvidaComoVista,
          totalDuvidasVistas: vistas.size,
          totalGeralDuvidas: categorias.reduce((total, categoria) => total + categoria.categoriaDuvidas.length, 0),
          contarDuvidasVistasNaCategoria: (ids) => ids.filter((id) => vistas.has(id)).length,
        }}
      >
        {filhos}
      </ContextoVisualizacoes.Provider>
    </ContextoConteudo.Provider>
  ));
}
