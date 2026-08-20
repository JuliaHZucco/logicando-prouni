import type { Categoria } from "../tipos";

export const categorias: Categoria[] = [
  {
    categoriaId: "elegibilidade",
    categoriaNome: "Elegibilidade",
    categoriaDescricao: "Quem pode se inscrever no PROUNI e critérios de renda.",
    categoriaIcone: "bi-person-check",
    categoriaDuvidas: [
      {
        duvidaId: "eleg-1",
        duvidaPergunta: "Quem pode se inscrever no PROUNI?",
        duvidaResposta:
          "Podem se inscrever brasileiros(as) sem diploma de curso superior que tenham feito o ENEM mais recente, tirado no mínimo 450 pontos na média das provas objetivas e não tenham zerado a redação. Também é necessário se enquadrar em um dos critérios de renda por pessoa da família.",
      },
      {
        duvidaId: "eleg-2",
        duvidaPergunta: "Qual é o limite de renda familiar para conseguir uma bolsa?",
        duvidaResposta:
          "Para bolsa integral, a renda familiar mensal por pessoa não pode ultrapassar 1,5 salário mínimo. Para bolsa parcial (50%), o limite sobe para até 3 salários mínimos por pessoa da família.",
      },
      {
        duvidaId: "eleg-3",
        duvidaPergunta: "Precisei estudar em escola pública para participar?",
        duvidaResposta:
          "Sim, é um dos requisitos: ter cursado o ensino médio completo em escola pública, ou como bolsista integral em escola privada. Quem fez parte do ensino médio em escola pública e parte em escola privada sem bolsa integral não se enquadra.",
      },
      {
        duvidaId: "eleg-4",
        duvidaPergunta: "Já fiz faculdade antes. Posso participar mesmo assim?",
        duvidaResposta:
          "Não. O PROUNI é destinado a quem ainda não possui diploma de curso superior. Quem já concluiu uma graduação, mesmo que em outra área, não pode concorrer a uma bolsa.",
      },
    ],
  },
  {
    categoriaId: "como-se-inscrever",
    categoriaNome: "Como se Inscrever",
    categoriaDescricao: "Passo a passo da inscrição no sistema oficial.",
    categoriaIcone: "bi-clipboard-check",
    categoriaDuvidas: [
      {
        duvidaId: "insc-1",
        duvidaPergunta: "Onde faço a inscrição do PROUNI?",
        duvidaResposta:
          "A inscrição é feita exclusivamente pelo site oficial do PROUNI, no portal do MEC, usando o login único gov.br. Não existe inscrição por e-mail, WhatsApp ou presencialmente na faculdade.",
      },
      {
        duvidaId: "insc-2",
        duvidaPergunta: "Quantas opções de curso posso escolher?",
        duvidaResposta:
          "É possível selecionar até duas opções de curso e instituição durante o mesmo processo seletivo, podendo priorizar qual delas é a preferida.",
      },
      {
        duvidaId: "insc-3",
        duvidaPergunta: "Preciso pagar alguma taxa para me inscrever?",
        duvidaResposta:
          "Não. A inscrição no PROUNI é totalmente gratuita. Qualquer cobrança para 'garantir' a inscrição ou a bolsa é indício de golpe.",
      },
      {
        duvidaId: "insc-4",
        duvidaPergunta: "Como sei se fui pré-selecionado?",
        duvidaResposta:
          "O resultado da pré-seleção é divulgado no próprio site do PROUNI, na área do candidato, em data definida no cronograma oficial do processo seletivo daquele semestre.",
      },
    ],
  },
  {
    categoriaId: "documentacao",
    categoriaNome: "Documentação",
    categoriaDescricao: "Documentos que você precisa reunir para comprovar tudo.",
    categoriaIcone: "bi-file-earmark-text",
    categoriaDuvidas: [
      {
        duvidaId: "doc-1",
        duvidaPergunta: "Quais documentos comprovam a renda familiar?",
        duvidaResposta:
          "Em geral são solicitados: carteira de trabalho, contracheques, declaração de Imposto de Renda, extratos bancários e, para quem não tem renda formal, declaração de autônomo ou de que não exerce atividade remunerada.",
      },
      {
        duvidaId: "doc-2",
        duvidaPergunta: "Como comprovo que estudei em escola pública?",
        duvidaResposta:
          "É preciso apresentar o histórico escolar do ensino médio, emitido pela escola, mostrando as instituições onde cada série foi cursada.",
      },
      {
        duvidaId: "doc-3",
        duvidaPergunta: "Preciso de documento de identidade para a matrícula?",
        duvidaResposta:
          "Sim, é exigido documento oficial com foto (RG ou CNH), CPF e comprovante de residência atualizado, além dos documentos de renda e escolaridade.",
      },
      {
        duvidaId: "doc-4",
        duvidaPergunta: "E se eu não tiver algum documento pedido?",
        duvidaResposta:
          "Cada instituição publica sua própria lista de documentos aceitos como comprovação alternativa. Vale a pena consultar o edital da faculdade escolhida antes da data da comprovação presencial.",
      },
    ],
  },
  {
    categoriaId: "prazos",
    categoriaNome: "Prazos",
    categoriaDescricao: "Datas e cronograma que você precisa acompanhar.",
    categoriaIcone: "bi-calendar-check",
    categoriaDuvidas: [
      {
        duvidaId: "prazo-1",
        duvidaPergunta: "Quando abrem as inscrições do PROUNI?",
        duvidaResposta:
          "O PROUNI costuma ter dois processos seletivos por ano, um por semestre, com inscrições geralmente logo após a divulgação do resultado do ENEM. As datas exatas mudam a cada edição e são publicadas no site oficial.",
      },
      {
        duvidaId: "prazo-2",
        duvidaPergunta: "Quanto tempo tenho para comprovar as informações?",
        duvidaResposta:
          "Após a pré-seleção, existe um prazo curto (geralmente alguns dias úteis) para comparecer à instituição de ensino e comprovar presencialmente os dados informados na inscrição.",
      },
      {
        duvidaId: "prazo-3",
        duvidaPergunta: "O que acontece se eu perder o prazo de comprovação?",
        duvidaResposta:
          "Perder o prazo de comprovação documental normalmente cancela a pré-seleção, e a vaga é repassada para o próximo candidato da lista de espera.",
      },
      {
        duvidaId: "prazo-4",
        duvidaPergunta: "Existe lista de espera no PROUNI?",
        duvidaResposta:
          "Sim. Quem não é chamado nas primeiras chamadas pode se inscrever na lista de espera, que segue convocando candidatos conforme surgem vagas remanescentes.",
      },
    ],
  },
  {
    categoriaId: "renovacao-de-bolsa",
    categoriaNome: "Renovação de Bolsa",
    categoriaDescricao: "Como manter sua bolsa ao longo do curso.",
    categoriaIcone: "bi-arrow-repeat",
    categoriaDuvidas: [
      {
        duvidaId: "renov-1",
        duvidaPergunta: "A bolsa do PROUNI precisa ser renovada todo semestre?",
        duvidaResposta:
          "Sim, a permanência no programa é reavaliada periodicamente pela instituição de ensino, verificando desempenho acadêmico e frequência mínima nas disciplinas.",
      },
      {
        duvidaId: "renov-2",
        duvidaPergunta: "Qual desempenho acadêmico é exigido para não perder a bolsa?",
        duvidaResposta:
          "Cada instituição define critérios próprios, mas em geral é necessário cumprir um coeficiente de rendimento mínimo e não ultrapassar um número de reprovações estabelecido em regulamento interno.",
      },
      {
        duvidaId: "renov-3",
        duvidaPergunta: "Posso trancar uma disciplina sem perder a bolsa?",
        duvidaResposta:
          "Depende das regras da instituição. Trancamentos e reprovações costumam ser tolerados até um certo limite; ultrapassar esse limite pode levar ao cancelamento da bolsa.",
      },
      {
        duvidaId: "renov-4",
        duvidaPergunta: "Preciso comprovar a renda de novo durante o curso?",
        duvidaResposta:
          "Sim, algumas instituições realizam reavaliação socioeconômica periódica para confirmar que o(a) estudante continua se enquadrando nos critérios de renda do programa.",
      },
    ],
  },
];

export const totalGeralDuvidas = categorias.reduce(
  (somaTotal, categoria) => somaTotal + categoria.categoriaDuvidas.length,
  0
);
