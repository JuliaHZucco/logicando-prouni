import EntradaRapida from "../componentes/EntradaRapida";
import { descreverCronometro, descreverModoDaSala, type PropsTelaDaSala } from "./propsDaSala";

export default function TelaEsperaModerador({ estado, ocupado, aoAcionar, aoPedirEncerramento }: PropsTelaDaSala) {
  const semParticipantes = estado.totalParticipantes < 1;

  return (
    <div className="row g-3">
      <div className="col-12 col-lg-6">
        <section className="sala-cartao moderador-espera-cartao text-center h-100">
          <div className="moderador-sala-nome">{estado.nome.toUpperCase()}</div>

          <div className="moderador-codigo-bloco">
            <div className="sala-rotulo">CÓDIGO DA SALA · RODADA {estado.rodada}</div>
            <div className="moderador-codigo-grande">{estado.codigo}</div>
          </div>

          <div className="moderador-ficha">
            <div className="moderador-ficha-item">
              <i className="bi bi-shuffle" aria-hidden="true" />
              <span className="moderador-ficha-rotulo">Modo</span>
              <span className="moderador-ficha-valor">{descreverModoDaSala(estado)}</span>
            </div>
            <div className="moderador-ficha-item">
              <i className="bi bi-question-circle" aria-hidden="true" />
              <span className="moderador-ficha-rotulo">Perguntas</span>
              <span className="moderador-ficha-valor">{estado.quantidadePerguntas}</span>
            </div>
            <div className="moderador-ficha-item">
              <i className="bi bi-stopwatch" aria-hidden="true" />
              <span className="moderador-ficha-rotulo">Cronômetro</span>
              <span className="moderador-ficha-valor">{descreverCronometro(estado)}</span>
            </div>
          </div>

          <div className="moderador-participantes">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
              <h2 className="moderador-participantes-titulo">Participantes na sala</h2>
              <span className="moderador-contagem">
                {estado.totalParticipantes} {estado.totalParticipantes === 1 ? "participante" : "participantes"}
              </span>
            </div>

            {semParticipantes ? (
              <div className="moderador-vazio">
                <i className="bi bi-people" aria-hidden="true" />
                <span>Ninguém entrou ainda.</span>
              </div>
            ) : (
              <div
                className="sala-lista-participantes moderador-lista-rolavel"
                role="region"
                aria-label="Lista de participantes"
                tabIndex={0}
              >
                {estado.participantes.map((participante) => (
                  <span className="sala-participante" key={participante.id}>
                    {participante.apelido}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="moderador-acoes">
            <button
              type="button"
              className="quiz-botao-iniciar w-100"
              onClick={() => aoAcionar("Avancar")}
              disabled={ocupado || semParticipantes}
            >
              Iniciar partida
            </button>
            {semParticipantes && (
              <small className="sala-texto">Aguarde pelo menos um participante entrar para iniciar.</small>
            )}
            <button type="button" className="moderador-encerrar" onClick={aoPedirEncerramento} disabled={ocupado}>
              <i className="bi bi-x-circle me-1" aria-hidden="true" />
              Encerrar sala
            </button>
          </div>
        </section>
      </div>

      <div className="col-12 col-lg-6">
        <section className="sala-cartao moderador-qr-cartao h-100">
          <EntradaRapida codigo={estado.codigo} />
        </section>
      </div>
    </div>
  );
}
