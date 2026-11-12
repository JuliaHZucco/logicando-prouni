import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Alerta from "../../componentes/Alerta";
import AreaCarregando from "../../componentes/AreaCarregando";
import BarraDaSala from "../../funcionalidades/salas/componentes/BarraDaSala";
import { useSalaAoVivo } from "../../funcionalidades/salas/hooks/useSalaAoVivo";
import { useSonsDaSala } from "../../funcionalidades/salas/hooks/useSonsDaSala";
import { sairDaSala } from "../../funcionalidades/salas/servicos/salasApi";
import TelaEspera from "../../funcionalidades/salas/telas/TelaEspera";
import TelaPergunta from "../../funcionalidades/salas/telas/TelaPergunta";
import TelaRanking from "../../funcionalidades/salas/telas/TelaRanking";
import TelaResultado from "../../funcionalidades/salas/telas/TelaResultado";

export default function PaginaSalaParticipante() {
  const { codigo = "" } = useParams<{ codigo: string }>();
  const codigoNormalizado = codigo.toUpperCase();
  const { estado, erroDeCarga, mensagemDeConexao, responder } = useSalaAoVivo(codigoNormalizado);
  useSonsDaSala(estado);
  const navigate = useNavigate();
  const [saindo, setSaindo] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const sair = async () => {
    setSaindo(true);
    setMensagemErro(null);
    try {
      await sairDaSala(codigoNormalizado);
      navigate("/", { replace: true });
    } catch (erro) {
      setMensagemErro((erro as Error).message || "Erro ao sair da sala.");
      setSaindo(false);
    }
  };

  if (erroDeCarga?.status === 404) {
    return <Navigate to="/quiz/sala" replace />;
  }

  if (erroDeCarga?.status === 403) {
    return <Navigate to={`/sala/${codigoNormalizado}/apelido`} replace />;
  }

  if (!estado) {
    return (
      <div className="sala-tela">
        <main className="sala-conteudo">
          <AreaCarregando mensagem="Entrando na sala..." />
        </main>
      </div>
    );
  }

  if (!estado.participante) {
    return <Navigate to={`/moderador/sala/${codigoNormalizado}`} replace />;
  }

  return (
    <div className="sala-tela">
      <BarraDaSala codigo={estado.codigo} apelido={estado.participante.apelido} />
      <main className="sala-conteudo">
        {mensagemDeConexao && <Alerta mensagem={mensagemDeConexao} variante="warning" />}

        {mensagemErro && <Alerta mensagem={mensagemErro} />}

        {estado.status === "aguardando" && <TelaEspera estado={estado} aoSair={sair} saindo={saindo} />}

        {estado.status === "pergunta_aberta" && estado.pergunta && (
          <TelaPergunta estado={estado} pergunta={estado.pergunta} aoResponder={responder} />
        )}

        {estado.status === "resultado_pergunta" && estado.resultado && (
          <TelaResultado estado={estado} resultado={estado.resultado} />
        )}

        {(estado.status === "ranking" || estado.status === "encerrada") && <TelaRanking estado={estado} />}

        {estado.status === "encerrada" && (
          <Link to="/" className="quiz-botao-iniciar text-decoration-none w-100">
            Voltar ao site
          </Link>
        )}
      </main>
    </div>
  );
}
