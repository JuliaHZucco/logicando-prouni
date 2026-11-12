import type { EstadoSala } from "../tipos";

interface PropsTelaEspera {
  estado: EstadoSala;
  aoSair?: () => void;
  saindo?: boolean;
}

export default function TelaEspera({ estado, aoSair, saindo = false }: PropsTelaEspera) {
  const novaRodada = estado.rodada > 1;

  return (
    <>
      <section className="sala-cartao text-center">
        <img src="/mascote-fe.svg" alt="Mascote Fê" className="sala-mascote" />
        {novaRodada ? (
          <>
            <div className="sala-rotulo">RODADA {estado.rodada}</div>
            <h1 className="sala-titulo">O moderador abriu uma nova rodada</h1>
            <p className="sala-texto mb-0">
              Você continua na sala com o mesmo apelido. O placar começa do zero. Aguarde a primeira pergunta.
            </p>
          </>
        ) : (
          <>
            <h1 className="sala-titulo">Aguardando o moderador iniciar</h1>
            <p className="sala-texto mb-0">Fique nesta tela. A primeira pergunta aparece sozinha.</p>
          </>
        )}
      </section>

      <section className="sala-cartao">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="sala-rotulo mb-0">NA SALA</span>
          <span className="sala-texto">
            {estado.totalParticipantes} {estado.totalParticipantes === 1 ? "participante" : "participantes"}
          </span>
        </div>
        <div className="sala-lista-participantes">
          {estado.participantes.map((participante) => (
            <span className="sala-participante" key={participante.id}>
              {participante.apelido}
              {participante.id === estado.participante?.id ? " (você)" : ""}
            </span>
          ))}
        </div>
      </section>

      {!novaRodada && aoSair && (
        <button type="button" className="quiz-botao-secundario w-100" onClick={aoSair} disabled={saindo}>
          <i className="bi bi-arrow-left me-2" aria-hidden="true" />
          Voltar e sair da sala
        </button>
      )}
    </>
  );
}
