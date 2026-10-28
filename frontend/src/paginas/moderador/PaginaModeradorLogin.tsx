import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Alerta from "../../componentes/Alerta";
import { entrarComoModerador, sairDoModerador } from "../../funcionalidades/moderador/servicos/moderadorApi";

export default function PaginaModeradorLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  useEffect(() => {
    sairDoModerador().catch(() => undefined);
  }, []);

  const entrar = async (evento: FormEvent) => {
    evento.preventDefault();
    setEntrando(true);
    setMensagemErro(null);
    try {
      await entrarComoModerador(email, senha);
      navigate("/moderador/salas", { replace: true });
    } catch (erro) {
      setMensagemErro((erro as Error).message || "Erro ao entrar.");
    } finally {
      setEntrando(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="moderador-login">
        <form className="sala-cartao" onSubmit={entrar}>
          <div className="sala-rotulo">ÁREA DO MODERADOR</div>
          <h1 className="sala-titulo">Entrar</h1>
          <p className="sala-texto">Acesso restrito a quem conduz as salas do quiz ao vivo.</p>

          <label className="form-label quiz-label" htmlFor="email">
            E-MAIL
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            className="form-control quiz-input mb-3"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            required
          />

          <label className="form-label quiz-label" htmlFor="senha">
            SENHA
          </label>
          <input
            id="senha"
            type="password"
            autoComplete="current-password"
            className="form-control quiz-input"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            required
          />

          {mensagemErro && (
            <div className="mt-3">
              <Alerta mensagem={mensagemErro} />
            </div>
          )}

          <button type="submit" className="quiz-botao-iniciar w-100 mt-4" disabled={entrando}>
            {entrando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
