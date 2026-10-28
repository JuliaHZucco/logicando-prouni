import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Alerta from "../../componentes/Alerta";
import { entrarNaSala } from "../../funcionalidades/salas/servicos/salasApi";
import { ErroApi } from "../../utilitarios/api";

const tamanhoMaximoDoApelido = 20;

export default function PaginaSalaApelido() {
  const { codigo = "" } = useParams<{ codigo: string }>();
  const codigoNormalizado = codigo.toUpperCase();
  const navigate = useNavigate();
  const [apelido, setApelido] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const entrar = async (evento: FormEvent) => {
    evento.preventDefault();
    setEnviando(true);
    setMensagemErro(null);
    try {
      await entrarNaSala(codigoNormalizado, apelido.trim());
      navigate(`/sala/${codigoNormalizado}`, { replace: true });
    } catch (erro) {
      if (erro instanceof ErroApi && erro.status === 404) {
        setMensagemErro("Sala não encontrada. Confira o código com o moderador.");
      } else {
        setMensagemErro((erro as Error).message || "Erro ao entrar na sala.");
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="sala-tela">
      <header className="sala-barra">
        <div className="sala-barra-esquerda">
          <img src="/logo-feevale.png" alt="Logo da Universidade Feevale" className="sala-barra-logo" />
          <span className="sala-barra-marca">
            Feevale <span className="marca-destaque">Prouni</span>
          </span>
        </div>
      </header>

      <main className="sala-conteudo">
        <div className="text-center">
          <img src="/mascote-fe.svg" alt="Mascote Fê" className="sala-mascote" />
          <div className="sala-rotulo">SALA {codigoNormalizado}</div>
          <h1 className="sala-titulo">Como quer ser chamado(a)?</h1>
          <p className="sala-texto">Escolha um apelido. Ele aparece no ranking para todos da sala.</p>
        </div>

        <form className="sala-cartao" onSubmit={entrar}>
          <label className="form-label quiz-label" htmlFor="apelido">
            APELIDO
          </label>
          <input
            id="apelido"
            type="text"
            maxLength={tamanhoMaximoDoApelido}
            autoComplete="off"
            className={`form-control quiz-input ${mensagemErro ? "is-invalid" : ""}`}
            value={apelido}
            onChange={(evento) => setApelido(evento.target.value)}
            aria-invalid={Boolean(mensagemErro)}
          />
          <div className="sala-texto mt-2">Até {tamanhoMaximoDoApelido} caracteres. Não precisa ser seu nome real.</div>

          {mensagemErro && (
            <div className="mt-3">
              <Alerta mensagem={mensagemErro} />
            </div>
          )}

          <button type="submit" className="quiz-botao-iniciar w-100 mt-4" disabled={enviando || apelido.trim().length === 0}>
            {enviando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                Entrando...
              </>
            ) : (
              "Entrar na sala"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
