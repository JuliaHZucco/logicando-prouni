$ErrorActionPreference = 'Stop'

Set-Location $PSScriptRoot
$saida = Join-Path $PSScriptRoot 'schema-producao.sql'

Write-Host 'Restaurando a ferramenta dotnet-ef...'
& dotnet tool restore
if ($LASTEXITCODE -ne 0) { throw 'Não foi possível restaurar a ferramenta dotnet-ef.' }

Write-Host 'Gerando o script SQL das migrations...'
& dotnet ef migrations script --idempotent --configuration Release --project backend/QuizProuni.Api --output $saida
if ($LASTEXITCODE -ne 0) { throw 'Não foi possível gerar o script das migrations.' }

Write-Host ''
Write-Host "Script gerado em: $saida"
Write-Host 'Para aplicar no banco (com um usuário que possa criar tabelas):'
Write-Host '  $env:PGCLIENTENCODING = ''UTF8''   # evita problemas com acentos no Windows'
Write-Host '  psql -h <servidor> -U <usuario_admin> -d <banco> -v ON_ERROR_STOP=1 -f schema-producao.sql'
