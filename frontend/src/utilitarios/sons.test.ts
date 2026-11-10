import { beforeEach, describe, expect, it, vi } from "vitest";
import { tocarSomFinalizacao, tocarSomResposta } from "./sons";

class AudioFalso {
  static criados: AudioFalso[] = [];

  caminho: string;
  volume = 0;
  play = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  pause = vi.fn();

  constructor(caminho: string) {
    this.caminho = caminho;
    AudioFalso.criados.push(this);
  }
}

describe("sons", () => {
  beforeEach(() => {
    AudioFalso.criados = [];
    vi.stubGlobal("Audio", AudioFalso);
  });

  it("toca o som de acerto e o de erro", () => {
    tocarSomResposta(true);
    tocarSomResposta(false);

    expect(AudioFalso.criados.map((audio) => audio.caminho)).toEqual(["/som-acerto.mp3", "/som-erro.mp3"]);
  });

  it("toca o som de aproveitamento alto ou baixo ao fim do quiz", () => {
    tocarSomFinalizacao(true);
    tocarSomFinalizacao(false);

    expect(AudioFalso.criados.map((audio) => audio.caminho)).toEqual(["/som-aproveitamento-alto.mp3", "/som-aproveitamento-baixo.mp3"]);
  });

  it("toca no volume máximo", () => {
    tocarSomResposta(true);

    expect(AudioFalso.criados[0].volume).toBe(1);
    expect(AudioFalso.criados[0].play).toHaveBeenCalledOnce();
  });

  it("interrompe o som anterior quando começa outro", () => {
    tocarSomResposta(true);
    tocarSomResposta(false);

    expect(AudioFalso.criados[0].pause).toHaveBeenCalledOnce();
    expect(AudioFalso.criados[1].pause).not.toHaveBeenCalled();
  });

  it("ignora o erro quando o navegador não deixa tocar", async () => {
    vi.stubGlobal(
      "Audio",
      class extends AudioFalso {
        constructor(caminho: string) {
          super(caminho);
          this.play = vi.fn<() => Promise<void>>().mockRejectedValue(new Error("bloqueado pelo navegador"));
        }
      },
    );

    expect(() => tocarSomResposta(true)).not.toThrow();
    await Promise.resolve();
  });
});
