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
          "Podem se inscrever brasileiros(as) sem diploma de curso superior que tenham participado de uma das duas edições mais recentes do ENEM (não valendo participação como 'treineiro'), com média mínima de 450 pontos nas provas objetivas e nota acima de zero na redação. Também é necessário se enquadrar em um dos critérios de renda por pessoa da família.",
      },
      {
        duvidaId: "eleg-2",
        duvidaPergunta: "Qual é o limite de renda familiar para conseguir uma bolsa?",
        duvidaResposta:
          "Na Feevale, são ofertadas apenas bolsas integrais, que exigem renda familiar bruta mensal de até 1,5 salário mínimo por pessoa. O PROUNI também prevê bolsas parciais (50%), com limite de até 3 salários mínimos por pessoa, mas esse tipo de bolsa não é ofertado pela Feevale.",
      },
      {
        duvidaId: "eleg-3",
        duvidaPergunta: "Precisei estudar em escola pública para participar?",
        duvidaResposta:
          "Não necessariamente. Você pode se inscrever em qualquer uma destas situações de ensino médio: 1) integralmente em escola pública; 2) integralmente em escola privada, como bolsista integral; 3) parte em pública e parte em privada, como bolsista integral; 4) parte em pública e parte em privada, como bolsista parcial ou sem bolsa; 5) integralmente em escola privada, como bolsista parcial ou sem bolsa. O que muda entre elas não é o direito de se inscrever, e sim a prioridade na ordem de classificação: quem se enquadra nas situações 1 e 3 tem prioridade mais alta (equivalente à de professor da rede pública em cursos de licenciatura/pedagogia), seguido de quem se enquadra na situação 2, depois na 4, e por último na 5.",
      },
      {
        duvidaId: "eleg-4",
        duvidaPergunta: "Já fiz faculdade antes. Posso participar mesmo assim?",
        duvidaResposta:
          "Não. O PROUNI é destinado a quem ainda não possui diploma de curso superior. Quem já concluiu uma graduação, mesmo que em outra área, não pode concorrer a uma bolsa.",
      },
      {
        duvidaId: "eleg-5",
        duvidaPergunta: "Existe alguma exceção à regra de escola pública ou de renda?",
        duvidaResposta:
          "Sim. Também podem concorrer pessoas com deficiência, conforme critérios oficiais de avaliação, e professores da rede pública em efetivo exercício do magistério da educação básica — neste caso, apenas para bolsas em cursos de licenciatura e pedagogia, sem necessidade de atender ao limite de renda.",
      },
      {
        duvidaId: "eleg-6",
        duvidaPergunta: "Como calculo se minha renda familiar está dentro do limite do PROUNI?",
        duvidaResposta:
          "Some a renda bruta de todos os integrantes do grupo familiar e divida pelo número de integrantes — esse é o valor da renda per capita. Para a bolsa integral, esse valor não pode ultrapassar 1,5 salário mínimo vigente. Por exemplo: uma família com renda total de R$ 2.500,00 e 4 integrantes tem renda per capita de R$ 625,00, dentro do limite.",
      },
      {
        duvidaId: "eleg-7",
        duvidaPergunta: "A renda usada no cálculo é a bruta ou a líquida?",
        duvidaResposta:
          "É utilizada a renda familiar bruta, ou seja, a soma de todos os rendimentos apresentados pelo grupo familiar, sem descontos.",
      },
      {
        duvidaId: "eleg-8",
        duvidaPergunta: "Sou professor(a) da educação básica. Que documento comprova isso?",
        duvidaResposta:
          "É preciso apresentar o comprovante de efetivo exercício do magistério na educação básica, integrando o quadro de pessoal permanente de instituição pública. O documento deve ser solicitado nas secretarias municipais de educação e/ou coordenadorias regionais, e precisa conter a relação das matrículas e/ou contratos em seu nome, com a respectiva carga horária, impresso em papel timbrado, com carimbo e assinatura do(a) responsável.",
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
        duvidaPergunta: "Onde e como faço a inscrição do PROUNI?",
        duvidaResposta:
          "A inscrição é feita em etapa única e gratuita, exclusivamente pelo site oficial do PROUNI, usando o login único gov.br. Durante o período de inscrição é possível alterar as opções escolhidas quantas vezes quiser — só vale a última inscrição confirmada. Não existe inscrição por e-mail, WhatsApp ou presencialmente na faculdade.",
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
          "Para cada integrante do grupo familiar com 16 anos ou mais, é obrigatória a cópia completa da Carteira de Trabalho Digital ou o CNIS, emitido pelo Meu INSS. Também é exigida a declaração completa do Imposto de Renda Pessoa Física com o recibo de entrega do último exercício (ou o print de isenção, se for o caso). Além disso, cada pessoa deve comprovar sua renda conforme a própria situação: contracheques para assalariados, declaração de autônomo para informais, comprovante de benefício para aposentados, DECORE para sócios de empresa, entre outros.",
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
          "Sim, é exigido documento oficial com foto (RG ou CNH — certidão de nascimento apenas se o(a) candidato(a) for menor de 18 anos e não tiver nenhum dos dois) e CPF, além dos documentos de renda e escolaridade. Também é exigido comprovante de residência atualizado de todos os membros do grupo familiar com mais de 18 anos — não basta apresentar apenas um comprovante em nome do candidato ou do responsável pela casa.",
      },
      {
        duvidaId: "doc-4",
        duvidaPergunta: "E se eu não tiver algum documento pedido?",
        duvidaResposta:
          "Cada instituição publica sua própria lista de documentos aceitos como comprovação alternativa. Vale a pena consultar o edital da faculdade escolhida antes da data da comprovação presencial.",
      },
      {
        duvidaId: "doc-5",
        duvidaPergunta: "Existe alguma regra especial para quem tem até 24 anos?",
        duvidaResposta:
          "Sim. Se você tiver 24 anos ou menos, é obrigatório apresentar os documentos de identificação, carteira de trabalho/CNIS e comprovação de renda de todo o seu grupo familiar de origem (pais ou responsáveis, irmãos e demais dependentes), mesmo que não more com eles. Caso se declare independente, é necessário comprovar renda própria condizente com seu padrão de vida e consumo, sob pena de reprovação, além de apresentar uma declaração explicando o motivo de não residir com os pais.",
      },
      {
        duvidaId: "doc-6",
        duvidaPergunta: "Como funciona a política de cotas do PROUNI?",
        duvidaResposta:
          "Para concorrer como cotista é preciso apresentar documento que comprove a etnia (certidão, autodeclaração reconhecida em cartório ou assinada eletronicamente pelo GOV.BR) ou, no caso de pessoa com deficiência, laudo médico atestando a espécie e o grau da deficiência com o código CID correspondente.",
      },
      {
        duvidaId: "doc-7",
        duvidaPergunta: "Preciso apresentar alguma certidão do INSS?",
        duvidaResposta:
          "Sim, é obrigatória a Certidão Negativa ou Positiva de Benefícios do INSS de todos os integrantes do grupo familiar, gerada pelo Meu INSS (acesse com sua conta gov.br, vá em 'Outros Serviços' > 'Meus Benefícios' e baixe o documento). Se ocorrer algum erro na emissão, é preciso contatar diretamente o INSS.",
      },
      {
        duvidaId: "doc-8",
        duvidaPergunta: "Como comprovo a situação da minha moradia?",
        duvidaResposta:
          "Depende da situação: se a moradia for própria ou financiada, apresente a folha do IPTU do ano vigente com o Valor Venal Total ou a Base de Cálculo (constando nome do proprietário e endereço); em zona rural, apresente o ITR. Se for alugada, apresente o contrato de locação registrado em cartório e os três últimos recibos de pagamento. Se for cedida, além do IPTU, é exigida a Declaração de Casa Cedida assinada pelo cedente e o comprovante de endereço dele. Para outras situações (ocupação irregular, comodato, usufruto, etc.), use a Declaração de Situação de Moradia disponível em www.feevale.br/prouni.",
      },
      {
        duvidaId: "doc-9",
        duvidaPergunta: "Sou sócio(a) ou diretor(a) de empresa. Quais documentos de renda preciso apresentar?",
        duvidaResposta:
          "Se a empresa for enquadrada como Simples, Limitada ou Microempresa, é obrigatória a DECORE (Declaração Comprobatória de Percepção de Rendimentos) dos últimos três meses, assinada por contador(a) inscrito(a) no CRC, além da declaração completa do Imposto de Renda Pessoa Jurídica do último exercício, do Contrato Social (obrigatório) e alterações, se houver, e do extrato bancário dos últimos três meses da conta em que a renda é movimentada. Atenção: DECORE e Pró-Labore são documentos diferentes, e o Pró-Labore sozinho não é aceito. Se for MEI, os documentos mudam — veja a próxima dúvida.",
      },
      {
        duvidaId: "doc-10",
        duvidaPergunta: "Sou MEI. Quais documentos preciso apresentar?",
        duvidaResposta:
          "É preciso apresentar o Comprovante de MEI (emitido no site do governo, na área de serviços para MEI), uma declaração de renda informando o tipo de atividade e o valor médio mensal (modelo disponível em www.feevale.br/prouni), a declaração exigida pela Feevale para esse item — no caso do MEI, a DASN-SIMEI (Declaração Anual do Simples Nacional para o MEI) — e o extrato bancário dos últimos três meses da conta em que a renda é movimentada.",
      },
      {
        duvidaId: "doc-11",
        duvidaPergunta: "Como devem ser assinadas as declarações exigidas no processo?",
        duvidaResposta:
          "Todas as declarações emitidas pelo(a) candidato(a) devem ser entregues em via original. A assinatura do(a) declarante precisa ser reconhecida em cartório (sendo aceito o reconhecimento por semelhança) ou feita eletronicamente pelo GOV.BR. Se o modelo de declaração pedir testemunhas — como na declaração de separação não legalizada — elas só precisam assinar o documento, sem necessidade de cartório, mas não podem ser membros do grupo familiar.",
      },
      {
        duvidaId: "doc-12",
        duvidaPergunta: "Preciso comprovar algo sobre pensão alimentícia?",
        duvidaResposta:
          "Sim, se algum integrante do grupo familiar recebe ou paga pensão alimentícia. Havendo decisão judicial, apresente a decisão e os seis últimos comprovantes de recebimento ou pagamento. Não havendo decisão judicial, apresente uma declaração informando o valor pago ou recebido (modelo disponível em www.feevale.br/prouni). Se houver direito à pensão mas ela não estiver sendo paga, também é preciso declarar o não recebimento.",
      },
      {
        duvidaId: "doc-13",
        duvidaPergunta: "Preciso apresentar certidão de casamento ou de óbito dos meus pais?",
        duvidaResposta:
          "Sim, quando aplicável: certidão de casamento ou escritura pública de união estável, se os pais forem casados ou vivem em união estável; e certidão de óbito, em caso de pai ou mãe falecido(a). Se os pais forem separados sem união oficializada, é preciso apresentar a declaração de separação não legalizada, assinada por um dos cônjuges com duas testemunhas (que não podem ser do grupo familiar).",
      },
      {
        duvidaId: "doc-14",
        duvidaPergunta: "Se eu já tiver matrícula em faculdade pública, preciso fazer algo antes de entregar os documentos?",
        duvidaResposta:
          "Sim. Como o PROUNI não permite vínculo simultâneo com instituição pública e gratuita, é obrigatório apresentar o documento oficial de cancelamento de matrícula e desistência de vaga antes da comprovação. Do mesmo modo, se você já for bolsista PROUNI ativo em outra instituição (ou nesta mesma), é preciso apresentar o Termo de Concessão da Bolsa atual, já que a aprovação neste processo encerra automaticamente a bolsa anterior.",
      },
      {
        duvidaId: "doc-15",
        duvidaPergunta: "Sou isento(a) da declaração de Imposto de Renda. O que apresento no lugar?",
        duvidaResposta:
          "Apresente o print da informação gerada pelo site oficial de consulta à restituição do Imposto de Renda (restituicao.receita.fazenda.gov.br), mostrando que não há declaração para o exercício informado.",
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
        duvidaPergunta: "Quando ocorrem as inscrições do PROUNI?",
        duvidaResposta:
          "O PROUNI tem dois processos seletivos por ano, um por semestre. As inscrições do primeiro semestre costumam ocorrer entre os meses de fevereiro e março, e as do segundo semestre, entre junho e julho. As datas exatas mudam a cada edição e são publicadas no site oficial do PROUNI.",
      },
      {
        duvidaId: "prazo-2",
        duvidaPergunta: "Quanto tempo tenho para comprovar as informações?",
        duvidaResposta:
          "Após a pré-seleção, existe um prazo definido no edital daquele semestre (geralmente cerca de dez dias) para comparecer à instituição de ensino e comprovar presencialmente os dados informados na inscrição.",
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
          "Sim. Quem não é chamado nas primeiras chamadas pode manifestar interesse na lista de espera, que segue convocando candidatos conforme surgem vagas remanescentes.",
      },
      {
        duvidaId: "prazo-5",
        duvidaPergunta: "Quais são as etapas do processo seletivo do PROUNI?",
        duvidaResposta:
          "O processo seletivo ocorre nos dois semestres do ano e é composto por três etapas: primeira chamada, segunda chamada e lista de espera. Quem não for pré-selecionado nas duas chamadas pode manifestar interesse na lista de espera, que segue convocando candidatos conforme surgem vagas remanescentes.",
      },
      {
        duvidaId: "prazo-6",
        duvidaPergunta: "O que acontece depois que meus documentos são aprovados?",
        duvidaResposta:
          "Após a instituição aprovar a comprovação das informações, o candidato assina o Termo de Concessão de Bolsa e realiza a matrícula. É responsabilidade do próprio candidato verificar, junto à instituição, os horários e o local de comparecimento para a comprovação — perder o prazo ou não comprovar as informações resulta automaticamente na reprovação do candidato.",
      },
      {
        duvidaId: "prazo-7",
        duvidaPergunta: "De quem é a responsabilidade por cumprir os prazos do PROUNI?",
        duvidaResposta:
          "Todos os prazos referentes aos procedimentos acadêmicos e à bolsa do PROUNI — como inscrição, comprovação de documentos e renovação — são de responsabilidade exclusiva do(a) estudante bolsista. Perder um prazo, inclusive o de renovação da bolsa, pode acarretar a suspensão automática do benefício.",
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
          "Sim, a bolsa deve ser atualizada semestralmente. Na Feevale, a assinatura do Termo de Atualização ocorre nos meses de abril e outubro, conforme o cronograma do MEC, e depende do desempenho acadêmico e da frequência nas disciplinas.",
      },
      {
        duvidaId: "renov-2",
        duvidaPergunta: "Qual desempenho acadêmico é exigido para não perder a bolsa?",
        duvidaResposta:
          "É exigida aprovação em, no mínimo, 75% das disciplinas cursadas em cada período letivo (por exemplo, quem cursa 4 disciplinas precisa ser aprovado em pelo menos 3). Em caso de rendimento insuficiente, a coordenação do PROUNI pode autorizar a continuidade da bolsa por até duas vezes, mediante justificativa do(a) estudante.",
      },
      {
        duvidaId: "renov-3",
        duvidaPergunta: "Posso trancar a matrícula sem perder a bolsa?",
        duvidaResposta:
          "Na Feevale, é possível trancar a matrícula e depois solicitar reingresso em até dois períodos letivos consecutivos (1 ano), desde que o curso não esteja em extinção; no curso de Medicina, esse prazo é de apenas 1 período (6 meses). Ultrapassado o prazo, a bolsa PROUNI é encerrada por evasão.",
      },
      {
        duvidaId: "renov-4",
        duvidaPergunta: "Preciso comprovar a renda de novo durante o curso?",
        duvidaResposta:
          "Sim, a instituição pode realizar reavaliação socioeconômica periódica, e uma mudança substancial na condição socioeconômica do(a) estudante pode levar ao encerramento da bolsa.",
      },
      {
        duvidaId: "renov-5",
        duvidaPergunta: "Se eu for reprovado(a) em uma disciplina, preciso pagar para cursá-la de novo?",
        duvidaResposta:
          "Não. Como a Feevale oferece apenas bolsa integral, a instituição não pode cobrar do(a) bolsista pelas disciplinas cursadas novamente em caso de reprovação (dependências).",
      },
    ],
  },
  {
    categoriaId: "perda-da-bolsa",
    categoriaNome: "Perda da Bolsa",
    categoriaDescricao: "Situações que podem levar à suspensão ou ao encerramento definitivo da bolsa.",
    categoriaIcone: "bi-exclamation-triangle",
    categoriaDuvidas: [
      {
        duvidaId: "perda-1",
        duvidaPergunta: "Quais situações levam ao encerramento da bolsa PROUNI?",
        duvidaResposta:
          "Entre outros motivos, a bolsa pode ser encerrada por: não realizar a matrícula no primeiro semestre de usufruto; reprovação abaixo do mínimo exigido de disciplinas; mudança substancial na renda familiar; matrícula em instituição pública gratuita; conclusão do curso (ou de qualquer outro curso superior); término do prazo máximo de validade da bolsa; documentação ou informação falsa; não apresentar documentação pendente do processo de ingresso (por exemplo, ter concluído o ensino médio mas ainda não ter o certificado); acúmulo de mais de uma bolsa PROUNI; uso simultâneo com financiamento do FIES em curso ou instituição diferente; decisão ou ordem judicial; evasão; ou solicitação do próprio bolsista.",
      },
      {
        duvidaId: "perda-2",
        duvidaPergunta: "Quantas reprovações posso ter até perder a bolsa?",
        duvidaResposta:
          "É preciso ser aprovado em, no mínimo, 75% das disciplinas cursadas em cada período letivo. Por exemplo: em 4 disciplinas, é necessário passar em ao menos 3; em 8 disciplinas, em ao menos 6. Ficar abaixo desse percentual pode levar ao encerramento da bolsa, embora a coordenação do PROUNI possa autorizar a continuidade por até duas vezes, mediante justificativa.",
      },
      {
        duvidaId: "perda-3",
        duvidaPergunta: "Se minha renda familiar aumentar, posso perder a bolsa?",
        duvidaResposta:
          "Sim. A instituição pode realizar reavaliação socioeconômica periódica, e uma mudança substancial na condição socioeconômica do(a) estudante — como um aumento de renda que ultrapasse o limite exigido — pode levar ao encerramento da bolsa.",
      },
      {
        duvidaId: "perda-4",
        duvidaPergunta: "Existe um prazo máximo para usar a bolsa PROUNI?",
        duvidaResposta:
          "Sim. A bolsa pode ser utilizada durante um período equivalente a duas vezes o prazo normal de integralização do curso, descontados os semestres já cursados antes da concessão da bolsa. Ao concluir o curso, a bolsa é encerrada e os semestres restantes não podem ser aproveitados em outro curso ou especialização.",
      },
      {
        duvidaId: "perda-5",
        duvidaPergunta: "Posso perder a bolsa se deixar a matrícula trancada por muito tempo?",
        duvidaResposta:
          "Sim. Na Feevale, o reingresso após trancamento só é permitido em até dois períodos letivos consecutivos (1 ano); no curso de Medicina, o limite é de 1 período (6 meses). Ultrapassado esse prazo, a bolsa é encerrada por evasão.",
      },
      {
        duvidaId: "perda-6",
        duvidaPergunta: "O que acontece se eu me matricular em uma faculdade pública?",
        duvidaResposta:
          "A bolsa é encerrada. Não é permitida a concessão nem a manutenção de bolsa PROUNI para quem está matriculado, a qualquer tempo, em instituição de ensino superior pública e gratuita.",
      },
      {
        duvidaId: "perda-7",
        duvidaPergunta: "O que acontece se eu apresentar informações ou documentos falsos?",
        duvidaResposta:
          "A prestação de informações falsas ou a apresentação de documentação inidônea, mesmo identificada após a matrícula, leva ao encerramento da bolsa (assegurados contraditório e ampla defesa ao estudante), sem prejuízo de sanções penais e civis cabíveis.",
      },
      {
        duvidaId: "perda-8",
        duvidaPergunta: "Posso ter duas bolsas PROUNI ao mesmo tempo?",
        duvidaResposta:
          "Não. Só é permitido manter uma bolsa PROUNI por vez. Se o bolsista se inscrever novamente em um processo seletivo e for aprovado, a bolsa anterior é encerrada automaticamente.",
      },
      {
        duvidaId: "perda-9",
        duvidaPergunta: "Posso usar bolsa PROUNI e financiamento FIES ao mesmo tempo?",
        duvidaResposta:
          "Não. É proibido usufruir, ao mesmo tempo, de bolsa PROUNI e financiamento do FIES em curso ou instituição diferentes — isso leva ao encerramento da bolsa PROUNI. Se você já tinha um contrato de financiamento do FIES antes de receber a bolsa integral do PROUNI, deve solicitar o encerramento desse contrato diretamente com o agente financeiro (banco).",
      },
      {
        duvidaId: "perda-10",
        duvidaPergunta: "Perder a bolsa é a mesma coisa que ficar com ela suspensa?",
        duvidaResposta:
          "Não. A suspensão é temporária — por exemplo, durante um trancamento de matrícula dentro do prazo permitido, ou por falta de atualização do usufruto pelo coordenador — e o período suspenso é descontado do prazo total de uso da bolsa, sem que o estudante perca a bolsa ou fique devendo nesse período. Já o encerramento é definitivo.",
      },
      {
        duvidaId: "perda-11",
        duvidaPergunta: "O que acontece se a bolsa for concedida depois que as aulas já começaram?",
        duvidaResposta:
          "Se a matrícula do(a) bolsista ocorrer em período incompatível com o calendário letivo, impossibilitando a frequência e podendo gerar reprovação por faltas, a instituição deve emitir o Termo de Concessão de Bolsa e suspender seu usufruto até o período letivo seguinte, sem prejuízo ao(à) estudante.",
      },
    ],
  },
  {
    categoriaId: "direitos-e-beneficios",
    categoriaNome: "Direitos e Benefícios do Bolsista",
    categoriaDescricao: "Vantagens, garantias e oportunidades extras que a lei assegura a quem tem bolsa PROUNI.",
    categoriaIcone: "bi-award",
    categoriaDuvidas: [
      {
        duvidaId: "dir-1",
        duvidaPergunta: "Preciso devolver o dinheiro da bolsa depois de formado(a)?",
        duvidaResposta:
          "Não. A bolsa é um benefício concedido pelo Governo Federal e não está condicionada a nenhuma forma de restituição monetária. Ao concluir o curso, o(a) bolsista não fica devendo nada aos cofres públicos.",
      },
      {
        duvidaId: "dir-2",
        duvidaPergunta: "Já iniciei outra faculdade antes. Posso aproveitar as disciplinas já cursadas?",
        duvidaResposta:
          "Sim, é possível solicitar aproveitamento curricular das disciplinas já cursadas, mas isso fica sujeito à análise do departamento responsável na instituição para a qual o(a) estudante foi selecionado(a).",
      },
      {
        duvidaId: "dir-3",
        duvidaPergunta: "Existe vaga de estágio exclusiva para bolsistas do PROUNI?",
        duvidaResposta:
          "Sim. Há convênio do MEC com a Caixa Econômica Federal para vagas de estágio, disponíveis a partir do 3º semestre (cursos de 3 anos) ou do 5º semestre (cursos de 4 ou 5 anos), com cadastro pelo CIEE. Há também convênio com a Febraban, que faz os bancos associados reservarem 10% de suas vagas de estágio para bolsistas do PROUNI.",
      },
      {
        duvidaId: "dir-4",
        duvidaPergunta: "Posso ter bolsa PROUNI e bolsa de iniciação científica ao mesmo tempo?",
        duvidaResposta:
          "Sim, não existe impedimento legal para o bolsista do PROUNI se candidatar também a uma bolsa de iniciação científica.",
      },
      {
        duvidaId: "dir-5",
        duvidaPergunta: "Sou bolsista PROUNI e estou grávida. Tenho algum direito especial?",
        duvidaResposta:
          "Sim, a estudante gestante tem direito a até 90 dias de ausência justificada às aulas (Lei nº 6.202/1975). No entanto, continua obrigatória a realização de provas, a apresentação de trabalhos em datas especiais e a realização da matrícula.",
      },
      {
        duvidaId: "dir-6",
        duvidaPergunta: "O que é a Bolsa Permanência?",
        duvidaResposta:
          "É um benefício extra em dinheiro, com valor equivalente ao das bolsas federais de iniciação científica, pago mensalmente a bolsistas com bolsa integral do PROUNI em cursos presenciais de no mínimo 6 semestres de duração e carga horária média de pelo menos 6 horas diárias de aula.",
      },
      {
        duvidaId: "dir-7",
        duvidaPergunta: "Como faço para receber a Bolsa Permanência?",
        duvidaResposta:
          "É preciso abrir uma conta corrente individual no Banco do Brasil ou na Caixa Econômica Federal (não pode ser poupança, conta eletrônica ou com mais de um titular) e depois ir à Coordenação do PROUNI da instituição, levando documento de identidade, CPF, comprovante bancário e comprovante de residência, para assinar o Termo de Concessão.",
      },
      {
        duvidaId: "dir-8",
        duvidaPergunta: "Perco a Bolsa Permanência se minha bolsa PROUNI for suspensa?",
        duvidaResposta:
          "Sim, o pagamento da Bolsa Permanência é interrompido enquanto a bolsa PROUNI estiver suspensa, voltando a ser pago quando a bolsa PROUNI voltar a ser utilizada.",
      },
      {
        duvidaId: "dir-9",
        duvidaPergunta: "Se a Feevale sair do programa PROUNI, eu perco minha bolsa?",
        duvidaResposta:
          "Não. Ao aderir ao PROUNI, a instituição assume o compromisso de manter a bolsa dos estudantes já matriculados, mesmo que decida deixar o programa antes do fim do prazo de adesão.",
      },
      {
        duvidaId: "dir-10",
        duvidaPergunta: "Existem bolsas fora do processo seletivo regular?",
        duvidaResposta:
          "Sim, são as chamadas bolsas remanescentes: vagas não preenchidas no processo seletivo, que podem ser oferecidas a estudantes já matriculados na instituição e que atendam aos critérios socioeconômicos do PROUNI, em prazo estabelecido pelo MEC. Diferente da bolsa regular, a bolsa remanescente não tem efeito retroativo — sua vigência começa a partir da data de emissão do Termo de Concessão, então o(a) estudante não tem direito ao ressarcimento de parcelas já pagas naquele semestre antes de ser contemplado.",
      },
      {
        duvidaId: "dir-11",
        duvidaPergunta: "Como funciona a seleção para a Bolsa Permanência?",
        duvidaResposta:
          "A seleção dos estudantes aptos é feita mensalmente, de forma automática, pelo sistema do PROUNI. O pagamento, porém, depende da disponibilidade orçamentária e financeira do Ministério da Educação, além da assinatura do Termo de Concessão pelo bolsista e do envio mensal da relação de beneficiários pela coordenação do PROUNI da instituição.",
      },
      {
        duvidaId: "dir-12",
        duvidaPergunta: "Em quais casos a Bolsa Permanência é encerrada definitivamente (não só suspensa)?",
        duvidaResposta:
          "A Bolsa Permanência é encerrada quando: o curso deixa de atender ao critério de carga horária média de pelo menos 6 horas diárias; a bolsa PROUNI do(a) estudante é encerrada; o(a) estudante é transferido(a) para um curso que não se enquadra nos critérios do benefício; é constatado que o valor não está sendo usado para despesas educacionais; há inidoneidade de documento ou informação falsa; ou por solicitação do(a) próprio(a) estudante.",
      },
    ],
  },
  {
    categoriaId: "procedimentos-e-contato-na-feevale",
    categoriaNome: "Procedimentos e Contato na Feevale",
    categoriaDescricao:
      "Entrega de documentos, transferências, comprovantes e contato com o NAE na Feevale.",
    categoriaIcone: "bi-file-earmark-check",
    categoriaDuvidas: [
      {
        duvidaId: "feevale-1",
        duvidaPergunta: "Como funciona a entrega de documentos na Feevale?",
        duvidaResposta:
          "Para pré-selecionados em primeira ou segunda chamada, e para quem está na lista de espera dentro da classificação de vagas, é preciso agendar horário para entrevista pelo telefone (51) 3586-8800, ramal 6545, com atendimento na sala 300L, prédio Lilás, Campus II. Quem manifestou interesse na lista de espera mas está fora da classificação de vagas entrega os documentos em envelope lacrado, sem agendamento, de segunda a sexta-feira, das 8h30 às 12h e das 13h às 20h, no mesmo local.",
      },
      {
        duvidaId: "feevale-2",
        duvidaPergunta: "Posso transferir minha bolsa PROUNI para a Feevale ou trocar de curso mantendo a bolsa?",
        duvidaResposta:
          "No momento, a Feevale não possui previsão de oferta de vagas PROUNI para transferências internas ou externas. Há exceções previstas em lei a essa regra — veja a próxima dúvida.",
      },
      {
        duvidaId: "feevale-3",
        duvidaPergunta: "Como peço o comprovante de que sou bolsista PROUNI?",
        duvidaResposta:
          "A solicitação do Comprovante de Condição de Bolsista deve ser feita pelo e-mail prouni@feevale.br.",
      },
      {
        duvidaId: "feevale-4",
        duvidaPergunta: "Preciso avisar a Feevale se eu mudar de curso ou tiver alguma alteração na matrícula?",
        duvidaResposta:
          "Sim. É responsabilidade do(a) bolsista comunicar ao Núcleo de Apoio ao Estudante (NAE) qualquer alteração em sua matrícula, para garantir a continuidade do benefício, além de manter os dados de contato sempre atualizados no sistema da instituição.",
      },
      {
        duvidaId: "feevale-5",
        duvidaPergunta: "Quem pode assinar o Termo de Atualização da Bolsa?",
        duvidaResposta:
          "Somente o próprio bolsista ou seu representante legal pode assinar o Termo de Atualização (ou o Termo de Suspensão, caso a bolsa esteja suspensa). A assinatura é obrigatória para a renovação da bolsa.",
      },
      {
        duvidaId: "feevale-6",
        duvidaPergunta: "Onde entro em contato para tirar dúvidas sobre o PROUNI na Feevale?",
        duvidaResposta:
          "Pelo Núcleo de Apoio ao Estudante (NAE): e-mail prouni@feevale.br, telefone (51) 3586-8800 ramal 6545, sala 300L, 3º andar, prédio Lilás, Campus II. Para dúvidas gerais sobre o programa PROUNI, também é possível ligar na Central de Atendimento do MEC: 0800 616161.",
      },
      {
        duvidaId: "feevale-7",
        duvidaPergunta: "Como peço reingresso depois de trancar a matrícula?",
        duvidaResposta:
          "É preciso preencher o formulário de reingresso disponibilizado pela Feevale, dentro do prazo estipulado pela instituição. A solicitação é analisada pela Comissão do PROUNI, que dá o retorno por e-mail, e o deferimento fica condicionado à existência de vaga acadêmica. Ao reingressar, o(a) estudante fica sujeito ao currículo e às normas institucionais vigentes na data da matrícula.",
      },
      {
        duvidaId: "feevale-8",
        duvidaPergunta: "Existe alguma exceção à regra de não haver vagas para transferência?",
        duvidaResposta:
          "Sim. Mesmo sem oferta geral de vagas, a instituição é obrigada por lei a aceitar transferência nos casos de extinção do curso ou da instituição de origem, ou quando o(a) estudante (ou seu dependente) for servidor(a) público(a) federal civil ou militar removido(a) ou transferido(a) de ofício, com mudança de domicílio por interesse da administração. Também é proibida a cobrança de qualquer taxa de matrícula como condição para analisar ou emitir documentos de transferência.",
      },
      {
        duvidaId: "feevale-9",
        duvidaPergunta: "Que restrições nacionais existem para uma transferência de bolsa ser aceita?",
        duvidaResposta:
          "Além da disponibilidade de vaga no curso de destino, a transferência só é permitida se a nota do ENEM usada pelo(a) bolsista para entrar no PROUNI for igual ou superior à do último candidato aprovado no processo seletivo mais recente para o curso de destino, e se o total de semestres já cursados ou suspensos não for igual ou superior à duração do curso de destino.",
      },
      {
        duvidaId: "feevale-10",
        duvidaPergunta: "Sou menor de idade. Preciso levar alguém comigo na entrevista?",
        duvidaResposta:
          "Sim. Se o(a) candidato(a) tiver menos de 18 anos, é obrigatório comparecer à entrevista de comprovação acompanhado de um responsável.",
      },
    ],
  },
];

export const totalGeralDuvidas = categorias.reduce(
  (somaTotal, categoria) => somaTotal + categoria.categoriaDuvidas.length,
  0
);