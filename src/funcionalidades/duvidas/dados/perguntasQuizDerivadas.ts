import type { OpcaoQuiz } from "../tipos";

export interface PerguntaQuizDerivada {
  duvidaId: string;
  baseDuvidaId: string;
  duvidaPergunta: string;
  opcoesResposta: OpcaoQuiz[];
}

function opcoes(correta: number, ...textos: string[]): OpcaoQuiz[] {
  return textos.map((texto, indice) => ({
    opcaoId: String.fromCharCode(97 + indice),
    texto,
    correta: indice === correta,
  }));
}

export const perguntasQuizDerivadas: Record<string, PerguntaQuizDerivada[]> = {
  elegibilidade: [
    {
      duvidaId: "eleg-1-detalhe-enem",
      baseDuvidaId: "eleg-1",
      duvidaPergunta: "Qual é a média mínima exigida nas provas objetivas do ENEM?",
      opcoesResposta: opcoes(1, "350 pontos", "450 pontos", "550 pontos", "Não há média mínima"),
    },
    {
      duvidaId: "eleg-5-detalhe-professor",
      baseDuvidaId: "eleg-5",
      duvidaPergunta: "Para quais cursos vale a exceção de renda dos professores da rede pública?",
      opcoesResposta: opcoes(2, "Para qualquer curso superior", "Apenas para Medicina", "Licenciatura e pedagogia", "Apenas cursos tecnológicos"),
    },
  ],
  "como-se-inscrever": [
    {
      duvidaId: "insc-1-detalhe-site",
      baseDuvidaId: "insc-1",
      duvidaPergunta: "Onde é feita a inscrição do PROUNI?",
      opcoesResposta: opcoes(0, "No site oficial do PROUNI", "Diretamente na Feevale", "Por e-mail", "Por WhatsApp"),
    },
    {
      duvidaId: "insc-1-detalhe-alteracao",
      baseDuvidaId: "insc-1",
      duvidaPergunta: "Durante a inscrição, qual opção é válida?",
      opcoesResposta: opcoes(3, "A primeira opção preenchida", "A opção enviada por e-mail", "A opção escolhida pela faculdade", "A última inscrição confirmada"),
    },
    {
      duvidaId: "insc-2-detalhe-quantidade",
      baseDuvidaId: "insc-2",
      duvidaPergunta: "Quantas opções de curso e instituição podem ser selecionadas?",
      opcoesResposta: opcoes(1, "Uma", "Até duas", "Até quatro", "Quantas desejar"),
    },
    {
      duvidaId: "insc-3-detalhe-gratuidade",
      baseDuvidaId: "insc-3",
      duvidaPergunta: "A inscrição no PROUNI tem alguma taxa?",
      opcoesResposta: opcoes(2, "Sim, uma taxa semestral", "Sim, uma taxa de garantia", "Não, é totalmente gratuita", "Somente a primeira opção é gratuita"),
    },
    {
      duvidaId: "insc-4-detalhe-resultado",
      baseDuvidaId: "insc-4",
      duvidaPergunta: "Em qual área o candidato consulta o resultado da pré-seleção?",
      opcoesResposta: opcoes(0, "Na área do candidato no site do PROUNI", "No site da Feevale", "No resultado do ENEM", "Por telefone"),
    },
    {
      duvidaId: "insc-4-detalhe-cronograma",
      baseDuvidaId: "insc-4",
      duvidaPergunta: "O resultado da pré-seleção é divulgado conforme qual referência?",
      opcoesResposta: opcoes(3, "A data escolhida pelo candidato", "O calendário da escola", "A data da matrícula anterior", "O cronograma oficial do semestre"),
    },
  ],
  prazos: [
    {
      duvidaId: "prazo-1-detalhe-frequencia",
      baseDuvidaId: "prazo-1",
      duvidaPergunta: "Quantos processos seletivos do PROUNI ocorrem por ano?",
      opcoesResposta: opcoes(1, "Um", "Dois", "Três", "Quatro"),
    },
    {
      duvidaId: "prazo-2-detalhe-comprovacao",
      baseDuvidaId: "prazo-2",
      duvidaPergunta: "Qual é o prazo geralmente indicado para comprovar as informações?",
      opcoesResposta: opcoes(2, "Um dia", "Três meses", "Cerca de dez dias", "Até o fim do curso"),
    },
    {
      duvidaId: "prazo-5-detalhe-etapas",
      baseDuvidaId: "prazo-5",
      duvidaPergunta: "Quantas etapas compõem o processo seletivo do PROUNI?",
      opcoesResposta: opcoes(0, "Três: primeira chamada, segunda chamada e lista de espera", "Uma: a inscrição", "Duas: inscrição e matrícula", "Quatro: prova, entrevista, matrícula e estágio"),
    },
  ],
  "renovacao-de-bolsa": [
    {
      duvidaId: "renov-1-detalhe-meses",
      baseDuvidaId: "renov-1",
      duvidaPergunta: "Em quais meses ocorre a assinatura do Termo de Atualização na Feevale?",
      opcoesResposta: opcoes(3, "Janeiro e julho", "Fevereiro e agosto", "Março e setembro", "Abril e outubro"),
    },
    {
      duvidaId: "renov-2-detalhe-percentual",
      baseDuvidaId: "renov-2",
      duvidaPergunta: "Qual percentual mínimo de disciplinas deve ser concluído com aprovação?",
      opcoesResposta: opcoes(1, "50%", "75%", "80%", "100%"),
    },
    {
      duvidaId: "renov-2-detalhe-excecoes",
      baseDuvidaId: "renov-2",
      duvidaPergunta: "Por quantas vezes a continuidade pode ser autorizada em caso de rendimento insuficiente?",
      opcoesResposta: opcoes(0, "Até duas vezes", "Uma vez", "Até quatro vezes", "Nunca"),
    },
    {
      duvidaId: "renov-3-detalhe-prazo",
      baseDuvidaId: "renov-3",
      duvidaPergunta: "Por quanto tempo consecutivo é possível trancar a matrícula na Feevale?",
      opcoesResposta: opcoes(2, "Um período de três meses", "Três períodos letivos", "Dois períodos letivos", "Prazo ilimitado"),
    },
    {
      duvidaId: "renov-3-detalhe-medicina",
      baseDuvidaId: "renov-3",
      duvidaPergunta: "Qual é o prazo de trancamento permitido para o curso de Medicina?",
      opcoesResposta: opcoes(1, "Dois períodos letivos", "Um período letivo", "Um ano e meio", "Prazo ilimitado"),
    },
  ],
};
