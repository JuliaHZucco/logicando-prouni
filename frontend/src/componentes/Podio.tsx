import type { LinhaRanking } from "../funcionalidades/salas/tipos";

interface PropsPodio {
  ranking: LinhaRanking[];
}

function descreverDesempenho(linha: LinhaRanking): string {
  if (linha.perguntasExibidas === 0) return `${linha.acertos} acertos`;
  const aproveitamento = linha.aproveitamento === null ? "" : ` · ${linha.aproveitamento}%`;
  return `${linha.acertos} de ${linha.perguntasExibidas}${aproveitamento}`;
}

export default function Podio({ ranking }: PropsPodio) {
  const ordemVisual = [1, 0, 2, ...ranking.slice(3).map((_, indice) => indice + 3)];
  const colocados = ordemVisual.filter((indice) => indice < ranking.length).map((indice) => ranking[indice]);

  return (
    <div className="podio" role="list" aria-label="Pódio: três primeiros colocados">
      {colocados.map((linha) => {
        const posicao = Math.min(linha.posicao, 3);
        return (
          <div className={`podio-coluna podio-posicao-${posicao}`} role="listitem" key={linha.participanteId}>
            <div className="podio-figura">
              <span className="podio-avatar">
                {linha.posicao === 1 && <img src="/coroa.png" alt="Coroa do primeiro lugar" className="podio-coroa" />}
                {linha.apelido.charAt(0).toUpperCase()}
              </span>
              <span className="podio-nome">{linha.apelido}</span>
              <span className="podio-desempenho">{descreverDesempenho(linha)}</span>
            </div>
            <div className="podio-degrau">{linha.posicao}º</div>
          </div>
        );
      })}
    </div>
  );
}
