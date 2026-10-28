import { useCallback, useEffect, useRef, useState } from "react";
import type { HubConnection } from "@microsoft/signalr";
import { ErroApi } from "../../../utilitarios/api";
import { criarConexaoDaSala } from "../servicos/conexaoDaSala";
import { buscarEstadoDaSala } from "../servicos/salasApi";
import type {
  EstadoSala,
  LinhaRanking,
  ParticipanteSala,
  PerguntaSala,
  ResultadoAcao,
  ResultadoPergunta,
} from "../tipos";

export function useSalaAoVivo(codigo: string) {
  const [estado, setEstado] = useState<EstadoSala | null>(null);
  const [erroDeCarga, setErroDeCarga] = useState<ErroApi | null>(null);
  const [mensagemDeConexao, setMensagemDeConexao] = useState<string | null>(null);
  const conexaoRef = useRef<HubConnection | null>(null);
  const conexaoProntaRef = useRef<Promise<void>>(Promise.resolve());

  const recarregarEstado = useCallback(async () => {
    try {
      setEstado(await buscarEstadoDaSala(codigo));
      setErroDeCarga(null);
    } catch (erro) {
      setErroDeCarga(erro instanceof ErroApi ? erro : null);
    }
  }, [codigo]);

  useEffect(() => {
    const conexao = criarConexaoDaSala();
    conexaoRef.current = conexao;

    conexao.on("participante-entrou", (dados: { participantes: ParticipanteSala[]; total: number }) =>
      setEstado((atual) =>
        atual ? { ...atual, participantes: dados.participantes, totalParticipantes: dados.total } : atual,
      ),
    );

    conexao.on("pergunta-iniciada", (pergunta: PerguntaSala) =>
      setEstado((atual) =>
        atual
          ? {
              ...atual,
              status: "pergunta_aberta",
              perguntaAtual: pergunta.ordem,
              pergunta,
              minhaAlternativaId: null,
              resultado: null,
            }
          : atual,
      ),
    );

    conexao.on("resposta-registrada", (dados: { respondidas: number; totalParticipantes: number }) =>
      setEstado((atual) =>
        atual?.pergunta
          ? {
              ...atual,
              totalParticipantes: dados.totalParticipantes,
              pergunta: { ...atual.pergunta, respondidas: dados.respondidas },
            }
          : atual,
      ),
    );

    conexao.on("resultado-disponivel", (resultado: ResultadoPergunta) =>
      setEstado((atual) => (atual ? { ...atual, status: "resultado_pergunta", resultado } : atual)),
    );

    ["quiz-finalizado", "nova-rodada"].forEach((evento) =>
      conexao.on(evento, (_: { ranking?: LinhaRanking[]; rodada?: number }) => void recarregarEstado()),
    );

    conexao.onreconnected(async () => {
      await conexao.invoke("EntrarSala", codigo);
      await recarregarEstado();
    });

    const iniciar = async () => {
      await recarregarEstado();
      try {
        await conexao.start();
        const resultado: ResultadoAcao = await conexao.invoke("EntrarSala", codigo);
        if (!resultado.ok) setMensagemDeConexao(resultado.erro ?? "Sem acesso a esta sala.");
      } catch {
        setMensagemDeConexao("Não foi possível conectar à sala.");
      }
    };
    conexaoProntaRef.current = iniciar();

    return () => {
      void conexao.stop();
    };
  }, [codigo, recarregarEstado]);

  const executar = useCallback(async (metodo: string, ...argumentos: unknown[]): Promise<ResultadoAcao> => {
    await conexaoProntaRef.current;
    const conexao = conexaoRef.current;
    if (!conexao) return { ok: false, erro: "Sem conexão com a sala." };
    try {
      return await conexao.invoke(metodo, codigo, ...argumentos);
    } catch {
      return { ok: false, erro: "Sem conexão com a sala." };
    }
  }, [codigo]);

  const responder = useCallback(
    async (alternativaId: number): Promise<ResultadoAcao> => {
      const resultado = await executar("Responder", alternativaId);
      if (resultado.ok) {
        setEstado((atual) => (atual ? { ...atual, minhaAlternativaId: alternativaId } : atual));
      }
      return resultado;
    },
    [executar],
  );

  return { estado, erroDeCarga, mensagemDeConexao, recarregarEstado, executar, responder };
}
