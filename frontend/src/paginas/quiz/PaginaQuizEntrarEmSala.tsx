import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AbasQuiz from "../../funcionalidades/quiz/componentes/AbasQuiz";
import { entrarNaSala } from "../../funcionalidades/salas/servicos/salasApi";
import { ErroApi } from "../../utilitarios/api";

export default function PaginaQuizEntrarEmSala() {
  const navigate = useNavigate();
  const campoDoCodigo = useRef<HTMLInputElement>(null);
  const [codigo, setCodigo] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const entrar = async (evento: FormEvent) => {
    evento.preventDefault();
    const codigoNormalizado = codigo.trim().toUpperCase();
    if (!codigoNormalizado) return;

    setVerificando(true);
    setMensagemErro(null);
    try {
      await entrarNaSala(codigoNormalizado, "");
      navigate(`/sala/${codigoNormalizado}`);
    } catch (erro) {
      if (erro instanceof ErroApi && erro.codigo === "PrecisaApelido") {
        navigate(`/sala/${codigoNormalizado}/apelido`);
      } else if (erro instanceof ErroApi && erro.status === 404) {
        setMensagemErro("Sala não encontrada. Confira o código com o moderador.");
      } else if (erro instanceof ErroApi && erro.codigo === "SalaEncerrada") {
        setMensagemErro("Esta sala já foi encerrada.");
      } else {
        setMensagemErro((erro as Error).message || "Erro ao entrar na sala.");
      }
    } finally {
      setVerificando(false);
    }
  };

  const tentarDeNovo = () => {
    setCodigo("");
    setMensagemErro(null);
    campoDoCodigo.current?.focus();
  };

  return (
    <div className="container py-4">
      <div className="quiz-menu-wrap">
        <Link to="/" className="link-voltar mb-4 d-inline-flex align-items-center">
          <i className="bi bi-arrow-left me-2" aria-hidden="true" />
          Voltar ao início
        </Link>

        <div className="quiz-menu-header mb-4">
          <h1 className="quiz-menu-titulo mb-2">
            <span className="quiz-menu-titulo-icone" aria-hidden="true">
              <i className="bi bi-controller" />
            </span>
            <span>Quiz do Prouni</span>
          </h1>
          <p className="quiz-menu-subtitulo mb-0">Escolha como praticar</p>
        </div>

        <AbasQuiz abaAtiva="sala" />

        <form className="cartao-codigo-sala" onSubmit={entrar}>
          <h2>Tem um código de sala?</h2>
          <p>Peça o código de 6 caracteres ao moderador e digite abaixo. Não precisa de cadastro.</p>

          <label className="cartao-codigo-rotulo" htmlFor="codigoDaSala">
            CÓDIGO DA SALA
          </label>
          <input
            ref={campoDoCodigo}
            id="codigoDaSala"
            type="text"
            maxLength={6}
            autoComplete="off"
            autoCapitalize="characters"
            className={`campo-codigo-sala ${mensagemErro ? "invalido" : ""}`}
            value={codigo}
            onChange={(evento) => {
              setCodigo(evento.target.value.toUpperCase());
              setMensagemErro(null);
            }}
            aria-invalid={Boolean(mensagemErro)}
            aria-describedby={mensagemErro ? "erroDoCodigo" : undefined}
          />

          {mensagemErro && (
            <div id="erroDoCodigo" className="cartao-codigo-erro" role="alert">
              {mensagemErro}
            </div>
          )}

          {mensagemErro ? (
            <button type="button" className="cartao-codigo-botao" onClick={tentarDeNovo}>
              Tentar de novo
            </button>
          ) : (
            <button type="submit" className="cartao-codigo-botao" disabled={verificando || codigo.trim().length === 0}>
              {verificando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                  Verificando...
                </>
              ) : (
                "Entrar na sala"
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
