let audioAtual: HTMLAudioElement | null = null;

function tocarAudio(caminho: string) {
  audioAtual?.pause();
  audioAtual = new Audio(caminho);
  audioAtual.volume = 1;
  void audioAtual.play().catch(() => undefined);
}

export function tocarSomResposta(acertou: boolean) {
  tocarAudio(acertou ? "/som-acerto.mp3" : "/som-erro.mp3");
}

export function tocarSomFinalizacao(aprovado: boolean) {
  tocarAudio(aprovado ? "/som-aproveitamento-alto.mp3" : "/som-aproveitamento-baixo.mp3");
}
