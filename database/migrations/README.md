# Migrações do banco

As alterações do schema devem ser adicionadas aqui em arquivos numerados, por
exemplo `001-criacao.sql` e `002-autenticacao.sql`.

`001-criacao.sql` representa o schema inicial completo e é a única fonte
oficial para criar o banco.

As próximas alterações devem ser adicionadas como novas migrações, sem editar
uma migração já aplicada em um banco.
