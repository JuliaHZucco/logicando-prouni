CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE moderadores (
  moderador_id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE CHECK (email = lower(btrim(email))),
  senha_hash TEXT NOT NULL
);

CREATE TABLE categorias (
  categoria_id VARCHAR(50) PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  icone VARCHAR(50) NOT NULL,
  ordem SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE perguntas (
  pergunta_id VARCHAR(80) PRIMARY KEY,
  categoria_id VARCHAR(50) NOT NULL REFERENCES categorias(categoria_id),
  pergunta_base_id VARCHAR(80),
  enunciado TEXT NOT NULL,
  resposta TEXT,
  ordem SMALLINT NOT NULL DEFAULT 0,
  ativa BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (pergunta_id, categoria_id),
  FOREIGN KEY (pergunta_base_id, categoria_id) REFERENCES perguntas(pergunta_id, categoria_id),
  CHECK (pergunta_base_id <> pergunta_id),
  CHECK ((pergunta_base_id IS NULL) = (resposta IS NOT NULL))
);

CREATE TABLE alternativas (
  alternativa_id SERIAL PRIMARY KEY,
  pergunta_id VARCHAR(80) NOT NULL REFERENCES perguntas(pergunta_id) ON DELETE CASCADE,
  letra CHAR(1) NOT NULL CHECK (letra IN ('a', 'b', 'c', 'd')),
  texto TEXT NOT NULL,
  correta BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (pergunta_id, letra),
  UNIQUE (alternativa_id, pergunta_id)
);
CREATE UNIQUE INDEX uq_alternativa_correta ON alternativas (pergunta_id) WHERE correta;

CREATE TABLE visitantes (
  visitante_id SERIAL PRIMARY KEY,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_ultimo_acesso TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE duvidas_vistas (
  visitante_id INT NOT NULL REFERENCES visitantes(visitante_id) ON DELETE CASCADE,
  pergunta_id VARCHAR(80) NOT NULL REFERENCES perguntas(pergunta_id),
  data_visualizacao TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (visitante_id, pergunta_id)
);

CREATE TABLE partidas_individuais (
  partida_individual_id SERIAL PRIMARY KEY,
  visitante_id INT NOT NULL REFERENCES visitantes(visitante_id) ON DELETE CASCADE,
  modo VARCHAR(10) NOT NULL CHECK (modo IN ('aleatorio', 'categoria', 'misto')),
  data_inicio TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_fim TIMESTAMPTZ,
  CHECK (data_fim IS NULL OR data_fim >= data_inicio)
);

CREATE TABLE partida_perguntas (
  partida_individual_id INT NOT NULL REFERENCES partidas_individuais(partida_individual_id) ON DELETE CASCADE,
  pergunta_id VARCHAR(80) NOT NULL REFERENCES perguntas(pergunta_id),
  ordem SMALLINT NOT NULL CHECK (ordem BETWEEN 1 AND 10),
  PRIMARY KEY (partida_individual_id, pergunta_id),
  UNIQUE (partida_individual_id, ordem)
);

CREATE TABLE respostas_individuais (
  resposta_individual_id SERIAL PRIMARY KEY,
  partida_individual_id INT NOT NULL,
  pergunta_id VARCHAR(80) NOT NULL,
  alternativa_id INT NOT NULL,
  correta BOOLEAN NOT NULL,
  data_resposta TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (partida_individual_id, pergunta_id),
  FOREIGN KEY (partida_individual_id, pergunta_id) REFERENCES partida_perguntas(partida_individual_id, pergunta_id) ON DELETE CASCADE,
  FOREIGN KEY (alternativa_id, pergunta_id) REFERENCES alternativas(alternativa_id, pergunta_id)
);

CREATE TABLE salas (
  sala_id SERIAL PRIMARY KEY,
  codigo VARCHAR(6) NOT NULL UNIQUE CHECK (codigo ~ '^[A-HJ-NP-Z2-9]{6}$'),
  nome VARCHAR(60) NOT NULL CHECK (btrim(nome) <> ''),
  moderador_id INT NOT NULL REFERENCES moderadores(moderador_id),
  modo VARCHAR(10) NOT NULL CHECK (modo IN ('aleatorio', 'categoria', 'misto')),
  quantidade_perguntas SMALLINT NOT NULL CHECK (quantidade_perguntas BETWEEN 1 AND 10),
  usa_cronometro BOOLEAN NOT NULL DEFAULT false,
  segundos_por_pergunta SMALLINT CHECK (segundos_por_pergunta BETWEEN 10 AND 60),
  status VARCHAR(20) NOT NULL DEFAULT 'aguardando'
    CHECK (status IN ('aguardando', 'pergunta_aberta', 'resultado_pergunta', 'ranking', 'encerrada')),
  pergunta_atual SMALLINT,
  rodada_atual SMALLINT NOT NULL DEFAULT 1 CHECK (rodada_atual >= 1),
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_encerramento TIMESTAMPTZ,
  CHECK (usa_cronometro = (segundos_por_pergunta IS NOT NULL)),
  CHECK (pergunta_atual BETWEEN 1 AND quantidade_perguntas),
  CHECK (status NOT IN ('pergunta_aberta', 'resultado_pergunta') OR pergunta_atual IS NOT NULL),
  CHECK ((status = 'encerrada') = (data_encerramento IS NOT NULL))
);

CREATE TABLE sala_categorias (
  sala_id INT NOT NULL REFERENCES salas(sala_id) ON DELETE CASCADE,
  categoria_id VARCHAR(50) NOT NULL REFERENCES categorias(categoria_id),
  PRIMARY KEY (sala_id, categoria_id)
);

CREATE TABLE sala_perguntas (
  sala_pergunta_id SERIAL PRIMARY KEY,
  sala_id INT NOT NULL REFERENCES salas(sala_id) ON DELETE CASCADE,
  pergunta_id VARCHAR(80) NOT NULL REFERENCES perguntas(pergunta_id),
  ordem SMALLINT NOT NULL CHECK (ordem BETWEEN 1 AND 10),
  UNIQUE (sala_id, ordem),
  UNIQUE (sala_id, pergunta_id)
);

CREATE TABLE exibicoes (
  sala_pergunta_id INT NOT NULL REFERENCES sala_perguntas(sala_pergunta_id) ON DELETE CASCADE,
  rodada SMALLINT NOT NULL CHECK (rodada >= 1),
  data_abertura TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_encerramento TIMESTAMPTZ,
  PRIMARY KEY (sala_pergunta_id, rodada),
  CHECK (data_encerramento IS NULL OR data_encerramento >= data_abertura)
);

CREATE TABLE sala_pergunta_alternativas (
  sala_pergunta_id INT NOT NULL REFERENCES sala_perguntas(sala_pergunta_id) ON DELETE CASCADE,
  alternativa_id INT NOT NULL REFERENCES alternativas(alternativa_id),
  posicao SMALLINT NOT NULL CHECK (posicao BETWEEN 1 AND 4),
  PRIMARY KEY (sala_pergunta_id, alternativa_id),
  UNIQUE (sala_pergunta_id, posicao)
);

CREATE TABLE participantes (
  participante_id SERIAL PRIMARY KEY,
  sala_id INT NOT NULL REFERENCES salas(sala_id) ON DELETE CASCADE,
  visitante_id INT NOT NULL REFERENCES visitantes(visitante_id) ON DELETE CASCADE,
  apelido VARCHAR(30) NOT NULL CHECK (apelido = btrim(apelido) AND apelido <> ''),
  data_entrada TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_ultimo_acesso TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sala_id, visitante_id)
);
CREATE UNIQUE INDEX uq_participantes_apelido ON participantes (sala_id, lower(apelido));

CREATE TABLE respostas (
  resposta_id SERIAL PRIMARY KEY,
  sala_pergunta_id INT NOT NULL,
  rodada SMALLINT NOT NULL,
  participante_id INT NOT NULL REFERENCES participantes(participante_id) ON DELETE CASCADE,
  alternativa_id INT NOT NULL,
  correta BOOLEAN NOT NULL,
  data_resposta TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sala_pergunta_id, rodada, participante_id),
  FOREIGN KEY (sala_pergunta_id, rodada) REFERENCES exibicoes(sala_pergunta_id, rodada) ON DELETE CASCADE,
  FOREIGN KEY (sala_pergunta_id, alternativa_id)
    REFERENCES sala_pergunta_alternativas(sala_pergunta_id, alternativa_id) ON DELETE CASCADE
);

CREATE INDEX idx_perguntas_categoria ON perguntas (categoria_id);
CREATE INDEX idx_perguntas_base ON perguntas (pergunta_base_id);
CREATE INDEX idx_partidas_visitante ON partidas_individuais (visitante_id);
CREATE INDEX idx_respostas_individuais_pergunta ON respostas_individuais (pergunta_id);
CREATE INDEX idx_salas_moderador_data ON salas (moderador_id, data_criacao DESC);
CREATE INDEX idx_participantes_visitante ON participantes (visitante_id);
CREATE INDEX idx_respostas_participante ON respostas (participante_id);

INSERT INTO moderadores (email, senha_hash)
VALUES ('moderador@feevale.br', crypt('troque-esta-senha', gen_salt('bf', 10)));
