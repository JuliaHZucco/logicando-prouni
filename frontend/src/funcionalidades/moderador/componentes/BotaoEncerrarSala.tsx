interface PropsBotaoEncerrarSala {
  aoClicar: () => void;
  desabilitado: boolean;
}

export default function BotaoEncerrarSala({ aoClicar, desabilitado }: PropsBotaoEncerrarSala) {
  return (
    <button type="button" className="moderador-encerrar" onClick={aoClicar} disabled={desabilitado}>
      <i className="bi bi-x-circle me-1" aria-hidden="true" />
      Encerrar sala
    </button>
  );
}
