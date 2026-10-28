import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Alerta from "../../componentes/Alerta";
import AreaCarregando from "../../componentes/AreaCarregando";
import LinkVoltarModerador from "../../funcionalidades/moderador/componentes/LinkVoltarModerador";
import ModalEncerrarSala from "../../funcionalidades/moderador/telas/ModalEncerrarSala";
import TelaEncerradaModerador from "../../funcionalidades/moderador/telas/TelaEncerradaModerador";
import TelaEsperaModerador from "../../funcionalidades/moderador/telas/TelaEsperaModerador";
import TelaPerguntaModerador from "../../funcionalidades/moderador/telas/TelaPerguntaModerador";
import TelaRankingModerador from "../../funcionalidades/moderador/telas/TelaRankingModerador";
import TelaResultadoModerador from "../../funcionalidades/moderador/telas/TelaResultadoModerador";
import { useSalaAoVivo } from "../../funcionalidades/salas/hooks/useSalaAoVivo";

export default function PaginaModeradorSala() {
  const { codigo = "" } = useParams<{ codigo: string }>();
  const codigoNormalizado = codigo.toUpperCase();
  const { estado, erroDeCarga, mensagemDeConexao, executar } = useSalaAoVivo(codigoNormalizado);
  const [ocupado, setOcupado] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [confirmandoEncerramento, setConfirmandoEncerramento] = useState(false);

  if (erroDeCarga && (erroDeCarga.status === 403 || erroDeCarga.status === 404)) {
    return <Navigate to="/moderador/salas" replace />;
  }

  if (!estado) {
    return (
      <div className="container py-5">
        <AreaCarregando mensagem="Abrindo a sala..." />
      </div>
    );
  }

  if (!estado.souModerador) {
    return <Navigate to="/moderador/salas" replace />;
  }

  const acionar = async (metodo: string) => {
    setOcupado(true);
    setMensagemErro(null);
    const resultado = await executar(metodo);
    if (!resultado.ok) setMensagemErro(resultado.erro ?? "Não foi possível concluir a ação.");
    setOcupado(false);
  };

  const encerrarSala = async () => {
    await acionar("EncerrarSala");
    setConfirmandoEncerramento(false);
  };

  const propsDasTelas = {
    estado,
    ocupado,
    aoAcionar: acionar,
    aoPedirEncerramento: () => setConfirmandoEncerramento(true),
  };

  return (
    <div className="container py-4">
      <LinkVoltarModerador para="/moderador/salas" texto="Minhas salas" />
      {mensagemDeConexao && <Alerta mensagem={mensagemDeConexao} variante="warning" />}
      {mensagemErro && (
        <div className="mb-3">
          <Alerta mensagem={mensagemErro} />
        </div>
      )}

      {estado.status === "aguardando" && <TelaEsperaModerador {...propsDasTelas} />}

      {estado.status === "pergunta_aberta" && estado.pergunta && (
        <TelaPerguntaModerador {...propsDasTelas} pergunta={estado.pergunta} />
      )}

      {estado.status === "resultado_pergunta" && estado.pergunta && estado.resultado && (
        <TelaResultadoModerador {...propsDasTelas} pergunta={estado.pergunta} resultado={estado.resultado} />
      )}

      {estado.status === "ranking" && <TelaRankingModerador {...propsDasTelas} />}

      {estado.status === "encerrada" && <TelaEncerradaModerador estado={estado} />}

      {confirmandoEncerramento && (
        <ModalEncerrarSala
          codigo={estado.codigo}
          ocupado={ocupado}
          aoCancelar={() => setConfirmandoEncerramento(false)}
          aoConfirmar={encerrarSala}
        />
      )}
    </div>
  );
}
