import { descreverCronometro, descreverModoDaSala, type PropsTelaDaSala } from "./propsDaSala";

export default function TelaEsperaModerador({ estado, ocupado, aoAcionar, aoPedirEncerramento }: PropsTelaDaSala) {
  return (
    <div className="row g-3">
      <div className="col-12 col-lg-6">
        <section className="sala-cartao text-center h-100">
          <div className="sala-rotulo">{estado.nome.toUpperCase()}</div>
          <div className="sala-rotulo">CÓDIGO DA SALA · RODADA {estado.rodada}</div>
          <div className="moderador-codigo-grande">{estado.codigo}</div>
          <p className="sala-texto">
            Peça aos participantes para abrirem o site, escolherem “Entrar em uma sala” e digitarem o código.
          </p>

          <div className="moderador-resumo">
            <div>
              <strong>Modo:</strong> {descreverModoDaSala(estado)}
            </div>
            <div>
              <strong>Perguntas:</strong> {estado.quantidadePerguntas}
            </div>
            <div>
              <strong>Cronômetro:</strong> {descreverCronometro(estado)}
            </div>
          </div>

          <div className="d-flex flex-column gap-2 mt-4">
            <button
              type="button"
              className="quiz-botao-iniciar"
              onClick={() => aoAcionar("Avancar")}
              disabled={ocupado}
            >
              Iniciar partida
            </button>
            <button type="button" className="quiz-botao-iniciar botao-perigo alt-d" onClick={aoPedirEncerramento} disabled={ocupado}>
              Encerrar sala
            </button>
          </div>
        </section>
      </div>

      <div className="col-12 col-lg-6">
        <section className="sala-cartao h-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="titulo-secao mb-0 fs-5">Participantes na sala</h2>
            <span className="sala-texto">
              {estado.totalParticipantes} {estado.totalParticipantes === 1 ? "participante" : "participantes"}
            </span>
          </div>
          <div className="sala-lista-participantes">
            {estado.participantes.map((participante) => (
              <span className="sala-participante" key={participante.id}>
                {participante.apelido}
              </span>
            ))}
          </div>
          <p className="sala-texto mt-3 mb-0">A lista atualiza sozinha quando alguém entra.</p>
        </section>
      </div>
    </div>
  );
}
