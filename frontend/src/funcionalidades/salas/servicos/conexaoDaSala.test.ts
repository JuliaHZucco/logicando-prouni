import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { criarConexaoDaSala } from "./conexaoDaSala";

const conexaoFalsa = { nome: "conexao" };
const construtor = {
  withUrl: vi.fn(),
  withAutomaticReconnect: vi.fn(),
  configureLogging: vi.fn(),
  build: vi.fn(),
};

vi.mock("@microsoft/signalr", async (importarOriginal) => ({
  ...(await importarOriginal<typeof import("@microsoft/signalr")>()),
  HubConnectionBuilder: vi.fn(function () {
    return construtor;
  }),
}));

describe("criarConexaoDaSala", () => {
  beforeEach(() => {
    construtor.withUrl.mockReturnValue(construtor);
    construtor.withAutomaticReconnect.mockReturnValue(construtor);
    construtor.configureLogging.mockReturnValue(construtor);
    construtor.build.mockReturnValue(conexaoFalsa);
    vi.mocked(HubConnectionBuilder).mockImplementation(function () {
      return construtor as unknown as HubConnectionBuilder;
    });
  });

  it("conecta no hub da sala, reconecta sozinha e não escreve log no console", () => {
    const conexao = criarConexaoDaSala();

    expect(construtor.withUrl).toHaveBeenCalledExactlyOnceWith("/hubs/sala");
    expect(construtor.withAutomaticReconnect).toHaveBeenCalledOnce();
    expect(construtor.configureLogging).toHaveBeenCalledExactlyOnceWith(LogLevel.None);
    expect(conexao).toBe(conexaoFalsa);
  });

  it("cada chamada monta uma conexão nova", () => {
    criarConexaoDaSala();
    criarConexaoDaSala();

    expect(construtor.build).toHaveBeenCalledTimes(2);
  });
});
