interface PropsModalEncerrarSala {
  codigo: string;
  ocupado: boolean;
  aoCancelar: () => void;
  aoConfirmar: () => void;
}

export default function ModalEncerrarSala({ codigo, ocupado, aoCancelar, aoConfirmar }: PropsModalEncerrarSala) {
  return (
    <div className="modal-fundo" role="dialog" aria-modal="true" aria-labelledby="tituloEncerrarSala">
      <div className="modal-caixa">
        <h2 id="tituloEncerrarSala" className="sala-titulo">
          Encerrar a sala {codigo}?
        </h2>
        <p className="sala-texto">
          Os participantes verão o resultado final e a sala não aceitará novas respostas. Essa ação não pode ser
          desfeita.
        </p>
        <div className="d-flex gap-2 justify-content-end flex-wrap">
          <button type="button" className="quiz-botao-secundario" onClick={aoCancelar} disabled={ocupado}>
            Cancelar
          </button>
          <button type="button" className="quiz-botao-iniciar botao-perigo alt-d" onClick={aoConfirmar} disabled={ocupado}>
            Encerrar sala
          </button>
        </div>
      </div>
    </div>
  );
}
