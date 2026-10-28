import { useEffect, useMemo, useState, type ReactNode } from "react";
import Alerta from "../../../componentes/Alerta";
import AreaCarregando from "../../../componentes/AreaCarregando";
import { buscarConteudo } from "../servicos/conteudoApi";
import type { Categoria } from "../tipos";
import { ContextoConteudo } from "./ContextoConteudo";

export default function ProvedorConteudo({ children }: { children: ReactNode }) {
  const [categorias, setCategorias] = useState<Categoria[] | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let cancelado = false;
    buscarConteudo()
      .then((conteudo) => {
        if (cancelado) return;
        setCategorias(conteudo);
        setMensagemErro(null);
      })
      .catch((erro: Error) => {
        if (!cancelado) setMensagemErro(erro.message || "Erro ao carregar o conteúdo.");
      });
    return () => {
      cancelado = true;
    };
  }, [tentativa]);

  const valor = useMemo(
    () => ({
      categorias: categorias ?? [],
      totalGeralDuvidas: (categorias ?? []).reduce(
        (total, categoria) => total + categoria.categoriaDuvidas.length,
        0,
      ),
    }),
    [categorias],
  );

  if (mensagemErro) {
    return (
      <div className="container py-5 d-flex flex-column gap-3 align-items-start">
        <Alerta mensagem={mensagemErro} />
        <button
          type="button"
          className="quiz-botao-secundario"
          onClick={() => {
            setMensagemErro(null);
            setTentativa((atual) => atual + 1);
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!categorias) {
    return (
      <div className="container py-5">
        <AreaCarregando mensagem="Carregando conteúdo..." />
      </div>
    );
  }

  return <ContextoConteudo.Provider value={valor}>{children}</ContextoConteudo.Provider>;
}
