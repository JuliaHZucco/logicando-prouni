import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Alerta from "../../componentes/Alerta";
import AreaCarregando from "../../componentes/AreaCarregando";
import LinkVoltarModerador from "../../funcionalidades/moderador/componentes/LinkVoltarModerador";
import { buscarRankingGeral } from "../../funcionalidades/moderador/servicos/moderadorApi";
import { buscarEstadoDaSala } from "../../funcionalidades/salas/servicos/salasApi";
import type { EstadoSala, LinhaRanking } from "../../funcionalidades/salas/tipos";
import { ErroApi } from "../../utilitarios/api";
import CabecalhoDaSala from "../../funcionalidades/moderador/componentes/CabecalhoDaSala";

function classeDaPosicao(posicao: number): string {
  return posicao <= 3 ? `posicao-${posicao}` : "posicao-demais";
}

export default function PaginaModeradorRankingGeral() {
  const { codigo = "" } = useParams<{ codigo: string }>();
  const codigoNormalizado = codigo.toUpperCase();
  const [ranking, setRanking] = useState<LinhaRanking[] | null>(null);
  const [estado, setEstado] = useState<EstadoSala | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [semAcesso, setSemAcesso] = useState(false);

  useEffect(() => {
    Promise.all([buscarRankingGeral(codigoNormalizado), buscarEstadoDaSala(codigoNormalizado)])
      .then(([linhas, sala]) => {
        setRanking(linhas);
        setEstado(sala);
      })
      .catch((erro) => {
        if (erro instanceof ErroApi && (erro.status === 403 || erro.status === 404)) setSemAcesso(true);
        else setMensagemErro((erro as Error).message || "Erro ao carregar o ranking.");
      });
  }, [codigoNormalizado]);

  if (semAcesso) {
    return <Navigate to="/moderador/salas" replace />;
  }

  return (
    <div className="container py-4">
      <LinkVoltarModerador para={`/moderador/sala/${codigoNormalizado}`} texto="Voltar ao pódio" />

      {mensagemErro && <Alerta mensagem={mensagemErro} />}
      {!ranking && !mensagemErro && <AreaCarregando mensagem="Carregando ranking..." />}

      {ranking && estado && (
        <>
          <CabecalhoDaSala codigo={estado.codigo} rodada={estado.rodada} nome={estado.nome} className="mb-2" />
          <h1 className="titulo-secao">Ranking geral</h1>
          <p className="text-muted">
            {ranking.length} {ranking.length === 1 ? "participante" : "participantes"}. Esta lista completa só aparece
            para o moderador.
          </p>

          <section className="sala-cartao p-0 overflow-hidden">
            <div className="table-responsive">
              <table className="table tabela-salas mb-0 align-middle">
                <thead>
                  <tr>
                    <th>POSIÇÃO</th>
                    <th>APELIDO</th>
                    <th>ACERTOS</th>
                    <th>APROVEITAMENTO</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((linha) => (
                    <tr key={linha.participanteId}>
                      <td className={`posicao-ranking ${classeDaPosicao(linha.posicao)}`}>{linha.posicao}º</td>
                      <td>{linha.apelido}</td>
                      <td>
                        {linha.acertos} de {linha.perguntasExibidas}
                      </td>
                      <td>{linha.aproveitamento === null ? "-" : `${linha.aproveitamento}%`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {ranking.length === 0 && <div className="p-4 text-center text-muted">Ninguém entrou nesta sala.</div>}
          </section>
          <p className="sala-aviso mt-3">Empates têm a mesma posição e aparecem em ordem alfabética.</p>
        </>
      )}
    </div>
  );
}
