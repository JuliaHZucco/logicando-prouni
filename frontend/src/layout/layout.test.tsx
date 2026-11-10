import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { useConteudo } from "../funcionalidades/duvidas/hooks/useConteudo";
import { buscarConteudo, buscarDuvidasVistas } from "../funcionalidades/duvidas/servicos/conteudoApi";
import { buscarModeradorLogado, sairDoModerador } from "../funcionalidades/moderador/servicos/moderadorApi";
import { ErroApi } from "../utilitarios/api";
import { criarCategorias } from "../testes/fabricas";
import LocalAtual from "../testes/LocalAtual";
import Cabecalho from "./Cabecalho";
import LayoutDoModerador from "./LayoutDoModerador";
import LayoutDoSite from "./LayoutDoSite";
import Rodape from "./Rodape";

vi.mock("../funcionalidades/duvidas/servicos/conteudoApi", () => ({
  buscarConteudo: vi.fn(),
  buscarDuvidasVistas: vi.fn(),
  registrarDuvidaVista: vi.fn(),
}));
vi.mock("../funcionalidades/moderador/servicos/moderadorApi", () => ({
  buscarModeradorLogado: vi.fn(),
  sairDoModerador: vi.fn(),
}));

describe("Cabecalho", () => {
  function renderizar(entrada = "/") {
    return render(
      <MemoryRouter initialEntries={[entrada]}>
        <Cabecalho />
        <Routes>
          <Route path="*" element={<LocalAtual />} />
        </Routes>
      </MemoryRouter>,
    );
  }

  const campo = () => screen.getByLabelText("Buscar dúvida");

  it("leva ao início pela marca e à área do moderador pelo ícone", () => {
    renderizar();

    expect(screen.getByRole("link", { name: /Feevale Prouni/ })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Área do moderador" })).toHaveAttribute("href", "/moderador/login");
  });

  it("busca pelo termo digitado, com o texto codificado na URL", async () => {
    renderizar();

    await userEvent.type(campo(), "bolsa parcial{Enter}");

    expect(screen.getByTestId("local")).toHaveTextContent("/buscar?q=bolsa%20parcial");
  });

  it("tira os espaços das pontas do termo", async () => {
    renderizar();

    await userEvent.type(campo(), "  prazo  {Enter}");

    expect(screen.getByTestId("local")).toHaveTextContent("/buscar?q=prazo");
  });

  it("não busca quando o campo está vazio", async () => {
    renderizar();

    await userEvent.type(campo(), "   {Enter}");

    expect(screen.getByTestId("local")).toHaveTextContent("/");
    expect(screen.getByTestId("local")).not.toHaveTextContent("/buscar");
  });

  it("limpa o campo ao sair da página de busca", async () => {
    renderizar();
    await userEvent.type(campo(), "bolsa{Enter}");
    expect(campo()).toHaveValue("bolsa");

    await userEvent.click(screen.getByRole("link", { name: /Feevale Prouni/ }));

    expect(campo()).toHaveValue("");
  });
});

describe("Rodape", () => {
  function renderizar() {
    return render(
      <MemoryRouter>
        <Rodape />
      </MemoryRouter>,
    );
  }

  it("mostra o projeto de extensão Logicando com o link para o site", () => {
    renderizar();

    const link = screen.getByRole("link", { name: "Logicando" });
    expect(link).toHaveAttribute("href", "https://projetos.feevale.br/logicando/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("mostra os contatos e as redes da Feevale", () => {
    renderizar();

    expect(screen.getByText("(51) 3586-8800")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Atendimento Feevale" })).toHaveAttribute("href", "https://feevale.apprbs.com.br/atendimentos/login");
    expect(screen.getAllByRole("link", { name: "@feevale" })).toHaveLength(2);
  });

  it("tem o acesso à área do moderador e a autoria", () => {
    renderizar();

    expect(screen.getByRole("link", { name: "Área do moderador" })).toHaveAttribute("href", "/moderador/login");
    expect(screen.getByText("Desenvolvimento: Júlia Hadassa Zucco")).toBeInTheDocument();
  });
});

describe("LayoutDoModerador", () => {
  function renderizar() {
    return render(
      <MemoryRouter initialEntries={["/moderador/salas"]}>
        <Routes>
          <Route path="/moderador" element={<LayoutDoModerador />}>
            <Route path="salas" element={<div>Conteúdo do moderador</div>} />
          </Route>
          <Route path="/moderador/login" element={<div>Tela de login</div>} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it("mostra 'Carregando...' enquanto confere a sessão", () => {
    vi.mocked(buscarModeradorLogado).mockReturnValue(new Promise(() => undefined));
    renderizar();

    expect(screen.getByRole("status")).toHaveTextContent("Carregando...");
  });

  it("com sessão ativa mostra o e-mail no cabeçalho e a página pedida", async () => {
    vi.mocked(buscarModeradorLogado).mockResolvedValue({ email: "prof@feevale.br" });
    renderizar();

    expect(await screen.findByText("Conteúdo do moderador")).toBeInTheDocument();
    expect(screen.getByText("prof@feevale.br")).toBeInTheDocument();
    expect(sairDoModerador).not.toHaveBeenCalled();
  });

  it("sem sessão (401) manda para a tela de login", async () => {
    vi.mocked(buscarModeradorLogado).mockRejectedValue(new ErroApi({ status: 401, codigo: "ERRO_HTTP", tipo: "unauthorized", mensagem: "Entre como moderador para continuar." }));
    renderizar();

    expect(await screen.findByText("Tela de login")).toBeInTheDocument();
    expect(screen.queryByText("Conteúdo do moderador")).not.toBeInTheDocument();
  });
});

describe("LayoutDoSite", () => {
  function PaginaInterna() {
    const { totalGeralDuvidas } = useConteudo();
    return <div>Página interna com {totalGeralDuvidas} dúvidas</div>;
  }

  function renderizar() {
    return render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<LayoutDoSite />}>
            <Route path="/" element={<PaginaInterna />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
  }

  it("mostra o cabeçalho e o rodapé do site em volta da página", async () => {
    vi.mocked(buscarConteudo).mockResolvedValue(criarCategorias());
    vi.mocked(buscarDuvidasVistas).mockResolvedValue([]);
    renderizar();

    expect(await screen.findByText("Página interna com 4 dúvidas")).toBeInTheDocument();
    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(screen.getByText("Desenvolvimento: Júlia Hadassa Zucco")).toBeInTheDocument();
  });

  it("espera o conteúdo carregar antes de mostrar a página", () => {
    vi.mocked(buscarConteudo).mockReturnValue(new Promise(() => undefined));
    vi.mocked(buscarDuvidasVistas).mockResolvedValue([]);
    renderizar();

    expect(screen.getByText("Carregando conteúdo...")).toBeInTheDocument();
    expect(screen.queryByText(/Página interna/)).not.toBeInTheDocument();
  });
});
